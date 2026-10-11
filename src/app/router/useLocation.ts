import { useEffect, useState } from "react"
export function useLocation() {
  const read = () => ({
    pathname: window.location.pathname,
    search: window.location.search,
  })
  const [location, setLocation] = useState(read)
  useEffect(() => {
    const update = () => setLocation(read())
    window.addEventListener("popstate", update)
    return () => window.removeEventListener("popstate", update)
  }, [])
  return location
}
