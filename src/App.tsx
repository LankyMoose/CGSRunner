import { ToastProvider } from "./context/ToastContext"
import { Targets } from "./components/Targets"
import { ExecutionHistory } from "./components/ExecutionHistory"
import { ScriptSelector } from "./components/ScriptSelector"
import { ScriptJobProvider } from "./context/ScriptJobContext"
import { useAsync } from "kaioken"
import { loadTargets, useTargets } from "./stores/targets"
import { loadHistory, useHistory } from "./stores/history"

export function App() {
  useAsync(async () => {
    const [targets, history] = await Promise.all([loadTargets(), loadHistory()])
    useTargets.setState(targets)
    useHistory.setState(history)
  }, [])
  return (
    <ToastProvider>
      <ScriptJobProvider>
        <main>
          <Targets />
          <ExecutionHistory />
          <ScriptSelector />
        </main>
      </ScriptJobProvider>
    </ToastProvider>
  )
}
