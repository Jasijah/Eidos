import { EidosLogo } from '../brand/EidosLogo';
import { ThemeToggle } from '../theme/ThemeToggle';
import { HeroSection } from '../components/public/HeroSection';
import { VisionSection } from '../components/public/VisionSection';
import { HowItWorksSection } from '../components/public/HowItWorksSection';
import { WhoItsForSection } from '../components/public/WhoItsForSection';
import { FutureOfCommunicationSection } from '../components/public/FutureOfCommunicationSection';
import { TrustSection } from '../components/public/TrustSection';
import { BetaSignupForm } from '../components/public/BetaSignupForm';
export function PublicLandingPage({navigate}:{navigate:(path:string)=>void}){return <main className="public-site"><header className="public-nav"><button className="brand-button" onClick={()=>navigate('/')} aria-label="Eidos home"><EidosLogo/></button><nav aria-label="Public navigation"><a href="#vision">Vision</a><a href="#how-it-works">How it works</a><a href="#trust">Trust</a><ThemeToggle/><button className="public-cta small" onClick={()=>navigate('/join-beta')}>Join the Beta</button></nav></header><HeroSection onJoin={()=>navigate('/join-beta')}/><VisionSection/><HowItWorksSection/><WhoItsForSection/><FutureOfCommunicationSection/><TrustSection/><section className="landing-signup" id="join-beta"><div><p className="public-section-label">Closed beta</p><h2>Help shape the future of human presence.</h2><p>Join a small group testing camera-free communication before the public launch.</p></div><BetaSignupForm/></section><footer className="public-footer"><EidosLogo compact/><p>Turn your camera off. Stay present. Your voice stays yours.</p><button onClick={()=>navigate('/admin-login')}>Admin access</button></footer></main>}
