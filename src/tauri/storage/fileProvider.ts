import {
  exists,
  readTextFile,
  writeTextFile,
  BaseDirectory,
} from "@tauri-apps/plugin-fs"
import { join } from "@tauri-apps/api/path"

const DIR_OPTIONS = {
  baseDir: BaseDirectory.Document,
}

export enum LoadError {
  READ_FAILURE = "READ_FAILURE",
  PARSE_FAILURE = "PARSE_FAILURE",
  VALIDATION_FAILURE = "VALIDATION_FAILURE",
}
export enum SaveError {
  WRITE_FAILURE = "WRITE_FAILURE",
  VALIDATION_FAILURE = "VALIDATION_FAILURE",
}

export type LoadResult<T> = [null, T] | [LoadError, null]

export class FileProvider<T> {
  constructor(
    private options: {
      fileName: string
      defaultData: T
      validate: (data: unknown) => data is T
    }
  ) {}
  async load(): Promise<LoadResult<T>> {
    const fileExists = await exists(
      await join(this.options.fileName),
      DIR_OPTIONS
    )
    if (!fileExists) await this.save(this.options.defaultData)

    let content: string, parsed: unknown
    try {
      content = await readTextFile(
        await join(this.options.fileName),
        DIR_OPTIONS
      )
    } catch (error) {
      alert(error)
      return [LoadError.READ_FAILURE, null]
    }
    try {
      parsed = JSON.parse(content)
    } catch (e) {
      console.error(e)

      return [LoadError.PARSE_FAILURE, null]
    }

    if (!this.options.validate(parsed)) {
      return [LoadError.VALIDATION_FAILURE, null]
    }

    return [null, parsed]
  }

  async save(data: T): Promise<null | SaveError> {
    if (!this.options.validate(data)) {
      return SaveError.VALIDATION_FAILURE
    }
    try {
      await writeTextFile(
        await join(this.options.fileName),
        JSON.stringify(data, null, 2),
        DIR_OPTIONS
      )

      return null
    } catch (error) {
      alert(error)
      return SaveError.WRITE_FAILURE
    }
  }
}
