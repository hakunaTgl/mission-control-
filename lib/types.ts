export type AgentStatus = "idle" | "active" | "blocked" | "needs approval" | "failed" | "disabled";
export type ProjectStatus = "idea" | "active" | "blocked" | "testing" | "launch-ready" | "launched" | "paused" | "archived";
export type WorkflowStatus = "idle" | "running" | "success" | "failed" | "blocked" | "needs approval";

export interface Agent { id:string; name:string; mission:string; status:AgentStatus; permissionTier:number; allowedTools:string[]; memoryAccessLevel:string; currentTask:string; failureCount:number; lastRun:string; logs:string[]; approvalRequired:boolean; simulated?:boolean }
export interface Project { id:string; name:string; category:string; status:ProjectStatus; priority:"low"|"medium"|"high"|"critical"; description:string; nextAction:string; tags:string[]; owner:string; createdDate:string; updatedDate:string }
export interface MemoryNote { id:string; title:string; content:string; type:string; linkedProject:string; priority:string; confidence:number; source:string; createdDate:string; updatedDate:string }
export interface Workflow { id:string; name:string; triggerType:string; assignedAgent:string; status:WorkflowStatus; approvalRequired:boolean; retryCount:number; maxRetries:number; lastRun:string; logOutput:string; failureExplanation:string }
export interface CreativeRecord { id:string; type:string; title:string; content:string; createdDate:string }
export interface AppState { agents:Agent[]; projects:Project[]; memory:MemoryNote[]; workflows:Workflow[]; creative:CreativeRecord[] }
