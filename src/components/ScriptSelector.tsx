import { useRef, useSignal } from "kaioken"
import { ScriptSelection } from "../types"
import { useScriptJob } from "../context/ScriptJobContext"

export function ScriptSelector() {
  const { runJob, targets } = useScriptJob()
  const selectedScript = useSignal<ScriptSelection | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleSelectFile = async (e: Event) => {
    const target = e.target as HTMLInputElement
    if (!target.files) return
    const file = target.files[0]
    const text = await file.text()
    selectedScript.value = { path: file.name, contents: text.trim() }
  }

  const handleRun = async () => {
    if (!selectedScript.value) return
    runJob(selectedScript.value)
  }

  return (
    <div
      id="script-selector"
      className="flex gap-2 p-2 items-center justify-between glass-panel"
    >
      <input
        accept=".sh"
        className="hidden"
        type="file"
        ref={inputRef}
        onchange={handleSelectFile}
      />
      <button
        className="px-2 py-1 font-bold glass-panel max-w-60 truncate text-sm hover:bg-opacity-15"
        onclick={() => inputRef.current?.click()}
      >
        {selectedScript.value?.path ?? "Select script"}
      </button>

      {selectedScript.value && targets.value.length > 0 && (
        <button
          className="px-2 py-1 font-bold text-sm text-nowrap bg-success/50 hover:bg-success shadow-sm rounded-sm border border-white/10"
          onclick={handleRun}
        >
          Run script on selected packages
        </button>
      )}
    </div>
  )
}
