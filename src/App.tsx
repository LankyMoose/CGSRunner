import { UserDataProvider } from "./context/UserDataContext"
import { ToastContextProvider } from "./context/ToastContext"
import { Workspaces } from "./components/Workspaces"
import { Packages } from "./components/Packages"
import { ExecutionHistory } from "./components/ExecutionHistory"
import { ScriptSelector } from "./components/ScriptSelector"

export function App() {
  return (
    <>
      <UserDataProvider>
        <ToastContextProvider>
          <header>
            <Workspaces />
          </header>
          <main>
            <Packages />
            <ExecutionHistory />
            <ScriptSelector />
          </main>
        </ToastContextProvider>
      </UserDataProvider>
    </>
  )
}
