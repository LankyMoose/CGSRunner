import "./global.css"
import { mount } from "kaioken"
import { App } from "./App"
import { getCurrentWindow, PhysicalSize } from "@tauri-apps/api/window"
await getCurrentWindow().setMinSize(new PhysicalSize(640, 480))
mount(App, document.getElementById("app")!)
