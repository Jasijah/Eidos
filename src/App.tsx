import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  CircleDot,
  Eye,
  Mic,
  MonitorUp,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  Video
} from 'lucide-react';
import { AvatarCanvas } from './components/AvatarCanvas';
import { AudioLipSyncService } from './services/AudioLipSyncService';
import { AvatarAnimationService } from './services/AvatarAnimationService';
import { FaceTrackingService } from './services/FaceTrackingService';
import { GestureMemoryService } from './services/GestureMemoryService';
import { PresenceModeService } from './services/PresenceModeService';
import type { AvatarFrame, AvatarStyle, FaceTrackingSnapshot, PresenceMode, UserProfile } from './types';
import { defaultProfile, loadProfile, saveProfile } from './utils/storage';
import { defaultRealismProfile, type RealismLevel, type RealismProfile } from './avatar/RealismProfile';

const modeLabels: Record<PresenceMode, string> = {
  professional: 'Professional',
  casual: 'Casual',
  creator: 'Creator',
  'low-energy': 'Low Energy / Sick Day'
};

const emptyFrame: AvatarFrame = {
  mouthOpen: 0.035,
  headX: 0,
  headY: 0,
  blink: false,
  smile: 0.08,
  tilt: 0,
  idle: 0.12,
  handGesture: false,
  viseme: 'rest',
  jawOpen: 0.02,
  brow: 0,
  eyeSquint: 0.06,
  eyeContact: 0.65,
  shoulderShift: 0,
  posture: 0.62,
  breathing: 0.5
};

export function App() {
  const gestureService = useMemo(() => new GestureMemoryService(), []);
  const animationService = useMemo(() => new AvatarAnimationService(), []);
  const faceService = useMemo(() => new FaceTrackingService(), []);
  const presenceService = useMemo(() => new PresenceModeService(), []);
  const lipSyncRef = useRef(new AudioLipSyncService());
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [profile, setProfile] = useState<UserProfile>(() => (typeof window === 'undefined' ? defaultProfile : loadProfile()));
  const [gestureProfile, setGestureProfile] = useState(() => gestureService.load());
  const [mode, setMode] = useState<PresenceMode>('professional');
  const [realism, setRealism] = useState<RealismProfile>(defaultRealismProfile);
  const [voiceOnly, setVoiceOnly] = useState(true);
  const [avatarActive, setAvatarActive] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [tracking, setTracking] = useState<FaceTrackingSnapshot>();
  const [frame, setFrame] = useState<AvatarFrame>(emptyFrame);
  const [mediaError, setMediaError] = useState('');
  const [activePage, setActivePage] = useState<'preview' | 'settings'>('preview');

  useEffect(() => saveProfile(profile), [profile]);

  useEffect(() => {
    let animation = 0;
    const tick = () => {
      const lipSync = lipSyncRef.current.getLipSyncFrame();
      setFrame(
        animationService.composeFrame({
          lipSync,
          tracking,
          gestureProfile,
          mode: realism.lowEnergyMode ? 'low-energy' : mode,
          voiceOnly,
          realism,
          now: performance.now()
        })
      );
      animation = requestAnimationFrame(tick);
    };
    animation = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animation);
  }, [animationService, gestureProfile, mode, realism, tracking, voiceOnly]);

  useEffect(() => {
    if (!cameraEnabled || !videoRef.current || !canvasRef.current) return;
    const interval = window.setInterval(() => {
      const next = faceService.estimateFromFrame(videoRef.current!, canvasRef.current!);
      if (next) {
        setTracking(next);
        setGestureProfile(gestureService.updateWithSample(faceService.snapshotToGestureSample(next)));
      }
    }, 700);
    return () => window.clearInterval(interval);
  }, [cameraEnabled, faceService, gestureService]);

  async function enableMicrophone() {
    setMediaError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      await lipSyncRef.current.connect(stream);
      setMicEnabled(true);
    } catch {
      setMediaError('Microphone permission was not granted.');
    }
  }

  async function enableCamera() {
    setMediaError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraEnabled(true);
      setVoiceOnly(false);
    } catch {
      setMediaError('Camera permission was not granted.');
    }
  }

  function completeTraining() {
    const next = { ...profile, trainingComplete: true };
    setProfile(next);
    if (presenceService.shouldDisableCameraAfterTraining(true)) {
      setCameraEnabled(false);
      setVoiceOnly(true);
    }
  }

  function deleteMemory() {
    setGestureProfile(gestureService.clear());
    setTracking(undefined);
  }

  function addHandGesture() {
    setGestureProfile(gestureService.addHandGestureEvent());
  }

  return (
    <main className="min-h-screen bg-cloud text-ink">
      <div className="grid min-h-screen grid-cols-[248px_1fr] max-lg:grid-cols-1">
        <aside className="border-r border-line bg-white px-5 py-6 max-lg:border-b max-lg:border-r-0">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-white">
              <Sparkles size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold leading-none">Eidos</h1>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-teal">AI presence layer</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button className={`nav-button ${activePage === 'preview' ? 'is-active' : ''}`} onClick={() => setActivePage('preview')}>
              <Video size={18} /> Live preview
            </button>
            <button className={`nav-button ${activePage === 'settings' ? 'is-active' : ''}`} onClick={() => setActivePage('settings')}>
              <Settings size={18} /> Settings
            </button>
          </nav>

          <div className="mt-8 rounded-lg border border-line bg-cloud p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <UserRound size={17} /> Onboarding
            </div>
            <label className="field-label">Display name</label>
            <input className="text-input" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
            <label className="field-label mt-3">Role</label>
            <input className="text-input" value={profile.role} onChange={(event) => setProfile({ ...profile, role: event.target.value })} />
            <label className="field-label mt-3">Avatar style</label>
            <select className="text-input" value={profile.avatarStyle} onChange={(event) => setProfile({ ...profile, avatarStyle: event.target.value as AvatarStyle })}>
              <option value="studio">Studio</option>
              <option value="warm">Warm</option>
              <option value="mono">Mono</option>
              <option value="expressive">Expressive</option>
            </select>
            <button className="primary-button mt-4 w-full" onClick={completeTraining}>Finish training</button>
          </div>
        </aside>

        <section className="px-7 py-6 max-sm:px-4">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-3xl font-semibold">{activePage === 'preview' ? 'Live call preview' : 'Settings'}</h2>
              <p className="mt-1 text-sm text-ink/60">Real voice in, realistic visual presence out.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="toggle-row">
                <input type="checkbox" checked={avatarActive} onChange={(event) => setAvatarActive(event.target.checked)} />
                Avatar Mode Active
              </label>
              <button className="secondary-button" onClick={enableMicrophone}>
                <Mic size={17} /> {micEnabled ? 'Mic on' : 'Enable mic'}
              </button>
              <button className="secondary-button" onClick={enableCamera}>
                {cameraEnabled ? <Camera size={17} /> : <CameraOff size={17} />} {cameraEnabled ? 'Camera training' : 'Train camera'}
              </button>
            </div>
          </header>

          {mediaError ? <div className="mb-4 rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-ink">{mediaError}</div> : null}

          {activePage === 'preview' ? (
            <PreviewPage
              avatarActive={avatarActive}
              cameraEnabled={cameraEnabled}
              frame={frame}
              gestureProfile={gestureProfile}
              mode={realism.lowEnergyMode ? 'low-energy' : mode}
              profile={profile}
              realism={realism}
              tracking={tracking}
              voiceOnly={voiceOnly}
              setMode={setMode}
              setVoiceOnly={setVoiceOnly}
              deleteMemory={deleteMemory}
              addHandGesture={addHandGesture}
            />
          ) : (
            <SettingsPage
              cameraEnabled={cameraEnabled}
              deleteMemory={deleteMemory}
              micEnabled={micEnabled}
              profile={profile}
              realism={realism}
              setRealism={setRealism}
              setProfile={setProfile}
            />
          )}
        </section>
      </div>
      <video ref={videoRef} autoPlay muted playsInline className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}

interface PreviewPageProps {
  avatarActive: boolean;
  cameraEnabled: boolean;
  frame: AvatarFrame;
  gestureProfile: ReturnType<GestureMemoryService['load']>;
  mode: PresenceMode;
  profile: UserProfile;
  realism: RealismProfile;
  tracking?: FaceTrackingSnapshot;
  voiceOnly: boolean;
  setMode: (mode: PresenceMode) => void;
  setVoiceOnly: (enabled: boolean) => void;
  deleteMemory: () => void;
  addHandGesture: () => void;
}

function PreviewPage(props: PreviewPageProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-5">
          <div>
            <h3 className="text-lg font-semibold">{props.profile.name}</h3>
            <p className="text-sm text-ink/60">{props.profile.role} · {modeLabels[props.mode]}</p>
          </div>
          <div className={`status-pill ${props.avatarActive ? 'bg-teal/15 text-teal' : 'bg-coral/15 text-coral'}`}>
            <CircleDot size={15} /> {props.avatarActive ? 'Realistic avatar live' : 'Disclosure off'}
          </div>
        </div>
        <div className="grid min-h-[530px] place-items-center bg-[#dfe8e5] p-5">
          <AvatarCanvas frame={props.frame} style={props.profile.avatarStyle} label={props.profile.name} realism={props.realism} />
        </div>
        <div className="grid gap-3 border-t border-line p-5 sm:grid-cols-3">
          <Metric label="Mouth" value={`${Math.round(props.frame.mouthOpen * 100)}%`} tone="teal" />
          <Metric label="Jaw" value={`${Math.round((props.frame.jawOpen ?? 0) * 100)}%`} tone="coral" />
          <Metric label="Eye contact" value={`${Math.round((props.frame.eyeContact ?? 0) * 100)}%`} tone="lime" />
        </div>
      </section>

      <aside className="space-y-5">
        <section className="panel p-5">
          <h3 className="section-title">Presence mode</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(Object.keys(modeLabels) as PresenceMode[]).map((key) => (
              <button key={key} className={`mode-button ${props.mode === key ? 'is-active' : ''}`} onClick={() => props.setMode(key)}>
                {modeLabels[key]}
              </button>
            ))}
          </div>
          <label className="toggle-row mt-4">
            <input type="checkbox" checked={props.voiceOnly} onChange={(event) => props.setVoiceOnly(event.target.checked)} />
            Voice-Only Presence Mode
          </label>
        </section>

        <section className="panel p-5">
          <h3 className="section-title">Realistic behavior</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label="Head X" value={(props.tracking?.headX ?? props.frame.headX).toFixed(2)} tone="teal" />
            <Metric label="Blinking" value={props.frame.blink ? 'Yes' : 'No'} tone="coral" />
            <Metric label="Brow" value={(props.frame.brow ?? 0).toFixed(2)} tone="lime" />
            <Metric label="Posture" value={(props.frame.posture ?? 0).toFixed(2)} tone="teal" />
          </div>
          <p className="mt-3 text-sm text-ink/60">
            Camera is {props.cameraEnabled ? 'used only for training and live mirroring.' : 'off. Voice-only animation uses saved gesture memory.'}
          </p>
        </section>

        <section className="panel p-5">
          <h3 className="section-title">Realism memory</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label="Nod freq." value={props.gestureProfile.nodFrequency.toFixed(2)} tone="teal" />
            <Metric label="Smile freq." value={props.gestureProfile.smileFrequency.toFixed(2)} tone="coral" />
            <Metric label="Idle" value={props.gestureProfile.idleMovement.toFixed(2)} tone="lime" />
            <Metric label="Hand events" value={String(props.gestureProfile.handGestureEvents)} tone="teal" />
          </div>
          <div className="mt-4 flex gap-2">
            <button className="secondary-button flex-1" onClick={props.addHandGesture}>Add gesture</button>
            <button className="danger-button" onClick={props.deleteMemory}>
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </section>

        <section className="panel p-5">
          <h3 className="section-title">Virtual camera output</h3>
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-dashed border-ink/25 bg-cloud p-4 text-sm">
            <MonitorUp className="text-teal" size={28} />
            <span>Technical placeholder: future WebRTC canvas capture and OS virtual camera bridge.</span>
          </div>
        </section>
      </aside>
    </div>
  );
}

function SettingsPage({
  cameraEnabled,
  deleteMemory,
  micEnabled,
  profile,
  realism,
  setRealism,
  setProfile
}: {
  cameraEnabled: boolean;
  deleteMemory: () => void;
  micEnabled: boolean;
  profile: UserProfile;
  realism: RealismProfile;
  setRealism: (profile: RealismProfile) => void;
  setProfile: (profile: UserProfile) => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <section className="panel p-5">
        <h3 className="section-title">Avatar source and realism</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {(['studio', 'warm', 'mono', 'expressive'] as AvatarStyle[]).map((style) => (
            <button key={style} className={`mode-button capitalize ${profile.avatarStyle === style ? 'is-active' : ''}`} onClick={() => setProfile({ ...profile, avatarStyle: style })}>
              {style}
            </button>
          ))}
        </div>
        <label className="field-label mt-5">Realism level</label>
        <div className="grid grid-cols-3 gap-2">
          {(['standard', 'professional', 'high-realism'] as RealismLevel[]).map((level) => (
            <button key={level} className={`mode-button ${realism.level === level ? 'is-active' : ''}`} onClick={() => setRealism({ ...realism, level })}>
              {level === 'high-realism' ? 'High Realism' : level}
            </button>
          ))}
        </div>
        <RangeControl label="Gesture intensity" value={realism.gestureIntensity} onChange={(value) => setRealism({ ...realism, gestureIntensity: value })} />
        <RangeControl label="Expression intensity" value={realism.expressionIntensity} onChange={(value) => setRealism({ ...realism, expressionIntensity: value })} />
        <RangeControl label="Eye contact strength" value={realism.eyeContactStrength} onChange={(value) => setRealism({ ...realism, eyeContactStrength: value })} />
        <label className="toggle-row mt-4">
          <input type="checkbox" checked={realism.lowEnergyMode} onChange={(event) => setRealism({ ...realism, lowEnergyMode: event.target.checked })} />
          Low-energy mode
        </label>
        <label className="toggle-row mt-3">
          <input type="checkbox" checked={realism.cameraTrainedBehavior} onChange={(event) => setRealism({ ...realism, cameraTrainedBehavior: event.target.checked })} />
          Camera-trained behavior
        </label>
      </section>
      <section className="panel p-5">
        <h3 className="section-title">Permissions and data</h3>
        <div className="mt-4 space-y-3">
          <PermissionRow icon={<Mic size={18} />} label="Microphone permission" active={micEnabled} />
          <PermissionRow icon={<Camera size={18} />} label="Camera permission" active={cameraEnabled} />
          <PermissionRow icon={<ShieldCheck size={18} />} label="Local realism memory" active />
          <PermissionRow icon={<Eye size={18} />} label="Eye contact correction" active={realism.eyeContactStrength > 0} />
        </div>
        <button className="danger-button mt-5" onClick={deleteMemory}>
          <Trash2 size={16} /> Delete realism / gesture memory
        </button>
        <p className="mt-4 text-sm text-ink/60">
          Realism and gesture memory stay local in this browser. Voice cloning is not implemented; Eidos always uses the user's real voice.
        </p>
      </section>
    </div>
  );
}

function RangeControl({ label, onChange, value }: { label: string; onChange: (value: number) => void; value: number }) {
  return (
    <label className="mt-5 block">
      <span className="field-label">{label}</span>
      <span className="flex items-center gap-3">
        <input className="w-full accent-teal" type="range" min="0" max="100" value={value} onChange={(event) => onChange(Number(event.target.value))} />
        <span className="w-10 text-right text-sm font-semibold text-ink/70">{value}</span>
      </span>
    </label>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'teal' | 'coral' | 'lime' }) {
  const toneClass = {
    teal: 'text-teal',
    coral: 'text-coral',
    lime: 'text-lime'
  }[tone];

  return (
    <div className="rounded-lg border border-line bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function PermissionRow({ active, icon, label }: { active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-cloud px-4 py-3 text-sm">
      <span className="flex items-center gap-2 font-medium">{icon}{label}</span>
      <span className={active ? 'text-teal' : 'text-coral'}>{active ? 'Granted' : 'Not granted'}</span>
    </div>
  );
}