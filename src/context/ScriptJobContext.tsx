import { createContext, Signal, useContext, useRef, useSignal } from "kaioken"
import { ScriptJob, ScriptSelection } from "../types"
import { useHistory } from "../stores/history"
import { ShellRunner } from "../tauri/shell/shellRunner"

type ScriptJobCtx = {
  targets: Signal<string[]>
  runJob: (script: ScriptSelection) => Promise<void>
  cancelJob: (id: string) => Promise<void>
  cancelJobTarget: (jobId: string, targetId: string) => Promise<void>
}

const ScriptJobContext = createContext<ScriptJobCtx>(null as any)

export const useScriptJob = () => useContext(ScriptJobContext)

type RunnerRejectorTuple = [string, ShellRunner, () => void]

export const ScriptJobProvider: Kaioken.FC = ({ children }) => {
  const { value: data, setData } = useHistory()
  const jobsInProgress = useRef<Record<string, RunnerRejectorTuple[]>>({})
  const targets = useSignal<string[]>([])

  const cancelJob = async (jobId: string) => {
    const job = jobsInProgress.current[jobId]
    if (!job) return
    await Promise.all(
      job.map(([_, runner, reject]) => (reject(), runner.cancel()))
    )
  }

  const cancelJobTarget = async (jobId: string, targetId: string) => {
    debugger
    const tgt = jobsInProgress.current[jobId]?.find(([tgt]) => tgt === targetId)
    if (!tgt) return
    const [_, runner, reject] = tgt
    reject()
    await runner.cancel()
  }

  const runJob = async (script: ScriptSelection) => {
    if (!data) return
    const id = crypto.randomUUID()
    const jobTargets = [...targets.value]
    const job: ScriptJob = {
      script,
      targets: jobTargets.reduce((acc, tgt) => {
        acc[tgt] = { code: null, stderr: "", stdout: "" }
        return acc
      }, {} as ScriptJob["targets"]),
    }
    await setData((prev) => ({
      ...prev,
      history: { ...prev.history, [id]: job },
    }))

    const runners: RunnerRejectorTuple[] = []
    jobsInProgress.current[id] = runners
    await Promise.allSettled(
      jobTargets.map((tgt) => {
        const result = job.targets[tgt]
        const update = () =>
          setData((prev) => ({
            ...prev,
            history: {
              ...prev.history,
              [id]: {
                ...job,
                targets: {
                  ...job.targets,
                  [tgt]: result,
                },
              },
            },
          }))

        return new Promise<void>((resolve, reject) => {
          const runner = new ShellRunner(job.script.contents, {
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
            args: [tgt],
          })
          runners.push([tgt, runner, reject])
          runner.start()
        })
      })
    )
    delete jobsInProgress.current[id]
  }
  return (
    <ScriptJobContext.Provider
      value={{ runJob, cancelJob, cancelJobTarget, targets }}
    >
      {children}
    </ScriptJobContext.Provider>
  )
}
