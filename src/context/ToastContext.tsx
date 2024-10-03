import {
  createContext,
  memo,
  Portal,
  Transition,
  TransitionState,
  useContext,
  useEffect,
  useState,
} from "kaioken"

type Toast = {
  ts: number
  type: "info" | "success" | "warning" | "error"
  message: string
  expires: number
  expired?: boolean
}

const defaultDuration = 3000

const ToastContext = createContext<{
  showToast: (type: Toast["type"], message: string) => void
}>(null as any)

export const useToast = () => useContext(ToastContext)

export const ToastContextProvider: Kaioken.FC = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setToasts((prev) =>
        prev.map((toast) => {
          if (toast.expired) {
            return toast
          }
          return {
            ...toast,
            expired: Date.now() > toast.expires,
          }
        })
      )
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const showToast = (
    type: Toast["type"],
    message: string,
    duration?: number
  ) => {
    const ts = Date.now()
    const toast = {
      ts,
      type,
      message,
      expires: ts + (duration ?? defaultDuration),
    }
    setToasts((prev) => [...prev, toast])
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Portal container={() => document.getElementById("toast-root")!}>
        {toasts.map((toast, i) => (
          <Transition
            key={toast.ts}
            in={!toast.expired}
            duration={{
              in: 50,
              out: 300,
            }}
            onTransitionEnd={(state) => {
              if (state === "exited") {
                setToasts((prev) => prev.filter((t) => t.ts !== toast.ts))
              }
            }}
            element={(state) => <ToastItem toast={toast} state={state} i={i} />}
          />
        ))}
      </Portal>
    </ToastContext.Provider>
  )
}

const ToastItem = memo(
  ({
    toast,
    state,
    i,
  }: {
    toast: Toast
    state: TransitionState
    i: number
  }) => {
    if (state == "exited") return null
    const translateX = state === "entered" ? 0 : 250
    const translateY = i * 70
    return (
      <div
        style={{
          transform: `translate(${translateX}px, ${translateY}px)`,
        }}
        className={`toast toast-${toast.type}`}
      >
        <span className="toast-message">{toast.message}</span>
      </div>
    )
  }
)
