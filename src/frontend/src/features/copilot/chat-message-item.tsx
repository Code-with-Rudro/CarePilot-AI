import React from 'react';
import { Bot, User, FileText, AlertCircle } from 'lucide-react';
import { ChatMessage, CitationSource } from '../../types/chat';

interface ChatMessageItemProps {
  message: ChatMessage;
  onSelectCitation: (citation: CitationSource) => void;
  onSelectSuggestedQuestion?: (q: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onSelectCitation,
  onSelectSuggestedQuestion,
}) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.875rem',
        padding: '0.75rem 0',
        animation: 'fadeIn var(--transition-fast) ease-out',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: isAssistant ? 'var(--color-primary)' : 'var(--color-accent)',
          color: isAssistant ? '#ffffff' : 'var(--color-primary-dark)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isAssistant ? <Bot size={18} /> : <User size={18} />}
      </div>

      {/* Message Content */}
      <div style={{ flex: 1, maxWidth: '85%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
            {isAssistant ? 'CarePilot AI' : 'You'}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
            {message.timestamp}
          </span>
        </div>

        <div
          style={{
            backgroundColor: isAssistant ? 'var(--color-surface)' : 'var(--color-accent)',
            color: 'var(--color-text-main)',
            border: '1px solid var(--color-border)',
            borderRadius: isAssistant
              ? '0 var(--radius-lg) var(--radius-lg) var(--radius-lg)'
              : 'var(--radius-lg) 0 var(--radius-lg) var(--radius-lg)',
            padding: '1rem 1.125rem',
            fontSize: '0.9375rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {message.content}

          {message.insufficientEvidence && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '0.75rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--color-attention-bg)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-attention)',
                fontSize: '0.8125rem',
              }}
            >
              <AlertCircle size={16} />
              <span>Groundedness Guard: No unsupported statements were hallucinated.</span>
            </div>
          )}

          {/* Citations section */}
          {message.citations && message.citations.length > 0 && (
            <div
              style={{
                marginTop: '0.875rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Sources:
              </span>
              {message.citations.map((c, i) => (
                <button
                  key={i}
                  onClick={() => onSelectCitation(c)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.75rem',
                    color: 'var(--color-primary-dark)',
                    fontWeight: 500,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <FileText size={12} color="var(--color-primary)" />
                  <span>{c.documentName} (p. {c.page})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Suggested Questions */}
        {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.625rem' }}>
            {message.suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSuggestedQuestion?.(q)}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.3125rem 0.625rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-primary)',
                  fontWeight: 500,
                  transition: 'all var(--transition-fast)',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
