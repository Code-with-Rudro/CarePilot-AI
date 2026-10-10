import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { UploadModal } from '../../features/documents/upload-modal';
import { useDocuments } from '../../hooks/use-documents';

interface ShellProps {
  activeScreen: string;
  onNavigate: (screenId: string) => void;
  children: React.ReactNode;
  pageTitle: string;
}

export const Shell: React.FC<ShellProps> = ({
  activeScreen,
  onNavigate,
  children,
  pageTitle,
}) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { uploadFile, refreshDocuments } = useDocuments();

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar
        activeScreen={activeScreen}
        onNavigate={onNavigate}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: '100%', overflow: 'hidden' }}>
        <Header
          pageTitle={pageTitle}
          onOpenUpload={() => setIsUploadOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onLaunchAR={() => onNavigate('ar-assistant')}
        />

        <main style={{ flex: 1, overflowY: 'auto', padding: '1.75rem', backgroundColor: 'var(--color-bg)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={async (file, docType, facility) => {
          await uploadFile(file, docType, facility);
          await refreshDocuments();
          setIsUploadOpen(false);
          onNavigate('extraction-review');
        }}
      />
    </div>
  );
};
