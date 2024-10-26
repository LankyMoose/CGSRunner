import { createContext, Signal, useContext, useSignal, useState } from "kaioken"
import { ScriptJob, ScriptSelection } from "../types"
import { runBash } from "../tauri/bash/run"
import { useHistory } from "../stores/history"

type ScriptJobCtx = {
  targets: Signal<string[]>
  running: boolean
  runJob: (script: ScriptSelection) => Promise<void>
}

const ScriptJobContext = createContext<ScriptJobCtx>(null as any)

export const useScriptJob = () => useContext(ScriptJobContext)

export const ScriptJobProvider: Kaioken.FC = ({ children }) => {
  //const showToast = useToast()
  const { value: data, setData } = useHistory()
  const [running, setRunning] = useState(false)
  const targets = useSignal<string[]>([])

  const runJob = async (script: ScriptSelection) => {
    if (running) return
    if (!data) return
    setRunning(true)
    const ts = Date.now()
    const job: ScriptJob = {
      script,
      targets: targets.value.reduce((acc, pkg) => {
        acc[pkg] = {}
        return acc
      }, {} as ScriptJob["targets"]),
    }
    await setData({ ...data, history: { ...data.history, [ts]: job } })

    await Promise.allSettled(
      targets.value.map(async (pkg) => {
        try {
          const result = await runBash(job.script.contents, { cwd: pkg })
          job.targets[pkg] = { ...job.targets[pkg], result }
        } catch (error) {
          job.targets[pkg] = { ...job.targets[pkg], error: String(error) }
        } finally {
          setData({ ...data, history: { ...data.history, [ts]: { ...job } } })
        }
      })
    )

    job.completed = true
    await setData({
      ...data,
      history: { ...data.history, [ts]: { ...job } },
    })
    setRunning(false)
  }
  return (
    <ScriptJobContext.Provider
      value={{
        runJob,
        running,
        targets,
      }}
    >
      {children}
    </ScriptJobContext.Provider>
  )
}
