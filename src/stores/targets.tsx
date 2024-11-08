import { createStore } from "kaioken"
import { TargetDTO, TargetRecord, db } from "$/idb"

export const useTargets = createStore(null as TargetRecord[] | null, (set) => ({
  addTargets: async (targets: TargetDTO[]) => {
    const newTargets = await Promise.all(
      targets.map((target) => db.target.create(target))
    )
    set((prev) => [...(prev ?? []), ...newTargets])
    return newTargets
  },
  removeTarget: async (tgt: TargetRecord) => {
    await db.target.delete(tgt.id)
    set((prev) => prev?.filter((t) => t.id !== tgt.id) ?? [])
  },
}))

export const loadTargets = async () => {
  return db.target.all()
}
