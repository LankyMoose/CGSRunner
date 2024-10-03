import { open } from "@tauri-apps/plugin-dialog"
import normalizePath from "../utils/normalizePath"

export async function openFolderSelectorDialog() {
  const res = await open({
    title: "Select folders",
    directory: true,
    multiple: true,
  })
  if (res === null) return null
  return res.filter(Boolean).map((dir) => normalizePath(dir, false))
}

export function openScriptSelectorDialog() {
  return open({
    title: "Select script",
    filters: [
      {
        name: "Bash",
        extensions: ["sh"],
      },
    ],
  })
}
