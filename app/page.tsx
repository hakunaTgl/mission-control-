import { AppShell } from '@/components/app-shell';
import { agents, projects } from '@/lib/seed-data';
export default function Page(){
  return <AppShell title='Sovereign Mission Control'><div className='grid md:grid-cols-3 gap-3'>
    <div className='card'>Total Projects: {projects.length}</div>
    <div className='card'>Active Agents: {agents.filter(a=>a.status==='active').length}</div>
    <div className='card'>System Health: Stable (simulated)</div>
  </div></AppShell>
}
