import { BookOpen, Download, ExternalLink, Flag, Map, MessageSquare, RefreshCw } from 'lucide-react';
const resources = [
  { icon: <Download />, title: 'Download latest build', copy: 'Signed installers will appear with each closed beta release.', action: 'Desktop build', href: '#download' },
  { icon: <BookOpen />, title: 'Release notes', copy: 'See what changed, known limitations, and upgrade guidance.', action: 'Read notes', href: '/docs/release-notes.md' },
  { icon: <MessageSquare />, title: 'Submit feedback', copy: 'Tell us what felt natural, useful, or uncomfortable.', action: 'Email feedback', href: 'mailto:beta@eidospresence.com?subject=Eidos%20Beta%20Feedback' },
  { icon: <Flag />, title: 'Report a bug', copy: 'Attach exported diagnostics for the fastest response.', action: 'Report issue', href: 'mailto:support@eidospresence.com?subject=Eidos%20Beta%20Bug' },
  { icon: <Map />, title: 'View roadmap', copy: 'Follow the path to photoreal identity and native virtual camera.', action: 'Open roadmap', href: '/docs/eidos-roadmap.md' },
  { icon: <ExternalLink />, title: 'Beta community', copy: 'Discord access will be enabled for the first invited cohort.', action: 'Discord coming soon', href: '#community' }
];
export function BetaHub() { return <div className="space-y-5"><section className="beta-hub-hero"><div><p className="field-label">Closed Beta Hub</p><h3>Everything you need to stay present.</h3><p>Builds, support, release status, and the direct line back to the Eidos team.</p></div><div><RefreshCw /><span><strong>Version 0.1.0-beta</strong><small>Local build | Update checks ready</small></span></div></section><section className="resource-grid">{resources.map((item) => <a className="resource-card" href={item.href} key={item.title}>{item.icon}<h4>{item.title}</h4><p>{item.copy}</p><strong>{item.action}<ExternalLink size={14} /></strong></a>)}</section></div>; }
