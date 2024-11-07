import { FolderIcon } from "./icons/icon-folder"
import { useScriptJob } from "../context/ScriptJobContext"
import { openFsSelectorDialog } from "../tauri/dialog"
import { useToast } from "../context/ToastContext"
import { useTargets } from "../stores/targets"
import { FileIcon } from "./icons/icon-file"
import { UserTargets } from "../tauri/storage/userData"
import { FolderPlusIcon } from "./icons/icon-folder-plus"
import { FilePlusIcon } from "./icons/icon-file-plus"
import { TrashIcon } from "./icons/icon-trash"

const selectDirs = () => openFsSelectorDialog({ dir: true })
const selectFiles = () => openFsSelectorDialog()

export function Targets() {
  const { targets } = useScriptJob()
  const showToast = useToast()
  const { value: data, setData } = useTargets()

  const addNewTargets = async (dir?: boolean) => {
    const targets = await (dir ? selectDirs() : selectFiles())
    if (!targets) return

    const tgtDict = new Set([...(data?.targets.map((t) => t.path) ?? [])])
    const newTargets = [
      ...(data?.targets ?? []),
      ...targets
        .filter((t) => !tgtDict.has(t))
        .map((path) => ({
          path,
          dir,
        })),
    ]

    const saveError = await setData((prev) => ({
      ...prev,
      targets: newTargets,
    }))

    const pluralized = targets.length > 1 ? "targets" : "target"

    if (saveError) {
      console.error(saveError)
      showToast("danger", `Failed to add ${pluralized}`)
      return
    }
    showToast("success", `Added ${pluralized}`)
  }

  const deselectTarget = (tgt: string) => {
    targets.value = targets.value.filter((p) => p !== tgt)
  }

  const selectTarget = (tgt: string) => {
    targets.value = [...targets.value, tgt]
  }

  const deleteTarget = async (tgt: string) => {
    const saveError = await setData((prev) => ({
      ...prev,
      targets: prev.targets.filter((t) => t.path !== tgt),
    }))
    if (saveError) {
      console.error(saveError)
      showToast("danger", `Failed to delete target`)
      return
    }
    if (targets.value.includes(tgt))
      targets.value = targets.value.filter((p) => p !== tgt)
    showToast("success", `Deleted target`)
  }

  return (
    <div id="targets" className="flex flex-col gap-2 p-2 h-full glass-panel">
      <div className="flex justify-between">
        <div className="flex gap-2 items-start">
          <h1 className="text-2xl font-bold">Targets</h1>
          <small className="badge">({targets.value.length})</small>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-info px-2 rounded bg-opacity-50 hover:bg-opacity-100"
            onclick={() => addNewTargets(true)}
          >
            <FolderPlusIcon />
          </button>
          <button
            className="bg-info px-2 rounded bg-opacity-50 hover:bg-opacity-100"
            onclick={() => addNewTargets()}
          >
            <FilePlusIcon />
          </button>
        </div>
      </div>

      <TargetsList
        targets={data?.targets ?? []}
        selectedTargets={targets.value}
        deselectTarget={deselectTarget}
        selectTarget={selectTarget}
        deleteTarget={deleteTarget}
      />
    </div>
  )
}

function TargetsList({
  targets,
  selectedTargets,
  deselectTarget,
  selectTarget,
  deleteTarget,
}: {
  targets: UserTargets["targets"]
  selectedTargets: string[]
  deselectTarget: (tgt: string) => void
  selectTarget: (tgt: string) => void
  deleteTarget: (tgt: string) => Promise<void>
}) {
  return (
    <div
      className={`flex flex-col gap-1 h-[calc(100vh-138px)] overflow-y-auto`}
    >
      {targets.map((tgt) => (
        <button
          key={tgt.path}
          onclick={() => {
            ;(selectedTargets.includes(tgt.path)
              ? deselectTarget
              : selectTarget)(tgt.path)
          }}
          className={`flex gap-2 items-center border border-white px-2 py-1 rounded border-opacity-5 hover:text-neutral-100 ${
            selectedTargets.includes(tgt.path)
              ? "bg-indigo-500 bg-opacity-25 text-neutral-100"
              : "bg-neutral-400 bg-opacity-5 text-neutral-300"
          }`}
          title={tgt.path}
        >
          {tgt.dir ? (
            <FolderIcon className="w-4 h-4 min-w-4" />
          ) : (
            <FileIcon className="w-4 h-4 min-w-4" />
          )}
          <span className="flex-grow truncate max-w-full text-sm text-left">
            {tgt.path}
          </span>
          <button
            onclick={(e) => (e.preventDefault(), deleteTarget(tgt.path))}
            className="rounded p-1 text-xs bg-neutral-300 bg-opacity-10 hover:bg-red-500 hover:bg-opacity-50"
          >
            <TrashIcon width="1rem" height="1rem" />
          </button>
        </button>
      ))}
    </div>
  )
}
