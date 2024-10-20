import { UserDataProvider } from "./context/UserDataContext"
import { ToastContextProvider } from "./context/ToastContext"
import { Workspaces } from "./components/Workspaces"
import { Packages } from "./components/Packages"
import { ExecutionHistory } from "./components/ExecutionHistory"

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
          </main>
        </ToastContextProvider>
      </UserDataProvider>
    </>
  )
}
