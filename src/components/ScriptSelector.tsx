import { useId, useSignal } from "kaioken"

export function ScriptSelector() {
  const inputId = useId()
  const selectedFile = useSignal<File | null>(null)
  return (
    <div
      id="script-selector"
      className="flex gap-2 p-2 items-center justify-between glass-panel"
    >
      <div>
        <input
          className={"hidden"}
          id={inputId}
          type="file"
          accept={".sh"}
          onchange={(e) => {
            if (!e.target.files) return
            console.log(e.target.files[0])
            selectedFile.value = e.target.files[0]
          }}
        />
        <label htmlFor={inputId} className="cursor-pointer">
          {selectedFile.value ? selectedFile.value.name : "Select script"}
        </label>
      </div>
      {selectedFile.value && (
        <div>
          <button
            onclick={() => {
              console.log(selectedFile.value)
            }}
          >
            Run script against 2 packages
          </button>
        </div>
      )}
    </div>
  )
}
