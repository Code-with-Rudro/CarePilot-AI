const API_BASE_URL = 'http://127.0.0.1:8000';

interface TTSResponse {
    success: boolean;
    audio_url: string;
}

export type TTSLanguage = 'english' | 'telugu' | 'hindi';

// Verified Murf AI voices:
// - English & Telugu (multilingual Gen2): en-US-miles
// - Hindi (native Hindi India): hi-IN-shweta
export const TTS_VOICES: Record<TTSLanguage, string> = {
    english: 'en-US-miles',
    telugu: 'en-US-miles',
    hindi: 'hi-IN-shweta',
};

export async function generateSpeech(
    text: string,
    voiceId: string = TTS_VOICES.english
): Promise<string> {
    if (!text.trim()) {
        throw new Error('No prescription instructions available.');
    }

    const response = await fetch(`${API_BASE_URL}/api/tts/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text,
            voice_id: voiceId,
        }),
    });

    if (!response.ok) {
        throw new Error(`Speech generation failed (${response.status}).`);
    }

    const data: TTSResponse = await response.json();

    if (!data.success || !data.audio_url) {
        throw new Error('No audio was returned by the TTS service.');
    }

    return data.audio_url;
}