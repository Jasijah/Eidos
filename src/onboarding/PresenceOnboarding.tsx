import { ArrowRight, BriefcaseBusiness, Mic, Presentation, ShieldCheck, Users, VideoOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { OnboardingStore, type MeetingType } from './OnboardingStore';
const education = [
  { title: 'Turn Your Camera Off.', copy: 'Join calls through a realistic visual presence while keeping your real microphone voice.', icon: <VideoOff size={28} /> },
  { title: 'Stay Present.', copy: 'Eidos keeps subtle listening, speaking, and idle behavior active even when the camera is off.', icon: <ShieldCheck size={28} /> },
  { title: 'Your Voice Stays Yours.', copy: 'Eidos never clones your voice, generates speech, or speaks for you.', icon: <Mic size={28} /> }
];
const meetings: { id: MeetingType; label: string; detail: string; icon: React.ReactNode }[] = [
  { id: 'team', label: 'Team meetings', detail: 'Standups, internal calls, and collaboration.', icon: <Users size={20} /> },
  { id: 'client', label: 'Client meetings', detail: 'Customer, recruiting, and external calls.', icon: <BriefcaseBusiness size={20} /> },
  { id: 'creator', label: 'Presenting', detail: 'Demos, teaching, streaming, and content.', icon: <Presentation size={20} /> },
  { id: 'comfort', label: 'Camera relief', detail: 'Low-energy days, privacy, and accessibility.', icon: <VideoOff size={20} /> }
];
export function PresenceOnboarding({ onComplete }: { onComplete: (meetingType?: MeetingType) => void }) {
  const store = useMemo(() => new OnboardingStore(), []); const initial = store.load();
  const [index, setIndex] = useState(initial.step); const [selected, setSelected] = useState<MeetingType | undefined>(initial.meetingType); const item = education[Math.max(0, index - 1)];
  const next = () => { if (index === 0) { if (!selected) return; store.setMeetingType(selected); } if (index >= 3) { const completed = store.complete(); onComplete(completed.meetingType); return; } const value = index + 1; store.advance(value); setIndex(value); };
  return <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-labelledby="onboarding-title"><section className="onboarding-surface">{index === 0 ? <><div className="onboarding-mark"><Users size={28} /></div><p className="field-label">Personalize your Presence</p><h2 id="onboarding-title">What type of meetings do you attend most?</h2><p>Eidos will begin with a presence style suited to your day. You can change it anytime.</p><div className="meeting-type-grid">{meetings.map((option) => <button key={option.id} className={`meeting-type-option ${selected === option.id ? 'is-active' : ''}`} onClick={() => setSelected(option.id)} aria-pressed={selected === option.id}>{option.icon}<span><strong>{option.label}</strong><small>{option.detail}</small></span></button>)}</div></> : <><div className="onboarding-mark">{item.icon}</div><p className="field-label">Eidos Presence Platform</p><h2 id="onboarding-title">{item.title}</h2><p>{item.copy}</p></>}<div className="onboarding-progress">{Array.from({ length: 4 }, (_, i) => <span key={i} className={i <= index ? 'is-active' : ''} />)}</div><button className="primary-button" disabled={index === 0 && !selected} onClick={next}>{index === 3 ? 'Create my Presence' : 'Continue'}<ArrowRight size={17} /></button></section></div>;
}
