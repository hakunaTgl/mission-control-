import Link from 'next/link';
import { ReactNode } from 'react';
const routes = ['','agents','projects','builder-lab','war-room','creative-lab','memory','workflows','diagnostics','settings'];
export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  return <div className='min-h-screen p-6'><header className='mb-4'><h1 className='text-2xl font-bold text-red-400'>{title}</h1><nav className='flex gap-3 text-sm mt-3 flex-wrap'>{routes.map(r=><Link key={r} href={`/${r}`} className='px-2 py-1 bg-zinc-800 rounded'>{r || 'dashboard'}</Link>)}</nav></header>{children}</div>;
}
