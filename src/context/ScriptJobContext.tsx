import { createContext, Signal, useContext, useSignal } from "kaioken"
import { ScriptJob, ScriptSelection } from "../types"
import { runSh } from "../tauri/shell/run"
import { useHistory } from "../stores/history"

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
        acc[pkg] = {}
        return acc
      }, {} as ScriptJob["targets"]),
    }
    await setData((prev) => ({
      ...prev,
      history: { ...prev.history, [id]: job },
    }))

    await Promise.allSettled(
      jobTargets.map(async (pkg) => {
        try {
          const result = await runSh(job.script.contents, { cwd: pkg })
          job.targets[pkg] = { ...job.targets[pkg], result }
        } catch (error) {
          job.targets[pkg] = { ...job.targets[pkg], error: String(error) }
        } finally {
          await setData((prev) => ({
            ...prev,
            history: { ...prev.history, [id]: { ...job } },
          }))
        }
      })
    )

    job.completed = true
    await setData((prev) => ({
      ...prev,
      history: { ...prev.history, [id]: { ...job } },
    }))
  }
  return (
    <ScriptJobContext.Provider value={{ runJob, targets }}>
      {children}
    </ScriptJobContext.Provider>
  )
}
