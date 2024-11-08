import { createContext, Signal, useContext, useRef, useSignal } from "kaioken"
import { ScriptSelection } from "../types"
import { useHistory } from "../stores/history"
import { ShellRunner } from "../tauri/shell/shellRunner"
import { db } from "$/idb"

type ScriptJobCtx = {
  targets: Signal<string[]>
  runJob: (script: ScriptSelection) => Promise<void>
  cancelJob: (id: string) => Promise<void>
}

const ScriptJobContext = createContext<ScriptJobCtx>(null as any)

export const useScriptJob = () => useContext(ScriptJobContext)

type RunnerRejectorTuple = [ShellRunner, () => void]

export const ScriptJobProvider: Kaioken.FC = ({ children }) => {
  const { value: data, addHistory } = useHistory()
  const jobsInProgress = useRef<Record<string, RunnerRejectorTuple[]>>({})
  const targets = useSignal<string[]>([])

  const cancelJob = async (id: string) => {
    const job = jobsInProgress.current[id]
    if (!job) return
    await Promise.all(
      job.map(([runner, reject]) => (reject(), runner.cancel()))
    )
  }

  const runJob = async (script: ScriptSelection) => {
    if (!data) return
    const jobTargets = [...targets.value]
    const job = await addHistory({
      script: script.contents,
      scriptPath: script.path,
    })
    const tgts = await Promise.all(
      jobTargets.map((tgt) =>
        db.jobResult.create({
          historyId: job.id,
          target: tgt,
          stderr: "",
          stdout: "",
        })
      )
    )

    const runners: RunnerRejectorTuple[] = []
    jobsInProgress.current[job.id] = runners
    await Promise.allSettled(
      jobTargets.map((tgt) => {
        const result = tgts.find((r) => r.target === tgt)!

        return new Promise<void>((resolve, reject) => {
          const runner = new ShellRunner(script.contents, {
            onData(data) {
              result.stdout += data
              db.jobResult.update(result)
            },
            onError(data) {
              result.stderr += data
              db.jobResult.update(result)
            },
            onEnd(data) {
              result.code = data.code ?? undefined
              db.jobResult.update(result)
              resolve()
            },
            args: [tgt],
          })
          runners.push([runner, reject])
          runner.start()
        })
      })
    )
    delete jobsInProgress.current[job.id]
  }
  return (
    <ScriptJobContext.Provider value={{ runJob, cancelJob, targets }}>
      {children}
    </ScriptJobContext.Provider>
  )
}
