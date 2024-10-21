import { useAsync } from "kaioken"
import { useUserData } from "../context/UserDataContext"
import { findPackages } from "../tauri/bash/findPackages"
import { FolderIcon } from "./icons/icon-folder"
import { RefreshIcon } from "./icons/icon-refresh"
import { useScriptJob } from "../context/ScriptJobContext"

export function Packages() {
  const { userData } = useUserData()
  const { targets, setTargets } = useScriptJob()
  const {
    data: packages,
    loading,
    error,
    invalidate,
  } = useAsync(async () => {
    if (!userData) return []
    const res = (await Promise.all(userData.workspaces.map(findPackages)))
      .flat()
      .filter((v, i, arr) => arr.indexOf(v) === i)
    console.log("PackagesList", res)
    setTargets([])
    return res
  }, [userData?.workspaces])

  const removePackage = (pkg: string) => {
    setTargets(targets.filter((p) => p !== pkg))
  }

  const addPackage = (pkg: string) => {
    setTargets([...targets, pkg])
  }

  return (
    <div id="packages" className="flex flex-col gap-2 p-2 h-full glass-panel">
      <div className="flex justify-between">
        <div className="flex gap-2 items-start">
          <h1 className="text-2xl font-bold">Packages</h1>
          {packages && <small className="badge">({packages.length})</small>}
        </div>
        <button
          className="flex items-center opacity-50 hover:opacity-100"
          onclick={invalidate}
        >
          <RefreshIcon />
        </button>
      </div>
      {loading ? (
        <p>Searching...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : (
        <PackagesList
          packages={packages}
          selectedPackages={targets}
          removePackage={removePackage}
          addPackage={addPackage}
        />
      )}
    </div>
  )
}

function PackagesList({
  packages,
  selectedPackages,
  removePackage,
  addPackage,
}: {
  packages: string[]
  selectedPackages: string[]
  removePackage: (pkg: string) => void
  addPackage: (pkg: string) => void
}) {
  return (
    <div
      className={`flex flex-col gap-1 max-h-[calc(100vh-234px)] overflow-y-auto`}
    >
      {packages.length === 0 && (
        <p>
          <i>No packages found</i>
        </p>
      )}
      {packages.map((pkg) => (
        <button
          key={pkg}
          onclick={() => {
            if (selectedPackages.includes(pkg)) {
              removePackage(pkg)
            } else {
              addPackage(pkg)
            }
          }}
          className={`flex gap-2 items-center border border-white px-2 py-1 rounded border-opacity-5 hover:text-neutral-100 ${
            selectedPackages.includes(pkg)
              ? "bg-indigo-500 bg-opacity-25 text-neutral-100"
              : "bg-neutral-400 bg-opacity-5 text-neutral-300"
          }`}
          title={pkg}
        >
          <FolderIcon className="w-4 h-4 min-w-4" />
          <span className="truncate max-w-full text-sm">{pkg}</span>
        </button>
      ))}
    </div>
  )
}
