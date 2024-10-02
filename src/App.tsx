import { Link, Route, Router, useModel } from "kaioken"
import { UserDataProvider, useUserData } from "./context/UserDataContext"

export function App() {
  return (
    <UserDataProvider>
      <div className="min-h-screen flex flex-col gap-4 p-4">
        <nav className="flex gap-4">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
        <Router>
          <Route path="/" element={<MainScreen />} />
          <Route path="/about" element={<AboutScreen />} />
        </Router>
      </div>
    </UserDataProvider>
  )
}

function MainScreen() {
  const { userData, setUserData } = useUserData()
  const [ref, text] = useModel<HTMLInputElement>("")
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <input ref={ref} value={text} />
        <button
          type="button"
          onclick={() => {
            setUserData((prev) => ({
              ...prev,
              directories: [...prev.directories, text],
            }))
          }}
        >
          Save
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {userData.directories.map((dir) => (
          <div key={dir}>{dir}</div>
        ))}
      </div>
    </div>
  )
}

function AboutScreen() {
  return <h1>About</h1>
}
