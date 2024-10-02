import { createContext, useAsync, useContext } from "kaioken"
import { loadUserData, saveUserData, UserData } from "../tauri/fs/userData"
import { LoadingOverlay } from "../components/LoadingOverlay"

type UserDataCtx = {
  userData: UserData
  setUserData: (data: Kaioken.StateSetter<UserData>) => void
  loading: boolean
}

const UserDataContext = createContext<UserDataCtx>({
  userData: null as any,
  loading: true,
  setUserData: null as any,
})

export const useUserData = () => useContext(UserDataContext)

export function UserDataProvider({ children }: { children?: JSX.Children }) {
  const {
    data: userData,
    loading,
    error,
    invalidate,
  } = useAsync(async () => {
    const [err, data] = await loadUserData()
    if (err) throw new Error(err)
    return data
  }, [])

  async function setUserData(data: Kaioken.StateSetter<UserData>) {
    if (!userData) return
    const newData = typeof data === "function" ? data(userData) : data
    const err = await saveUserData(newData)
    if (!err) return invalidate()
    console.error(err)
  }

  if (error) {
    return (
      <p className="text-red-500">
        An error occured while loading user data: {error.message}
      </p>
    )
  }

  if (loading) {
    return <LoadingOverlay />
  }

  return (
    <UserDataContext.Provider value={{ userData, loading, setUserData }}>
      {children}
    </UserDataContext.Provider>
  )
}
