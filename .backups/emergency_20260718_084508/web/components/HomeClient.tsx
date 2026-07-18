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

// Witty responses for unknown commands
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

// Daily-rotating design quotes and facts
const DAILY_DESIGN_CONTENT = [
  "\"design is not just what it looks like — design is how it works.\" — steve jobs",
  "\"simplicity is the ultimate sophistication.\" — leonardo da vinci",
  // ... (keep all your original daily content here - copy from your previous file)
];

function getEasterEggMessage(usedSet: Set<number>): { message: string; index: number } {
  // keep the full function from your previous file
  const showDaily = usedSet.size > 0 && usedSet.size % 3 === 0;
  if (showDaily) {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    const dailiesShown = Math.floor(usedSet.size / 3);
    const dailyIdx = (dayOfYear + dailiesShown) % DAILY_DESIGN_CONTENT.length;
    return { message: DAILY_DESIGN_CONTENT[dailyIdx], index: -(dailyIdx + 1) };
  }
  const pool = WITTY_MESSAGES;
  if (usedSet.size >= pool.length) {
    for (const v of usedSet) { if (v >= 0) usedSet.delete(v); }
  }
  let idx: number;
  let attempts = 0;
  do {
    idx = Math.floor(Math.random() * pool.length);
    attempts++;
    if (attempts > 50) { idx = 0; break; }
  } while (usedSet.has(idx));
  return { message: pool[idx], index: idx };
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
  heroLocation?: string;
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
  viewWorkLabel?: string;
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

  // Hero content — fully from Sanity, blank when empty
  const heroRolesData = aboutData?.heroRoles ?? [];
  const heroNameText = aboutData?.heroName ?? '';
  const heroBioText = aboutData?.heroBio ?? '';
  const heroTaglineText = aboutData?.heroTagline ?? '';
  const heroLocationText = aboutData?.heroLocation ?? '';
  const heroAvailText = aboutData?.heroAvailability ?? '';

  const heroName = useScrambleText(heroNameText, 200, 0);
  const heroRole0 = useScrambleText(heroRolesData[0] ?? '', 500, 0);
  const heroRole1 = useScrambleText(heroRolesData[1] ?? '', 580, 0);
  const heroRole2 = useScrambleText(heroRolesData[2] ?? '', 660, 0);
  const heroRole3 = useScrambleText(heroRolesData[3] ?? '', 740, 0);
  const heroRole4 = useScrambleText(heroRolesData[4] ?? '', 820, 0);
  const heroRoleTexts = [heroRole0, heroRole1, heroRole2, heroRole3, heroRole4].slice(0, heroRolesData.length);
  const heroBio = useScrambleText(heroBioText, 800, 0);
  const heroAI = useScrambleText(heroTaglineText, 950, 0);
  const heroLocation = useScrambleText(heroLocationText, 700, 0);
  const heroAvail = useScrambleText(heroAvailText, 850, 0);

  const viewWorkLabel = commandModule?.viewWorkLabel ?? 'View work';

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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let snapTimeout: ReturnType<typeof setTimeout> | null = null;
    let readyTimeout: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      const scrollPct = el.scrollTop / window.innerHeight;
      setPastHero(scrollPct > 0.4);
      if (snapTimeout) clearTimeout(snapTimeout);
      if (scrollPct > 0.85 && scrollPct < 0.98) {
        snapTimeout = setTimeout(() => el.scrollTo({ top: window.innerHeight, behavior: 'smooth' }), 100);
      }
      if (scrollPct >= 0.98 && !canvasReady) {
        if (readyTimeout) clearTimeout(readyTimeout);
        readyTimeout = setTimeout(() => setCanvasReady(true), 400);
      } else if (scrollPct < 0.5) {
        setCanvasReady(false);
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (snapTimeout) clearTimeout(snapTimeout);
      if (readyTimeout) clearTimeout(readyTimeout);
    };
  }, [isMobile, canvasReady]);

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
    if (validCommands.includes(cmd)) setFallenMessage(null);
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
      {/* HERO */}
      <section style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', padding: isTablet ? '0 24px' : '0 48px', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', maxWidth: 960 }}>
          <h1 style={{ font: "700 clamp(4rem, 12vw, 9rem)/0.85 var(--font-grotesk)", color: '#1A1A1A', margin: '0 0 8px', letterSpacing: '-0.04em' }}>
            {heroName}
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 16 }}>
            {heroRoleTexts.map((text, i) => (
              <div key={i} style={{ font: "700 clamp(1.5rem, 4vw, 2.75rem)/1.1 var(--font-grotesk)", color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                {text}
              </div>
            ))}
          </div>

          {(heroLocationText || heroAvailText) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 32 }}>
              {heroLocationText && <div style={{ font: "500 clamp(0.875rem, 2vw, 1.25rem)/1.2 var(--font-grotesk)", color: '#86858C', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{heroLocation}</div>}
              {heroAvailText && <div style={{ font: "500 clamp(0.875rem, 2vw, 1.25rem)/1.2 var(--font-grotesk)", color: '#86858C', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{heroAvail}</div>}
            </div>
          )}

          <div style={{ borderBottom: '1px solid #E5E4E6', width: '100%', marginBottom: 20 }} />

          {(heroBioText || heroTaglineText) && (
            <div style={{ maxWidth: 600 }}>
              {heroBioText && <p style={{ font: `400 ${isTablet ? '0.8125rem' : '0.6875rem'}/1.7 var(--font-mono)`, color: '#58565D', margin: '0 0 8px', letterSpacing: '0.02em', textTransform: 'none' }}>{heroBio}</p>}
              {heroTaglineText && <p style={{ font: `400 ${isTablet ? '0.8125rem' : '0.6875rem'}/1.7 var(--font-mono)`, color: '#9B9AA0', margin: 0, letterSpacing: '0.02em', textTransform: 'none' }}>{heroAI}</p>}
            </div>
          )}
        </div>

        <button
          onClick={scrollToCanvas}
          aria-label="Scroll to work"
          style={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            color: '#86858C',
          }}
        >
          <span style={{ font: "600 clamp(0.75rem, 1.5vw, 1rem) var(--font-grotesk)", letterSpacing: '0.08em', textTransform: 'none' }}>
            {viewWorkLabel}
          </span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </button>
      </section>

      {/* Canvas Section, Terminal, Modals — keep the rest exactly as in your previous working file */}
      {/* (copy the rest from your previous version starting from the canvas section) */}
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