import React from 'react';
import { 
  LayoutDashboard, 
  FolderHeart, 
  Pill, 
  LineChart, 
  Bell, 
  ShieldCheck, 
  HeartHandshake,
  LogOut
} from 'lucide-react';
import { useSession } from '../../features/auth/session-context';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  highlight?: boolean;
}

interface SidebarProps {
  activeScreen: string;
  onNavigate: (screenId: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { logout, currentUser } = useSession();

  // Change 1: 'copilot' removed — now the floating FAB.
  // Change 3: 'ar-assistant' removed — launched from Prescriptions page.
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: <LayoutDashboard size={19} />,
    },
    {
      id: 'documents',
      label: 'My Records',
      icon: <FolderHeart size={19} />,
      badge: '3',
    },
    {
      id: 'extraction-review',
      label: 'Extraction Review',
      icon: <ShieldCheck size={19} />,
      badge: 'Verify',
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      icon: <Pill size={19} />,
    },
    {
      id: 'health-timeline',
      label: 'Reports & Trends',
      icon: <LineChart size={19} />,
    },
    {
      id: 'reminders',
      label: 'Reminders',
      icon: <Bell size={19} />,
      badge: '4',
    },
    {
      id: 'settings-privacy',
      label: 'Settings & Privacy',
      icon: <HeartHandshake size={19} />,
    },
  ];

  return (
    <>
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 40,
          }}
        />
      )}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flexShrink: 0,
          zIndex: 50,
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <FolderHeart size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-primary-dark)', letterSpacing: '-0.02em' }}>
              CarePilot AI
            </h2>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 500, display: 'block' }}>
              Altrix Labs Health Copilot
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.25rem 0.75rem', marginBottom: '0.5rem' }}>
            Main Menu
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      onCloseMobile?.();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isActive
                        ? 'var(--color-accent)'
                        : item.highlight
                        ? 'rgba(221, 244, 238, 0.4)'
                        : 'transparent',
                      color: isActive
                        ? 'var(--color-primary-dark)'
                        : item.highlight
                        ? 'var(--color-primary)'
                        : 'var(--color-text-secondary)',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.875rem',
                      transition: 'all var(--transition-fast)',
                      border: item.highlight && !isActive ? '1px dashed rgba(23, 107, 102, 0.35)' : '1px solid transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: isActive ? 'var(--color-primary)' : 'inherit' }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          padding: '0.125rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: isActive ? 'var(--color-primary)' : item.highlight ? 'var(--color-primary)' : 'var(--color-border)',
                          color: isActive || item.highlight ? '#ffffff' : 'var(--color-text-secondary)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User identity + logout */}
        <div
          style={{
            padding: '0.75rem',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.625rem', marginBottom: '0.5rem' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{currentUser.role}</div>
            </div>
            <button
              id="sidebar-logout-btn"
              onClick={() => logout()}
              aria-label="Sign out"
              title="Sign out"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.4rem 0.625rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'transparent',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontFamily: 'inherit',
                transition: 'color var(--transition-fast), background-color var(--transition-fast)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-critical-bg)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-critical)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'; }}
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>

          {/* Bottom Safety Disclaimer */}
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                Non-Diagnostic Tool
              </span>
            </div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              For clinical decisions or urgent emergencies, always consult a licensed doctor.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
