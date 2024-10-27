import {
  Child,
  Command,
  SpawnOptions,
  TerminatedPayload,
} from "@tauri-apps/plugin-shell"

export type ShellRunnerOptions = {
  onData?: (data: string) => void
  onEnd?: () => void
  onError?: (data: string) => void
  spawnOpts?: SpawnOptions
}

export class ShellRunner {
  outputs: string[] = []
  error?: string
  completed?: boolean
  terminatedPayload?: TerminatedPayload

  private childHandle: Child | undefined
  private started = false
  private command: Command<string>

  constructor(public script: string, public opts?: ShellRunnerOptions) {
    this.command = Command.create("exec-sh", ["-c", script], opts?.spawnOpts)
    this.command.stdout.on("data", (data) => {
      this.outputs.push(data)
      opts?.onData?.(data)
    })
    this.command.stderr.on("data", (data) => {
      this.error = data
      opts?.onError?.(data)
    })
    this.command.on("close", (data) => {
      this.terminatedPayload = data
      this.completed = true
      this.childHandle = undefined
      opts?.onEnd?.()
    })
  }

  async start() {
    if (this.started) return
    this.started = true
    this.childHandle = await this.command.spawn()
  }

  async cancel() {
    if (!this.childHandle) return
    await this.childHandle.kill()
    this.childHandle = undefined
  }
}
