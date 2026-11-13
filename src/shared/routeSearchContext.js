import { createContext, useContext } from 'react'

export const RouteSearchContext = createContext(null)

export function useRouteSearch() {
  return useContext(RouteSearchContext)
}
