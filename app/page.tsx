'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const INVITATION = {
  hosts: 'Sankar & Karthiha',
  dateLabel: '07 September 2026',
  time: '10:00 am',
  venue: 'Narangba, Queensland',
  eventDate: '2026-09-07T10:00:00+10:00',
  mapUrl: 'https://maps.app.goo.gl/mRTXcrErRen6Aj9a9',
  musicUrl: '', // Add an uploaded audio file path here, for example: '/music/song.mp3'
  message: 'A house is built with walls and beams; a home is made with love and dreams. With grateful hearts, we invite you to step through our new doors, share in our happiness, and bless the place where our family’s next chapter will unfold.',
};

const GALLERY = [
  { src: '/photos/foundation.jpg', alt: 'Our family at the beginning of the home build', note: 'The beginning' },
  { src: '/photos/progress-one.jpg', alt: 'Our family watching our new home take shape', note: 'Dreams taking shape' },
  { src: '/photos/progress-two.jpg', alt: 'A joyful family moment during construction', note: 'Built with love' },
  { src: '/photos/framing.jpg', alt: 'Our family in front of the new home frame', note: 'Almost home' },
];

function Countdown() {
  const calculate = useCallback(() => {
    const distance = Math.max(0, new Date(INVITATION.eventDate).getTime() - Date.now());
    return { days: Math.floor(distance / 86400000), hours: Math.floor(distance / 3600000) % 24, minutes: Math.floor(distance / 60000) % 60, seconds: Math.floor(distance / 1000) % 60 };
  }, []);
  const [time, setTime] = useState(calculate);
  useEffect(() => { const timer = window.setInterval(() => setTime(calculate()), 1000); return () => clearInterval(timer); }, [calculate]);
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
    <section className="hero" id="top"><div className="hero-image"/><div className="hero-shade"/><div className="hero-content reveal in-view"><p className="eyebrow">A new chapter begins</p><p className="monogram">S <span>&</span> K</p><h1>Sankar <i>&</i> Karthiha</h1><p className="hero-kicker">joyfully invite you to warm their new home</p><p className="hero-date">07 · 09 · 2026</p></div><a className="scroll-cue" href="#invitation"><span>Scroll</span><i /></a></section>
    <section className="letter-section" id="invitation"><div className="ornament">✦</div><div className="letter reveal"><p className="section-label">With love & gratitude</p><h2>Come, bless<br/>our new beginning.</h2><p>{INVITATION.message}</p><div className="signature">Sankar <span>&</span> Karthiha</div></div></section>
    <section className="scratch-section"><div className="section-heading reveal"><p className="section-label">Save the date</p><h2>A little surprise<br/>awaits you</h2><p className="instruction">Gently rub the golden card with your finger.</p></div><ScratchCard onReveal={celebrate}/></section>
    <section className="count-section"><div className="reveal"><p className="section-label">Counting every heartbeat</p><h2>Until we open<br/>our doors to you</h2><Countdown/></div></section>
    <section className="story-section"><div className="story-image reveal"><img src="/photos/foundation.jpg" alt="Sankar, Karthiha and their children at the site of their new home" loading="lazy"/><span>Where the dream began</span></div><div className="story-copy reveal"><p className="section-label">Our journey home</p><h2>From bare earth<br/>to belonging.</h2><p>We watched a patch of earth become a promise, a frame become a shelter, and a house become the place our children will remember as home.</p></div></section>
    <section className="gallery-section"><div className="section-heading reveal"><p className="section-label">Made of moments</p><h2>The story<br/>in photographs</h2></div><div className="gallery">{GALLERY.map((image, index) => <figure className={`gallery-card reveal card-${index + 1}`} key={image.src}><img src={image.src} alt={image.alt} loading="lazy"/><figcaption><span>0{index + 1}</span>{image.note}</figcaption></figure>)}</div></section>
    <section className="home-section"><div className="home-photo"><img src="/photos/home.jpg" alt="The front of Sankar and Karthiha's new home in Narangba" loading="lazy"/></div><div className="home-card reveal"><p className="section-label">Meet us here</p><h2>Our new home</h2><div className="venue-line"><span>Date</span><strong>{INVITATION.dateLabel}</strong></div><div className="venue-line"><span>Time</span><strong>{INVITATION.time}</strong></div><div className="venue-line"><span>Place</span><strong>{INVITATION.venue}</strong></div><a className="map-button" href={INVITATION.mapUrl} target="_blank" rel="noreferrer"><span>Open in Google Maps</span><i>↗</i></a></div></section>
    <footer><p className="section-label">We cannot wait to welcome you</p><div className="footer-names">Sankar <i>&</i> Karthiha</div><p>07 · 09 · 2026</p><a href="#top">Back to top ↑</a></footer>
    {!open && <button className="invitation-cover" onClick={() => void handleOpen()} aria-label="Open invitation"><span className="cover-edge"/><span className="cover-flourish">✦</span><span className="cover-copy"><small>Housewarming invitation</small><strong>S <i>&</i> K</strong><p>Sankar & Karthiha</p><em>Tap to open</em></span><span className="wax-seal">ॐ</span></button>}
  </main>;
}
