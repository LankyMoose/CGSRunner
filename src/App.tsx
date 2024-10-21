import { FileProviders } from "./context/FileProviders"
import { ToastProvider } from "./context/ToastContext"
import { Workspaces } from "./components/Workspaces"
import { Packages } from "./components/Packages"
import { ExecutionHistory } from "./components/ExecutionHistory"
import { ScriptSelector } from "./components/ScriptSelector"
import { ScriptJobProvider } from "./context/ScriptJobContext"

const Providers: Kaioken.FC = ({ children }) => {
  return (
    <FileProviders>
      <ToastProvider>
        <ScriptJobProvider>{children}</ScriptJobProvider>
      </ToastProvider>
    </FileProviders>
  )
}

export function App() {
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
