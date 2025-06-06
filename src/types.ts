export type ScriptSelection = {
  path: string
  contents: string
}

export type ScriptJobResult = {
  stdout: string
  stderr: string
  code: number | null
}

export type ScriptJob = {
  script: ScriptSelection
  targets: Record<string, ScriptJobResult>
}
