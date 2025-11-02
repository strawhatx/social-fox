"use client"

import { useEffect, useState } from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 996px)")
    const onChange = () => {
      setIsMobile(window.innerWidth < 996)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < 996)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
