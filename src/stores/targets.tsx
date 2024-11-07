import { createStore } from "kaioken"
import { UserTargets, targetsFileProvider } from "../tauri/storage/userData"

export const useTargets = createStore(
  null as UserTargets | null,
  (set, get) => ({
    async setData(setter: Kaioken.StateSetter<UserTargets>) {
      const data = get()
      if (!data) return null
      const newData = setter instanceof Function ? setter({ ...data }) : setter
      const err = await targetsFileProvider.save(newData)
      if (!err) {
        Object.assign(data, newData)
        set(newData)
        return null
      }
      return err
    },
  })
)

export const loadTargets = async () => {
  const [err, data] = await targetsFileProvider.load()
  if (err) throw new Error(err)
  return data
}
