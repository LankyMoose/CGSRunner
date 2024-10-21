import { useContext } from "kaioken"
import {
  historyFileProvider,
  workspacesFileProvider,
} from "../tauri/storage/userData"
import { createFileProviderContext } from "./createFileProviderContext"

const { context: historyContext, Provider: HistoryProvider } =
  createFileProviderContext(historyFileProvider)
const { context: workspacesContext, Provider: WorkspacesProvider } =
  createFileProviderContext(workspacesFileProvider)

export const useHistory = () => useContext(historyContext)
export const useWorkspaces = () => useContext(workspacesContext)

export const FileProviders: Kaioken.FC = ({ children }) => {
  return (
    <HistoryProvider>
      <WorkspacesProvider>{children}</WorkspacesProvider>
    </HistoryProvider>
  )
}
