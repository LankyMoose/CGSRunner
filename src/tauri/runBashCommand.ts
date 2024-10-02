import { ChildProcess, Command, SpawnOptions } from "@tauri-apps/plugin-shell"

//https://tauri.app/plugin/shell/
export async function runBashCommand(
  command: string,
  options?: SpawnOptions
): Promise<ChildProcess<string>> {
  return Command.create("exec-sh", ["-c", command], options).execute()
}
