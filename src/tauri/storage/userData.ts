import { __DEV__ } from "../../env"
import { ScriptJob } from "../../types"
import { FileProvider } from "./fileProvider"

type TimeStamp = string

type UserTarget = {
  path: string
  dir?: boolean
}

export type UserTargets = {
  version: string
  targets: UserTarget[]
}
export type UserHistory = {
  version: string
  history: Record<TimeStamp, ScriptJob>
}

export const targetsFileProvider = new FileProvider<UserTargets>({
  fileName: "targets.json",
  defaultData: {
    version: "0.0.0",
    targets: [],
  },
  validate: (data): data is UserTargets => {
    return (
      typeof data === "object" &&
      !!data &&
      "version" in data &&
      "targets" in data &&
      Array.isArray(data.targets)
    )
  },
})

export const historyFileProvider = new FileProvider<UserHistory>({
  fileName: "history.json",
  defaultData: {
    version: "0.0.0",
    history: {},
  },
  validate: (data): data is UserHistory => {
    return (
      typeof data === "object" &&
      !!data &&
      "version" in data &&
      "history" in data
    )
  },
})
