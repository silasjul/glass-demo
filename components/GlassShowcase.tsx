'use client';

import { useEffect, useState } from 'react';
import { Leva } from 'leva';
import LiquidGlass from '@/components/LiquidGlass';
import { useGlassCardControls } from '@/hooks/useGlassCardControls';
import { useLevaStore } from '@/stores/levaStore';

type SceneId = 'clock' | 'player' | 'profile' | 'pills' | 'widgets' | 'dock';

const SCENES: { id: SceneId; label: string }[] = [
  { id: 'clock', label: 'Clock' },
  { id: 'player', label: 'Player' },
  { id: 'profile', label: 'Profile' },
  { id: 'pills', label: 'Pills' },
  { id: 'widgets', label: 'Widgets' },
  { id: 'dock', label: 'Dock' },
];

/* ---------- icons ---------- */

function IconPrev() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 6h2v12H6zM20 6v12l-9-6z" />
    </svg>
  );
}
function IconPlay() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function IconNext() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16 6h2v12h-2zM4 6v12l9-6z" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.8-3.8" strokeLinecap="round" />
    </svg>
  );
}
function IconWaveform() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" />
    </svg>
  );
}
function IconAperture() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m12 3.5 4.2 7.3M20 8.8l-8.4.1M19 16.5l-4.3-7.2M12 20.5l-4.2-7.3M4 15.2l8.4-.1M5 7.5l4.3 7.2" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.5 7.5 7.5 5.5 7.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconGear() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1" strokeLinecap="round" />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" strokeLinejoin="round" />
    </svg>
  );
}
function IconWifi() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
      <path d="M3 9.5a13.5 13.5 0 0 1 18 0M6.2 13a9 9 0 0 1 11.6 0M9.4 16.4a4.5 4.5 0 0 1 5.2 0" />
      <circle cx="12" cy="19.4" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ---------- simple scenes (zoom-friendly, one idea per card) ---------- */

function ClockScene({ glass }: { glass: GlassProps }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = now ? String(now.getHours()).padStart(2, '0') : '––';
  const mm = now ? String(now.getMinutes()).padStart(2, '0') : '––';
  const date = now
    ? now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';

  return (
    <LiquidGlass {...glass} padding="30px 48px">
      <div className="text-center font-sans">
        <p className="text-[72px] font-extralight leading-none tracking-tight tabular-nums text-white">
          {hh}
          <span className="opacity-60">:</span>
          {mm}
        </p>
        <p className="mt-3 text-[13px] font-medium tracking-[0.08em] text-white/60">{date}</p>
      </div>
    </LiquidGlass>
  );
}

function ProfileScene({ glass }: { glass: GlassProps }) {
  return (
    <LiquidGlass {...glass} padding="22px 26px">
      <div className="flex w-[300px] items-center gap-4 font-sans">
        <div
          className="h-14 w-14 shrink-0 rounded-full shadow-lg shadow-black/40"
          style={{
            background:
              'radial-gradient(120% 120% at 25% 20%, #ffd9a3 0%, #ff4d8f 35%, #6a4dff 70%, #0a1a26 100%)',
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-semibold text-white">Nightswim</p>
          <p className="truncate text-[13px] font-medium text-white/55">@nightswim · 128k</p>
        </div>
        <button
          type="button"
          className="cursor-pointer rounded-full bg-white/15 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70"
        >
          Follow
        </button>
      </div>
    </LiquidGlass>
  );
}

function PillsScene({ glass }: { glass: GlassProps }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <LiquidGlass {...glass} cornerRadius={999} padding="16px 48px">
        <p className="font-sans text-[15px] font-semibold tracking-wide text-white">Continue</p>
      </LiquidGlass>

      <div className="flex items-center gap-4">
        <LiquidGlass {...glass} cornerRadius={999} padding="10px 18px">
          <p className="flex items-center gap-2 font-sans text-[13px] font-medium text-white/85">
            <IconWifi />
            Wi-Fi · On
          </p>
        </LiquidGlass>

        <LiquidGlass {...glass} cornerRadius={999} padding="13px 13px">
          <span className="text-white/85">
            <IconSearch />
          </span>
        </LiquidGlass>
      </div>
    </div>
  );
}

function PlayerScene({ glass }: { glass: GlassProps }) {
  return (
    <LiquidGlass {...glass} padding="22px 24px">
      <div className="w-[330px] font-sans">
        <div className="flex items-center gap-4">
          {/* album art: the record's own iridescence, in CSS */}
          <div
            className="h-16 w-16 shrink-0 rounded-xl shadow-lg shadow-black/40"
            style={{
              background:
                'radial-gradient(120% 120% at 20% 15%, #ffd9a3 0%, #ff4d8f 28%, #6a4dff 58%, #0a1a26 100%)',
            }}
          />
          <div className="min-w-0">
            <p className="truncate text-[17px] font-semibold leading-snug text-white">Vantablue</p>
            <p className="truncate text-[13px] font-medium leading-snug text-white/60">
              Nightswim — Glassworks, Vol. II
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="h-1 w-full rounded-full bg-white/20">
            <div className="h-1 w-[58%] rounded-full bg-white/90" />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] font-medium tabular-nums text-white/50">
            <span>2:14</span>
            <span>−1:34</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-8 text-white">
          <button type="button" aria-label="Previous track" className="cursor-pointer rounded opacity-80 transition hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70">
            <IconPrev />
          </button>
          <button
            type="button"
            aria-label="Pause"
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70"
          >
            <IconPlay />
          </button>
          <button type="button" aria-label="Next track" className="cursor-pointer rounded opacity-80 transition hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70">
            <IconNext />
          </button>
        </div>
      </div>
    </LiquidGlass>
  );
}

function WidgetsScene({ glass }: { glass: GlassProps }) {
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
      <LiquidGlass {...glass} padding="20px 22px">
        <div className="w-[210px] font-sans">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-semibold text-white/80">Copenhagen</p>
              <p className="mt-1 text-[44px] font-light leading-none tracking-tight text-white">21°</p>
            </div>
            <span className="mt-0.5 text-white/85">
              <IconMoon />
            </span>
          </div>
          <p className="mt-3 text-[13px] font-medium text-white/70">Clear evening</p>
          <p className="text-[12px] font-medium text-white/45">H 24° · L 15°</p>
        </div>
      </LiquidGlass>

      <div className="flex flex-col gap-5">
        <LiquidGlass {...glass} padding="16px 18px">
          <div className="w-[280px] font-sans">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#ff4d8f]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                Glassworks FM
              </p>
              <p className="ml-auto text-[11px] font-medium text-white/40">2m ago</p>
            </div>
            <p className="mt-2 text-[14px] font-medium leading-snug text-white/90">
              Nightswim published “Vantablue — Extended Mix”
            </p>
          </div>
        </LiquidGlass>

        <LiquidGlass {...glass} padding="14px 18px">
          <div className="flex w-[280px] items-center gap-3 font-sans">
            <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-white/10">
              <span className="text-[8px] font-bold uppercase tracking-wide text-[#ffd9a3]">Jul</span>
              <span className="text-[14px] font-semibold leading-none text-white">2</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white/90">Studio session</p>
              <p className="text-[12px] font-medium text-white/50">Tonight · 19:00–22:00</p>
            </div>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
}

function DockScene({ glass }: { glass: GlassProps }) {
  const apps = [
    { label: 'Search', icon: <IconSearch /> },
    { label: 'Waves', icon: <IconWaveform /> },
    { label: 'Lens', icon: <IconAperture /> },
    { label: 'Mail', icon: <IconMail /> },
    { label: 'Settings', icon: <IconGear /> },
  ];
  return (
    <div className="flex flex-col items-center gap-6">
      <LiquidGlass {...glass} cornerRadius={999} padding="12px 28px">
        <p className="font-sans text-[14px] font-medium tracking-wide text-white/85">
          Ask anything…
          <span className="ml-10 rounded-md bg-white/12 px-1.5 py-0.5 text-[11px] font-semibold text-white/55">⌘K</span>
        </p>
      </LiquidGlass>

      <LiquidGlass {...glass} padding="14px 18px">
        <div className="flex items-center gap-2 font-sans">
          {apps.map((app) => (
            <button
              key={app.label}
              type="button"
              aria-label={app.label}
              className="flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-2xl text-white/85 transition hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70"
            >
              {app.icon}
            </button>
          ))}
        </div>
      </LiquidGlass>
    </div>
  );
}

/* ---------- showcase ---------- */

type GlassProps = {
  displacementScale: number;
  blurAmount: number;
  saturation: number;
  aberrationIntensity: number;
  cornerRadius: number;
  overLight: boolean;
  darken: number;
  edgeWidth: number;
  edgeIntensity: number;
  edgeAngle: number;
  edgeSpread: number;
  edgeBase: number;
};

export default function GlassShowcase() {
  useGlassCardControls();
  const cfg = useLevaStore((s) => s.glassCard);
  const [scene, setScene] = useState<SceneId>('clock');
  const [uiHidden, setUiHidden] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
        setUiHidden((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const glass: GlassProps = {
    displacementScale: cfg.displacementScale,
    blurAmount: cfg.blurAmount,
    saturation: cfg.saturation,
    aberrationIntensity: cfg.aberrationIntensity,
    cornerRadius: cfg.cornerRadius,
    overLight: cfg.overLight,
    darken: cfg.darken,
    edgeWidth: cfg.edgeWidth,
    edgeIntensity: cfg.edgeIntensity,
    edgeAngle: cfg.edgeAngle,
    edgeSpread: cfg.edgeSpread,
    edgeBase: cfg.edgeBase,
  };

  const chrome = `transition-opacity duration-500 ${uiHidden ? 'pointer-events-none opacity-0' : 'opacity-100'}`;

  return (
    <>
      <Leva collapsed hidden={uiHidden} />

      {/* wordmark */}
      <header className={`fixed left-6 top-6 z-10 select-none font-sans ${chrome}`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">Liquid Glass</p>
        <p className="mt-0.5 text-[11px] font-medium tracking-wide text-white/35">ink &amp; glass · demo stage</p>
      </header>

      {/* active scene — no animated wrapper: opacity/transform on an ancestor
          breaks backdrop-filter sampling and the glass stops refracting */}
      <div className="flex min-h-dvh items-center justify-center px-6 pb-32 pt-16">
        {scene === 'clock' && <ClockScene glass={glass} />}
        {scene === 'player' && <PlayerScene glass={glass} />}
        {scene === 'profile' && <ProfileScene glass={glass} />}
        {scene === 'pills' && <PillsScene glass={glass} />}
        {scene === 'widgets' && <WidgetsScene glass={glass} />}
        {scene === 'dock' && <DockScene glass={glass} />}
      </div>

      {/* scene switcher — itself a glass pill */}
      <nav aria-label="Demo scenes" className={`fixed bottom-8 left-1/2 z-10 -translate-x-1/2 ${chrome}`}>
        <LiquidGlass {...glass} cornerRadius={999} padding="6px 6px">
          <div className="flex items-center gap-1 font-sans">
            {SCENES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScene(s.id)}
                aria-pressed={scene === s.id}
                className={`cursor-pointer rounded-full px-4 py-2 text-[13px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70 ${
                  scene === s.id ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white/90'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </LiquidGlass>
      </nav>

      {/* hint */}
      <p
        className={`fixed bottom-8 right-6 z-10 select-none font-sans text-[11px] font-medium tracking-wide text-white/30 ${chrome}`}
      >
        H — hide UI for capture
      </p>
    </>
  );
}
