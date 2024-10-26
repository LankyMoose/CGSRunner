import { ToastProvider } from "./context/ToastContext"
import { Workspaces } from "./components/Workspaces"
import { Packages } from "./components/Packages"
import { ExecutionHistory } from "./components/ExecutionHistory"
import { ScriptSelector } from "./components/ScriptSelector"
import { ScriptJobProvider } from "./context/ScriptJobContext"
import { useAsync } from "kaioken"
import { loadWorkspaces, useWorkspaces } from "./stores/workspaces"
import { loadHistory, useHistory } from "./stores/history"

const Providers: Kaioken.FC = ({ children }) => {
  return (
    <ToastProvider>
      <ScriptJobProvider>{children}</ScriptJobProvider>
    </ToastProvider>
  )
}

export function App() {
  useAsync(async () => {
    const [workspaces, history] = await Promise.all([
      loadWorkspaces(),
      loadHistory(),
    ])
    useWorkspaces.setState(workspaces)
    useHistory.setState(history)
  }, [])
  return (
    <Providers>
      <header>
        <Workspaces />
      </header>
      <main>
        <Packages />
        <ExecutionHistory />
        <ScriptSelector />
      </main>
    </Providers>
  )
}
