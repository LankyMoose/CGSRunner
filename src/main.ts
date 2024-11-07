import "./global.css"
import { mount } from "kaioken"
import { App } from "./App"
import { getCurrentWindow, PhysicalSize } from "@tauri-apps/api/window"
const minW = 720,
  minH = 432
await getCurrentWindow().setMinSize(new PhysicalSize(minW, minH))
mount(App, document.getElementById("app")!)
