import { useAsync } from "kaioken"
import { useUserData } from "../context/UserDataContext"
import { findPackages } from "../tauri/bash/findPackages"
import { FolderIcon } from "./icons/icon-folder"
import { RefreshIcon } from "./icons/icon-refresh"
import { selectedPackages } from "../state"

export function Packages() {
  const { userData } = useUserData()
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
    selectedPackages.value = []
    return res
  }, [userData?.workspaces])

  return (
    <div id="packages" className="flex flex-col gap-2 p-2 h-full glass-panel">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">
          Packages{" "}
          {packages === null ? (
            ""
          ) : (
            <sup className="text-xs bg-neutral-200 px-2 py-1 rounded text-black">
              ({packages.length})
            </sup>
          )}
        </h1>
        <button className="flex items-center" onclick={invalidate}>
          <RefreshIcon />
        </button>
      </div>
      {loading ? (
        <p>Searching...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : (
        <PackagesList packages={packages} />
      )}
    </div>
  )
}

function PackagesList({ packages }: { packages: string[] }) {
  return (
    <div
      className={`flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-256px)]`}
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
            if (selectedPackages.value.includes(pkg)) {
              selectedPackages.value = selectedPackages.value.filter(
                (p) => p !== pkg
              )
            } else {
              selectedPackages.value = [...selectedPackages.value, pkg]
            }
          }}
          className={`flex gap-2 items-center border border-white px-2 py-1 rounded border-opacity-10 ${
            selectedPackages.value.includes(pkg)
              ? "bg-red-500 bg-opacity-30"
              : "bg-white bg-opacity-5"
          }`}
          title={pkg}
        >
          <FolderIcon className="w-6 h-6 min-w-6" />
          <span className="truncate max-w-full">{pkg}</span>
        </button>
      ))}
    </div>
  )
}
