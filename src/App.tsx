import { UserDataProvider } from "./context/UserDataContext"
import { ToastContextProvider } from "./context/ToastContext"
import { Workspaces } from "./components/Workspaces"
import { Packages } from "./components/Packages"

export function App() {
  return (
    <ToastContextProvider>
      <UserDataProvider>
        <div className="min-h-screen flex flex-col gap-4 p-4">
          <MainScreen />
        </div>
      </UserDataProvider>
    </ToastContextProvider>
  )
}

function MainScreen() {
  return (
    <div className="flex flex-col gap-4">
      <Workspaces />
      <Packages />
    </div>
  )
}
