'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
const asset = (path: string) => `${BASE_PATH}${path}`;

const INVITATION = {
  hosts: 'Sankar & Karthiha',
  dateLabel: '07 September 2026',
  time: '10:00 am',
  venue: 'Narangba, Queensland',
  eventDate: '2026-09-07T10:00:00+10:00',
  mapUrl: 'https://maps.app.goo.gl/mRTXcrErRen6Aj9a9',
  musicUrl: asset('/music/indian-energetic.mp3'), // Replace this path to swap the editable background track.
  message: 'A house is built with walls and beams; a home is made with love and dreams. With grateful hearts, we invite you to step through our new doors, share in our happiness, and bless the place where our family’s next chapter will unfold.',
};

const GALLERY = [
  { src: asset('/photos/foundation.jpg'), alt: 'Our family at the cleared site of our future home', date: '28 March 2026', note: 'The first footprint', copy: 'On bare earth, we pictured every room, every laugh, and every memory still to come.' },
  { src: asset('/photos/progress-two.jpg'), alt: 'A joyful family moment as construction progressed', date: '04 April 2026', note: 'Growing together', copy: 'Every visit became a family ritual—measuring progress in smiles, stories, and excited little footsteps.' },
  { src: asset('/photos/framing.jpg'), alt: 'Our family in front of the completed steel frame', date: '11 April 2026', note: 'The frame rises', copy: 'Then the outline rose against the blue sky, and our future home suddenly felt wonderfully real.' },
  { src: asset('/photos/roofing.jpg'), alt: 'Our new home with its roof installed during construction', date: '04 May 2026', note: 'Under one roof', copy: 'Walls wrapped the rooms and the roof reached across them—the place we imagined was becoming our home.' },
];

function Countdown() {
  const calculate = useCallback(() => {
    const distance = Math.max(0, new Date(INVITATION.eventDate).getTime() - Date.now());
    return { days: Math.floor(distance / 86400000), hours: Math.floor(distance / 3600000) % 24, minutes: Math.floor(distance / 60000) % 60, seconds: Math.floor(distance / 1000) % 60 };
  }, []);
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => { setTime(calculate()); const timer = window.setInterval(() => setTime(calculate()), 1000); return () => clearInterval(timer); }, [calculate]);
  return <div className="countdown" aria-label={`${time.days} days, ${time.hours} hours, ${time.minutes} minutes and ${time.seconds} seconds until the celebration`}>
    {Object.entries(time).map(([label, value]) => <div className="count-cell" key={label}><strong>{String(value).padStart(2, '0')}</strong><span>{label}</span></div>)}
  </div>;
}

function ScratchCard({ onReveal }: { onReveal: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const drawing = useRef(false);
  const strokes = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect(); const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * ratio; canvas.height = rect.height * ratio;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      ctx.scale(ratio, ratio); const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      gradient.addColorStop(0, '#8f6a32'); gradient.addColorStop(.46, '#f0d797'); gradient.addColorStop(.7, '#a77a36'); gradient.addColorStop(1, '#f4dea2');
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, rect.width, rect.height); ctx.fillStyle = '#3f2d15'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '600 12px Arial'; ctx.fillText('RUB TO REVEAL THE DATE', rect.width / 2, rect.height / 2);
    }; resize(); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize);
  }, []);
  const scratch = (clientX: number, clientY: number) => {
    if (!drawing.current || revealed) return; const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect(); const ratio = canvas.width / rect.width; const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc((clientX - rect.left) * ratio, (clientY - rect.top) * ratio, 25 * ratio, 0, Math.PI * 2); ctx.fill();
    strokes.current += 1; if (strokes.current > 42) { setRevealed(true); onReveal(); }
  };
  const finish = () => { drawing.current = false; };
  return <div className={`scratch-card ${revealed ? 'is-revealed' : ''}`}>
    <div className="date-reveal"><span>Monday</span><strong>07</strong><span>September · 2026</span><i>10:00 am</i></div>
    <canvas ref={canvasRef} aria-label="Scratch to reveal the housewarming date" role="img"
      onPointerDown={e => { drawing.current = true; e.currentTarget.setPointerCapture(e.pointerId); scratch(e.clientX, e.clientY); }}
      onPointerMove={e => scratch(e.clientX, e.clientY)} onPointerUp={finish} onPointerCancel={finish} />
    <button type="button" className="reveal-button" onClick={() => { setRevealed(true); onReveal(); }}>or tap to reveal</button>
  </div>;
}

function Petals({ active }: { active: boolean }) {
  if (!active) return null;
  return <div className="petals" aria-hidden="true">{Array.from({ length: 22 }, (_, i) => <i key={i} style={{ '--i': i } as React.CSSProperties} />)}</div>;
}

export default function Home() {
  const [open, setOpen] = useState(false); const [petals, setPetals] = useState(false); const [music, setMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null); const ambientRef = useRef<{ context: AudioContext; timer: number } | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('in-view')), { threshold: .14 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el)); return () => observer.disconnect();
  }, [open]);
  useEffect(() => {
    const syncPlayback = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden) audio.pause();
      else if (music && open) void audio.play().catch(() => undefined);
    };
    const pausePlayback = () => audioRef.current?.pause();
    document.addEventListener('visibilitychange', syncPlayback);
    window.addEventListener('pagehide', pausePlayback);
    window.addEventListener('pageshow', syncPlayback);
    return () => {
      document.removeEventListener('visibilitychange', syncPlayback);
      window.removeEventListener('pagehide', pausePlayback);
      window.removeEventListener('pageshow', syncPlayback);
    };
  }, [music, open]);
  const toggleMusic = async () => {
    if (music) { audioRef.current?.pause(); if (ambientRef.current) { window.clearInterval(ambientRef.current.timer); void ambientRef.current.context.close(); ambientRef.current = null; } setMusic(false); return; }
    if (INVITATION.musicUrl && audioRef.current) { await audioRef.current.play(); setMusic(true); return; }
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const context = new AudioCtor(); let step = 0;
    const hit = (frequency: number, duration: number, volume: number, type: OscillatorType = 'sine') => { const now = context.currentTime; const osc = context.createOscillator(); const gain = context.createGain(); osc.type = type; osc.frequency.setValueAtTime(frequency, now); if (frequency < 100) osc.frequency.exponentialRampToValueAtTime(38, now + duration); gain.gain.setValueAtTime(volume, now); gain.gain.exponentialRampToValueAtTime(.0001, now + duration); osc.connect(gain).connect(context.destination); osc.start(now); osc.stop(now + duration); };
    const melody = [392, 440, 523.25, 587.33, 523.25, 440, 392, 659.25, 587.33, 523.25, 440, 392, 440, 523.25, 587.33, 783.99];
    const pulse = () => { if (step % 4 === 0) hit(82, .22, .085); if (step % 4 === 2) hit(150, .08, .025, 'square'); if (step % 2 === 0 || step % 8 === 7) hit(1050 + (step % 3) * 180, .035, .012, 'triangle'); hit(melody[step % melody.length], .17, step % 2 ? .018 : .026, 'triangle'); if (step % 8 === 0) hit(196, .65, .018, 'sine'); step += 1; };
    pulse(); const timer = window.setInterval(pulse, 288); ambientRef.current = { context, timer }; setMusic(true);
  };
  const handleOpen = async () => { setOpen(true); setPetals(true); window.setTimeout(() => setPetals(false), 4600); window.setTimeout(() => void toggleMusic(), 280); };
  const celebrate = () => { if (petals) return; setPetals(true); window.setTimeout(() => setPetals(false), 4500); };
  return <main className={`site-shell ${open ? 'opened' : ''}`}>
    <audio ref={audioRef} src={INVITATION.musicUrl || undefined} loop preload="none" />
    <button className={`music-control ${music ? 'playing' : ''}`} onClick={() => void toggleMusic()} aria-label={music ? 'Pause background music' : 'Play background music'}><span>{music ? 'Ⅱ' : '♪'}</span><em>{music ? 'Music on' : 'Music'}</em></button>
    <Petals active={petals} /><div className="cinematic-burst" aria-hidden="true"><i/><i/><i/></div>
    <section className="hero" id="top"><div className="hero-image" style={{ backgroundImage: `url(${asset('/photos/foundation.jpg')})` }}/><div className="hero-shade"/><div className="hero-content reveal in-view"><p className="eyebrow">Where our dream began</p><h1>From earth<br/><i>to</i> home</h1><p className="hero-kicker">Scroll through the journey that brought us home</p></div><a className="scroll-cue" href="#invitation"><span>Begin the journey</span><i /></a></section>
    <section className="letter-section" id="invitation"><div className="ornament">✦</div><div className="letter reveal"><p className="section-label">With love & gratitude</p><h2>Come, bless<br/>our new beginning.</h2><p>{INVITATION.message}</p><div className="signature">Sankar <span>&</span> Karthiha</div></div></section>
    <section className="scratch-section"><div className="section-heading reveal"><p className="section-label">Save the date</p><h2>A little surprise<br/>awaits you</h2><p className="instruction">Gently rub the golden card with your finger.</p></div><ScratchCard onReveal={celebrate}/></section>
    <section className="count-section" style={{ backgroundImage: `linear-gradient(rgba(32,10,12,.84),rgba(32,10,12,.9)),url(${asset('/photos/framing.jpg')})` }}><div className="reveal"><p className="section-label">Counting every heartbeat</p><h2>Until we open<br/>our doors to you</h2><Countdown/></div></section>
    <section className="gallery-section" id="journey"><div className="section-heading reveal"><p className="section-label">Our journey home</p><h2>Watch the dream<br/>rise as you scroll</h2><p className="journey-intro">From the first patch of earth to the frame that held our hopes.</p></div><div className="journey-line" aria-hidden="true"><span /></div><div className="gallery">{GALLERY.map((image, index) => <article className={`gallery-card reveal card-${index + 1}`} key={image.src}><div className="journey-photo"><img src={image.src} alt={image.alt} loading={index < 2 ? 'eager' : 'lazy'}/><span className="journey-number">0{index + 1}</span></div><div className="journey-copy"><p>{image.date}</p><h3>{image.note}</h3><span>{image.copy}</span></div></article>)}</div></section>
    <section className="home-section"><div className="completion-label reveal"><span>05</span><p>And then, we were home.</p></div><div className="home-photo"><img src={asset('/photos/home.jpg')} alt="The finished home of Sankar and Karthiha in Narangba" loading="eager"/></div><div className="home-card reveal"><p className="section-label">The journey ends at our door</p><h2>Our new home</h2><div className="venue-line"><span>Date</span><strong>{INVITATION.dateLabel}</strong></div><div className="venue-line"><span>Time</span><strong>{INVITATION.time}</strong></div><div className="venue-line"><span>Place</span><strong>{INVITATION.venue}</strong></div><a className="map-button" href={INVITATION.mapUrl} target="_blank" rel="noreferrer"><span>Open in Google Maps</span><i>↗</i></a></div></section>
    <footer><p className="section-label">We cannot wait to welcome you</p><div className="footer-names">Sankar <i>&</i> Karthiha</div><p>07 · 09 · 2026</p><a href="#top">Back to top ↑</a></footer>
    {!open && <div className="invitation-cover kinetic-cover" style={{ backgroundImage: `url(${asset('/kinetic-kolam-cover.png')})` }} onClick={() => void handleOpen()} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') void handleOpen(); }} role="button" tabIndex={0} aria-label="Open Sankar and Karthiha's housewarming invitation">
      <span className="cover-edge"/><span className="energy-aura"/>
      <span className="spark-field" aria-hidden="true">{Array.from({ length: 42 }, (_, i) => <i key={i} style={{ '--s': i } as React.CSSProperties}/>)}</span>
      <span className="cover-accessible-copy">Bless our new beginning. Sankar and Karthiha housewarming invitation. Tap to open.</span>
    </div>}
  </main>;
}
