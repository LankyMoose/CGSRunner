import { signal, useAsync } from "kaioken"
import { useUserData } from "../context/UserDataContext"
import { findPackages } from "../tauri/bash/findPackages"
import { FolderIcon } from "./icons/icon-folder"

export function Packages() {
  const { userData } = useUserData()
  const {
    data: packages,
    loading,
    error,
  } = useAsync(async () => {
    const res = (await Promise.all(userData.workspaces.map(findPackages)))
      .flat()
      .filter((v, i, arr) => arr.indexOf(v) === i)
    console.log("PackagesList", res)
    return res
  }, [userData.workspaces])

  return (
    <div className="flex flex-col gap-4">
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
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : (
        <PackagesList packages={packages} />
      )}
    </div>
  )
}

const selectedPackages = signal<string[]>([])

function PackagesList({ packages }: { packages: string[] }) {
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
          className={`flex gap-2 items-center border border-white px-2 py-1 rounded bg-opacity-30 border-opacity-30 ${
            selectedPackages.value.includes(pkg) ? "bg-blue-500" : ""
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
