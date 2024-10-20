import { signal, useAsync, useLayoutEffect, useRef } from "kaioken"
import { useUserData } from "../context/UserDataContext"
import { findPackages } from "../tauri/bash/findPackages"
import { FolderIcon } from "./icons/icon-folder"
import { RefreshIcon } from "./icons/icon-refresh"
import { useLayout } from "../context/LayoutContext"

export function Packages() {
  const { registerHeightOffset } = useLayout()
  const headerRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!headerRef.current) return
    registerHeightOffset(headerRef.current)
  }, [headerRef.current])

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
    return res
  }, [userData?.workspaces])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between" ref={headerRef}>
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

const selectedPackages = signal<string[]>([])

function PackagesList({ packages }: { packages: string[] }) {
  const { useHeightOffset } = useLayout()
  const heightOffset = useHeightOffset()
  return (
    <div
      className={`flex flex-col gap-1 p-1 overflow-y-auto`}
      style={`max-height: calc(100vh - ${heightOffset}px - 1.5rem)`}
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
