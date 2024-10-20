import { useRef, useSignal } from "kaioken"
import { selectedPackages } from "../state"

export function ScriptSelector() {
  const inputRef = useRef<HTMLInputElement>(null)
  const selectedFile = useSignal<File | null>(null)
  return (
    <div
      id="script-selector"
      className="flex gap-2 p-2 items-center justify-between glass-panel"
    >
      <div>
        <input
          ref={inputRef}
          className={"hidden"}
          type="file"
          accept={".sh"}
          onchange={(e) => {
            if (!e.target.files) return
            console.log(e.target.files[0])
            selectedFile.value = e.target.files[0]
          }}
        />
        <button
          className="px-2 py-1 font-bold glass-panel max-w-60 truncate"
          onclick={() => inputRef.current?.click()}
        >
          {selectedFile.value ? selectedFile.value.name : "Select script"}
        </button>
      </div>
      {selectedFile.value && selectedPackages.value.length > 0 && (
        <div>
          <button
            className="px-2 py-1 font-bold bg-success shadow bg-opacity-50 rounded border border-white border-opacity-10 hover:bg-opacity-100"
            onclick={() => {
              console.log(selectedFile.value)
            }}
          >
            Run script on selected packages
          </button>
        </div>
      )}
    </div>
  )
}
