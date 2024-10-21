import {
  ElementProps,
  Portal,
  Transition,
  useRef,
  type TransitionState,
} from "kaioken"

export function Modal({
  open,
  setOpen,
  children,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  children: JSX.Children
}) {
  return (
    <Portal container={document.getElementById("modal-root")!}>
      <Transition
        in={open}
        element={(state) => (
          <ModalDisplay state={state} close={() => setOpen(false)}>
            {children}
          </ModalDisplay>
        )}
      />
    </Portal>
  )
}

type ModalProps = {
  state: TransitionState
  close: () => void
  children: JSX.Children
}

function ModalDisplay({ state, close, children }: ModalProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  if (state == "exited") return null
  const opacity = state === "entered" ? "1" : "0"
  const scale = state === "entered" ? 1 : 0.85
  const translateY = state === "entered" ? -50 : -25
  return (
    <Backdrop
      ref={wrapperRef}
      onclick={(e) => e.target === wrapperRef.current && close()}
      style={{ opacity }}
    >
      <div
        className="modal"
        style={{
          transform: `translate(-50%, ${translateY}%) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </Backdrop>
  )
}

function Backdrop({ children, ...props }: ElementProps<"div">) {
  return (
    <div {...props} className="modal-backdrop">
      {children}
    </div>
  )
}
