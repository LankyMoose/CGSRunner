export type ScriptSelection = {
  path: string
  contents: string
}

export type ScriptJobResult = {
  stdout: string
  stderr: string
  code?: number
}

export interface ScriptJob {
  script: ScriptSelection
  targets: Record<string, { result?: ScriptJobResult }>
}