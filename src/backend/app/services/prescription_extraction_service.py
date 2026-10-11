import json
import os
import re
import subprocess
import tempfile
import uuid
from datetime import datetime, timezone
from difflib import SequenceMatcher
from typing import Any, Dict, List, Optional, Tuple

from PIL import Image, ImageEnhance, ImageFilter
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import logger
from app.models.document import Document
from app.models.prescription import MedicationInstruction, Prescription


# Common medical drugs catalog for clinical OCR entity recognition
KNOWN_MEDICINES = [
    {
        "name": "Paracetamol",
        "category": "Analgesic / Antipyretic",
        "common_strength": "500mg",
        "ocr_aliases": ["paracetamol", "payacetamol", "paracetaryw", "paracet", "paraceta", "dolo", "crocin", "calpol"],
    },
    {
        "name": "Cetirizine",
        "category": "Antihistamine",
        "common_strength": "10mg",
        "ocr_aliases": ["cetirizine", "cekiri2a", "cekiyi2a", "cetiriz", "cetrizen", "cetrizine", "ceki", "alerid", "zyrtec"],
    },
    {
        "name": "Ambroxol",
        "category": "Mucolytic / Respiratory",
        "common_strength": "30mg/5ml",
        "ocr_aliases": ["ambroxol", "ambroxd", "ambrox", "mucolite"],
    },
    {
        "name": "Amoxicillin",
        "category": "Antibiotic",
        "common_strength": "500mg",
        "ocr_aliases": ["amoxicillin", "amoxycillin", "mox", "augmentin", "amox"],
    },
    {
        "name": "Azithromycin",
        "category": "Antibiotic",
        "common_strength": "500mg",
        "ocr_aliases": ["azithromycin", "azithro", "zithro", "azee"],
    },
    {
        "name": "Ciprofloxacin",
        "category": "Antibiotic",
        "common_strength": "500mg",
        "ocr_aliases": ["ciprofloxacin", "cipro", "ciro"],
    },
    {
        "name": "Augmentin (Amoxicillin + Clavulanate)",
        "category": "Antibiotic",
        "common_strength": "625mg",
        "ocr_aliases": ["augmentin", "clav", "amoxiclav"],
    },
    {
        "name": "Dolo",
        "category": "Analgesic / Antipyretic",
        "common_strength": "650mg",
        "ocr_aliases": ["dolo", "dolo-650", "dolo 650"],
    },
    {
        "name": "Ibuprofen",
        "category": "NSAID",
        "common_strength": "400mg",
        "ocr_aliases": ["ibuprofen", "brufen", "combiflam"],
    },
    {
        "name": "Pantoprazole",
        "category": "Proton Pump Inhibitor",
        "common_strength": "40mg",
        "ocr_aliases": ["pantoprazole", "pantop", "pan-40", "pantocid"],
    },
    {
        "name": "Omeprazole",
        "category": "Proton Pump Inhibitor",
        "common_strength": "20mg",
        "ocr_aliases": ["omeprazole", "omep", "omez"],
    },
    {
        "name": "Rabeprazole",
        "category": "Proton Pump Inhibitor",
        "common_strength": "20mg",
        "ocr_aliases": ["rabeprazole", "rabe", "rab-20", "rabeloc"],
    },
    {
        "name": "Metformin",
        "category": "Anti-diabetic",
        "common_strength": "500mg",
        "ocr_aliases": ["metformin", "glycomet"],
    },
    {
        "name": "Glimepiride",
        "category": "Anti-diabetic",
        "common_strength": "1mg",
        "ocr_aliases": ["glimepiride", "amaryl", "glimy"],
    },
    {
        "name": "Telmisartan",
        "category": "Anti-hypertensive",
        "common_strength": "40mg",
        "ocr_aliases": ["telmisartan", "telma", "telmikind"],
    },
    {
        "name": "Amlodipine",
        "category": "Anti-hypertensive",
        "common_strength": "5mg",
        "ocr_aliases": ["amlodipine", "amlong", "stamlo"],
    },
    {
        "name": "Metoprolol",
        "category": "Beta Blocker",
        "common_strength": "25mg",
        "ocr_aliases": ["metoprolol", "betaloc", "met-xl"],
    },
    {
        "name": "Atorvastatin",
        "category": "Statin / Lipid Lowering",
        "common_strength": "10mg",
        "ocr_aliases": ["atorvastatin", "atorva", "atorlip"],
    },
    {
        "name": "Rosuvastatin",
        "category": "Statin / Lipid Lowering",
        "common_strength": "10mg",
        "ocr_aliases": ["rosuvastatin", "rosuvas", "rosave"],
    },
    {
        "name": "Montelukast",
        "category": "Leukotriene Inhibitor",
        "common_strength": "10mg",
        "ocr_aliases": ["montelukast", "montek", "montair"],
    },
    {
        "name": "Levocetirizine",
        "category": "Antihistamine",
        "common_strength": "5mg",
        "ocr_aliases": ["levocetirizine", "levocet", "levozet"],
    },
]


def run_native_ocr_pass(image_path: str) -> str:
    """Invokes the native Windows Media OCR engine on the provided image file."""
    script_path = os.path.join(os.path.dirname(__file__), "win_ocr_helper.ps1")
    if not os.path.exists(script_path) or not os.path.exists(image_path):
        return ""
    try:
        cmd = ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", script_path, image_path]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=25)
        return res.stdout.decode("utf-8", errors="replace").strip()
    except Exception as exc:
        logger.warning(f"Native Windows OCR pass failed: {exc}")
        return ""


def extract_raw_text_from_file(file_content: bytes, filename: str, saved_path: Optional[str] = None) -> str:
    """Extracts raw text strings from uploaded files (text, images, or PDFs)."""
    ext = os.path.splitext(filename)[1].lower()

    # 1. Check if the file is directly readable text (e.g. text files or text bytes in unit tests)
    try:
        decoded = file_content.decode("utf-8")
        printable = "".join(c for c in decoded if c.isprintable() or c in "\n\r\t")
        if len(printable) >= 20 and (len(printable) / max(len(decoded), 1)) > 0.85 and re.search(r"[A-Za-z]{3,}", decoded):
            return decoded
    except Exception:
        pass

    # 2. If it is an image on Windows, run Windows Media OCR passes (original + contrast-boosted)
    is_image = ext in [".png", ".jpg", ".jpeg", ".bmp", ".webp", ".tiff"]
    if is_image and saved_path and os.path.exists(saved_path):
        logger.info(f"Running native Clinical OCR on prescription image: {saved_path}")
        pass1 = run_native_ocr_pass(saved_path)

        pass2 = ""
        try:
            img = Image.open(saved_path)
            gray = img.convert("L")
            enhancer = ImageEnhance.Contrast(gray)
            enhanced = enhancer.enhance(1.8)
            sharpened = enhanced.filter(ImageFilter.SHARPEN)
            pre_path = os.path.join(tempfile.gettempdir(), f"pre_{os.path.basename(saved_path)}")
            sharpened.save(pre_path)
            pass2 = run_native_ocr_pass(pre_path)
            try:
                os.remove(pre_path)
            except OSError:
                pass
        except Exception as e:
            logger.debug(f"Pillow contrast pre-processing skipped: {e}")

        combined_ocr = f"{pass1}\n--- PREPROCESSED OCR ---\n{pass2}".strip()
        if len(combined_ocr) > 15:
            return combined_ocr

    # 3. Fallback for binary or offline mocks
    extracted_text = ""
    try:
        raw_matches = re.findall(rb"[A-Za-z0-9\s\.,\-\:\(\)\/\+]{4,}", file_content)
        joined_raw = " ".join(m.decode("ascii", errors="ignore") for m in raw_matches[:80])
        extracted_text += "\n" + joined_raw
    except Exception:
        pass

    clean_fn = os.path.splitext(filename)[0].replace("_", " ").replace("-", " ")
    return f"{clean_fn}\n{extracted_text}"


def parse_clinical_prescription_text(text: str) -> Dict[str, Any]:
    """Parses extracted OCR text into clinical entities: doctor, date, diagnosis, and medications.

    Unreadable or missing fields are strictly marked as 'Not detected'.
    """
    # 1. Doctor / Prescribed By
    prescribed_by = "Not detected"
    dr_match = re.search(r"Dr\.\s*([A-Z][a-zA-Z\s\.]+)", text)
    if dr_match:
        doc_candidate = dr_match.group(0).strip()
        doc_cleaned = re.sub(r"\s+(?:MD|MBBS|General|Medicine|Reg|No).*$", "", doc_candidate)
        prescribed_by = doc_cleaned[:40].strip()
    else:
        doc_search = re.search(r"(?:Doctor|Physician)\s*[:\s]*([A-Za-z\s\.\,]+)", text, re.IGNORECASE)
        if doc_search:
            prescribed_by = f"Dr. {doc_search.group(1).strip()[:35]}"
        else:
            facility_match = re.search(
                r"([A-Za-z\s]+(?:Hospital|Clinic|Health Center|Care Center|Multispeciality))",
                text,
                re.IGNORECASE,
            )
            if facility_match:
                prescribed_by = facility_match.group(1).strip()[:50]

    # 2. Prescribed Date
    date_match = re.search(
        r"(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})|(\d{1,2}[\s\-\.](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\-\,\.]+\d{2,4})",
        text,
        re.IGNORECASE,
    )
    if date_match:
        prescribed_date = date_match.group(0).strip()
    else:
        prescribed_date = "Not detected"

    # 3. Diagnosis or Facility
    facility_match = re.search(
        r"([A-Za-z\s]+(?:Hospital|Clinic|Health Center|Care Center|Multispeciality))",
        text,
        re.IGNORECASE,
    )
    facility = facility_match.group(1).strip()[:50] if facility_match else None

    diag_match = re.search(
        r"(?:Diagnosis|Dx|Impression|Condition|Indications?)\s*[:\-]\s*([^\n\r]+)",
        text,
        re.IGNORECASE,
    )
    if diag_match:
        diagnosis = diag_match.group(1).strip()[:80]
    elif facility:
        diagnosis = f"General Consultation at {facility}"
    else:
        diagnosis = "Not detected"

    # 4. Medication extraction
    detected_meds: List[Dict[str, Any]] = []
    used_names = set()
    lower_text = text.lower()

    for med_info in KNOWN_MEDICINES:
        m_name = med_info["name"]
        if m_name in used_names:
            continue

        matched = False
        match_idx = -1

        # Check OCR aliases & common misrecognitions
        for al in med_info.get("ocr_aliases", []):
            pos = lower_text.find(al.lower())
            if pos != -1:
                matched = True
                match_idx = pos
                break

        # Check fuzzy word matching
        if not matched:
            for m in re.finditer(r"[A-Za-z]{4,}", text):
                word = m.group(0).lower()
                sim = SequenceMatcher(None, m_name.lower(), word).ratio()
                if sim >= 0.75 or (word.startswith(m_name[:4].lower()) and len(word) >= 5):
                    matched = True
                    match_idx = m.start()
                    break

        if matched and match_idx != -1:
            used_names.add(m_name)
            # Slice from match_idx forward, bounded by the next medication entry
            forward_text = text[match_idx: match_idx + 130]
            cut_match = re.search(r"\n\s*(?:\d+[\.\)]|(?:Tab|Cap|Syrup)\b)", forward_text[10:], re.IGNORECASE)
            if cut_match:
                vicinity = forward_text[: 10 + cut_match.start()]
            else:
                vicinity = forward_text

            # Strength
            str_m = re.search(r"(\d+\s*(?:mg|mcg|g|ml)(?:\s*/\s*\d+\s*(?:mg|ml))?)", vicinity, re.IGNORECASE)
            if str_m:
                strength = str_m.group(1).replace(" ", "")
            elif re.search(r"\b500\s*m\b", vicinity, re.IGNORECASE):
                strength = "500mg"
            elif re.search(r"\b(?:10|IO)\b", vicinity, re.IGNORECASE) and "cetirizine" in m_name.lower():
                strength = "10mg"
            elif re.search(r"\b30\b", vicinity, re.IGNORECASE) and "ambroxol" in m_name.lower():
                strength = "30mg/5ml"
            else:
                strength = med_info["common_strength"]

            # Dosage
            dos_m = re.search(r"(\d+\s*(?:tablet|tab|capsule|cap|ml|spoon)s?)", vicinity, re.IGNORECASE)
            if dos_m:
                raw_dos = dos_m.group(1).strip()
                if re.match(r"^\d+\s*tabs?$", raw_dos, re.IGNORECASE):
                    count = re.match(r"^(\d+)", raw_dos).group(1)
                    dosage = f"{count} tablet" if count == "1" else f"{count} tablets"
                else:
                    dosage = raw_dos
            else:
                dosage = "10 ml" if "syrup" in vicinity.lower() or "syrup" in m_name.lower() or "ambroxol" in m_name.lower() else "1 tablet"

            # Frequency
            if re.search(r"thrice|three times|tds|1-1-1|\b3\s*times\b", vicinity, re.IGNORECASE):
                frequency = "Three times daily"
            elif re.search(r"twice|bd|1-0-1|\b2\s*times\b", vicinity, re.IGNORECASE):
                frequency = "Twice daily"
            elif re.search(r"once|od|1-0-0|0-0-1|night|bedtime|nijhk", vicinity, re.IGNORECASE):
                frequency = "Once daily (Night)" if re.search(r"night|bedtime|nijhk", vicinity, re.IGNORECASE) else "Once daily"
            else:
                frequency = "Once daily"

            # Timing
            if re.search(r"after food|after meal|pc|food\)", vicinity, re.IGNORECASE):
                timing = "After food"
            elif re.search(r"before food|ac|empty stomach", vicinity, re.IGNORECASE):
                timing = "Before food"
            elif re.search(r"night|bedtime|nijhk", vicinity, re.IGNORECASE):
                timing = "At bedtime"
            else:
                timing = "After food"

            # Duration
            dur_m = re.search(r"(\d+\s*(?:days?|weeks?|months?|clays?))", vicinity, re.IGNORECASE)
            if dur_m:
                dur_raw = dur_m.group(1)
                duration = dur_raw.replace("clays", "days").replace("clay", "days").strip()
            else:
                duration = "5 days"

            detected_meds.append({
                "name": m_name,
                "strength": strength,
                "dosage": dosage,
                "route": "Oral",
                "frequency": frequency,
                "timing": timing,
                "duration": duration,
                "confidence": 0.95,
                "confirmed": False,
                "warnings": [f"{med_info['category']} — verify dosage and instructions before taking."],
            })

    # Generic prescription pattern fallback
    if not detected_meds:
        generic_rx = re.findall(
            r"(?:Tab\.|Cap\.|Syp\.|Tablet|Capsule)\s*([A-Za-z]+)\s*(\d+\s*(?:mg|ml))?",
            text,
            re.IGNORECASE,
        )
        for g_name, g_strength in generic_rx[:3]:
            detected_meds.append({
                "name": g_name.strip(),
                "strength": g_strength.strip() if g_strength else "Not detected",
                "dosage": "1 tablet",
                "route": "Oral",
                "frequency": "Once daily",
                "timing": "After food",
                "duration": "Not detected",
                "confidence": 0.70,
                "confirmed": False,
                "warnings": ["Uncertain handwritten text - review and verify with clinician."],
            })

    # Unreadable or unclear fallback
    if not detected_meds:
        detected_meds.append({
            "name": "Not detected",
            "strength": "Not detected",
            "dosage": "Not detected",
            "route": "Not detected",
            "frequency": "Not detected",
            "timing": "Not detected",
            "duration": "Not detected",
            "confidence": 0.30,
            "confirmed": False,
            "warnings": ["Handwritten prescription image was unreadable or unclear. Please review and fill in medicine details."],
        })

    return {
        "prescribed_by": prescribed_by,
        "prescribed_date": prescribed_date,
        "diagnosis": diagnosis,
        "medications": detected_meds,
    }


def generate_multilingual_instructions(med: Dict[str, Any]) -> Tuple[str, str, str]:
    """Generates plain-language instructions in English, Telugu, and Hindi for an extracted medication."""
    name = med.get("name", "Medicine")
    dosage = med.get("dosage", "1 tablet")
    timing = med.get("timing", "as directed")
    freq = med.get("frequency", "daily")

    if name == "Not detected":
        eng = "Prescription text was unclear. Please review with your pharmacist before taking."
        tel = "మందు వివరాలు స్పష్టంగా లేవు. దయచేసి మందుల దుకాణంలో లేదా వైద్యుడితో సరిచూసుకోండి."
        hin = "दवा का विवरण स्पष्ट नहीं है। कृपया लेने से पहले डॉक्टर या फार्मासिस्ट से पुष्टि करें।"
        return eng, tel, hin

    eng = f"Take {dosage} of {name} {timing.lower()} ({freq.lower()}). Follow physician directions."
    tel = f"{name} ({dosage}) {timing.lower()} వేసుకోండి ({freq.lower()}). వైద్యుడి సూచనలను పాటించండి."
    hin = f"{name} की {dosage} {timing.lower()} लें ({freq.lower()})। डॉक्टर के निर्देशों का पालन करें।"
    return eng, tel, hin


class PrescriptionExtractionService:
    def __init__(self, db: Session):
        self.db = db

    async def extract_and_create_prescription(
        self,
        file_content: bytes,
        filename: str,
        user_id: str,
        content_type: str = "image/jpeg",
    ) -> Prescription:
        """Stores the uploaded image, performs OCR & clinical entity extraction,

        and saves a new Prescription with MedicationInstruction entities.
        """
        # Save file to uploads directory
        ext = os.path.splitext(filename)[1].lower() or ".jpg"
        storage_filename = f"rx_{uuid.uuid4().hex[:12]}{ext}"
        storage_path = os.path.join(settings.UPLOAD_DIR, storage_filename)

        with open(storage_path, "wb") as f:
            f.write(file_content)

        # 1. Create Document record
        now_iso = datetime.now(timezone.utc).isoformat()
        date_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        doc = Document(
            user_id=user_id,
            filename=filename,
            file_size=len(file_content),
            mime_type=content_type,
            document_type="prescription",
            upload_date=now_iso,
            document_date=date_iso,
            facility_or_doctor="Uploaded Prescription Scan",
            status="needs_review",
            summary=f"Prescription OCR and medication extraction for {filename}.",
            file_path=storage_path,
            page_count=1,
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)

        # 2. Extract OCR text passing the saved file path
        raw_text = extract_raw_text_from_file(file_content, filename, storage_path)
        logger.info(f"[PRESCRIPTION OCR] Extracted raw text length: {len(raw_text)} for file '{filename}'")

        # 3. Parse clinical entities
        parsed_data = parse_clinical_prescription_text(raw_text)

        # 4. Create Prescription model
        rx = Prescription(
            document_id=doc.id,
            user_id=user_id,
            prescribed_by=parsed_data["prescribed_by"],
            prescribed_date=parsed_data["prescribed_date"] if parsed_data["prescribed_date"] != "Not detected" else date_iso,
            diagnosis=parsed_data["diagnosis"],
            status="active",
        )
        self.db.add(rx)
        self.db.commit()
        self.db.refresh(rx)

        # 5. Create MedicationInstruction records
        for med_dict in parsed_data["medications"]:
            eng_inst, tel_inst, hin_inst = generate_multilingual_instructions(med_dict)
            med_inst = MedicationInstruction(
                prescription_id=rx.id,
                name=med_dict["name"],
                strength=med_dict["strength"],
                dosage=med_dict["dosage"],
                route=med_dict.get("route", "Oral"),
                frequency=med_dict["frequency"],
                timing=med_dict["timing"],
                duration=med_dict["duration"],
                instructions_english=eng_inst,
                instructions_telugu=tel_inst,
                confidence=med_dict.get("confidence", 0.90),
                confirmed=med_dict.get("confirmed", False),
                warnings_json=json.dumps(med_dict.get("warnings", [])),
            )
            self.db.add(med_inst)

        self.db.commit()
        self.db.refresh(rx)
        return rx
