import { useHistory } from "../context/FileProviders"
import { UserHistory } from "../tauri/storage/userData"
import { ScriptJob } from "../types"

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
        <button className="glass-panel px-1 hover:bg-info hover:bg-opacity-50">
          View details
        </button>
      </div>
    </div>
  )
}
