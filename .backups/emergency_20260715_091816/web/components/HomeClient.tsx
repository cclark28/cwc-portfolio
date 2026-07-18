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

const WITTY_MESSAGES = [
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
  "ah yes, the classic typo maneuver.",
  "that's not even close to a real command.",
  "i've seen worse. actually no, this is pretty bad.",
  "you're testing me. i respect that.",
  "is this a vibe check? because you failed.",
  "pro tip: the commands are listed right below.",
  "did you mean 'work'? because you're making me work.",
  "that word means nothing to me. we just met.",
  "keep guessing. i've got all day.",
  "i'm a portfolio site, not a search engine.",
  "you're either very creative or very lost.",
  "error: too much personality in that command.",
  "i only accept real commands. and compliments.",
  "the cards fell and they can't get up.",
  "somewhere, a UX designer just felt a disturbance.",
  "have you tried turning it off and typing 'work'?",
  "i'm going to pretend that didn't happen.",
  "you're speed-running the wrong answers.",
  "that's the spirit. wrong spirit, but still.",
  "congrats, you found the secret command. just kidding.",
];

const DAILY_DESIGN_CONTENT = [
  "\"design is not just what it looks like — design is how it works.\" — steve jobs",
];

function getEasterEggMessage(usedSet: Set<number>) {
  const idx = Math.floor(Math.random() * WITTY_MESSAGES.length);
  return { message: WITTY_MESSAGES[idx], index: idx };
}

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

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w <= MOBILE_BREAKPOINT) setScreenMode('mobile');
      else if (w <= TABLET_BREAKPOINT) setScreenMode('tablet');
      else setScreenMode('desktop');
    };
    check();
    setMounted(true);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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
    <div
      ref={scrollRef}
      style={{ width: '100vw', height: '100vh', overflowY: 'auto', overflowX: 'hidden', background: '#FAFAFB' }}
    >
      {/* Hero and Canvas sections - keep your existing code here */}
      {/* Terminal */}
      {pastHero && <Terminal activeFilter={activeFilter} onCommand={handleCommand} config={commandModule} />}

      {/* Info Modal */}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} aboutData={aboutData} />}

      {/* Other modals */}
      {showHelp && <div onClick={() => setShowHelp(false)}>Help Panel Placeholder</div>}
      {selectedItem && <ProjectDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      {passwordItem && <PasswordGateModal item={passwordItem} sitePassword={sitePassword} onClose={() => setPasswordItem(null)} onUnlocked={() => { setUnlocked(); setPasswordItem(null); setSelectedItem(passwordItem); }} />}
    </div>
  );
}