import { createContext, useAsync, useContext } from "kaioken"
import { loadUserData, saveUserData, UserData } from "../tauri/storage/userData"
import { LoadingOverlay } from "../components/LoadingOverlay"

type UserDataCtx = {
  userData: UserData
  setUserData: (
    data: Kaioken.StateSetter<UserData>,
    reload?: boolean
  ) => ReturnType<typeof saveUserData>
  loading: boolean
  invalidate: () => void
}

const UserDataContext = createContext<UserDataCtx>({
  userData: null as any,
  loading: true,
  setUserData: null as any,
  invalidate: null as any,
})

export const useUserData = () => useContext(UserDataContext)

export const UserDataProvider: Kaioken.FC = ({ children }) => {
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

  async function setUserData(
    data: Kaioken.StateSetter<UserData>,
    reload: boolean = false
  ): ReturnType<typeof saveUserData> {
    if (!userData) return null
    const newData = typeof data === "function" ? data(userData) : data
    const err = await saveUserData(newData)
    if (!err) {
      if (reload) {
        invalidate()
      } else {
        Object.assign(userData, newData)
      }
      return null
    }
    return err
  }

  if (loading) {
    return <LoadingOverlay />
  }

  if (error) {
    return (
      <div>
        <p className="text-red-500">
          An error occured while loading user data: {error.message}
        </p>
        <button onclick={() => invalidate()}>Retry</button>
      </div>
    )
  }

  return (
    <UserDataContext.Provider
      value={{ userData, loading, setUserData, invalidate }}
    >
      {children}
      {loading && <LoadingOverlay />}
    </UserDataContext.Provider>
  )
}
