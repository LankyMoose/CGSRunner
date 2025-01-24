import {
  Child,
  Command,
  SpawnOptions,
  TerminatedPayload,
} from "@tauri-apps/plugin-shell"
import { platform } from "@tauri-apps/plugin-os"

let killCmd: string
const killCommands = {
  macos: "kill -9 -TERM $1",
  windows: `taskkill /F /PID $1`,
  linux: "pkill -9 -s $1",
} as const
killCmd = killCommands[platform() as keyof typeof killCommands]
if (!killCmd) {
  alert("Unsupported platform")
  throw new Error("Unsupported platform")
}

export type ShellRunnerOptions = {
  onData?: (data: string) => void
  onEnd?: (data: TerminatedPayload) => void
  onError?: (data: string) => void
  spawnOpts?: SpawnOptions
  args?: string[]
}

enum RunnerState {
  Idle,
  Running,
  Completed,
  Cancelled,
  Killing,
}

export class ShellRunner {
  outputs: string[] = []
  error?: string
  state = RunnerState.Idle
  terminatedPayload?: TerminatedPayload

  private childHandle: Child | undefined
  private command: Command<string>

  constructor(public script: string, public opts?: ShellRunnerOptions) {
    const args = opts?.args ? ["--", ...opts.args] : []
    this.command = Command.create(
      "exec-sh",
      ["-c", script, ...args],
      opts?.spawnOpts
    )
    this.command.stdout.on("data", (data) => {
      if (!this.childHandle) return
      this.outputs.push(data)
      opts?.onData?.(data)
    })
    this.command.stderr.on("data", (data) => {
      if (!this.childHandle) return
      this.error = data
      opts?.onError?.(data)
    })
    this.command.on("close", (data) => {
      if (!this.childHandle) return
      this.terminatedPayload = data
      this.state = RunnerState.Completed
      this.childHandle = undefined
      opts?.onEnd?.(data)
    })
  }

  async start() {
    if (this.state !== RunnerState.Idle) return
    this.state = RunnerState.Running
    this.childHandle = await this.command.spawn()
  }

  async cancel() {
    if (this.state !== RunnerState.Running || !this.childHandle) return
    this.state = RunnerState.Killing

    const pid = this.childHandle.pid
    if (!pid) return

    const cmd = "kill -9 " + pid
    console.log("executing kill cmd", cmd)
    await new ShellRunner(cmd, {
      onData(data) {
        console.log("kill data", data)
      },
      onEnd: (data) => {
        this.state = RunnerState.Cancelled
        this.childHandle = undefined
      },
      onError: (data) => {
        console.error(data)
      },
    }).start()
  }
}
