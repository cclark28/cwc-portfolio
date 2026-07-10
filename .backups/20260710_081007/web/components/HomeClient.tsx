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

// Witty responses for unknown commands — rotates randomly
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

// Daily-rotating design quotes and facts — seeded by day-of-year
const DAILY_DESIGN_CONTENT = [
  "\"design is not just what it looks like — design is how it works.\" — steve jobs",
  "\"simplicity is the ultimate sophistication.\" — leonardo da vinci",
  "\"good design is as little design as possible.\" — dieter rams",
  "\"have no fear of perfection — you'll never reach it.\" — salvador dalí",
  "\"design is thinking made visual.\" — saul bass",
  "\"less is more.\" — ludwig mies van der rohe",
  "\"creativity is intelligence having fun.\" — albert einstein",
  "\"the details are not the details. they make the design.\" — charles eames",
  "\"design is where science and art break even.\" — robin mathew",
  "\"white space is to be regarded as an active element, not a passive background.\" — jan tschichold",
  "\"a designer knows he has achieved perfection not when there is nothing left to add, but when there is nothing left to take away.\" — antoine de saint-exupéry",
  "\"design can be art. design can be aesthetics. design is so simple, that's why it is so complicated.\" — paul rand",
  "\"everything is designed. few things are designed well.\" — brian reed",
  "\"people ignore design that ignores people.\" — frank chimero",
  "\"good design is obvious. great design is transparent.\" — joe sparano",
  "\"the public is more familiar with bad design than good design. it is, in effect, conditioned to prefer bad design.\" — paul rand",
  "\"you can't use up creativity. the more you use, the more you have.\" — maya angelou",
  "\"make it simple, but significant.\" — don draper",
  "\"design is the silent ambassador of your brand.\" — paul rand",
  "\"if you think good design is expensive, you should look at the cost of bad design.\" — ralf speth",
  "fun fact: the helvetica typeface was designed in 1957 and is used by over 100 major brands today.",
  "fun fact: the golden ratio (1.618) appears everywhere — from the parthenon to the apple logo.",
  "fun fact: the first website ever made is still online at info.cern.ch. it's just text and links.",
  "fun fact: comic sans was designed in 1994 by vincent connare — inspired by comic book lettering.",
  "fun fact: the average person sees between 6,000 and 10,000 ads per day. good design cuts through.",
  "fun fact: the 'save' icon is a 3.5\" floppy disk. most people using it have never seen one.",
  "fun fact: the twitter bird logo is made entirely from overlapping circles.",
  "fun fact: google's first logo was designed using GIMP, a free image editor.",
  "fun fact: the FedEx logo has a hidden arrow between the E and the x. once you see it, you can't unsee it.",
  "fun fact: the color blue is used by more than 40% of Fortune 500 companies in their branding.",
  "fun fact: the human eye can distinguish about 10 million different colors.",
  "fun fact: the bauhaus school operated for only 14 years (1919–1933) but redefined modern design forever.",
  "fun fact: pantone's color of the year has influenced product design globally since 2000.",
  "fun fact: the ampersand (&) is a ligature of the latin word 'et' meaning 'and.'",
  "fun fact: the first computer mouse was made of wood. designed by douglas engelbart in 1964.",
  "fun fact: the nike swoosh was designed by a graphic design student for $35 in 1971.",
  "fun fact: the average attention span for a website visitor is 8 seconds. make those seconds count.",
  "fun fact: the london underground map by harry beck (1933) invented the modern transit diagram.",
  "fun fact: the 'hamburger menu' icon (☰) was designed by norm cox for xerox star in 1981.",
  "fun fact: the word 'pixel' comes from 'picture element' — coined in 1965.",
  "fun fact: paul rand designed the IBM, UPS, and ABC logos. he charged Steve Jobs $100,000 for the NeXT logo — and gave him exactly one option.",
  "fun fact: the average designer moves their mouse about 5 miles per day.",
  "fun fact: the original macintosh team signed the inside of every mac case — like artists signing their work.",
  "fun fact: kerning — the spacing between letters — gets its name from the french word 'carne' meaning corner.",
  "fun fact: the most expensive logo redesign was Symantec's at $1.28 billion (they acquired VeriSign's brand).",
  "fun fact: grid systems in graphic design were formalized by josef müller-brockmann in 1961. still the gold standard.",
  "fun fact: the neon sign was invented in 1910 by georges claude. paris was the first city to glow.",
  "fun fact: the term 'user experience' was coined by don norman at apple in 1993.",
  "fun fact: there are over 500,000 fonts in existence. you probably use about 12.",
  "fun fact: the fibonacci sequence appears in sunflowers, hurricanes, galaxies — and good layout design.",
  "fun fact: red increases heart rate. that's why sale signs, error messages, and stop signs all use it.",
  "fun fact: japan's flag is one of the simplest in the world — a red circle on white. perfect design.",
  "fun fact: the first ever graphic designer is considered to be el lissitzky, a russian artist from the 1920s.",
  "fun fact: the 'lorem ipsum' placeholder text dates back to the 1500s — originally from cicero's writings.",
  "fun fact: the ISO paper sizes (A4, A3, etc.) are based on a ratio of 1:√2. fold any A-size in half and you get the next size down perfectly.",
  "fun fact: the wheelchair accessibility symbol was designed by susanne koefoed in 1968. it's been updated exactly once since.",
  "fun fact: 8% of men and 0.5% of women have some form of color blindness. always design for accessibility.",
  "fun fact: the most common screen resolution in 2024 is 1920×1080 — but designers need to think about 50+ sizes.",
  "fun fact: swiss design (international typographic style) originated in the 1950s. clean grids, sans-serif type, objective photography.",
  "fun fact: the @ symbol was nearly extinct before ray tomlinson chose it for email addresses in 1971.",
];

// Combine witty + daily content — daily items rotate based on day-of-year
function getEasterEggMessage(usedSet: Set<number>): { message: string; index: number } {
  // Every 3rd unknown command, show a daily design quote/fact instead of a witty quip
  const showDaily = usedSet.size > 0 && usedSet.size % 3 === 0;

  if (showDaily) {
    // Pick from daily pool based on day-of-year + how many dailies shown so far
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
    );
    const dailiesShown = Math.floor(usedSet.size / 3);
    const dailyIdx = (dayOfYear + dailiesShown) % DAILY_DESIGN_CONTENT.length;
    // Use negative index space to distinguish from witty messages
    return { message: DAILY_DESIGN_CONTENT[dailyIdx], index: -(dailyIdx + 1) };
  }

  // Pick a witty message we haven't used yet
  const pool = WITTY_MESSAGES;
  if (usedSet.size >= pool.length) {
    // Only clear witty indices (positive), keep daily tracking
    for (const v of usedSet) { if (v >= 0) usedSet.delete(v); }
  }
  let idx: number;
  let attempts = 0;
  do {
    idx = Math.floor(Math.random() * pool.length);
    attempts++;
    if (attempts > 50) { idx = 0; break; } // safety fallback
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
  const isMobile = screenMode === 'mobile';
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

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w <= MOBILE_BREAKPOINT) setScreenMode('mobile');
      else if (w <= TABLET_BREAKPOINT) setScreenMode('tablet');
      else setScreenMode('desktop');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Track scroll past hero — snap to canvas when close, delay canvas interaction
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let snapTimeout: ReturnType<typeof setTimeout> | null = null;
    let readyTimeout: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      const scrollPct = el.scrollTop / window.innerHeight;
      setPastHero(scrollPct > 0.4);

      // Snap to canvas once past 85%
      if (snapTimeout) clearTimeout(snapTimeout);
      if (scrollPct > 0.85 && scrollPct < 0.98) {
        snapTimeout = setTimeout(() => {
          el.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        }, 100);
      }

      // Enable canvas interaction after fully scrolled + delay
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
    // Enable canvas after smooth scroll lands
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

  // Hero content — from Sanity with fallbacks
  const heroRolesData = aboutData?.heroRoles ?? ['Artist', 'Designer', 'Curious & Experimental'];
  const heroNameText = aboutData?.heroName ?? 'charlie';
  const heroBioText = aboutData?.heroBio ?? 'Design, technology, and AI — building brands that connect.';
  const heroTaglineText = aboutData?.heroTagline ?? 'Open to collaboration across digital, environmental, and physical touchpoints.';
  const heroLocationText = 'Worldwide';
  const heroAvailText = aboutData?.heroAvailability ?? 'Available for work & talks';

  // Hero scramble text — staggered for cascading decode
  const heroName = useScrambleText(heroNameText, 200, 0);
  // Scramble each role line with staggered delay
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

  return (
    <div
      ref={scrollRef}
      style={{ width: '100vw', height: '100vh', overflowY: 'auto', overflowX: 'hidden', background: '#FAFAFB' }}
    >
      {/* ===== HERO / LANDING — Mont Blanc typographic style ===== */}
      <section
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          padding: isTablet ? '0 24px' : '0 48px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ width: '100%', maxWidth: 960 }}>
          {/* Name */}
          <h1
            style={{
              font: "700 clamp(4rem, 12vw, 9rem)/0.85 var(--font-grotesk)",
              color: '#1A1A1A',
              margin: '0 0 8px',
              letterSpacing: '-0.04em',
            }}
          >
            {heroName}
          </h1>

          {/* Stacked roles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 16 }}>
            {heroRoleTexts.map((text, i) => (
              <div
                key={i}
                style={{
                  font: "700 clamp(1.5rem, 4vw, 2.75rem)/1.1 var(--font-grotesk)",
                  color: '#1A1A1A',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                }}
              >
                {text}
              </div>
            ))}
          </div>

          {/* Location + availability — lighter weight */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 32 }}>
            <div
              style={{
                font: "500 clamp(0.875rem, 2vw, 1.25rem)/1.2 var(--font-grotesk)",
                color: '#86858C',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}
            >
              {heroLocation}
            </div>
            <div
              style={{
                font: "500 clamp(0.875rem, 2vw, 1.25rem)/1.2 var(--font-grotesk)",
                color: '#86858C',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}
            >
              {heroAvail}
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderBottom: '1px solid #E5E4E6', width: '100%', marginBottom: 20 }} />

          {/* Bio + tagline — short, punchy */}
          <div style={{ maxWidth: 600 }}>
            <p
              style={{
                font: `400 ${isTablet ? '0.8125rem' : '0.6875rem'}/1.7 var(--font-mono)`,
                color: '#58565D',
                margin: '0 0 8px',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              {heroBio}
            </p>
            <p
              style={{
                font: `400 ${isTablet ? '0.8125rem' : '0.6875rem'}/1.7 var(--font-mono)`,
                color: '#9B9AA0',
                margin: 0,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              {heroAI}
            </p>
          </div>
        </div>

        {/* View Work — large, bottom center */}
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
            transition: 'color 0.2s ease',
            animation: 'hero-bounce 2s ease-in-out infinite',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#1A1A1A'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#86858C'; }}
        >
          <span
            style={{
              font: "600 clamp(0.75rem, 1.5vw, 1rem) var(--font-grotesk)",
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            View Work
          </span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </button>
      </section>

      {/* ===== CANVAS SECTION ===== */}
      <section
        style={{
          width: '100%',
          height: '100vh',
          position: 'sticky',
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pointerEvents: canvasReady ? 'auto' : 'none',
        }}
      >
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
      </section>

      {/* Version indicator — only visible past hero */}
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
          opacity: pastHero ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      >
        v1.2.0
      </div>

      {/* Location clock — only visible past hero */}
      <div style={{ opacity: pastHero ? 1 : 0, transition: 'opacity 0.4s ease' }} className={isTablet ? 'location-clock-hide-tablet' : ''}>
        <LocationClock
          city={aboutData?.currentCity}
          country={aboutData?.currentCountry}
          timezone={aboutData?.timezone}
          latitude={aboutData?.latitude}
          longitude={aboutData?.longitude}
          email={aboutData?.contactEmail}
        />
      </div>

      {/* Terminal — only visible past hero */}
      {pastHero && <Terminal activeFilter={activeFilter} onCommand={handleCommand} config={commandModule} />}

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
