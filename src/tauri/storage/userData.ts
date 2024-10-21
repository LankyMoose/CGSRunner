import { __DEV__ } from "../../env"
import { ScriptJob } from "../../types"
import { FileHandler } from "./fs"

type TimeStamp = string

export type UserWorkspaces = {
  version: string
  workspaces: string[]
}
export type UserHistory = {
  version: string
  history: Record<TimeStamp, ScriptJob>
}

export const workspacesFileHandler = new FileHandler<UserWorkspaces>({
  fileName: "workspaces.json",
  defaultData: {
    version: "0.0.0",
    workspaces: [],
  } as UserWorkspaces,
  validate: (data): data is UserWorkspaces => {
    return (
      typeof data === "object" &&
      !!data &&
      "version" in data &&
      "workspaces" in data &&
      Array.isArray(data.workspaces)
    )
  },
})

export const historyFileHandler = new FileHandler<UserHistory>({
  fileName: "history.json",
  defaultData: {
    version: "0.0.0",
    history: {},
  } as UserHistory,
  validate: (data): data is UserHistory => {
    return (
      typeof data === "object" &&
      !!data &&
      "version" in data &&
      "history" in data
    )
  },
})
