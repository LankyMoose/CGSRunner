import { createStore } from "kaioken"
import { HistoryDTO, HistoryRecord, db } from "$/idb"

export const useHistory = createStore(
  null as HistoryRecord[] | null,
  (set) => ({
    addHistory: async (history: HistoryDTO) => {
      const newRecord = await db.history.create(history)
      set((prev) => [...(prev ?? []), newRecord])
      return newRecord
    },
    removeHistory: async (history: HistoryRecord) => {
      const results = await db.jobResult.findMany(
        (r) => r.historyId === history.id
      )
      await Promise.all(results.map((r) => db.jobResult.delete(r.id)))
      await db.history.delete(history.id)
      set((prev) => prev?.filter((h) => h.id !== history.id) ?? [])
    },
  })
)

export const loadHistory = async () => {
  return db.history.all()
}
