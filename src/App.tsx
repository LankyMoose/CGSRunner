import { UserDataProvider } from "./context/UserDataContext"
import { ToastProvider } from "./context/ToastContext"
import { Workspaces } from "./components/Workspaces"
import { Packages } from "./components/Packages"
import { ExecutionHistory } from "./components/ExecutionHistory"
import { ScriptSelector } from "./components/ScriptSelector"
import { ScriptJobProvider } from "./context/ScriptJobContext"

export function App() {
  return (
    <>
      <UserDataProvider>
        <ToastProvider>
          <ScriptJobProvider>
            <header>
              <Workspaces />
            </header>
            <main>
              <Packages />
              <ExecutionHistory />
              <ScriptSelector />
            </main>
          </ScriptJobProvider>
        </ToastProvider>
      </UserDataProvider>
    </>
  )
}
