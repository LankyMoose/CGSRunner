import {
  Child,
  Command,
  SpawnOptions,
  TerminatedPayload,
} from "@tauri-apps/plugin-shell"

export type ShellRunnerOptions = {
  onData?: (data: string) => void
  onEnd?: (data: TerminatedPayload) => void
  onError?: (data: string) => void
  spawnOpts?: SpawnOptions
  args?: string[]
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
    this.command = Command.create(
      "exec-sh",
      ["-c", script, "--", ...(opts?.args ?? [])],
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
      this.completed = true
      this.childHandle = undefined
      opts?.onEnd?.(data)
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
