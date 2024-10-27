import { useCallback, useState } from "kaioken"
import { ScriptJob } from "../types"
import { Spinner } from "./Spinner"
import { Modal } from "./Dialog/Modal"
import { useHistory } from "../stores/history"
import { TrashIcon } from "./icons/icon-trash"
import { UserHistory } from "../tauri/storage/userData"

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
      Object.keys(prev?.history || {}).length ===
      Object.keys(next?.history || {}).length
  )
  if (value === null) return <div>Loading...</div>

  console.log("rendering HistoryList", history)
  return (
    <div className="flex flex-col gap-2 max-h-[calc(100vh-170px)] overflow-y-auto">
      {Object.entries(value.history).map(([ts, job]) => (
        <JobDisplay key={`job-${ts}`} job={job} ts={ts} />
      ))}
    </div>
  )
}

function JobDisplay({ job, ts }: { job: ScriptJob; ts: string }) {
  const { setData } = useHistory(null, () => true)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleMaximizeClick = useCallback(() => {
    setDetailsOpen((prev) => !prev)
  }, [])

  const deleteJob = useCallback(async (e: Event) => {
    e.stopPropagation()
    e.preventDefault()
    ;(e.target as HTMLButtonElement).style.pointerEvents = "none"
    await setData((prev) => ({
      ...prev,
      history: Object.keys(prev.history).reduce((acc, _ts) => {
        if (_ts === ts) return acc
        return { ...acc, [_ts]: prev.history[_ts] }
      }, {} as UserHistory["history"]),
    }))
  }, [])

  return (
    <button
      onclick={handleMaximizeClick}
      className={`p-1 rounded border border-neutral-400 border-opacity-5 opacity-85 hover:opacity-100 relative bg-neutral-400 bg-opacity-5`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">{job.script.path}</span>
          <div className="flex gap-1 items-center">
            <button
              onclick={deleteJob}
              className={`w-6 h-6 flex items-center justify-center opacity-50 hover:opacity-100 hover:text-red-500`}
            >
              <TrashIcon width="0.75rem" />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1 ">
          {Object.keys(job.targets).map((pkg) => (
            <JobTargetDisplay key={pkg} jobTs={ts} targetName={pkg} />
          ))}
        </div>
      </div>
      <Modal open={detailsOpen} setOpen={setDetailsOpen}>
        <JobDetailsDisplay job={job} setOpen={setDetailsOpen} />
      </Modal>
    </button>
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
        tgt.code === null
          ? "bg-warning"
          : tgt.stderr
          ? "bg-danger"
          : "bg-success"
      }`}
    >
      <span className="truncate text-xs">
        {"> "}
        {targetName}
      </span>
      {tgt.code === null && <Spinner width="1rem" />}
    </div>
  )
}

function JobDetailsDisplay({
  job,
  setOpen,
}: {
  job: ScriptJob
  setOpen: (open: boolean) => void
}) {
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
                <pre>{res.stdout}</pre>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="modal-footer">
        <button
          onclick={() => setOpen(false)}
          className="px-2 py-1 bg-neutral-100 bg-opacity-15 hover:bg-opacity-25 rounded"
        >
          Close
        </button>
      </div>
    </div>
  )
}
