import { ElementProps, useCallback } from "kaioken"
import { twMerge } from "tailwind-merge"
import { useToast } from "../context/ToastContext"
import { useUserData } from "../context/UserDataContext"
import { openFolderSelectorDialog } from "../tauri/dialog"
import { CirclePlusIcon } from "./icons/icon-circle-plus"
import { CircleXIcon } from "./icons/icon-circle-x"

export function Workspaces() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Workspaces</h1>
      <WorkspacesList />
    </div>
  )
}

function WorkspacesList({ className = "", ...props }: ElementProps<"ul">) {
  const showToast = useToast()
  const { userData, setUserData } = useUserData()
  const workspaces = userData?.workspaces || []

  const handleRemoveClick = async (dir: string) => {
    const newWorkSpaces = workspaces.filter((w) => w !== dir)
    const saveError = await setUserData((prev) => ({
      ...prev,
      workspaces: newWorkSpaces,
    }))
    if (saveError) {
      console.error(saveError)
      showToast("error", "Failed to remove workspace")
      return
    }
    showToast("success", "Removed workspace")
  }

  return (
    <div className="flex rounded-lg bg-black bg-opacity-20 p-2">
      <ul
        className={twMerge("flex-grow flex flex-wrap gap-1", `${className}`)}
        {...props}
      >
        {workspaces.length === 0 && (
          <li className="flex gap-4 items-center justify-between border-2 px-2 py-1 rounded bg-black bg-opacity-10">
            <i>No workspaces...</i>
          </li>
        )}
        {workspaces.map((dir) => (
          <li
            key={dir}
            className="flex gap-4 items-center justify-between border-2 px-2 py-1 rounded"
          >
            <span>{dir}</span>
            <button onclick={() => handleRemoveClick(dir)}>
              <CircleXIcon />
            </button>
          </li>
        ))}
      </ul>
      <AddWorkspaceButton className="px-2 py-1" />
    </div>
  )
}

function AddWorkspaceButton(props: ElementProps<"button">) {
  const showToast = useToast()
  const { userData, setUserData } = useUserData()

  const handleClick = useCallback(async () => {
    const selectedFolders = await openFolderSelectorDialog()
    if (selectedFolders === null) return
    const newWorkSpaces = [
      ...new Set([...(userData?.workspaces ?? []), ...selectedFolders]),
    ]
    const saveError = await setUserData((prev) => ({
      ...prev,
      workspaces: newWorkSpaces,
    }))
    if (saveError) {
      console.error(saveError)
      showToast(
        "error",
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
  }, [userData?.workspaces])

  return (
    <button {...props} onclick={handleClick}>
      <CirclePlusIcon />
    </button>
  )
}
