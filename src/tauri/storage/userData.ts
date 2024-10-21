import { __DEV__ } from "../../env"
import { ScriptJob } from "../../types"
import { FileProvider } from "./fileProvider"

type TimeStamp = string

export type UserWorkspaces = {
  version: string
  workspaces: string[]
}
export type UserHistory = {
  version: string
  history: Record<TimeStamp, ScriptJob>
}

export const workspacesFileProvider = new FileProvider<UserWorkspaces>({
  fileName: "workspaces.json",
  defaultData: {
    version: "0.0.0",
    workspaces: [],
  },
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
