import type { Agent, Project } from './types';
export const projects: Project[] = [
  { id: 'p1', name: 'Sovereign Mission Control Core', status: 'active', priority: 'critical', category: 'Core OS', nextAction: 'Finalize dashboard metrics' },
  { id: 'p2', name: 'SmartHub Ultra', status: 'idea', priority: 'high', category: 'Agent Systems', nextAction: 'Define adapter contracts' }
];
export const agents: Agent[] = [
  { id: 'a1', name: 'Supreme Controller Agent', status: 'idle', permissionTier: 'Tier 2', currentTask: 'Queue review', approvalRequired: true },
  { id: 'a2', name: 'Builder Agent', status: 'active', permissionTier: 'Tier 2', currentTask: 'Stabilization patch', approvalRequired: true }
];
