import { useCallback, useState } from "kaioken"
import { ScriptJob } from "../types"
import { MaximizeIcon } from "./icons/icon-maximize"
import { Spinner } from "./Spinner"
import { Modal } from "./Dialog/Modal"
import { useHistory } from "../stores/history"

export function ExecutionHistory() {
  return (
    <div id="history" className="flex flex-col gap-2 p-2 glass-panel">
      <h1 className="text-2xl font-bold">History</h1>
      <HistoryList />
    </div>
  )
}

function HistoryList() {
  const { value } = useHistory(
    null,
    (prev, next) =>
      Object.keys(prev || {}).length === Object.keys(next || {}).length
  )
  if (value === null) return <div>Loading...</div>

  console.log("rendering HistoryList", history)
  return (
    <div className="flex flex-col gap-2 max-h-[calc(100vh-170px)] overflow-y-auto">
      {Object.entries(value.history).map(([ts, job]) => (
        <JobDisplay key={ts} job={job} ts={ts} />
      ))}
    </div>
  )
}

function JobDisplay({ job, ts }: { job: ScriptJob; ts: string }) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleMaximizeClick = useCallback(() => {
    setDetailsOpen((prev) => !prev)
  }, [])

  return (
    <div
      className={`p-1 rounded border border-neutral-400 border-opacity-5 relative ${
        job.completed
          ? "bg-neutral-400 bg-opacity-5"
          : "bg-warning bg-opacity-50"
      }`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">{job.script.path}</span>
          <button
            onclick={handleMaximizeClick}
            className="w-6 h-6 flex items-center justify-center opacity-50 hover:opacity-100"
          >
            <MaximizeIcon width="0.75rem" />
          </button>
        </div>
        <div className="flex flex-col gap-1 ">
          {Object.keys(job.targets).map((pkg) => (
            <JobTargetDisplay key={pkg} jobTs={ts} targetName={pkg} />
          ))}
        </div>
      </div>
      <Modal open={detailsOpen} setOpen={setDetailsOpen}>
        <JobDetailsDisplay job={job} ts={ts} setOpen={setDetailsOpen} />
      </Modal>
    </div>
  )
}

type JobTargetDisplayProps = {
  jobTs: string
  targetName: string
}

function JobTargetDisplay({ jobTs, targetName }: JobTargetDisplayProps) {
  const { value: tgt } = useHistory(
    (state) => state?.history[jobTs]?.targets[targetName]
  )
  if (!tgt) return null

  return (
    <div
      className={`flex justify-between gap-1 p-1 rounded bg-opacity-30 ${
        tgt.error ? "bg-danger" : tgt.result ? "bg-success" : "bg-warning"
      }`}
    >
      <span className="truncate text-xs">
        {"> "}
        {targetName}
      </span>
      {!tgt.error && !tgt.result && <Spinner width="1rem" />}
    </div>
  )
}

function JobDetailsDisplay({
  job,
  setOpen,
  ts,
}: {
  job: ScriptJob
  setOpen: (open: boolean) => void
  ts: string
}) {
  const { value: data, setData } = useHistory()
  const deleteJob = useCallback(async () => {
    if (!data) return
    const newHistory = { ...data, history: { ...data.history } }
    delete newHistory.history[ts]
    await setData(newHistory)
  }, [data])

  return (
    <div className="flex flex-col gap-2 relative">
      <h1 className="text-2xl font-bold modal-region-heading">Details</h1>
      <div className="modal-region">
        <pre className="p-2 bg-black bg-opacity-30 rounded text-xs">
          {job.script.contents}
        </pre>
      </div>
      <h1 className="text-2xl font-bold modal-region-heading">Targets</h1>
      <div className="modal-region">
        <ul className="flex flex-col gap-2">
          {Object.entries(job.targets).map(([pkg, res]) => (
            <li key={pkg} className="bg-black bg-opacity-30 rounded">
              <h2 className="font-bold px-2 py-1">
                {">"} {pkg}
              </h2>
              <div className="max-w-full overflow-auto text-xs p-2 bg-black bg-opacity-20">
                <pre>{res.result?.stdout}</pre>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="modal-footer">
        <div className="flex justify-between">
          <button
            onclick={() => setOpen(false)}
            className="px-2 py-1 bg-neutral-100 bg-opacity-15 hover:bg-opacity-25 rounded"
          >
            Close
          </button>
          <div>
            <button
              onclick={deleteJob}
              className="px-2 py-1 bg-danger rounded bg-opacity-50 hover:bg-opacity-100"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
