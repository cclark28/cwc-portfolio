'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Canvas, { type CanvasHandle } from '@/components/Canvas';
import Terminal from '@/components/Terminal';
import InfoModal from '@/components/InfoModal';
import ProjectDetailModal from '@/components/ProjectDetailModal';
import PasswordGateModal, { isUnlocked, setUnlocked } from '@/components/PasswordGateModal';
import MobileLayout from '@/components/MobileLayout';
import type { SizedCanvasItem, Category } from '@/lib/canvasLayout';

const MOBILE_BREAKPOINT = 820;

interface HomeClientProps {
  work: SizedCanvasItem[];
  photo: SizedCanvasItem[];
  sitePassword?: string;
  passwordEnabled?: boolean;
}

export default function HomeClient({ work, photo, sitePassword, passwordEnabled }: HomeClientProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) {
    return <MobileLayout work={work} photo={photo} sitePassword={sitePassword} passwordEnabled={passwordEnabled} />;
  }
  const canvasRef = useRef<CanvasHandle>(null);
  const [activeFilter, setActiveFilter] = useState<Category | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SizedCanvasItem | null>(null);
  const [passwordItem, setPasswordItem] = useState<SizedCanvasItem | null>(null);

  const handleOpenProject = useCallback((item: SizedCanvasItem) => {
    if (item.private && passwordEnabled && sitePassword && !isUnlocked()) {
      setPasswordItem(item);
    } else {
      setSelectedItem(item);
    }
  }, [passwordEnabled, sitePassword]);

  const handleCommand = useCallback((cmd: string) => {
    switch (cmd) {
      case 'work':
      case 'photo': {
        const cat = cmd as Category;
        if (activeFilter === cat) {
          setActiveFilter(null);
          canvasRef.current?.resetAll();
        } else {
          setActiveFilter(cat);
          canvasRef.current?.focusCategory(cat);
        }
        break;
      }
      case 'info':
      case 'contact':
        setShowInfo(true);
        break;
      case 'esc':
        setActiveFilter(null);
        canvasRef.current?.resetAll();
        break;
      case 'help':
        setShowHelp(true);
        break;
      case 'playground':
        // Disabled — do nothing
        break;
      default:
        // Unknown command — ignore
        break;
    }
  }, [activeFilter]);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FAFAFB' }}>
      {/* Header */}
      <div
        style={{
          flex: 'none',
          height: 60,
          background: '#FAFAFB',
          borderBottom: '1px solid #E5E4E6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <span style={{ font: "700 1rem var(--font-grotesk)", letterSpacing: '0.02em' }}>CLARK</span>
      </div>

      {/* Canvas */}
      <Canvas
        ref={canvasRef}
        work={work}
        photo={photo}
        onOpenProject={handleOpenProject}
      />

      {/* Terminal */}
      <Terminal activeFilter={activeFilter} onCommand={handleCommand} />

      {/* Modals */}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

      {showHelp && (
        <div
          onClick={() => setShowHelp(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(24,24,27,0.35)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(440px, 90vw)',
              background: '#FFFFFF',
              borderRadius: 6,
              padding: '28px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ font: "500 0.6875rem var(--font-mono)", textTransform: 'uppercase', letterSpacing: '0.06em', color: '#86858C' }}>
                Help
              </span>
              <button
                onClick={() => setShowHelp(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', font: "400 1.25rem var(--font-grotesk)", color: '#86858C', padding: '0 4px', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <HelpRow cmd="work" desc="Filter to work projects" />
              <HelpRow cmd="photo" desc="Filter to photography" />
              <HelpRow cmd="info" desc="About & contact" />
              <HelpRow cmd="contact" desc="Same as info" />
              <HelpRow cmd="esc" desc="Clear filter, reset view" />
              <HelpRow cmd="help" desc="Show this panel" />
              <div style={{ borderTop: '1px solid #E5E4E6', paddingTop: 10, marginTop: 4 }}>
                <p style={{ font: "400 0.8125rem var(--font-grotesk)", color: '#86858C', margin: 0, lineHeight: 1.5 }}>
                  Drag to pan. Scroll to zoom. Click a card to open it.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <ProjectDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {passwordItem && (
        <PasswordGateModal
          item={passwordItem}
          sitePassword={sitePassword}
          onClose={() => setPasswordItem(null)}
          onUnlocked={() => {
            setUnlocked();
            const item = passwordItem;
            setPasswordItem(null);
            setSelectedItem(item);
          }}
        />
      )}
    </div>
  );
}

function HelpRow({ cmd, desc }: { cmd: string; desc: string }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
      <code style={{ font: "500 0.75rem var(--font-mono)", color: '#18181B', background: '#ECEBEE', padding: '2px 8px', borderRadius: 3, minWidth: 70, textAlign: 'center' }}>
        {cmd}
      </code>
      <span style={{ font: "400 0.8125rem var(--font-grotesk)", color: '#58565D' }}>{desc}</span>
    </div>
  );
}
