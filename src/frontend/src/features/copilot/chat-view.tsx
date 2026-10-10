import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { SafetyDisclaimer } from './safety-disclaimer';
import { ChatMessageItem } from './chat-message-item';
import { CitationPopover } from './citation-popover';
import { useCopilotChat } from '../../hooks/use-copilot-chat';
import { CitationSource } from '../../types/chat';
import { Send, Bot, RotateCcw, Sparkles, Mic, MicOff } from 'lucide-react';

interface ChatViewProps {
  initialQuery?: string;
  onOpenDocument?: (docId: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  initialQuery,
  onOpenDocument,
}) => {
  const { messages, isTyping, sendMessage, clearChat } = useCopilotChat();
  const [inputText, setInputText] = useState(initialQuery || '');
  const [isListening, setIsListening] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<CitationSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };
  const handleSpeechToText = () => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome.');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText((previous) =>
        previous ? `${previous} ${transcript}` : transcript
      );
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const samplePrompts = [
    'What does my Haemoglobin level mean?',
    'What instructions are in my Metoprolol prescription?',
    'What is my latest Fasting Blood Glucose?',
    'Explain my HbA1c result in plain words',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)', gap: '1rem' }}>
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
        }}
      >
        {/* Chat top header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
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
                Retrieves answers only from your authorized medical documents
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
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
                  Retrieving passages & grounding response...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Prompt Pills */}
        <div
          style={{
            padding: '0.625rem 1.25rem',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            Quick Prompts:
          </span>
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
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <input
            type="text"
            placeholder="Ask a question about your reports, prescriptions, or lab results..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            style={{
              flex: 1,
              padding: '0.6875rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text-main)',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />

          {/* SPEECH-TO-TEXT MICROPHONE BUTTON */}
          <Button
            type="button"
            variant="ghost"
            onClick={handleSpeechToText}
            disabled={isTyping}
            title={isListening ? 'Listening...' : 'Speak your question'}
            leftIcon={
              isListening ? <MicOff size={18} /> : <Mic size={18} />
            }
          >
            {isListening ? 'Listening...' : 'Speak'}
          </Button>

          {/* EXISTING ASK BUTTON */}
          <Button
            type="submit"
            variant="primary"
            disabled={!inputText.trim() || isTyping}
            rightIcon={<Send size={15} />}
          >
            Ask
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
