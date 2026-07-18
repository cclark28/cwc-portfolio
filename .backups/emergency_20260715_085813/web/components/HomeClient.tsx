'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Canvas, { type CanvasHandle } from '@/components/Canvas';
import Terminal from '@/components/Terminal';
import LocationClock from '@/components/LocationClock';
import InfoModal from '@/components/InfoModal';
import ProjectDetailModal from '@/components/ProjectDetailModal';
import PasswordGateModal, { isUnlocked, setUnlocked } from '@/components/PasswordGateModal';
import MobileLayout from '@/components/MobileLayout';
import type { SizedCanvasItem, Category } from '@/lib/canvasLayout';
import { useScrambleText } from '@/lib/useScrambleText';

const MOBILE_BREAKPOINT = 480;
const TABLET_BREAKPOINT = 1024;

// (Keep all your WITTY_MESSAGES, DAILY_DESIGN_CONTENT, getEasterEggMessage, interfaces exactly as you had them)

export interface AboutData {
  headline?: string;
  bio?: string;
  currentRole?: string;
  location?: string;
  contactEmail?: string;
  coverImageUrl?: string;
  currentCity?: string;
  currentCountry?: string;
  timezone?: string;
  latitude?: string;
  longitude?: string;
  heroInitials?: string;
  heroName?: string;
  heroRoles?: string[];
  heroBio?: string;
  heroTagline?: string;
  heroAvailability?: string;
  photo?: { url: string };
  links?: Array<{ label: string; url: string }>;
  // ... add other fields as needed
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
  const [screenMode, setScreenMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [mounted, setMounted] = useState(false);
  const isMobile = mounted && screenMode === 'mobile';
  const isTablet = screenMode === 'tablet';
  const canvasRef = useRef<CanvasHandle>(null);
  const [activeFilter, setActiveFilter] = useState<Category | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SizedCanvasItem | null>(null);
  const [passwordItem, setPasswordItem] = useState<SizedCanvasItem | null>(null);
  const [fallenMessage, setFallenMessage] = useState<string | null>(null);
  const usedMessagesRef = useRef<Set<number>>(new Set());
  const [pastHero, setPastHero] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hero scramble (keep your existing scramble calls)
  const heroRolesData = aboutData?.heroRoles ?? ['Artist', 'Designer', 'Curious & Experimental'];
  const heroNameText = aboutData?.heroName ?? 'charlie';
  const heroBioText = aboutData?.heroBio ?? 'Design, technology, and AI — building brands that connect.';
  const heroTaglineText = aboutData?.heroTagline ?? 'Open to collaboration across digital, environmental, and physical touchpoints.';
  const heroLocationText = 'Worldwide';
  const heroAvailText = aboutData?.heroAvailability ?? 'Available for work & talks';

  const heroName = useScrambleText(heroNameText, { delay: 200 });
  const heroRole0 = useScrambleText(heroRolesData[0] ?? '', { delay: 500 });
  const heroRole1 = useScrambleText(heroRolesData[1] ?? '', { delay: 580 });
  const heroRole2 = useScrambleText(heroRolesData[2] ?? '', { delay: 660 });
  const heroRole3 = useScrambleText(heroRolesData[3] ?? '', { delay: 740 });
  const heroRole4 = useScrambleText(heroRolesData[4] ?? '', { delay: 820 });
  const heroRoleTexts = [heroRole0, heroRole1, heroRole2, heroRole3, heroRole4].slice(0, heroRolesData.length);
  const heroBio = useScrambleText(heroBioText, { delay: 800 });
  const heroAI = useScrambleText(heroTaglineText, { delay: 950 });
  const heroLocation = useScrambleText(heroLocationText, { delay: 700 });
  const heroAvail = useScrambleText(heroAvailText, { delay: 850 });

  // (Keep all your useEffect for screen mode, scroll tracking, etc. exactly as you had them)

  const scrollToCanvas = useCallback(() => {
    scrollRef.current?.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    setTimeout(() => setCanvasReady(true), 800);
  }, []);

  const handleOpenProject = useCallback((item: SizedCanvasItem) => {
    if (item.private && passwordEnabled && sitePassword && !isUnlocked()) {
      setPasswordItem(item);
    } else {
      setSelectedItem(item);
    }
  }, [passwordEnabled, sitePassword]);

  const handleCommand = useCallback((cmd: string) => {
    const validCommands = ['work', 'photo', 'info', 'contact', 'esc', 'help', 'playground'];
    if (validCommands.includes(cmd)) {
      setFallenMessage(null);
    }

    switch (cmd) {
      case 'work':
      case 'photo':
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
      default: {
        const { message, index } = getEasterEggMessage(usedMessagesRef.current);
        usedMessagesRef.current.add(index);
        setFallenMessage(message);
        canvasRef.current?.fallCards();
        break;
      }
    }
  }, [activeFilter]);

  if (isMobile) {
    return <MobileLayout work={work} photo={photo} playground={playground} sitePassword={sitePassword} passwordEnabled={passwordEnabled} aboutData={aboutData} />;
  }

  return (
    <div ref={scrollRef} style={{ width: '100vw', height: '100vh', overflowY: 'auto', overflowX: 'hidden', background: '#FAFAFB' }}>
      {/* Hero section - keep your existing hero code */}
      {/* ... (your full hero section here) ... */}

      {/* Canvas section - keep your existing */}
      {/* ... */}

      {/* Terminal */}
      {pastHero && <Terminal activeFilter={activeFilter} onCommand={handleCommand} config={commandModule} />}

      {/* Info Modal - fixed */}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} aboutData={aboutData} />}

      {/* Other modals */}
      {showHelp && ( /* your help panel */ )}
      {selectedItem && <ProjectDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      {passwordItem && ( /* your password modal */ )}
    </div>
  );
}

// Keep HelpRow function at bottom
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