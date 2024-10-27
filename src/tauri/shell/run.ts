import { ChildProcess, Command, SpawnOptions } from "@tauri-apps/plugin-shell"

//https://tauri.app/plugin/shell/
export async function runSh(
  bash: string,
  options?: SpawnOptions
): Promise<ChildProcess<string>> {
  return Command.create("exec-sh", ["-c", bash], options).execute()
}
