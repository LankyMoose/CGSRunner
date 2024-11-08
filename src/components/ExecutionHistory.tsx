import { useAsync, useCallback, useLayoutEffect, useState } from "kaioken"
import { Spinner } from "./Spinner"
import { Modal } from "./Dialog/Modal"
import { useHistory } from "../stores/history"
import { TrashIcon } from "./icons/icon-trash"
import { useScriptJob } from "../context/ScriptJobContext"
import { db, HistoryRecord, jobResult, JobResultRecord } from "$/idb"

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
    (prev, next) => prev?.length === next?.length
  )
  if (value === null) return <div>Loading...</div>

  console.log("rendering HistoryList", history)
  return (
    <div className="flex flex-col gap-2 overflow-y-auto">
      {value.map((job) => (
        <JobDisplay key={job.id} job={job} id={job.id} />
      ))}
    </div>
  )
}

function JobDisplay({ job, id }: { job: HistoryRecord; id: string }) {
  const { cancelJob } = useScriptJob()
  const [detailsOpen, setDetailsOpen] = useState(false)

  const [results, setResults] = useState<JobResultRecord[] | null>(null)
  const { invalidate } = useAsync(async () => {
    const res = await db.jobResult.findMany((r) => r.historyId === id)
    setResults(res)
  }, [])

  useLayoutEffect(() => {
    const onWrite = (r: JobResultRecord) => {
      if (r.historyId === id) invalidate()
    }
    jobResult.on("write", onWrite)
    return () => {
      jobResult.off("write", onWrite)
    }
  }, [results])

  const handleMaximizeClick = useCallback(() => {
    setDetailsOpen((prev) => !prev)
  }, [])

  const deleteJob = useCallback(async (e: Event) => {
    e.stopPropagation()
    e.preventDefault()

    await cancelJob(id)
    ;(e.target as HTMLButtonElement).style.pointerEvents = "none"
    await useHistory.methods.removeHistory(job)
  }, [])

  return (
    <button
      onclick={handleMaximizeClick}
      className={`p-1 rounded border border-neutral-400 border-opacity-5 opacity-85 hover:opacity-100 relative bg-neutral-400 bg-opacity-5`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">{job.scriptPath}</span>
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
          {results?.map((tgt) => (
            <JobResultDisplay key={tgt.id} result={tgt} />
          ))}
        </div>
      </div>
      <Modal open={detailsOpen} setOpen={setDetailsOpen}>
        <JobDetailsDisplay
          job={job}
          results={results}
          setOpen={setDetailsOpen}
        />
      </Modal>
    </button>
  )
}

type JobResultDisplayProps = {
  result: JobResultRecord
}

function JobResultDisplay({ result }: JobResultDisplayProps) {
  return (
    <div
      className={`flex justify-between gap-1 p-1 rounded bg-opacity-30 ${
        result.code === undefined
          ? "bg-warning"
          : result.stderr
          ? "bg-danger"
          : "bg-success"
      }`}
    >
      <span className="truncate text-xs">
        {"> "}
        {result.target}
      </span>
      {result.code === undefined && <Spinner width="1rem" />}
    </div>
  )
}

function JobDetailsDisplay({
  job,
  results,
  setOpen,
}: {
  job: HistoryRecord
  results: JobResultRecord[] | null
  setOpen: (open: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-2 relative">
      <h1 className="text-2xl font-bold modal-region-heading">Details</h1>
      <div className="modal-region">
        <pre className="p-2 bg-black bg-opacity-30 rounded text-xs">
          {job.script}
        </pre>
      </div>
      <h1 className="text-2xl font-bold modal-region-heading">Targets</h1>
      <div className="modal-region">
        <ul className="flex flex-col gap-2">
          {results?.map((res) => (
            <JobDetailsDisplayResultRow key={res.id} result={res} />
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

function JobDetailsDisplayResultRow({ result }: { result: JobResultRecord }) {
  return (
    <li className="bg-black bg-opacity-30 rounded">
      <h2 className="font-bold px-2 py-1">
        {">"} {result.target}
      </h2>
      <div className="max-w-full overflow-auto text-xs p-2 bg-black bg-opacity-20">
        <pre>{result.stdout}</pre>
      </div>
      {result.stderr && (
        <div className="max-w-full overflow-auto text-xs p-2 bg-black bg-opacity-20">
          <pre>{result.stderr}</pre>
        </div>
      )}
    </li>
  )
}
