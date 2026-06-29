import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BarChart3, BookOpen, Camera, CameraOff, Check, CircleGauge, HeartHandshake, Image, LayoutDashboard, LifeBuoy, LogOut, MessageSquare, Mic, ShieldCheck, Sparkles, UserPlus, Users, Video } from 'lucide-react';
import { AvatarCanvas } from './components/AvatarCanvas';
import { AvatarStudio } from './avatar/AvatarStudio';
import { PrivacyDashboard } from './components/PrivacyDashboard';
import { VirtualCameraSetup } from './components/VirtualCameraSetup';
import { BetaEvaluation } from './components/BetaEvaluation';
import { AudioLipSyncService } from './services/AudioLipSyncService';
import { AvatarAnimationService } from './services/AvatarAnimationService';
import { FaceTrackingService } from './services/FaceTrackingService';
import { GestureMemoryService } from './services/GestureMemoryService';
import { PresenceStateDetector } from './presence/PresenceStateDetector';
import { TrainingSessionRecorder, type TrainingSessionSummary } from './presence/TrainingSessionRecorder';
import { mergeTrainingSession, type UserBehaviorProfile } from './presence/UserBehaviorProfile';
import type { AvatarFrame, FaceTrackingSnapshot, PresenceMode, UserProfile } from './types';
import { clearBehaviorProfile, clearProfile, loadBehaviorProfile, loadProfile, saveBehaviorProfile, saveProfile } from './utils/storage';
import { defaultRealismProfile, type RealismProfile } from './avatar/RealismProfile';
import { deleteAvatarIdentityModel, loadAvatarIdentityModel, saveAvatarIdentityModel, type AvatarIdentityModel, type AvatarRealismLevel, type PhotorealAvatarProviderId } from './avatar/AvatarIdentityModel';
import { AvatarProviderRegistry } from './avatar/AvatarProviderRegistry';
import type { MediaPipePresenceFeatures } from './presence/MediaPipeFeatureMapper';
import type { PresencePrediction } from './ml/PresencePrediction';
import { LocalQwenProvider } from './llm/LocalQwenProvider';
import { disabledContextState, type ContextState } from './llm/ContextState';
import { ConsentManager, type ConsentState } from './privacy/ConsentManager';
import { CommercialDatasetRegistry } from './data/CommercialDatasetRegistry';
import { DatasetLicenseValidator } from './data/DatasetLicenseValidator';
import { OutputFrameBus } from './output/OutputFrameBus';
import { loadOutputSettings, saveOutputSettings, type OutputSettings } from './output/OutputSettings';
import { createEidosSecureStorage, deleteEidosSecureKey, SECURE_AVATAR_KEY, SECURE_BEHAVIOR_KEY } from './storage/EidosSecureStorage';
import { AnalyticsService } from './analytics/AnalyticsService';
import { EventTracker } from './analytics/EventTracker';
import { SessionTracker } from './analytics/SessionTracker';
import { CrashReporter } from './analytics/CrashReporter';
import { PerformanceMonitor } from './performance/PerformanceMonitor';
import { PresenceQualityEvaluator, type PresenceQualityScore } from './presence/PresenceQualityEvaluator';
import { FeedbackService } from './feedback/FeedbackService';
import { FeedbackPrompt } from './feedback/FeedbackPrompt';
import { PmfSurvey } from './feedback/PmfSurvey';
import { PresenceOnboarding } from './onboarding/PresenceOnboarding';
import { OnboardingStore } from './onboarding/OnboardingStore';
import { BetaDashboard } from './pages/BetaDashboard';
import { FounderDashboard } from './pages/FounderDashboard';
import { AdminConsole } from './pages/AdminConsole';
import { ClosedBetaSignup } from './pages/ClosedBetaSignup';
import { PresenceWalkthrough } from './onboarding/PresenceWalkthrough';
import type { MeetingType } from './onboarding/OnboardingStore';
import { SystemCheckPage } from './pages/SystemCheckPage';
import { TrustCenter } from './pages/TrustCenter';
import { HelpCenter } from './pages/HelpCenter';
import { BetaHub } from './pages/BetaHub';
import { RecoveryNotice } from './components/RecoveryNotice';
import { EidosLogo } from './brand/EidosLogo';
import { ThemeToggle } from './theme/ThemeToggle';

const TRAINING_SECONDS = 60;
const modeLabels: Record<PresenceMode, string> = { professional: 'Professional', casual: 'Casual', creator: 'Creator', 'low-energy': 'Low Energy' };
const emptyFrame: AvatarFrame = { mouthOpen: 0.035, headX: 0, headY: 0, blink: false, smile: 0.08, tilt: 0, idle: 0.12, handGesture: false, viseme: 'rest', jawOpen: 0.02, brow: 0, eyeSquint: 0.06, eyeContact: 0.65, shoulderShift: 0, posture: 0.62, breathing: 0.5 };

export type BetaPage = 'live' | 'avatar' | 'training' | 'output' | 'privacy' | 'trust' | 'diagnostics' | 'help' | 'hub' | 'evaluation' | 'dashboard' | 'founder' | 'admin' | 'signup';
type TrainingState = 'idle' | 'running' | 'complete';

export function App({ initialPage = 'live', adminEmail, onAdminLogout }: { initialPage?: BetaPage; adminEmail?: string; onAdminLogout?: () => void }) {
  const gestureService = useMemo(() => new GestureMemoryService(), []);
  const animationService = useMemo(() => new AvatarAnimationService(), []);
  const faceService = useMemo(() => new FaceTrackingService(), []);
  const stateDetector = useMemo(() => new PresenceStateDetector(), []);
  const trainingRecorder = useMemo(() => new TrainingSessionRecorder(), []);
  const consentManager = useMemo(() => new ConsentManager(), []);
  const providerRegistry = useMemo(() => new AvatarProviderRegistry(), []);
  const contextProvider = useMemo(() => new LocalQwenProvider(), []);
  const outputBus = useMemo(() => new OutputFrameBus(), []);
  const secureStorage = useMemo(() => createEidosSecureStorage(), []);
  const analytics = useMemo(() => new AnalyticsService(), []);
  const eventTracker = useMemo(() => new EventTracker(analytics), [analytics]);
  const sessionTracker = useMemo(() => new SessionTracker(), []);
  const crashReporter = useMemo(() => new CrashReporter(), []);
  const performanceMonitor = useMemo(() => new PerformanceMonitor(), []);
  const qualityEvaluator = useMemo(() => new PresenceQualityEvaluator(), []);
  const feedbackService = useMemo(() => new FeedbackService(), []);
  const onboardingStore = useMemo(() => new OnboardingStore(), []);
  const lipSyncRef = useRef(new AudioLipSyncService());
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackingCanvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | undefined>(undefined);
  const trainingRef = useRef(false);
  const [page, setPage] = useState<BetaPage>(initialPage);
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [behaviorProfile, setBehaviorProfile] = useState<UserBehaviorProfile>(() => loadBehaviorProfile());
  const [avatar, setAvatar] = useState<AvatarIdentityModel | undefined>(() => loadAvatarIdentityModel());
  const [consent, setConsent] = useState<ConsentState>(() => consentManager.load());
  const [providerId, setProviderId] = useState<PhotorealAvatarProviderId>('local-realistic');
  const [realism, setRealism] = useState<RealismProfile>(defaultRealismProfile);
  const [mode, setMode] = useState<PresenceMode>('professional');
  const [voiceOnly, setVoiceOnly] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [tracking, setTracking] = useState<FaceTrackingSnapshot>();
  const [cameraFeatures, setCameraFeatures] = useState<MediaPipePresenceFeatures>();
  const [latestFeatures, setLatestFeatures] = useState<MediaPipePresenceFeatures>();
  const [frame, setFrame] = useState<AvatarFrame>(emptyFrame);
  const [prediction, setPrediction] = useState<PresencePrediction>();
  const [presenceState, setPresenceState] = useState<'speaking' | 'listening' | 'idle' | 'thinking'>('idle');
  const [contextState, setContextState] = useState<ContextState>(disabledContextState());
  const [mediaError, setMediaError] = useState('');
  const [trainingState, setTrainingState] = useState<TrainingState>('idle');
  const [trainingRemaining, setTrainingRemaining] = useState(TRAINING_SECONDS);
  const [trainingSummary, setTrainingSummary] = useState<TrainingSessionSummary>();
  const [gestureProfile, setGestureProfile] = useState(() => gestureService.load());
  const [outputSettings, setOutputSettings] = useState<OutputSettings>(() => loadOutputSettings());
  const [onboardingVisible, setOnboardingVisible] = useState(() => !onboardingStore.load().completed);
  const [callActive, setCallActive] = useState(false);
  const [quality, setQuality] = useState<PresenceQualityScore>(() => qualityEvaluator.evaluate(emptyFrame));
  const [feedbackSessionId, setFeedbackSessionId] = useState<string>();
  const [showPmf, setShowPmf] = useState(false);
  const [walkthroughVisible, setWalkthroughVisible] = useState(false);

  useEffect(() => {
    let active = true;
    void secureStorage.then(async (store) => {
      const [storedAvatar, storedBehavior] = await Promise.all([store.get<AvatarIdentityModel>(SECURE_AVATAR_KEY), store.get<UserBehaviorProfile>(SECURE_BEHAVIOR_KEY)]);
      if (!active) return;
      if (storedAvatar) setAvatar(storedAvatar);
      if (storedBehavior) setBehaviorProfile(storedBehavior);
    });
    return () => { active = false; };
  }, [secureStorage]);

  useEffect(() => {
    const uninstall = crashReporter.install(() => eventTracker.event('Crash'));
    eventTracker.event(localStorage.getItem('eidos.installed.v1') ? 'First Launch' : 'App Installed');
    localStorage.setItem('eidos.installed.v1', 'true');
    return uninstall;
  }, [crashReporter, eventTracker]);

  useEffect(() => saveProfile(profile), [profile]);
  useEffect(() => saveOutputSettings(outputSettings), [outputSettings]);
  useEffect(() => () => outputBus.close(), [outputBus]);
  useEffect(() => {
    consentManager.save(consent);
    void secureStorage.then(async (store) => {
      if (consent.localAvatarStorage && avatar) {
        await store.put(SECURE_AVATAR_KEY, avatar);
        deleteAvatarIdentityModel();
      } else await store.delete(SECURE_AVATAR_KEY);
      if (consent.behaviorStorage) {
        await store.put(SECURE_BEHAVIOR_KEY, behaviorProfile);
        clearBehaviorProfile();
      } else await store.delete(SECURE_BEHAVIOR_KEY);
    });
  }, [avatar, behaviorProfile, consent, consentManager, secureStorage]);

  useEffect(() => {
    let animation = 0;
    let diagnosticTick = 0;
    const tick = () => {
      const lipSync = lipSyncRef.current.getLipSyncFrame();
      const state = stateDetector.classify(lipSync);
      setPresenceState(state);
      const next = animationService.composeFrame({ lipSync, tracking, cameraFeatures, gestureProfile, mode, voiceOnly, realism, userBehaviorProfile: behaviorProfile, now: performance.now() });
      setFrame(next);
      outputBus.publish({ frame: next, style: profile.avatarStyle, label: profile.name, identity: avatar, realism, settings: outputSettings });
      diagnosticTick += 1;
      if (diagnosticTick % 8 === 0) {
        const latestPrediction = animationService.getLastPrediction();
        setPrediction(latestPrediction);
        const score = qualityEvaluator.evaluate(next, latestPrediction, state);
        setQuality(score);
        if (callActive) sessionTracker.sample({ confidence: latestPrediction?.confidence ?? 0.68, naturalness: latestPrediction?.naturalnessScore ?? 0.72, presenceQuality: score.overall });
      }
      performanceMonitor.record({ gpu: 'Browser GPU', avatarRenderMs: 0, mediaPipeLatencyMs: cameraEnabled ? 100 : 0, behaviorLatencyMs: 0, presenceHz: 60 });
      animation = requestAnimationFrame(tick);
    };
    animation = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animation);
  }, [animationService, avatar, behaviorProfile, callActive, cameraEnabled, cameraFeatures, gestureProfile, mode, outputBus, outputSettings, performanceMonitor, profile.avatarStyle, profile.name, qualityEvaluator, realism, sessionTracker, stateDetector, tracking, voiceOnly]);

  useEffect(() => {
    if (!cameraEnabled || !videoRef.current || !trackingCanvasRef.current) return;
    let busy = false;
    const interval = window.setInterval(async () => {
      if (busy) return;
      busy = true;
      const result = await faceService.estimateFromFrame(videoRef.current!, trackingCanvasRef.current!);
      if (result) {
        setTracking(result.snapshot);
        setCameraFeatures(result.features);
        setLatestFeatures(result.features);
        setGestureProfile(gestureService.updateWithSample(faceService.snapshotToGestureSample(result.snapshot)));
        if (trainingRef.current) trainingRecorder.record(result.features);
      }
      busy = false;
    }, 100);
    return () => window.clearInterval(interval);
  }, [cameraEnabled, faceService, gestureService, trainingRecorder]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void contextProvider.infer({ speechState: presenceState, audioEnergy: lipSyncRef.current.getLipSyncFrame().amplitude }).then(setContextState);
    }, 1800);
    return () => window.clearInterval(interval);
  }, [contextProvider, presenceState]);

  const stopCamera = useCallback(() => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = undefined;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraEnabled(false);
    setVoiceOnly(true);
    setTracking(undefined);
    setCameraFeatures(undefined);
  }, []);

  const finishTraining = useCallback(() => {
    trainingRef.current = false;
    const summary = trainingRecorder.summarize(Date.now());
    setTrainingSummary(summary);
    setBehaviorProfile((current) => mergeTrainingSession(current, summary.profile));
    setProfile((current) => ({ ...current, trainingComplete: true }));
    setTrainingState('complete');
    eventTracker.event('Training Completed', { qualityScore: summary.qualityScore });
    setTrainingRemaining(0);
    stopCamera();
  }, [eventTracker, stopCamera, trainingRecorder]);

  useEffect(() => {
    if (trainingState !== 'running') return;
    const timer = window.setInterval(() => setTrainingRemaining((remaining) => {
      if (remaining <= 1) { window.clearInterval(timer); finishTraining(); return 0; }
      return remaining - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [finishTraining, trainingState]);

  useEffect(() => () => { cameraStreamRef.current?.getTracks().forEach((track) => track.stop()); lipSyncRef.current.disconnect(); }, []);

  async function enableMicrophone() {
    setMediaError('');
    try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false }); await lipSyncRef.current.connect(stream); setMicEnabled(true); }
    catch { setMediaError('Microphone permission was not granted. Eidos uses your real microphone voice only.'); }
  }

  async function enableCamera(): Promise<boolean> {
    setMediaError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false });
      cameraStreamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCameraEnabled(true); setVoiceOnly(false); return true;
    } catch { setMediaError('Camera permission was not granted. Voice-only mode remains available.'); return false; }
  }

  async function startTraining() {
    const ready = cameraEnabled || await enableCamera();
    if (!ready) return;
    eventTracker.event('Training Started'); trainingRecorder.start(Date.now()); trainingRef.current = true; setTrainingState('running'); setTrainingRemaining(TRAINING_SECONDS); setTrainingSummary(undefined); setPage('training');
  }

  function deleteImages() {
    setAvatar((current) => current ? { ...current, sourceImages: current.sourceImages.map((image) => ({ ...image, dataUrl: '', storedLocally: false })), updatedAt: new Date().toISOString() } : undefined);
  }
  function deleteAvatar() { deleteAvatarIdentityModel(); void secureStorage.then((store) => store.delete(SECURE_AVATAR_KEY)); setAvatar(undefined); }
  function deleteBehavior() { void secureStorage.then((store) => store.delete(SECURE_BEHAVIOR_KEY)); setGestureProfile(gestureService.clear()); setBehaviorProfile(clearBehaviorProfile()); setProfile((current) => ({ ...current, trainingComplete: false })); setTrainingSummary(undefined); setTrainingState('idle'); setTrainingRemaining(TRAINING_SECONDS); }
  function deleteAll() { eventTracker.event('Data Delete', { scope: 'all' }); deleteAvatar(); deleteBehavior(); setProfile(clearProfile()); void deleteEidosSecureKey(); setConsent(consentManager.reset()); }
  function exportData() {
    eventTracker.event('Data Export');
    const payload = { exportedAt: new Date().toISOString(), profile, avatar, behaviorProfile, consent, contextModel: { enabled: contextProvider.enabled, localOnly: true } };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'eidos-beta-data.json'; anchor.click(); URL.revokeObjectURL(url);
  }

  function handleAvatarCreated(nextAvatar: AvatarIdentityModel) {
    setAvatar(nextAvatar);
    setWalkthroughVisible(true);
    eventTracker.event('Avatar Upload Complete', { images: nextAvatar.sourceImages.length });
    eventTracker.event('Avatar Created', { provider: nextAvatar.provider });
  }
  function startPresenceSession() {
    const session = sessionTracker.start({ voiceOnly, cameraEnabled, mode });
    setCallActive(true);
    eventTracker.event('Call Started', { voiceOnly, cameraEnabled, mode }, session.id);
    if (sessionTracker.list().length === 0) eventTracker.event('First Presence Session', {}, session.id);
    if (voiceOnly && !sessionTracker.list().some((item) => item.voiceOnly)) eventTracker.event('First Voice-Only Session', {}, session.id);
  }
  function endPresenceSession() {
    const session = sessionTracker.end();
    setCallActive(false);
    if (!session) return;
    eventTracker.event('Call Ended', { durationMs: session.durationMs, voiceOnly: session.voiceOnly }, session.id);
    setFeedbackSessionId(session.id);
    if (feedbackService.shouldAskPmf(sessionTracker.list().length)) setShowPmf(true);
  }

  const providerStatus = providerRegistry.resolve(avatar?.provider ?? providerId);
  const pageTitle = page === 'live' ? 'Live Presence' : page === 'avatar' ? 'Avatar Studio' : page === 'training' ? 'Training Studio' : page === 'output' ? 'Virtual Camera Setup' : page === 'trust' ? 'Trust Center' : page === 'diagnostics' ? 'System Check' : page === 'help' ? 'Help Center' : page === 'hub' ? 'Beta Hub' : page === 'evaluation' ? 'Beta Evaluation' : page === 'dashboard' ? 'Beta Dashboard' : page === 'founder' ? 'Founder Dashboard' : page === 'admin' ? 'Administrator Console' : page === 'signup' ? 'Join Closed Beta' : 'Privacy Dashboard';

  return <main className="min-h-screen bg-cloud text-ink"><a className="skip-link" href="#eidos-content">Skip to content</a><div className="grid min-h-screen grid-cols-[232px_1fr] max-lg:grid-cols-1"><aside className="border-r border-line bg-white px-5 py-6 max-lg:border-b max-lg:border-r-0"><div className="mb-8 flex items-center justify-between gap-3"><button className="brand-button app-brand" onClick={() => { if (!window.eidosDesktop) window.location.href = '/'; }}><EidosLogo compact /></button></div><nav className="space-y-1"><NavButton active={page === 'live'} icon={<Video size={18} />} label="Live Presence" onClick={() => setPage('live')} /><NavButton active={page === 'avatar'} icon={<Image size={18} />} label="Avatar Studio" onClick={() => setPage('avatar')} /><NavButton active={page === 'training'} icon={<CircleGauge size={18} />} label="Training Studio" onClick={() => setPage('training')} /><NavButton active={page === 'output'} icon={<Video size={18} />} label="Virtual Camera" onClick={() => setPage('output')} /><NavButton active={page === 'trust'} icon={<HeartHandshake size={18} />} label="Trust Center" onClick={() => setPage('trust')} /><NavButton active={page === 'privacy'} icon={<ShieldCheck size={18} />} label="Privacy Dashboard" onClick={() => setPage('privacy')} /><NavButton active={page === 'diagnostics'} icon={<LifeBuoy size={18} />} label="System Check" onClick={() => setPage('diagnostics')} /><NavButton active={page === 'help'} icon={<BookOpen size={18} />} label="Help Center" onClick={() => setPage('help')} /><NavButton active={page === 'hub'} icon={<Sparkles size={18} />} label="Beta Hub" onClick={() => setPage('hub')} /><NavButton active={page === 'evaluation'} icon={<MessageSquare size={18} />} label="Beta Evaluation" onClick={() => setPage('evaluation')} /><NavButton active={page === 'dashboard'} icon={<BarChart3 size={18} />} label="Beta Dashboard" onClick={() => setPage('dashboard')} /><NavButton active={page === 'founder'} icon={<LayoutDashboard size={18} />} label="Founder Dashboard" onClick={() => setPage('founder')} /><NavButton active={page === 'signup'} icon={<UserPlus size={18} />} label="Join Closed Beta" onClick={() => setPage('signup')} /><NavButton active={page === 'admin'} icon={<Users size={18} />} label="Admin Console" onClick={() => setPage('admin')} /></nav><div className="mt-8 border-t border-line pt-5"><p className="text-xs font-semibold text-ink/55">Turn Your Camera Off.<br/>Stay Present.<br/>Your Voice Stays Yours.</p><p className="mt-3 text-[10px] text-ink/40">Eidos 0.1.0-beta</p></div><div className="mt-5 border-t border-line pt-5"><p className="field-label">Beta status</p><StatusLine label="Avatar" value={avatar ? 'Identity ready' : 'Default identity'} /><StatusLine label="Behavior" value={`${behaviorProfile.qualityScore}% maturity`} /><StatusLine label="Tracking" value={faceService.getExtractorStatus().mode} /><StatusLine label="Context" value={contextProvider.enabled ? contextState.source : 'disabled'} /></div></aside><section id="eidos-content" className="min-w-0 px-7 py-6 max-sm:px-4"><header className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-semibold">{pageTitle}</h2><p className="mt-1 text-sm text-ink/55">Real voice in. Private visual presence out.</p></div><div className="flex items-center gap-2">{adminEmail ? <span className="admin-session-chip">{adminEmail}</span> : null}<ThemeToggle/><button className="secondary-button" onClick={enableMicrophone}><Mic size={17} /> {micEnabled ? 'Mic connected' : 'Connect real mic'}</button><button className="icon-button" title={cameraEnabled ? 'Turn camera off' : 'Enable camera'} onClick={cameraEnabled ? stopCamera : () => void enableCamera()}>{cameraEnabled ? <Camera size={18} /> : <CameraOff size={18} />}</button>{onAdminLogout ? <button className="icon-button" title="Log out" onClick={onAdminLogout}><LogOut size={18}/></button> : null}</div></header>{mediaError ? <RecoveryNotice message={mediaError} onRetry={() => void enableMicrophone()} onDiagnostics={() => setPage('diagnostics')} /> : null}{page === 'live' ? <LivePresence frame={frame} profile={profile} avatar={avatar} realism={realism} mode={mode} setMode={(nextMode) => { setMode(nextMode); eventTracker.event('Settings Changed', { setting: 'mode', value: nextMode }); }} voiceOnly={voiceOnly} setVoiceOnly={(enabled) => { eventTracker.event('Settings Changed', { setting: 'voiceOnly', value: enabled }); return enabled ? stopCamera() : void enableCamera(); }} micEnabled={micEnabled} cameraEnabled={cameraEnabled} presenceState={presenceState} prediction={prediction} providerStatus={providerStatus.provider.status()} contextState={contextState} contextEnabled={contextProvider.enabled} callActive={callActive} onStartCall={startPresenceSession} onEndCall={endPresenceSession} quality={quality} developerMode={analytics.preferences().developerMode} /> : page === 'avatar' ? <AvatarStudio displayName={profile.name} avatar={avatar} consent={consent} providerId={providerId} realism={realism.level} profile={profile} onProfileChange={setProfile} onProviderChange={setProviderId} onRealismChange={(level) => setRealism((current) => ({ ...current, level }))} onCreated={handleAvatarCreated} onDelete={deleteAvatar} /> : page === 'training' ? <TrainingStudio state={trainingState} remaining={trainingRemaining} features={latestFeatures} behaviorProfile={behaviorProfile} summary={trainingSummary} cameraEnabled={cameraEnabled} onStart={() => void startTraining()} onFinish={finishTraining} /> : page === 'output' ? <VirtualCameraSetup settings={outputSettings} onChange={setOutputSettings} /> : page === 'trust' ? <TrustCenter onPrivacy={() => setPage('privacy')} /> : page === 'diagnostics' ? <SystemCheckPage trackerStatus={() => faceService.getExtractorStatus()} /> : page === 'help' ? <HelpCenter onSystemCheck={() => setPage('diagnostics')} onVirtualCamera={() => setPage('output')} /> : page === 'hub' ? <BetaHub /> : page === 'evaluation' ? <BetaEvaluation /> : page === 'dashboard' ? <BetaDashboard /> : page === 'founder' ? <FounderDashboard /> : page === 'admin' ? <AdminConsole /> : page === 'signup' ? <ClosedBetaSignup /> : <PrivacyPage consent={consent} setConsent={setConsent} avatar={avatar} behaviorProfile={behaviorProfile} onDeleteImages={deleteImages} onDeleteAvatar={deleteAvatar} onDeleteBehavior={deleteBehavior} onDeleteAll={deleteAll} onExport={exportData} />}</section></div>{onboardingVisible ? <PresenceOnboarding onComplete={(meetingType?: MeetingType) => { setOnboardingVisible(false); setMode(meetingType === 'creator' ? 'creator' : meetingType === 'comfort' ? 'low-energy' : meetingType === 'team' ? 'casual' : 'professional'); eventTracker.event('Account Created', { meetingType: meetingType ?? 'unspecified' }); setPage('avatar'); }} /> : null}{walkthroughVisible ? <PresenceWalkthrough onNavigate={setPage} onComplete={() => { setWalkthroughVisible(false); setPage('live'); }} /> : null}{feedbackSessionId ? <FeedbackPrompt sessionId={feedbackSessionId} onClose={() => setFeedbackSessionId(undefined)} /> : null}{showPmf ? <PmfSurvey onClose={() => setShowPmf(false)} /> : null}<video ref={videoRef} autoPlay muted playsInline className="hidden" /><canvas ref={trackingCanvasRef} className="hidden" /></main>;
}

function LivePresence({ frame, profile, avatar, realism, mode, setMode, voiceOnly, setVoiceOnly, micEnabled, cameraEnabled, presenceState, prediction, providerStatus, contextState, contextEnabled, callActive, onStartCall, onEndCall, quality, developerMode }: { frame: AvatarFrame; profile: UserProfile; avatar?: AvatarIdentityModel; realism: RealismProfile; mode: PresenceMode; setMode: (mode: PresenceMode) => void; voiceOnly: boolean; setVoiceOnly: (enabled: boolean) => void; micEnabled: boolean; cameraEnabled: boolean; presenceState: string; prediction?: PresencePrediction; providerStatus: { available: boolean; message: string }; contextState: ContextState; contextEnabled: boolean; callActive: boolean; onStartCall: () => void; onEndCall: () => void; quality: PresenceQualityScore; developerMode: boolean }) {
  return <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_350px]"><section className="meeting-shell"><div className="meeting-bar"><div><p className="font-semibold">Beta meeting room</p><p className="text-xs text-white/55">Real voice | Avatar Mode Active</p></div><div className="flex items-center gap-2 text-xs text-white/65"><ShieldCheck size={15} /> Local-first</div></div><div className="meeting-stage"><AvatarCanvas frame={frame} style={profile.avatarStyle} label={profile.name} realism={realism} identity={avatar} /></div><div className="meeting-controls"><StatusControl active={micEnabled} icon={<Mic size={17} />} label={micEnabled ? 'Real mic live' : 'Mic off'} /><StatusControl active={cameraEnabled} icon={cameraEnabled ? <Camera size={17} /> : <CameraOff size={17} />} label={cameraEnabled ? 'Camera tracking' : 'Camera off'} /><button className={callActive ? 'danger-button ml-auto' : 'primary-button ml-auto'} onClick={callActive ? onEndCall : onStartCall}>{callActive ? 'End call' : 'Start call'}</button><span className="text-xs font-semibold text-white/60">{voiceOnly ? 'Voice-only presence' : 'Live mirroring'}</span></div></section><aside className="space-y-4"><section className="panel p-5"><div className="flex items-center justify-between"><h3 className="section-title">Behavior engine</h3><span className="status-dot"><span /> {presenceState}</span></div><div className="mt-4 grid grid-cols-2 gap-3"><Metric label="Naturalness" value={`${Math.round((prediction?.naturalnessScore ?? 0.72) * 100)}%`} /><Metric label="Confidence" value={`${Math.round((prediction?.confidence ?? 0.68) * 100)}%`} /><Metric label="Universal" value={`${Math.round((prediction?.blendWeights.universal ?? 0.9) * 100)}%`} /><Metric label="Personal" value={`${Math.round((prediction?.blendWeights.user ?? 0.1) * 100)}%`} /></div><p className="mt-3 text-xs leading-5 text-ink/50">{prediction?.reasonCodes.join(' | ') ?? 'Universal baseline active'}</p></section><section className="panel p-5"><h3 className="section-title">Presence mode</h3><div className="mt-3 grid grid-cols-2 gap-2">{(Object.keys(modeLabels) as PresenceMode[]).map((key) => <button key={key} className={`mode-button ${mode === key ? 'is-active' : ''}`} onClick={() => setMode(key)}>{modeLabels[key]}</button>)}</div><label className="toggle-row mt-4"><input type="checkbox" checked={voiceOnly} onChange={(event) => setVoiceOnly(event.target.checked)} /> Voice-Only Mode</label></section><section className="panel p-5"><h3 className="section-title">Stack status</h3><div className="mt-3 data-inventory"><Inventory label="Avatar provider" value={providerStatus.available ? 'Ready' : 'Fallback'} /><Inventory label="Context model" value={contextEnabled ? contextState.source : 'Disabled'} /><Inventory label="Context label" value={contextEnabled ? contextState.label : 'Not used'} /><Inventory label="Voice" value="Real user voice" /></div><p className="mt-3 text-xs leading-5 text-ink/50">{providerStatus.message}</p></section>{developerMode ? <section className="panel p-5"><h3 className="section-title">Presence Quality</h3><strong className="mt-3 block text-4xl">{quality.overall}</strong><div className="mt-3 data-inventory"><Inventory label="Blink" value={String(quality.blinkRealism)} /><Inventory label="Head motion" value={String(quality.headMotion)} /><Inventory label="Eye contact" value={String(quality.eyeContact)} /><Inventory label="Lip sync" value={String(quality.lipSync)} /></div></section> : null}</aside></div>;
}
function TrainingStudio({ state, remaining, features, behaviorProfile, summary, cameraEnabled, onStart, onFinish }: { state: TrainingState; remaining: number; features?: MediaPipePresenceFeatures; behaviorProfile: UserBehaviorProfile; summary?: TrainingSessionSummary; cameraEnabled: boolean; onStart: () => void; onFinish: () => void }) {
  const progress = state === 'complete' ? 100 : ((TRAINING_SECONDS - remaining) / TRAINING_SECONDS) * 100;
  const empty = '--';
  return <div className="training-studio-grid"><section className="panel overflow-hidden"><div className="training-camera"><div className="training-guide"><div className="face-guide" /><p>{cameraEnabled ? features ? `${features.source} face features detected` : 'Center your face in the frame' : 'Camera is used only during this 60-second session'}</p></div></div><div className="p-5"><div className="flex items-end justify-between"><div><p className="field-label">Camera calibration</p><h3 className="text-xl font-semibold">60-second presence training</h3></div><strong className="text-3xl tabular-nums">{state === 'complete' ? 'Done' : `${remaining}s`}</strong></div><div className="mt-4 h-2 overflow-hidden rounded bg-cloud"><div className="h-full bg-teal transition-all" style={{ width: `${progress}%` }} /></div><div className="mt-4 flex gap-2">{state !== 'running' ? <button className="primary-button" onClick={onStart}><Camera size={17} /> Start training</button> : <button className="secondary-button" onClick={onFinish}>Finish early</button>}</div>{state === 'complete' ? <div className="mt-4 flex items-center gap-2 rounded-md bg-teal/10 p-3 text-sm font-semibold text-teal"><Check size={17} /> Camera no longer required</div> : null}</div></section><aside className="space-y-4"><section className="panel p-5"><h3 className="section-title">Extracted feature preview</h3><div className="mt-4 grid grid-cols-2 gap-3"><Metric label="Blink L/R" value={features ? `${features.blinkLeft.toFixed(2)} / ${features.blinkRight.toFixed(2)}` : empty} /><Metric label="Jaw open" value={features?.jawOpen.toFixed(2) ?? empty} /><Metric label="Smile" value={features?.smileIntensity.toFixed(2) ?? empty} /><Metric label="Brow" value={features?.browMovement.toFixed(2) ?? empty} /><Metric label="Yaw / Pitch" value={features ? `${features.headYaw.toFixed(2)} / ${features.headPitch.toFixed(2)}` : empty} /><Metric label="Confidence" value={features ? `${Math.round(features.faceConfidence * 100)}%` : empty} /></div></section><section className="panel p-5"><h3 className="section-title">Profile maturity</h3><div className="mt-4 flex items-end justify-between"><strong className="text-3xl">{behaviorProfile.qualityScore}%</strong><span className="capitalize text-sm text-ink/55">{behaviorProfile.profileMaturity}</span></div><div className="mt-3 h-2 overflow-hidden rounded bg-cloud"><div className="h-full bg-teal" style={{ width: `${behaviorProfile.qualityScore}%` }} /></div><p className="mt-3 text-xs leading-5 text-ink/50">{summary ? `${summary.sampleCount} samples | ${summary.source} | quality ${summary.qualityScore}%` : 'Complete a session to personalize voice-only behavior.'}</p></section></aside></div>;
}
function PrivacyPage(props: { consent: ConsentState; setConsent: (state: ConsentState) => void; avatar?: AvatarIdentityModel; behaviorProfile: UserBehaviorProfile; onDeleteImages: () => void; onDeleteAvatar: () => void; onDeleteBehavior: () => void; onDeleteAll: () => void; onExport: () => void }) {
  const registry = new CommercialDatasetRegistry(); const validator = new DatasetLicenseValidator();
  return <><PrivacyDashboard consent={props.consent} onConsentChange={props.setConsent} avatar={props.avatar} behaviorProfile={props.behaviorProfile} onDeleteImages={props.onDeleteImages} onDeleteAvatar={props.onDeleteAvatar} onDeleteBehavior={props.onDeleteBehavior} onDeleteAll={props.onDeleteAll} onExport={props.onExport} /><section className="panel mt-5 p-5"><h3 className="section-title">Commercial dataset gate</h3><div className="mt-3 dataset-compliance-grid">{registry.list().map((dataset) => { const allowed = validator.validate(dataset).allowed; return <div key={dataset.id} className="dataset-row"><div><strong>{dataset.datasetName}</strong><small>{dataset.licenseType}</small></div><span className={allowed ? 'is-approved' : 'is-blocked'}>{allowed ? 'Approved' : 'Blocked'}</span></div>; })}</div></section></>;
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) { return <button className={`nav-button ${active ? 'is-active' : ''}`} onClick={onClick}>{icon}{label}</button>; }
function StatusLine({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between py-1 text-xs"><span className="text-ink/45">{label}</span><strong className="capitalize text-ink/70">{value}</strong></div>; }
function StatusControl({ active, icon, label }: { active: boolean; icon: React.ReactNode; label: string }) { return <div className={`meeting-status ${active ? 'is-active' : ''}`}>{icon}<span>{label}</span></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="metric"><p>{label}</p><strong>{value}</strong></div>; }
function Inventory({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><strong>{value}</strong></div>; }
