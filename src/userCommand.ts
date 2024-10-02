export type UserCommandTargetResult =
  | {
      target: string
      stdout: string
    }
  | {
      target: string
      stderr: string
    }

export type UserCommand = {
  timestamp: number
  name: string
  command: string
  targets: string[]
  results: UserCommandTargetResult[]
}
