import { ArrowUpRight, LayoutDashboard, Terminal, ScrollText } from 'lucide-react';
import Brand from './Brand';
export default function Sidebar({ route }) {
  return <aside className="sidebar"><a href="#/" aria-label="Cedar Sentinel home"><Brand /></a><div className="workspace-label"><span className="status-dot" />Demo workspace<small>LOCAL · SAMPLE DATA</small></div><nav aria-label="Console navigation">{[['dashboard', 'Overview', LayoutDashboard], ['commands', 'Command center', Terminal], ['audit', 'Audit log', ScrollText]].map(([id,label,Icon]) => <a key={id} href={'#/app/'+id} aria-current={route === id ? 'page' : undefined}><Icon size={18} />{label}</a>)}</nav><div className="sidebar-bottom"><p>No cloud resources connected.<br />Actions here are simulated.</p><a href="#/">Back to website <ArrowUpRight size={16} /></a></div></aside>;
}
