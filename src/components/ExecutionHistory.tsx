import { useState } from "kaioken"
import { useHistory } from "../context/FileProviders"
import { UserHistory } from "../tauri/storage/userData"
import { ScriptJob } from "../types"
import { Modal } from "./Dialog/Modal"
import { XIcon } from "./icons/icon-x"

export function ExecutionHistory() {
  const { data } = useHistory()
  return (
    <div id="history" className="flex flex-col gap-2 p-2 glass-panel">
      <h1 className="text-2xl font-bold">History</h1>
      {data && <HistoryList history={data} />}
    </div>
  )
}

function HistoryList({ history }: { history: UserHistory }) {
  console.log("rendering HistoryList", history)
  return (
    <div className="flex flex-col gap-2">
      {Object.entries(history.history).map(([ts, job]) => (
        <JobDisplay key={ts} job={job} ts={ts} />
      ))}
    </div>
  )
}

function JobDisplay({ job, ts }: { job: ScriptJob; ts: string }) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const { data, setData } = useHistory()

  const deleteJob = async () => {
    if (!data) return
    const newHistory = { ...data, history: { ...data.history } }
    delete newHistory.history[ts]
    await setData(newHistory)
  }

  return (
    <div className="glass-panel py-1 px-2 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <pre className="inline-block truncate">
          <code>{job.script.path}</code>
        </pre>
        <small className="opacity-75 text-nowrap">
          {Object.entries(job.targets).length} packages
        </small>
      </div>
      <div className="flex items-center justify-end gap-2 text-xs">
        <button
          onclick={deleteJob}
          className="glass-panel px-1 hover:bg-danger hover:bg-opacity-50"
        >
          Delete
        </button>
        <button
          onclick={() => setDetailsOpen(true)}
          className="glass-panel px-1 hover:bg-info hover:bg-opacity-50"
        >
          View details
        </button>
      </div>
      <Modal open={detailsOpen} setOpen={setDetailsOpen}>
        <JobDetailsDisplay job={job} setOpen={setDetailsOpen} />
      </Modal>
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
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold flex justify-between">
        Details
        <button
          onclick={() => setOpen(false)}
          className="opacity-50 hover:opacity-100"
        >
          <XIcon />
        </button>
      </h1>
      <pre className="p-2 bg-black bg-opacity-30 rounded text-xs">
        {job.script.contents}
      </pre>
      <h1 className="text-2xl font-bold">Targets</h1>
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
  )
}
