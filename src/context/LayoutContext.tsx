import { createContext, useContext, useState, useVNode } from "kaioken"

type LayoutCtx = {
  useHeightOffset: () => number
  registerHeightOffset: (element: HTMLElement) => void
}

const LayoutContext = createContext<LayoutCtx>({
  useHeightOffset: () => 0,
  registerHeightOffset: () => {},
})

export const useLayout = () => useContext(LayoutContext)

export const LayoutProvider: Kaioken.FC = ({ children }) => {
  const [heightOffset, setHeightOffset] = useState(0)
  const [vNodeToHeightMap] = useState(() => new Map<Kaioken.VNode, number>())
  const [registeredElements, setRegisteredElements] = useState(
    () => new Set<Element>()
  )
  const useHeightOffset = () => {
    const vNode = useVNode()
    if (!vNodeToHeightMap.has(vNode)) {
      vNodeToHeightMap.set(vNode, heightOffset)
    }
    return vNodeToHeightMap.get(vNode)!
  }
  const registerHeightOffset = (element: HTMLElement) => {
    if (registeredElements.has(element)) {
      return
    }
    const height = element.getBoundingClientRect().height
    setRegisteredElements((prev) => {
      return new Set(prev).add(element)
    })
    setHeightOffset((prev) => prev + height)
  }
  return (
    <LayoutContext.Provider value={{ useHeightOffset, registerHeightOffset }}>
      {children}
    </LayoutContext.Provider>
  )
}
