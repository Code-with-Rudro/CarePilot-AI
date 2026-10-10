import React, { useState } from 'react';
import { Volume2, Languages, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

interface TeluguTranslationPanelProps {
  englishText: string;
  teluguText?: string;
  medicationName: string;
}

export const TeluguTranslationPanel: React.FC<TeluguTranslationPanelProps> = ({
  englishText,
  teluguText,
  medicationName,
}) => {
  const [activeLanguage, setActiveLanguage] = useState<'english' | 'telugu'>('english');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      setIsPlayingAudio(true);
      const textToSpeak = activeLanguage === 'telugu' && teluguText ? teluguText : englishText;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = activeLanguage === 'telugu' ? 'te-IN' : 'en-IN';
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Languages size={15} color="var(--color-primary)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
            Regional Language Explanation (English / తెలుగు)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            <button
              onClick={() => setActiveLanguage('english')}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.6875rem',
                fontWeight: activeLanguage === 'english' ? 600 : 500,
                backgroundColor: activeLanguage === 'english' ? 'var(--color-primary)' : 'transparent',
                color: activeLanguage === 'english' ? '#ffffff' : 'var(--color-text-secondary)',
              }}
            >
              English
            </button>
            <button
              onClick={() => setActiveLanguage('telugu')}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.6875rem',
                fontWeight: activeLanguage === 'telugu' ? 600 : 500,
                backgroundColor: activeLanguage === 'telugu' ? 'var(--color-primary)' : 'transparent',
                color: activeLanguage === 'telugu' ? '#ffffff' : 'var(--color-text-secondary)',
              }}
            >
              తెలుగు (Telugu)
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

      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-main)', lineHeight: 1.5, fontStyle: activeLanguage === 'telugu' ? 'normal' : 'normal' }}>
        {activeLanguage === 'telugu' && teluguText ? (
          <div>
            <p style={{ fontWeight: 500, color: 'var(--color-primary-dark)' }}>{teluguText}</p>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
              * ధృవీకరించబడిన ప్రిస్క్రిప్షన్ ఆధారంగా రూపొందించబడింది (Grounded in verified prescription)
            </span>
          </div>
        ) : (
          <p>{englishText}</p>
        )}
      </div>
    </div>
  );
};
