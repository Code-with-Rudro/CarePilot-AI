import React, { useState, useRef } from 'react';
import { Volume2, Languages } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { generateSpeech, TTS_VOICES, TTSLanguage } from '../../lib/tts';
import { getHindiTranslation, getTeluguTranslation } from '../../lib/translations';

interface TeluguTranslationPanelProps {
  englishText: string;
  teluguText?: string;
  hindiText?: string;
  medicationName: string;
}

export const TeluguTranslationPanel: React.FC<TeluguTranslationPanelProps> = ({
  englishText,
  teluguText,
  hindiText,
  medicationName,
}) => {
  const [activeLanguage, setActiveLanguage] = useState<TTSLanguage>('english');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const resolvedTeluguText = getTeluguTranslation(englishText, teluguText);
  const resolvedHindiText = getHindiTranslation(englishText, hindiText);

  const handleLanguageChange = (lang: TTSLanguage) => {
    // Stop any current audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setAudioUrl(null);
    setTtsError(null);
    setActiveLanguage(lang);
  };

  const handleSpeak = async () => {
    setTtsError(null);
    setIsPlayingAudio(true);

    let textToSpeak = englishText;
    let voiceId = TTS_VOICES.english;
    let fallbackLocale = 'en-IN';

    if (activeLanguage === 'telugu') {
      textToSpeak = resolvedTeluguText;
      voiceId = TTS_VOICES.telugu;
      fallbackLocale = 'te-IN';
    } else if (activeLanguage === 'hindi') {
      textToSpeak = resolvedHindiText;
      voiceId = TTS_VOICES.hindi;
      fallbackLocale = 'hi-IN';
    }

    try {
      // 1. Try Murf AI backend TTS with language-specific voice ID
      const url = await generateSpeech(textToSpeak, voiceId);
      if (url) {
        setAudioUrl(url);
        const audio = new Audio(url);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => {
          setIsPlayingAudio(false);
          setTtsError('Audio playback failed from TTS service.');
        };
        await audio.play();
        return;
      }
      throw new Error('No audio URL returned');
    } catch (err) {
      // 2. Graceful fallback to browser Web Speech API
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = fallbackLocale;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => {
          setIsPlayingAudio(false);
          setTtsError('Unable to play audio in selected language.');
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlayingAudio(false);
        setTtsError('Speech playback failed and browser speech synthesis is unavailable.');
      }
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '0.875rem',
        marginTop: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Languages size={15} color="var(--color-primary)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
            Regional Language Explanation (English / తెలుగు / हिन्दी)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => handleLanguageChange('english')}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.6875rem',
                fontWeight: activeLanguage === 'english' ? 600 : 500,
                backgroundColor: activeLanguage === 'english' ? 'var(--color-primary)' : 'transparent',
                color: activeLanguage === 'english' ? '#ffffff' : 'var(--color-text-secondary)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('telugu')}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.6875rem',
                fontWeight: activeLanguage === 'telugu' ? 600 : 500,
                backgroundColor: activeLanguage === 'telugu' ? 'var(--color-primary)' : 'transparent',
                color: activeLanguage === 'telugu' ? '#ffffff' : 'var(--color-text-secondary)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              తెలుగు (Telugu)
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('hindi')}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.6875rem',
                fontWeight: activeLanguage === 'hindi' ? 600 : 500,
                backgroundColor: activeLanguage === 'hindi' ? 'var(--color-primary)' : 'transparent',
                color: activeLanguage === 'hindi' ? '#ffffff' : 'var(--color-text-secondary)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              हिन्दी (Hindi)
            </button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleSpeak}
            disabled={isPlayingAudio}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.6875rem' }}
            leftIcon={<Volume2 size={13} />}
          >
            {isPlayingAudio ? 'Playing...' : 'Audio'}
          </Button>
        </div>
      </div>

      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
        {activeLanguage === 'telugu' ? (
          <div>
            <p style={{ fontWeight: 500, color: 'var(--color-primary-dark)' }}>{resolvedTeluguText}</p>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
              * ధృవీకరించబడిన ప్రిస్క్రిప్షన్ ఆధారంగా రూపొందించబడింది (Grounded in verified prescription)
            </span>
          </div>
        ) : activeLanguage === 'hindi' ? (
          <div>
            <p style={{ fontWeight: 500, color: 'var(--color-primary-dark)' }}>{resolvedHindiText}</p>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
              * सत्यापित पर्चे के आधार पर तैयार किया गया (Grounded in verified prescription)
            </span>
          </div>
        ) : (
          <p>{englishText}</p>
        )}
      </div>

      {audioUrl && (
        <div style={{ marginTop: '0.625rem' }}>
          <audio
            ref={audioRef}
            controls
            src={audioUrl}
            style={{ width: '100%', height: '32px' }}
            onError={() => {
              setTtsError('Audio playback failed.');
            }}
          />
        </div>
      )}

      {ttsError && (
        <p style={{ fontSize: '0.6875rem', color: 'var(--color-attention)', marginTop: '0.375rem' }}>
          {ttsError}
        </p>
      )}
    </div>
  );
};
