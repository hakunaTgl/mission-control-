import Link from "next/link";
const items = [["/","Dashboard"],["/agent-control","Agent Control"],["/project-inventory","Project Inventory"],["/builder-lab","Builder Lab"],["/war-room","War Room"],["/creative-lab","Creative Lab"],["/memory-vault","Memory Vault"],["/workflow-automations","Workflow Automations"],["/diagnostics","Diagnostics Console"],["/settings","Settings / Safety"]] as const;
export function Nav(){return <div className="side"><h2>Sovereign Mission Control</h2>{items.map(([href,label])=><div key={href} style={{margin:'10px 0'}}><Link href={href}>{label}</Link></div>)}</div>;}
