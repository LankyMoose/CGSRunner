import { ElementProps, useCallback } from "kaioken"
import { twMerge } from "tailwind-merge"
import { useToast } from "../context/ToastContext"
import { openFolderSelectorDialog } from "../tauri/dialog"
import { CirclePlusIcon } from "./icons/icon-circle-plus"
import { CircleXIcon } from "./icons/icon-circle-x"
import { useWorkspaces } from "../stores/workspaces"

export function Workspaces() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">Workspaces</h1>
      <WorkspacesList />
    </div>
  )
}

function WorkspacesList({ className = "", ...props }: ElementProps<"ul">) {
  const showToast = useToast()
  const { value: data, setData } = useWorkspaces()

  const handleRemoveClick = async (dir: string) => {
    if (!data) return
    const newWorkSpaces = data.workspaces.filter((w) => w !== dir)
    const saveError = await setData((prev) => ({
      ...prev,
      workspaces: newWorkSpaces,
    }))
    if (saveError) {
      console.error(saveError)
      showToast("danger", "Failed to remove workspace")
      return
    }
    showToast("success", "Removed workspace")
  }

  return (
    <div className="flex p-2 glass-panel">
      <ul
        className={twMerge(
          "flex-grow flex flex-wrap gap-1 max-h-[32px] overflow-y-auto",
          `${className}`
        )}
        {...props}
      >
        {(data?.workspaces.length || 0) === 0 && (
          <li className="flex items-center py-1">
            <i>No workspaces...</i>
          </li>
        )}
        {data?.workspaces.map((dir) => (
          <li
            key={dir}
            className="flex gap-2 items-center justify-between px-2 bg-white bg-opacity-5 rounded border border-white border-opacity-10"
          >
            <span className="text-xs font-bold">{dir}</span>
            <button
              className="opacity-50 hover:opacity-100"
              onclick={() => handleRemoveClick(dir)}
            >
              <CircleXIcon className="w-4 h-4 min-w-4" />
            </button>
          </li>
        ))}
      </ul>
      <AddWorkspaceButton className="px-2 py-1 opacity-50 hover:opacity-100" />
    </div>
  )
}

function AddWorkspaceButton(props: ElementProps<"button">) {
  const showToast = useToast()
  const { value: data, setData } = useWorkspaces()

  const handleClick = useCallback(async () => {
    const selectedFolders = await openFolderSelectorDialog()
    if (selectedFolders === null) return
    const newWorkSpaces = [
      ...new Set([...(data?.workspaces ?? []), ...selectedFolders]),
    ]
    const saveError = await setData((prev) => ({
      ...prev,
      workspaces: newWorkSpaces,
    }))
    if (saveError) {
      console.error(saveError)
      showToast(
        "danger",
        selectedFolders.length > 1
          ? "Failed to add workspaces"
          : "Failed to add workspace"
      )
      return
    }
    showToast(
      "success",
      selectedFolders.length > 1 ? "Added workspaces" : "Added workspace"
    )
  }, [data])

  return (
    <button {...props} onclick={handleClick}>
      <CirclePlusIcon />
    </button>
  )
}
