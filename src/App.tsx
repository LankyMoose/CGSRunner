import { UserDataProvider } from "./context/UserDataContext"
import { ToastContextProvider } from "./context/ToastContext"
import { Workspaces } from "./components/Workspaces"
import { Packages } from "./components/Packages"
import { useLayoutEffect, useRef } from "kaioken"
import { LayoutProvider, useLayout } from "./context/LayoutContext"

const Providers: Kaioken.FC = ({ children }) => {
  return (
    <UserDataProvider>
      <ToastContextProvider>
        <LayoutProvider>{children}</LayoutProvider>
      </ToastContextProvider>
    </UserDataProvider>
  )
}
export function App() {
  return (
    <Providers>
      <Header />
      <Main />
    </Providers>
  )
}

function Header() {
  const { registerHeightOffset } = useLayout()
  const headerRef = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    if (!headerRef.current) return
    registerHeightOffset(headerRef.current)
  }, [headerRef.current])
  return (
    <header ref={headerRef} className="p-2">
      <Workspaces />
    </header>
  )
}

function Main() {
  return (
    <main className="p-2">
      <Packages />
    </main>
  )
}
