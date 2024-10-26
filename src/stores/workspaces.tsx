import { createStore } from "kaioken"
import {
  UserWorkspaces,
  workspacesFileProvider,
} from "../tauri/storage/userData"

export const useWorkspaces = createStore(
  null as UserWorkspaces | null,
  (set, get) => ({
    async setData(setter: Kaioken.StateSetter<UserWorkspaces>) {
      const data = get()
      if (!data) return null
      const newData = setter instanceof Function ? setter({ ...data }) : setter
      const err = await workspacesFileProvider.save(newData)
      if (!err) {
        Object.assign(data, newData)
        set(newData)
        return null
      }
      return err
    },
  })
)

export const loadWorkspaces = async () => {
  const [err, data] = await workspacesFileProvider.load()
  if (err) throw new Error(err)
  return data
}
