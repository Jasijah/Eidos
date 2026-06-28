import { ArrowRight, Mic, ShieldCheck, Sparkles } from 'lucide-react';

export function HeroSection({ onJoin }: { onJoin: () => void }) {
  return <section className="public-hero"><img src="/brand/eidos-presence-hero.png" alt="A realistic digital human presence rendered in violet light" /><div className="public-hero-shade" /><div className="public-hero-copy"><h1>Turn your camera off.<br /><span>Stay present.</span></h1><p>Eidos is a Presence Platform that lets people communicate with their real voice while remaining visually present without depending on a camera.</p><div className="hero-actions"><button className="public-cta" onClick={onJoin}>Join the Beta <ArrowRight size={17} /></button></div><p className="public-trust-line">Your voice stays yours. Eidos never clones your voice or speaks for you.</p><div className="hero-principles"><Principle icon={<Mic />} title="Authentic voice" /><Principle icon={<ShieldCheck />} title="Local-first privacy" /><Principle icon={<Sparkles />} title="Portable presence" /></div></div></section>;
}
function Principle({ icon, title }: { icon: React.ReactNode; title: string }) { return <div>{icon}<strong>{title}</strong></div>; }
