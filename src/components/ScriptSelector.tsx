import { useSignal } from "kaioken"
import { selectedPackages } from "../state"
import { openScriptSelectorDialog } from "../tauri/dialog"

export function ScriptSelector() {
  const selectedFile = useSignal<string | null>(null)

  const handleSelectFile = async () => {
    selectedFile.value = await openScriptSelectorDialog()
  }

  return (
    <div
      id="script-selector"
      className="flex gap-2 p-2 items-center justify-between glass-panel"
    >
      <button
        className="px-2 py-1 font-bold glass-panel max-w-60 truncate text-sm hover:bg-opacity-15"
        onclick={handleSelectFile}
      >
        {selectedFile.value ?? "Select script"}
      </button>

      {selectedFile.value && selectedPackages.value.length > 0 && (
        <button
          className="px-2 py-1 font-bold text-sm bg-success shadow bg-opacity-50 rounded border border-white border-opacity-10 hover:bg-opacity-100"
          onclick={() => {
            console.log(selectedFile.value)
          }}
        >
          Run script on selected packages
        </button>
      )}
    </div>
  )
}
