import { createContext, useContext, useState } from "kaioken"
import { ScriptJob, ScriptSelection } from "../types"
import { runBash } from "../tauri/bash/run"
import { useUserData } from "./UserDataContext"

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
  const { userData, setUserData } = useUserData()
  const [running, setRunning] = useState(false)
  const [targets, setTargets] = useState<string[]>([])

  const runJob = async (script: ScriptSelection) => {
    if (running) return
    if (!userData) return
    setRunning(true)
    const job: ScriptJob = {
      script,
      targets: {},
    }
    const ts = Date.now()

    for await (const pkg of targets) {
      const res = await runBash(job.script.contents, { cwd: pkg })
      job.targets[pkg] = { result: res }
    }

    await setUserData({
      ...userData,
      history: { ...userData.history, [ts]: job },
    })

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
