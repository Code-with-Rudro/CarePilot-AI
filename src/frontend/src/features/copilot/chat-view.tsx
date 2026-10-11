import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { SafetyDisclaimer } from './safety-disclaimer';
import { ChatMessageItem } from './chat-message-item';
import { CitationPopover } from './citation-popover';
import { useCopilotChat } from '../../hooks/use-copilot-chat';
import { CitationSource } from '../../types/chat';
import { Send, Bot, RotateCcw, Sparkles, Mic, MicOff, Plus, Image as ImageIcon, X, Upload } from 'lucide-react';

const STT_LANGUAGES = [
  { code: 'en-IN', label: 'English (India)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'te-IN', label: 'తెలుగు (Telugu)' },
  { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
] as const;

interface ChatViewProps {
  initialQuery?: string;
  onOpenDocument?: (docId: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  initialQuery,
  onOpenDocument,
}) => {
  const { messages, isTyping, sendMessage, uploadAndExtractImage, clearChat } = useCopilotChat();
  const [inputText, setInputText] = useState(initialQuery || '');
  const [selectedLang, setSelectedLang] = useState<string>('en-IN');
  const [isListening, setIsListening] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<CitationSource | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup abort error
        }
        recognitionRef.current = null;
      }
      if (filePreview) {
        try {
          URL.revokeObjectURL(filePreview);
        } catch {
          // ignore
        }
      }
    };
  }, [filePreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (filePreview) {
      try {
        URL.revokeObjectURL(filePreview);
      } catch {}
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    if (filePreview) {
      try {
        URL.revokeObjectURL(filePreview);
      } catch {}
    }
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore stop error
      }
      recognitionRef.current = null;
      setIsListening(false);
    }

    if (selectedFile) {
      uploadAndExtractImage(selectedFile, inputText);
      handleRemoveFile();
      setInputText('');
    } else {
      sendMessage(inputText);
      setInputText('');
    }
  };

  const handleSpeechToText = () => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    // Toggle off if already listening
    if (isListening || recognitionRef.current) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Error stopping speech recognition:', err);
        }
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = selectedLang;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Remember current text so spoken words append smoothly
      baseTextRef.current = inputText.trim();

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const transcript = res[0]?.transcript || '';
          if (res.isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const speechTranscript = (finalTranscript + interimTranscript).trim();
        if (speechTranscript) {
          const base = baseTextRef.current;
          setInputText(base ? `${base} ${speechTranscript}` : speechTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // Normal pause during listening; keep listening without interrupting user
          return;
        }
        if (event.error === 'aborted') {
          return;
        }

        const activeLang =
          STT_LANGUAGES.find((l) => l.code === selectedLang)?.label || selectedLang;

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          alert('Microphone access was denied. Please allow microphone permissions in your browser settings.');
        } else if (event.error === 'language-not-supported') {
          alert(`Speech recognition for ${activeLang} is not supported on this browser. Falling back to English.`);
          setSelectedLang('en-IN');
        } else if (event.error === 'audio-capture') {
          alert('No microphone was detected. Please verify your microphone connection.');
        } else if (event.error === 'network') {
          console.warn('Network issue during speech recognition');
        } else {
          console.error('Speech recognition error:', event.error);
        }

        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      alert('Unable to access microphone. Please check your browser microphone permissions.');
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  const samplePrompts = [
    'What does my Haemoglobin level mean?',
    'What instructions are in my Metoprolol prescription?',
    'What is my latest Fasting Blood Glucose?',
    'Explain my HbA1c result in plain words',
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '100%',
        gap: '0.75rem',
        position: 'relative',
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.type.startsWith('image/') || file.name.endsWith('.pdf'))) {
          if (filePreview) {
            try { URL.revokeObjectURL(filePreview); } catch {}
          }
          setSelectedFile(file);
          if (file.type.startsWith('image/')) {
            setFilePreview(URL.createObjectURL(file));
          } else {
            setFilePreview(null);
          }
        }
      }}
    >
      <SafetyDisclaimer />

      {/* Main Chat Box */}
      <Card
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          overflow: 'hidden',
          backgroundColor: 'var(--color-surface)',
          border: isDragging ? '2px dashed var(--color-primary)' : '1px solid var(--color-border)',
          position: 'relative',
        }}
      >
        {/* Drag Overlay */}
        {isDragging && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              backgroundColor: 'rgba(23, 107, 102, 0.12)',
              backdropFilter: 'blur(2px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              color: 'var(--color-primary)',
              fontWeight: 600,
              pointerEvents: 'none',
            }}
          >
            <Upload size={36} />
            <span>Drop image to extract details</span>
          </div>
        )}

        {/* Chat top header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.875rem 1.125rem',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                Document-Grounded RAG Assistant
              </h3>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                Retrieves answers & extracts details from your medical scans
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={clearChat}
            leftIcon={<RotateCcw size={14} />}
          >
            Reset Chat
          </Button>
        </div>

        {/* Messages scroll area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.125rem', display: 'flex', flexDirection: 'column' }}>
          {messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              onSelectCitation={(c) => setSelectedCitation(c)}
              onSelectSuggestedQuestion={(q) => sendMessage(q)}
            />
          ))}

          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={18} />
              </div>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: '0 var(--radius-lg) var(--radius-lg) var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', animation: 'pulseGlow 1s infinite' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', animation: 'pulseGlow 1s infinite 0.2s' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', animation: 'pulseGlow 1s infinite 0.4s' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '0.375rem' }}>
                  Extracting entities with OCR & grounding clinical response...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Prompt Pills & Language Selector */}
        <div
          style={{
            padding: '0.45rem 1rem',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              whiteSpace: 'nowrap',
              fontSize: '0.75rem',
              padding: '0.25rem 0.625rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-accent)',
              border: '1.5px solid var(--color-primary)',
              color: 'var(--color-primary-dark)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              flexShrink: 0,
            }}
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>Upload Image to Extract</span>
          </button>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(prompt)}
              style={{
                whiteSpace: 'nowrap',
                fontSize: '0.75rem',
                padding: '0.25rem 0.625rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
                fontWeight: 500,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {prompt}
            </button>
          ))}

          {/* STT Language Selector in Quick Bar */}
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              flexShrink: 0,
              padding: '0.15rem 0.4rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Mic:</span>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              disabled={isListening || isTyping}
              title="Select speech recognition language"
              aria-label="Speech recognition language"
              style={{
                fontSize: '0.6875rem',
                fontWeight: 500,
                color: 'var(--color-text-main)',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                cursor: isListening || isTyping ? 'not-allowed' : 'pointer',
              }}
            >
              {STT_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected File Preview Strip with Prominent SEND Option */}
        {selectedFile && (
          <div
            style={{
              padding: '0.625rem 1rem',
              backgroundColor: 'var(--color-accent)',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              animation: 'fadeIn var(--transition-fast) ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden', flex: 1 }}>
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Selected upload"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    objectFit: 'cover',
                    border: '1px solid var(--color-border)',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                    flexShrink: 0,
                  }}
                >
                  <ImageIcon size={18} />
                </div>
              )}
              <div style={{ overflow: 'hidden' }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--color-text-main)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {selectedFile.name}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                  Image attached • {(selectedFile.size / 1024).toFixed(1)} KB (ready to extract)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              {/* PRIMARY SEND BUTTON IN PREVIEW STRIP */}
              <button
                type="button"
                id="preview-send-button"
                onClick={handleSend}
                disabled={isTyping}
                title="Send and extract medical image details"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.375rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: isTyping ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary-dark)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                }}
              >
                <Send size={13} />
                <span>Send Image</span>
              </button>

              <button
                type="button"
                onClick={handleRemoveFile}
                title="Remove selected image"
                aria-label="Remove image"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--color-critical)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)')}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Active Listening Status Banner */}
        {isListening && (
          <div
            style={{
              padding: '0.4rem 1rem',
              backgroundColor: 'var(--color-critical-bg)',
              borderTop: '1px solid rgba(220, 38, 38, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--color-critical)',
              fontWeight: 600,
              animation: 'fadeIn var(--transition-fast) ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-critical)',
                  display: 'inline-block',
                  animation: 'pulseGlow 1s infinite',
                }}
              />
              <span>
                Listening in {STT_LANGUAGES.find((l) => l.code === selectedLang)?.label || 'English'}... Speak into your microphone
              </span>
            </div>
            <button
              type="button"
              onClick={handleSpeechToText}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--color-critical)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.75rem',
              }}
            >
              Done (Stop)
            </button>
          </div>
        )}

        {/* Input Form */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '0.75rem 1rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* Upload symbol + button */}
          <button
            type="button"
            id="copilot-upload-plus-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isTyping}
            title="Upload prescription or lab report image (+)"
            aria-label="Upload prescription or lab report image"
            style={{
              width: '36px',
              height: '36px',
              minWidth: '36px',
              borderRadius: '50%',
              border: '1.5px solid var(--color-primary)',
              backgroundColor: selectedFile ? 'var(--color-primary)' : 'var(--color-accent)',
              color: selectedFile ? '#ffffff' : 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isTyping ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
              flexShrink: 0,
              boxShadow: 'var(--shadow-sm)',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 3px 10px rgba(23, 107, 102, 0.35)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <Plus size={20} strokeWidth={2.6} />
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={
              isListening
                ? "🎙️ Listening... Speak into your microphone (words stream live)"
                : selectedFile
                ? "Add an optional message or click Send..."
                : "Ask a question, or click + to upload image..."
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            disabled={isTyping}
            style={{
              flex: 1,
              minWidth: 0,
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              border: isListening ? '1.5px solid var(--color-critical)' : '1px solid var(--color-border)',
              backgroundColor: isListening ? 'var(--color-critical-bg)' : 'var(--color-bg)',
              color: 'var(--color-text-main)',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border-color 0.2s, background-color 0.2s',
            }}
          />

          {/* SPEECH-TO-TEXT MICROPHONE BUTTON (Compact with active glow) */}
          <button
            type="button"
            onClick={handleSpeechToText}
            disabled={isTyping}
            title={isListening ? 'Listening... (Click to stop)' : 'Speak your question'}
            aria-label="Speech recognition microphone"
            style={{
              width: '36px',
              height: '36px',
              minWidth: '36px',
              borderRadius: '50%',
              border: isListening ? '1.5px solid var(--color-critical)' : '1px solid var(--color-border)',
              backgroundColor: isListening ? 'var(--color-critical)' : 'var(--color-bg)',
              color: isListening ? '#ffffff' : 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isTyping ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
              flexShrink: 0,
              boxShadow: isListening ? '0 0 10px rgba(220, 38, 38, 0.5)' : 'none',
              transform: isListening ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          {/* PROMINENT ALWAYS-VISIBLE SEND BUTTON */}
          <Button
            type="submit"
            id="copilot-send-button"
            variant="primary"
            disabled={(!inputText.trim() && !selectedFile) || isTyping}
            rightIcon={<Send size={15} />}
            style={{
              flexShrink: 0,
              minWidth: '76px',
              padding: '0.5rem 0.875rem',
              fontWeight: 600,
            }}
          >
            Send
          </Button>
        </form>
      </Card>

      {/* Citation provenance popover */}
      <CitationPopover
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
        onOpenDocument={onOpenDocument}
      />
    </div>
  );
};
