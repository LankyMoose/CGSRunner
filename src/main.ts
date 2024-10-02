import "./global.css"
import { mount } from "kaioken"
import { App } from "./App"
import { Command } from "@tauri-apps/plugin-shell"

const root = document.querySelector<HTMLDivElement>("#app")!
mount(App, root)

let result = await Command.create("exec-sh", [
  "-c",
  "echo 'Hello World!'",
]).execute()
console.log(result)
