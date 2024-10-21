import { createContext, useContext, useState } from "kaioken"
import { ScriptJob, ScriptSelection } from "../types"
import { runBash } from "../tauri/bash/run"
import { useUserData } from "./UserDataContext"
import { useToast } from "./ToastContext"

type ScriptJobCtx = {
  targets: string[]
  setTargets: (packages: string[]) => void
  running: boolean
  runJob: (script: ScriptSelection) => void
}

const ScriptJobContext = createContext<ScriptJobCtx>({
  targets: [],
  setTargets: () => {},
  running: false,
  runJob: () => {},
})

export const useScriptJob = () => useContext(ScriptJobContext)

export const ScriptJobProvider: Kaioken.FC = ({ children }) => {
  const showToast = useToast()
  const { history, setHistory } = useUserData()
  const [running, setRunning] = useState(false)
  const [targets, setTargets] = useState<string[]>([])

  const runJob = async (script: ScriptSelection) => {
    debugger
    if (running) return
    if (!history) return
    setRunning(true)
    const job: ScriptJob = {
      script,
      targets: {},
    }
    const ts = Date.now()

    try {
      for await (const pkg of targets) {
        const res = await runBash(job.script.contents, { cwd: pkg })
        job.targets[pkg] = { result: res }
      }
      await setHistory({
        ...history,
        history: { ...history.history, [ts]: job },
      })
    } catch (error) {
      showToast("danger", String(error))
    }
    setRunning(false)
  }
  return (
    <ScriptJobContext.Provider
      value={{
        runJob,
        running,
        targets,
        setTargets,
      }}
    >
      {children}
    </ScriptJobContext.Provider>
  )
}
