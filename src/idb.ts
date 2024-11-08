import { idb, model, Field, InferDto, InferRecord } from "async-idb-orm"

export const target = model({
  id: Field.string({ default: () => crypto.randomUUID(), key: true }),
  path: Field.string(),
  dir: Field.boolean({ optional: true }),
})

export type TargetDTO = InferDto<typeof target>
export type TargetRecord = InferRecord<typeof target>

export const history = model({
  id: Field.string({ default: () => crypto.randomUUID(), key: true }),
  script: Field.string(),
  scriptPath: Field.string(),
})

export type HistoryDTO = InferDto<typeof history>
export type HistoryRecord = InferRecord<typeof history>

export const jobResult = model({
  id: Field.string({ default: () => crypto.randomUUID(), key: true }),
  historyId: Field.string(),
  target: Field.string(),
  stdout: Field.string(),
  stderr: Field.string(),
  code: Field.number({ optional: true }),
})

export type JobResultDTO = InferDto<typeof jobResult>
export type JobResultRecord = InferRecord<typeof jobResult>

export const db = idb(
  "CGSRunner",
  {
    target,
    history,
    jobResult,
  },
  1_0_0
)
