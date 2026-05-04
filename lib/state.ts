import { promises as fs } from "fs";
import path from "path";
import { AppState } from "./types";

const statePath = path.join(process.cwd(), "data", "state.json");

export async function readState(): Promise<AppState> {
  const raw = await fs.readFile(statePath, "utf-8");
  return JSON.parse(raw) as AppState;
}

export async function writeState(next: AppState): Promise<void> {
  await fs.writeFile(statePath, JSON.stringify(next, null, 2));
}
