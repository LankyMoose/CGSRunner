import { signal, useAsync } from "kaioken"
import { useUserData } from "../context/UserDataContext"
import { findPackages } from "../tauri/bash/findPackages"
import { FolderIcon } from "./icons/icon-folder"

export function Packages() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Packages</h1>
      <PackagesList />
    </div>
  )
}

const selectedPackages = signal<string[]>([])

function PackagesList() {
  const { userData } = useUserData()
  const {
    data: packages,
    loading,
    error,
  } = useAsync(async () => {
    const res = (
      await Promise.all(userData.workspaces.map(findPackages))
    ).flat()
    console.log("PackagesList", res)
    return res
  }, [...userData.workspaces])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error</p>
  return (
    <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto">
      {packages.length === 0 && (
        <p>
          <i>No packages found</i>
        </p>
      )}
      {packages.map((pkg) => (
        <button
          key={pkg}
          onclick={() => {
            if (selectedPackages.value.includes(pkg)) {
              selectedPackages.value = selectedPackages.value.filter(
                (p) => p !== pkg
              )
            } else {
              selectedPackages.value = [...selectedPackages.value, pkg]
            }
          }}
          className={`flex gap-2 items-center border border-white px-2 py-1 rounded ${
            selectedPackages.value.includes(pkg)
              ? "bg-neutral-700"
              : " border-opacity-30"
          }`}
          title={pkg}
        >
          <FolderIcon className="w-6 h-6" />
          <span className="truncate">{pkg}</span>
        </button>
      ))}
    </div>
  )
}
