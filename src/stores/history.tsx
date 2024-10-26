import { createStore } from "kaioken"
import { UserHistory, historyFileProvider } from "../tauri/storage/userData"

export const useHistory = createStore(
  null as UserHistory | null,
  (set, get) => ({
    async setData(setter: Kaioken.StateSetter<UserHistory>) {
      const data = get()
      if (!data) return null
      const newData = setter instanceof Function ? setter({ ...data }) : setter
      const err = await historyFileProvider.save(newData)
      if (!err) {
        Object.assign(data, newData)
        set(newData)
        return null
      }
      return err
    },
  })
)

export const loadHistory = async () => {
  const [err, data] = await historyFileProvider.load()
  if (err) throw new Error(err)
  return data
}
