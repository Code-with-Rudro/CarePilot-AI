import os
import pytest
from app.services.prescription_extraction_service import (
    extract_raw_text_from_file,
    parse_clinical_prescription_text,
)

def test_real_prescription_image_extraction():
    img_path = r"C:\Users\N MANIKANTA\OneDrive\Desktop\CarePilot-AI\src\backend\uploads\rx_685a3f085229.png"
    if not os.path.exists(img_path):
        pytest.skip("Image not found")
        
    with open(img_path, "rb") as f:
        content = f.read()
        
    raw_text = extract_raw_text_from_file(content, "rx_test.png", img_path)
    print("RAW TEXT EXTRACTED LENGTH:", len(raw_text))
    parsed = parse_clinical_prescription_text(raw_text)
    
    assert "Srinivas" in parsed["prescribed_by"]
    assert "10/06/2025" in parsed["prescribed_date"]
    
    med_names = [m["name"] for m in parsed["medications"]]
    print("EXTRACTED MEDS:", med_names)
    assert "Paracetamol" in med_names
    assert "Cetirizine" in med_names
    assert "Ambroxol" in med_names
    
    para = next(m for m in parsed["medications"] if m["name"] == "Paracetamol")
    assert para["strength"] == "500mg"
    assert "Three times" in para["frequency"] or "thrice" in para["frequency"].lower()
    assert "After food" in para["timing"]
    assert "5 days" in para["duration"]
    
    ceti = next(m for m in parsed["medications"] if m["name"] == "Cetirizine")
    assert ceti["strength"] == "10mg"
    assert "Once" in ceti["frequency"]
    
    amb = next(m for m in parsed["medications"] if m["name"] == "Ambroxol")
    assert "30mg" in amb["strength"]
    assert "10 ml" in amb["dosage"]
