import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, ChevronDown } from 'lucide-react';
import { ChatView } from './chat-view';

interface CopilotFabProps {
  onOpenDocument?: (docId: string) => void;
}

export const CopilotFab: React.FC<CopilotFabProps> = ({ onOpenDocument }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  // Trap focus inside panel when open
  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimatingOut(false);
    }, 220);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.75rem',
          right: '1.75rem',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.5rem',
        }}
      >
        {/* Tooltip label shown above button */}
        {!isOpen && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-surface)',
              backgroundColor: 'var(--color-primary-dark)',
              padding: '0.25rem 0.625rem',
              borderRadius: 'var(--radius-full)',
              whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-md)',
              pointerEvents: 'none',
              animation: 'fabTooltipIn 0.3s ease-out',
            }}
          >
            Open Health Copilot
          </span>
        )}

        <button
          id="copilot-fab-button"
          aria-label="Open Health Copilot"
          aria-expanded={isOpen}
          aria-controls="copilot-panel"
          onClick={() => (isOpen ? handleClose() : setIsOpen(true))}
          title="Open Health Copilot"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: isOpen ? 'var(--color-critical)' : 'var(--color-primary)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(23, 107, 102, 0.45)',
            transition: 'background-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast)',
            transform: isOpen ? 'scale(0.92)' : 'scale(1)',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 28px rgba(23, 107, 102, 0.55)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = isOpen ? 'scale(0.92)' : 'scale(1)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(23, 107, 102, 0.45)';
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLButtonElement).style.outline = '3px solid rgba(23, 107, 102, 0.5)';
            (e.currentTarget as HTMLButtonElement).style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLButtonElement).style.outline = 'none';
          }}
        >
          {isOpen ? <ChevronDown size={22} /> : <Bot size={24} />}
        </button>
      </div>

      {/* Backdrop (mobile only, semi-transparent) */}
      {isOpen && (
        <div
          aria-hidden="true"
          onClick={handleClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 198,
            backgroundColor: 'rgba(0,0,0,0.18)',
            backdropFilter: 'blur(1px)',
          }}
        />
      )}

      {/* Copilot Drawer Panel */}
      {isOpen && (
        <div
          id="copilot-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Health Copilot chat panel"
          tabIndex={-1}
          style={{
            position: 'fixed',
            bottom: '5.5rem',
            right: '1.75rem',
            width: 'min(460px, calc(100vw - 2rem))',
            height: 'min(600px, calc(100vh - 8rem))',
            zIndex: 199,
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 20px 60px -8px rgba(16, 24, 40, 0.22), 0 8px 20px -4px rgba(16, 24, 40, 0.1)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: isAnimatingOut
              ? 'copilotPanelOut 220ms ease-in forwards'
              : 'copilotPanelIn 220ms ease-out',
            outline: 'none',
          }}
        >
          {/* Panel Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.875rem 1.125rem',
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={16} />
              </div>
              <div>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-primary-dark)', margin: 0 }}>
                  Health Copilot
                </h2>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block' }}>
                  Grounded in your medical records
                </span>
              </div>
            </div>
            <button
              aria-label="Close Health Copilot panel"
              onClick={handleClose}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-critical-bg)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-critical)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-bg)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)';
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Chat Content — reuses existing ChatView entirely */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <ChatView
              onOpenDocument={onOpenDocument}
            />
          </div>
        </div>
      )}

      {/* Keyframe animations injected via style tag */}
      <style>{`
        @keyframes fabTooltipIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes copilotPanelIn {
          from { opacity: 0; transform: scale(0.94) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes copilotPanelOut {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to   { opacity: 0; transform: scale(0.94) translateY(16px); }
        }
        #copilot-fab-button:focus-visible {
          outline: 3px solid rgba(23, 107, 102, 0.5) !important;
          outline-offset: 3px !important;
        }
      `}</style>
    </>
  );
};
