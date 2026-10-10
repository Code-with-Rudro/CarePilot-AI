# User Roles
ROLE_CANDIDATE = "candidate"
ROLE_PATIENT = "patient"
ROLE_RECEPTIONIST = "receptionist"
ROLE_CLINICIAN = "clinician_reviewer"
ROLE_CAREGIVER = "caregiver"

VALID_ROLES = {ROLE_CANDIDATE, ROLE_PATIENT, ROLE_RECEPTIONIST, ROLE_CLINICIAN, ROLE_CAREGIVER}

# Document Types
DOC_TYPE_PRESCRIPTION = "prescription"
DOC_TYPE_LAB_REPORT = "lab_report"
DOC_TYPE_DISCHARGE_SUMMARY = "discharge_summary"
DOC_TYPE_IMAGING_REPORT = "imaging_report"
DOC_TYPE_DIAGNOSTIC = "diagnostic"
DOC_TYPE_GENERAL = "general"

# Processing Status
STATUS_UPLOADED = "uploaded"
STATUS_READING = "reading"
STATUS_EXTRACTING = "extracting"
STATUS_NEEDS_REVIEW = "needs_review"
STATUS_PROCESSED = "processed"
STATUS_FAILED = "failed"

# Review Status
REVIEW_UNVERIFIED = "unverified"
REVIEW_CONFIRMED = "confirmed"
REVIEW_CORRECTED = "corrected"
REVIEW_REJECTED = "rejected"

# Reminder Status
REMINDER_PENDING = "pending"
REMINDER_TAKEN = "taken"
REMINDER_SKIPPED = "skipped"
REMINDER_SNOOZED = "snoozed"

# Verified Medicine Catalog for AR & lookup
VERIFIED_MEDICINE_CATALOG = {
    "paracetamol": {
        "name": "Paracetamol (Acetaminophen)",
        "genericName": "Paracetamol",
        "standardStrength": "500mg / 650mg",
        "category": "Analgesic & Antipyretic",
        "primaryUse": "Relief of mild-to-moderate fever, headache, body aches",
        "safetyAdvisory": "Never exceed 4,000mg in 24 hours. Avoid concurrent alcohol consumption to protect liver health.",
        "commonSideEffects": ["Rare nausea", "Allergic rash (very rare)"],
        "schedule": "Over-the-counter (OTC)",
        "teluguSummary": "జ్వరం మరియు శరీర నొప్పుల నివారణకు వాడతారు. రోజుకు 4 గ్రాములకు మించి వాడకూడదు.",
        "verifiedManufacturer": "GSK / Micro Labs (Dolo)",
    },
    "metoprolol": {
        "name": "Metoprolol Tartrate",
        "genericName": "Metoprolol",
        "standardStrength": "25mg / 50mg",
        "category": "Beta-blocker (Antihypertensive)",
        "primaryUse": "Management of high blood pressure and angina pectoris",
        "safetyAdvisory": "Do not discontinue abruptly. Take consistently with or immediately after food.",
        "commonSideEffects": ["Mild dizziness upon standing", "Fatigue", "Slow heart rate"],
        "schedule": "Schedule H Prescription Only",
        "teluguSummary": "రక్తపోటు (BP) మరియు గుండె సంబంధిత సమస్యల నియంత్రణకు వాడతారు. ఉదయం అల్పాహారం తర్వాత వేసుకోవాలి.",
        "verifiedManufacturer": "AstraZeneca / Sun Pharma",
    },
    "pantoprazole": {
        "name": "Pantoprazole Sodium",
        "genericName": "Pantoprazole",
        "standardStrength": "40mg",
        "category": "Proton Pump Inhibitor (PPI)",
        "primaryUse": "Acid reflux (GERD), gastric ulcer prophylaxis",
        "safetyAdvisory": "Take once daily in the morning, 30 to 60 minutes before breakfast.",
        "commonSideEffects": ["Headache", "Mild abdominal discomfort"],
        "schedule": "Schedule H Prescription Only",
        "teluguSummary": "ఎసిడిటీ మరియు గ్యాస్ సమస్యల నివారణకు వాడతారు. ఉదయం టిఫిన్ కు 30 నిమిషాల ముందు వేసుకోవాలి.",
        "verifiedManufacturer": "Alkem Laboratories / Torrent",
    },
    "atorvastatin": {
        "name": "Atorvastatin Calcium",
        "genericName": "Atorvastatin",
        "standardStrength": "10mg / 20mg",
        "category": "HMG-CoA Reductase Inhibitor (Statin)",
        "primaryUse": "Lowering low-density lipoprotein (LDL) cholesterol and cardiovascular risk reduction",
        "safetyAdvisory": "Take at bedtime. Report unexplained muscle aches or weakness immediately.",
        "commonSideEffects": ["Mild joint pain", "Headache"],
        "schedule": "Schedule H Prescription Only",
        "teluguSummary": "కొలెస్ట్రాల్ తగ్గించడానికి వాడతారు. రాత్రి భోజనం తర్వాత నిద్రపోయే ముందు వేసుకోవాలి.",
        "verifiedManufacturer": "Pfizer / Cipla",
    },
    "amoxicillin": {
        "name": "Amoxicillin Trihydrate",
        "genericName": "Amoxicillin",
        "standardStrength": "500mg",
        "category": "Broad-spectrum Penicillin Antibiotic",
        "primaryUse": "Bacterial respiratory, ENT, and dental infections",
        "safetyAdvisory": "Complete the full prescribed course even if symptoms resolve earlier. Take with meals.",
        "commonSideEffects": ["Diarrhea", "Mild nausea", "Skin rash in allergic individuals"],
        "schedule": "Schedule H1 Antibiotic",
        "teluguSummary": "బాక్టీరియల్ ఇన్ఫెక్షన్ల నివారణకు యాంటీబయాటిక్. డాక్టర్ చెప్పిన పూర్తి కాలం వరకు వాడాలి.",
        "verifiedManufacturer": "GlaxoSmithKline (Augmentin) / Alkem",
    }
}
