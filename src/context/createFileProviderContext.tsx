import { createContext, useAsync, useContext } from "kaioken"
import { FileProvider, SaveError } from "../tauri/storage/fileProvider"

type FileProviderContext<T> = {
  data: T | null
  loading: boolean
  error: Error | null
  invalidate: () => void
  setData: (data: Kaioken.StateSetter<T>) => Promise<SaveError | null>
}

const contexts = new Map<
  FileProvider<any>,
  Kaioken.Context<FileProviderContext<any>>
>()

export const useFileProvider = <T,>(fileProvider: FileProvider<T>) =>
  useContext(contexts.get(fileProvider)!) as FileProviderContext<T>

export const createFileProviderContext = <T,>(
  fileProvider: FileProvider<T>
) => {
  const context = createContext(null as any as FileProviderContext<T>)
  contexts.set(fileProvider, context)

  const Provider: Kaioken.FC = ({ children }) => {
    const { data, loading, error, invalidate } = useAsync(async () => {
      const [err, data] = await fileProvider.load()
      if (err) throw new Error(err)
      return data
    }, [])

    async function setData(setter: Kaioken.StateSetter<T>) {
      if (!data) return null
      const newData = setter instanceof Function ? setter({ ...data }) : setter
      const err = await fileProvider.save(newData)
      if (!err) {
        Object.assign(data, newData)
        invalidate()
        return null
      }
      return err
    }

    if (error) {
      return (
        <div>
          <p className="text-red-500">
            An error occured while loading: {error.message}
          </p>
          <button onclick={() => invalidate()}>Retry</button>
        </div>
      )
    }
    return (
      <context.Provider value={{ data, loading, error, invalidate, setData }}>
        {children}
      </context.Provider>
    )
  }

  return { context, Provider }
}
