import { ElementProps, useCallback } from "kaioken"
import { twMerge } from "tailwind-merge"
import { UserDataProvider, useUserData } from "./context/UserDataContext"
import { openFolderSelectorDialog } from "./tauri/dialog"
import { ToastContextProvider, useToast } from "./context/ToastContext"
import { CircleX } from "./components/icons/icon-circle-x"
import { CirclePlus } from "./components/icons/icon-circle-plus"

export function App() {
  return (
    <ToastContextProvider>
      <UserDataProvider>
        <div className="min-h-screen flex flex-col gap-4 p-4">
          <MainScreen />
        </div>
      </UserDataProvider>
    </ToastContextProvider>
  )
}

function MainScreen() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Workspaces</h1>
      <WorkspacesList />
    </div>
  )
}

function WorkspacesList({ className = "", ...props }: ElementProps<"ul">) {
  const { showToast } = useToast()
  const { userData, setUserData } = useUserData()

  const handleRemoveClick = async (dir: string) => {
    const newWorkSpaces = userData.workspaces.filter((w) => w !== dir)
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
    <div className="flex border-2 p-1 rounded-lg">
      <ul
        className={twMerge("flex-grow flex flex-wrap gap-1", `${className}`)}
        {...props}
      >
        {userData.workspaces.length === 0 && (
          <li className="flex gap-4 items-center justify-between border-2 px-2 py-1 rounded bg-neutral-700">
            <i>No workspaces...</i>
          </li>
        )}
        {userData.workspaces.map((dir) => (
          <li
            key={dir}
            className="flex gap-4 items-center justify-between border-2 px-2 py-1 rounded"
          >
            <span>{dir}</span>
            <button onclick={() => handleRemoveClick(dir)}>
              <CircleX />
            </button>
          </li>
        ))}
      </ul>
      <AddWorkspaceButton className="px-2 py-1" />
    </div>
  )
}

function AddWorkspaceButton(props: ElementProps<"button">) {
  const { showToast } = useToast()
  const { userData, setUserData } = useUserData()

  const handleClick = useCallback(async () => {
    const selectedFolders = await openFolderSelectorDialog()
    if (selectedFolders === null) return
    const newWorkSpaces = [
      ...new Set([...userData.workspaces, ...selectedFolders]),
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
  }, [])

  return (
    <button {...props} onclick={handleClick}>
      <CirclePlus />
    </button>
  )
}
