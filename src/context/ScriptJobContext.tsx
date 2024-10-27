import { createContext, Signal, useContext, useSignal } from "kaioken"
import { ScriptJob, ScriptSelection } from "../types"
import { useHistory } from "../stores/history"
import { ShellRunner } from "../tauri/shell/shellRunner"

type ScriptJobCtx = {
  targets: Signal<string[]>
  runJob: (script: ScriptSelection) => Promise<void>
}

const ScriptJobContext = createContext<ScriptJobCtx>(null as any)

export const useScriptJob = () => useContext(ScriptJobContext)

export const ScriptJobProvider: Kaioken.FC = ({ children }) => {
  const { value: data, setData } = useHistory()
  const targets = useSignal<string[]>([])

  const runJob = async (script: ScriptSelection) => {
    if (!data) return
    const id = crypto.randomUUID()
    const jobTargets = [...targets.value]
    const job: ScriptJob = {
      script,
      targets: jobTargets.reduce((acc, pkg) => {
        acc[pkg] = { code: null, stderr: "", stdout: "" }
        return acc
      }, {} as ScriptJob["targets"]),
    }
    await setData((prev) => ({
      ...prev,
      history: { ...prev.history, [id]: job },
    }))

    await Promise.allSettled(
      jobTargets.map((pkg) => {
        const result = job.targets[pkg]
        const update = () =>
          setData((prev) => ({
            ...prev,
            history: {
              ...prev.history,
              [id]: {
                ...job,
                targets: {
                  ...job.targets,
                  [pkg]: result,
                },
              },
            },
          }))

        return new Promise<void>((resolve) => {
          const runner = new ShellRunner(job.script.contents, {
            spawnOpts: { cwd: pkg },
            onData(data) {
              result.stdout += data
              update()
            },
            onError(data) {
              result.stderr += data
              update()
            },
            onEnd(data) {
              result.code = data.code
              update()
              resolve()
            },
          })

          runner.start()
        })
      })
    )
  }
  return (
    <ScriptJobContext.Provider value={{ runJob, targets }}>
      {children}
    </ScriptJobContext.Provider>
  )
}
