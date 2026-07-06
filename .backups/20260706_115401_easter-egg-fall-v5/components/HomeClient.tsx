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

// Witty responses for unknown commands — rotates randomly
const UNKNOWN_CMD_MESSAGES = [
  "hey buddy, nice try.",
  "that's not a command. but i admire the confidence.",
  "nope. not that one either.",
  "interesting choice — but no.",
  "you just broke everything. kidding. kind of.",
  "that command is still in development. (it's not.)",
  "bold move. wrong move. but bold.",
  "i don't know what that means, but i respect the energy.",
  "you're really going off-script here.",
  "that's not how this works. that's not how any of this works.",
  "sorry, i only speak work, photo, and info.",
  "command not found. cards not found. coincidence?",
  "you seem fun. type 'work' and let's see the portfolio.",
  "this isn't a terminal. well — it kind of is. but still no.",
  "nice guess. terrible guess. but nice.",
  "the cards didn't like that one.",
  "you just made all the cards fall. hope you're happy.",
  "oops. try something from the menu next time.",
  "404: command not found. also the cards left.",
  "well, that happened. type 'esc' to undo your chaos.",
];

export interface AboutData {
  headline?: string;
  bio?: string;
  currentRole?: string;
  location?: string;
  contactEmail?: string;
  coverImageUrl?: string;
}

export interface CommandModuleConfig {
  showWork?: boolean;
  workLabel?: string;
  showPhoto?: boolean;
  photoLabel?: string;
  showPlayground?: boolean;
  playgroundLabel?: string;
  showInfo?: boolean;
  showHelp?: boolean;
  showEsc?: boolean;
  placeholder?: string;
  hint?: string;
}

interface HomeClientProps {
  work: SizedCanvasItem[];
  photo: SizedCanvasItem[];
  playground?: SizedCanvasItem[];
  sitePassword?: string;
  passwordEnabled?: boolean;
  commandModule?: CommandModuleConfig | null;
  aboutData?: AboutData | null;
}

export default function HomeClient({ work, photo, playground = [], sitePassword, passwordEnabled, commandModule, aboutData }: HomeClientProps) {
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef<CanvasHandle>(null);
  const [activeFilter, setActiveFilter] = useState<Category | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SizedCanvasItem | null>(null);
  const [passwordItem, setPasswordItem] = useState<SizedCanvasItem | null>(null);
  const [fallenMessage, setFallenMessage] = useState<string | null>(null);
  const usedMessagesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleOpenProject = useCallback((item: SizedCanvasItem) => {
    if (item.private && passwordEnabled && sitePassword && !isUnlocked()) {
      setPasswordItem(item);
    } else {
      setSelectedItem(item);
    }
  }, [passwordEnabled, sitePassword]);

  const handleCommand = useCallback((cmd: string) => {
    // Any valid command clears the fallen state
    const validCommands = ['work', 'photo', 'info', 'contact', 'esc', 'help', 'playground'];
    if (validCommands.includes(cmd)) {
      setFallenMessage(null);
    }

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
      case 'playground': {
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
      default: {
        // Unknown command — cards fall, witty message appears
        // Pick a message we haven't used yet (cycles through all before repeating)
        if (usedMessagesRef.current.size >= UNKNOWN_CMD_MESSAGES.length) {
          usedMessagesRef.current.clear();
        }
        let idx: number;
        do {
          idx = Math.floor(Math.random() * UNKNOWN_CMD_MESSAGES.length);
        } while (usedMessagesRef.current.has(idx));
        usedMessagesRef.current.add(idx);

        setFallenMessage(UNKNOWN_CMD_MESSAGES[idx]);
        canvasRef.current?.fallCards();
        break;
      }
    }
  }, [activeFilter]);

  if (isMobile) {
    return <MobileLayout work={work} photo={photo} playground={playground} sitePassword={sitePassword} passwordEnabled={passwordEnabled} />;
  }

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
        <svg viewBox="0 0 102.67 31.25" style={{ height: 22, width: 'auto' }} aria-label="Clark">
          <path fill="#18181B" d="M.23,19.91C.23,13.39,4.94,8.52,11.99,8.52c6.05,0,10.08,3.57,10.63,8.57h-7.65c-.42-1.93-1.34-3.02-3.07-3.02-2.44,0-3.61,2.23-3.61,5.84s1.26,5.75,3.7,5.75c1.93,0,2.9-1.3,3.11-3.74h7.65c0,5.29-4.33,9.33-10.75,9.33C4.94,31.25.23,26.42.23,19.91Z"/>
          <path fill="#18181B" d="M24.59.54h8.15v30.04h-8.15V.54Z"/>
          <path fill="#18181B" d="M48.32,28.22h-.08c-1.43,1.97-3.7,2.9-6.47,2.9-4.12,0-7.14-2.23-7.14-6.43,0-4.75,3.65-6.13,7.77-6.6,4.54-.5,5.75-1.05,5.75-2.39,0-1.18-.55-2.06-2.27-2.06s-2.6,1.01-2.81,2.56h-7.52c.17-4.24,3.44-7.73,10.17-7.73,3.28,0,5.38.42,7.02,1.43,2.23,1.39,3.32,3.57,3.32,6.43v10.71c0,1.81.13,2.77.8,3.19v.34h-7.81c-.29-.5-.55-1.18-.71-2.35ZM48.37,22.8v-1.89c-.76.38-1.72.71-3.07,1.01-2.31.5-3.02,1.18-3.02,2.44,0,1.43,1.18,2.06,2.48,2.06,1.85,0,3.61-1.05,3.61-3.61Z"/>
          <path fill="#18181B" d="M57.27,10.16C57.27,4.32,61.72,0,67.35,0s10.08,4.33,10.08,10.17-4.45,10.17-10.08,10.17-10.08-4.33-10.08-10.17ZM75.41,10.16c0-4.83-3.45-8.4-8.07-8.4s-8.06,3.57-8.06,8.4,3.44,8.44,8.06,8.44,8.07-3.57,8.07-8.44ZM62.77,4.74h5.38c2.23,0,4.24,1.01,4.24,3.19,0,1.22-.63,2.14-1.76,2.56v.08c.97.34,1.3.97,1.51,1.81.29,1.26.08,2.6.55,2.81v.25h-3.4c-.29-.17-.21-1.47-.42-2.48-.17-.84-.55-1.13-1.47-1.13h-1.18v3.61h-3.44V4.74ZM66.21,9.45h1.43c.88,0,1.34-.34,1.34-1.05,0-.67-.38-1.01-1.34-1.01h-1.43v2.06Z"/>
          <path fill="#18181B" d="M89.4,22.89l-1.64,1.81v5.88h-7.81V.54h7.81v15l5.17-6.39h8.91l-7.14,7.9,7.98,13.53h-8.99l-4.29-7.69Z"/>
        </svg>
      </div>

      {/* Canvas */}
      <Canvas
        ref={canvasRef}
        work={work}
        photo={photo}
        playground={playground}
        onOpenProject={handleOpenProject}
        fallenMessage={fallenMessage}
      />

      {/* Version indicator */}
      <div
        style={{
          position: 'fixed',
          bottom: 96,
          left: 20,
          font: "400 0.5625rem var(--font-mono)",
          color: '#C4C3C8',
          letterSpacing: '0.04em',
          zIndex: 90,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        v1.2.0
      </div>

      {/* Terminal */}
      <Terminal activeFilter={activeFilter} onCommand={handleCommand} config={commandModule} />

      {/* Modals */}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} aboutData={aboutData} />}

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
            animation: 'modal-backdrop-in 0.25s ease forwards',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(440px, 90vw)',
              background: '#FFFFFF',
              borderRadius: 6,
              padding: '28px',
              animation: 'modal-content-in 0.3s ease forwards',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ font: "500 0.6875rem var(--font-mono)", textTransform: 'uppercase', letterSpacing: '0.06em', color: '#86858C' }}>
                Help
              </span>
              <button
                onClick={() => setShowHelp(false)}
                aria-label="Close"
                style={{
                  height: 28,
                  background: '#ECEBEE',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  padding: '0 10px 0 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  color: '#58565D',
                  transition: 'background 0.12s ease, color 0.12s ease',
                }}
                onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#D4D3D8'; b.style.color = '#18181B'; }}
                onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#ECEBEE'; b.style.color = '#58565D'; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
                <span style={{ font: "500 0.5625rem var(--font-mono)", textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Close
                </span>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <HelpRow cmd="work" desc="Filter to work projects" />
              <HelpRow cmd="photo" desc="Filter to photography" />
              <HelpRow cmd="playground" desc="Filter to playground" />
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
