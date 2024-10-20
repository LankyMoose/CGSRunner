import {
  exists,
  readTextFile,
  BaseDirectory,
  writeTextFile,
} from "@tauri-apps/plugin-fs"
import { __DEV__ } from "../../env"
import { ScriptJob } from "../../types"

type TimeStamp = string

export type UserData = {
  version: string
  workspaces: string[]
  history: Record<TimeStamp, ScriptJob>
}
export enum UserDataLoadError {
  READ_FAILURE = "READ_FAILURE",
  PARSE_FAILURE = "PARSE_FAILURE",
  VALIDATION_FAILURE = "VALIDATION_FAILURE",
}
export enum UserDataSaveError {
  WRITE_FAILURE = "WRITE_FAILURE",
  VALIDATION_FAILURE = "VALIDATION_FAILURE",
}

export type LoadUserDataResult = [null, UserData] | [UserDataLoadError, null]

const FILE_NAME = "user_data.json"
const DIR_OPTIONS = {
  baseDir: __DEV__ ? BaseDirectory.Desktop : BaseDirectory.AppData,
}
export const DEFAULT_USER_DATA = {
  version: "1",
  workspaces: [],
  history: {},
} as const satisfies UserData

// if (__DEV__) {
//   const devStartData = DEFAULT_USER_DATA
//   await saveUserData(devStartData)
// }

function validateUserData(thing: unknown): thing is UserData {
  return typeof thing === "object"
}

export async function loadUserData(): Promise<LoadUserDataResult> {
  const fileExists = await exists(FILE_NAME, DIR_OPTIONS)
  if (!fileExists) await saveUserData(DEFAULT_USER_DATA)

  let content: string, parsed: unknown
  try {
    content = await readTextFile(FILE_NAME, DIR_OPTIONS)
  } catch (error) {
    console.error(error)
    return [UserDataLoadError.READ_FAILURE, null]
  }
  try {
    parsed = JSON.parse(content)
  } catch (e) {
    console.error(e)
    return [UserDataLoadError.PARSE_FAILURE, null]
  }

  if (!validateUserData(parsed)) {
    return [UserDataLoadError.VALIDATION_FAILURE, null]
  }

  return [null, parsed]
}

export async function saveUserData(
  data: UserData
): Promise<null | UserDataSaveError> {
  if (!validateUserData(data)) {
    return UserDataSaveError.VALIDATION_FAILURE
  }
  try {
    await writeTextFile(FILE_NAME, JSON.stringify(data, null, 2), DIR_OPTIONS)
    return null
  } catch (error) {
    console.error(error)
    return UserDataSaveError.WRITE_FAILURE
  }
}
