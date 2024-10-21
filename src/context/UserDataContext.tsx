import { createContext, useAsync, useContext } from "kaioken"
import {
  historyFileHandler,
  workspacesFileHandler,
  UserHistory,
  UserWorkspaces,
} from "../tauri/storage/userData"

type UserDataCtx = {
  history: UserHistory | null
  setHistory: (
    data: Kaioken.StateSetter<UserHistory>
  ) => ReturnType<typeof historyFileHandler.save>
  invalidateHistory: () => void
  loadingHistory: boolean
  workspaces: UserWorkspaces | null
  setWorkspaces: (
    data: Kaioken.StateSetter<UserWorkspaces>
  ) => ReturnType<typeof workspacesFileHandler.save>
  invalidateWorkspaces: () => void
  loadingWorkspaces: boolean
}

const UserDataContext = createContext<UserDataCtx>(null as any)

export const useUserData = () => useContext(UserDataContext)

export const UserDataProvider: Kaioken.FC = ({ children }) => {
  const {
    data: history,
    loading: loadingHistory,
    error: errorHistory,
    invalidate: invalidateHistory,
  } = useAsync(async () => {
    const [err, data] = await historyFileHandler.load()
    if (err) throw new Error(err)
    return data
  }, [])

  const {
    data: workspaces,
    loading: loadingWorkspaces,
    error: errorWorkspaces,
    invalidate: invalidateWorkspaces,
  } = useAsync(async () => {
    const [err, data] = await workspacesFileHandler.load()
    if (err) throw new Error(err)
    return data
  }, [])

  async function setHistory(data: Kaioken.StateSetter<UserHistory>) {
    if (!history) return null
    const newData = typeof data === "function" ? data(history) : data
    const err = await historyFileHandler.save(newData)
    if (!err) {
      Object.assign(history, newData)
      invalidateHistory()
      return null
    }
    return err
  }

  async function setWorkspaces(data: Kaioken.StateSetter<UserWorkspaces>) {
    if (!workspaces) return null
    const newData = typeof data === "function" ? data(workspaces) : data
    const err = await workspacesFileHandler.save(newData)
    if (!err) {
      Object.assign(workspaces, newData)
      invalidateWorkspaces()
      return null
    }
    return err
  }

  if (errorHistory) {
    return (
      <div>
        <p className="text-red-500">
          An error occured while loading history: {errorHistory.message}
        </p>
        <button onclick={() => invalidateHistory()}>Retry</button>
      </div>
    )
  }
  if (errorWorkspaces) {
    return (
      <div>
        <p className="text-red-500">
          An error occured while loading history: {errorWorkspaces.message}
        </p>
        <button onclick={() => invalidateWorkspaces()}>Retry</button>
      </div>
    )
  }

  return (
    <UserDataContext.Provider
      value={{
        history,
        setHistory,
        invalidateHistory,
        loadingHistory,
        workspaces,
        setWorkspaces,
        invalidateWorkspaces,
        loadingWorkspaces,
      }}
    >
      {children}
    </UserDataContext.Provider>
  )
}
