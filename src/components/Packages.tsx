import { useEffect, useSignal } from "kaioken"
import { createFindPackagesRunner } from "../tauri/shell/findPackages"
import { FolderIcon } from "./icons/icon-folder"
import { RefreshIcon } from "./icons/icon-refresh"
import { useScriptJob } from "../context/ScriptJobContext"
import { useWorkspaces } from "../stores/workspaces"
import { ShellRunner } from "../tauri/shell/shellRunner"

export function Packages() {
  const { value: workspaces } = useWorkspaces()
  const { targets } = useScriptJob()
  const packages = useSignal<string[]>([])
  const reloadSig = useSignal(0)
  const loading = useSignal(false)

  useEffect(() => {
    loading.value = (workspaces?.workspaces || []).length > 0
    packages.value = []
    targets.value = []
    if (workspaces?.workspaces) {
      const runners: ShellRunner[] = []
      for (const dir of workspaces.workspaces) {
        const runner = createFindPackagesRunner(dir, {
          onData(data) {
            packages.value.push(
              data.trimEnd().substring(0, data.lastIndexOf("/"))
            )
            packages.value = [...new Set(packages.value)]
          },
          onEnd() {
            if (
              runners.length === workspaces.workspaces.length &&
              runners.every((r) => r.completed)
            ) {
              loading.value = false
            }
          },
        })
        runner.start()
        runners.push(runner)
      }
      console.log(`runners`, runners)
      return () => runners.forEach((r) => r.cancel())
    }
  }, [workspaces?.workspaces.length, reloadSig.value])

  const removePackage = (pkg: string) => {
    targets.value = targets.value.filter((p) => p !== pkg)
  }

  const addPackage = (pkg: string) => {
    targets.value = [...targets.value, pkg]
  }

  const reload = () => {
    reloadSig.value++
    packages.value = []
  }

  return (
    <div id="packages" className="flex flex-col gap-2 p-2 h-full glass-panel">
      <div className="flex justify-between">
        <div className="flex gap-2 items-start">
          <h1 className="text-2xl font-bold">Packages</h1>
          <small className="badge">({packages.value.length})</small>
        </div>
        <button
          className={`flex items-center opacity-50 hover:opacity-100 ${
            loading.value ? "animate-spin" : ""
          }`}
          onclick={reload}
          disabled={loading}
          title={loading.value ? "Loading..." : "Reload"}
        >
          <RefreshIcon />
        </button>
      </div>
      <PackagesList
        packages={packages.value}
        selectedPackages={targets.value}
        removePackage={removePackage}
        addPackage={addPackage}
      />
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
