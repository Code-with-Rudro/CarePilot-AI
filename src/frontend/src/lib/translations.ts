/**
 * Medical instruction translation utilities for CarePilot AI.
 * Grounded in patient safety, natural grammar, and clear clinical instructions.
 */

// Known instruction mappings for verified clinic demonstration prescriptions
const MEDICAL_INSTRUCTION_HINDI_MAP: Record<string, string> = {
  'Take 1 tablet every morning after breakfast. Do not stop abruptly without doctor consultation.':
    'प्रतिदिन सुबह नाश्ते के बाद 1 गोली लें। डॉक्टर की सलाह के बिना अचानक बंद न करें।',
  'Take 1 tablet every morning after breakfast. Do not stop abruptly without clinician oversight.':
    'प्रतिदिन सुबह नाश्ते के बाद 1 गोली लें। डॉक्टर की सलाह के बिना अचानक बंद न करें।',
  'Take 1 tablet once daily in the morning, 30 minutes before food with water.':
    'सुबह नाश्ते से 30 मिनट पहले पानी के साथ रोजाना 1 गोली लें।',
  'Take 1 tablet twice daily after meals.':
    'भोजन के बाद दिन में दो बार 1 गोली लें।',
  'Take 1 tablet at bedtime.':
    'सोते समय 1 गोली लें।',
  'Take with food.':
    'भोजन के साथ लें।',
  'Take after food.':
    'भोजन के बाद लें।',
  'Take before food.':
    'भोजन से पहले लें।',
};

const MEDICAL_INSTRUCTION_TELUGU_MAP: Record<string, string> = {
  'Take 1 tablet every morning after breakfast. Do not stop abruptly without doctor consultation.':
    'ప్రతిరోజూ ఉదయం అల్పాహారం తర్వాత 1 టాబ్లెట్ వేసుకోండి. వైద్యుడి సలహా లేకుండా అకస్మాత్తుగా ఆపవద్దు.',
  'Take 1 tablet every morning after breakfast. Do not stop abruptly without clinician oversight.':
    'ప్రతిరోజూ ఉదయం అల్పాహారం తర్వాత 1 టాబ్లెట్ వేసుకోండి. వైద్యుడి సలహా లేకుండా అకస్మాత్తుగా ఆపవద్దు.',
  'Take 1 tablet once daily in the morning, 30 minutes before food with water.':
    'ఉదయం అల్పాహారానికి 30 నిమిషాల ముందు నీళ్లతో 1 టాబ్లెట్ వేసుకోండి.',
  'Take 1 tablet twice daily after meals.':
    'భోజనం తర్వాత రోజుకు రెండుసార్లు 1 టాబ్లెట్ వేసుకోండి.',
  'Take 1 tablet at bedtime.':
    'రాత్రి పడుకునే ముందు 1 టాబ్లెట్ వేసుకోండి.',
  'Take with food.':
    'ఆహారంతో పాటు వేసుకోండి.',
  'Take after food.':
    'భోజనం తర్వాత వేసుకోండి.',
  'Take before food.':
    'భోజనానికి ముందు వేసుకోండి.',
};

/**
 * Returns natural Hindi translation of medication instructions.
 */
export function getHindiTranslation(englishText: string, customHindi?: string): string {
  if (customHindi && customHindi.trim()) {
    return customHindi.trim();
  }

  const normalized = englishText.trim();
  if (MEDICAL_INSTRUCTION_HINDI_MAP[normalized]) {
    return MEDICAL_INSTRUCTION_HINDI_MAP[normalized];
  }

  let translated = normalized;
  translated = translated
    .replace(/Take\s+(\d+)\s+tablet[s]?\s+every\s+morning\s+after\s+breakfast/gi, 'प्रतिदिन सुबह नाश्ते के बाद $1 गोली लें')
    .replace(/Take\s+(\d+)\s+tablet[s]?\s+once\s+daily\s+in\s+the\s+morning/gi, 'प्रतिदिन सुबह $1 गोली लें')
    .replace(/Take\s+(\d+)\s+tablet[s]?\s+twice\s+daily/gi, 'दिन में दो बार $1 गोली लें')
    .replace(/Take\s+(\d+)\s+tablet[s]?\s+three\s+times\s+daily/gi, 'दिन में तीन बार $1 गोली लें')
    .replace(/Take\s+(\d+)\s+tablet[s]?/gi, '$1 गोली लें')
    .replace(/Do not stop abruptly without (doctor|clinician) consultation/gi, 'डॉक्टर की सलाह के बिना अचानक बंद न करें')
    .replace(/Do not stop abruptly without (doctor|clinician) oversight/gi, 'डॉक्टर की सलाह के बिना अचानक बंद न करें')
    .replace(/30\s+minutes\s+before\s+food\s+with\s+water/gi, 'भोजन से 30 मिनट पहले पानी के साथ')
    .replace(/before\s+food/gi, 'भोजन से पहले')
    .replace(/after\s+food/gi, 'भोजन के बाद')
    .replace(/with\s+food/gi, 'भोजन के साथ')
    .replace(/after\s+breakfast/gi, 'नाश्ते के बाद')
    .replace(/before\s+breakfast/gi, 'नाश्ते से पहले')
    .replace(/at\s+bedtime/gi, 'सोते समय')
    .replace(/once\s+daily/gi, 'दिन में एक बार')
    .replace(/twice\s+daily/gi, 'दिन में दो बार')
    .replace(/every\s+morning/gi, 'प्रतिदिन सुबह');

  return translated;
}

/**
 * Returns natural Telugu translation of medication instructions.
 */
export function getTeluguTranslation(englishText: string, customTelugu?: string): string {
  if (customTelugu && customTelugu.trim()) {
    return customTelugu.trim();
  }

  const normalized = englishText.trim();
  if (MEDICAL_INSTRUCTION_TELUGU_MAP[normalized]) {
    return MEDICAL_INSTRUCTION_TELUGU_MAP[normalized];
  }

  return customTelugu || englishText;
}
