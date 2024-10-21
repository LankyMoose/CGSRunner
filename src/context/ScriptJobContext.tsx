import { createContext, useContext, useState } from "kaioken"
import { ScriptJob, ScriptSelection } from "../types"
import { runBash } from "../tauri/bash/run"
import { useToast } from "./ToastContext"
import { useHistory } from "./FileProviders"

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
  const { data, setData } = useHistory()
  const [running, setRunning] = useState(false)
  const [targets, setTargets] = useState<string[]>([])

  const runJob = async (script: ScriptSelection) => {
    if (running) return
    if (!data) return
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
      await setData({
        ...data,
        history: { ...data.history, [ts]: job },
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
