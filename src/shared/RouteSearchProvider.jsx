import { useState } from 'react'
import { RouteSearchContext } from './routeSearchContext'
import { PLACES } from './data/places'

export default function RouteSearchProvider({ children }) {
  // 화면 간 출발지, 도착지 공유 ({ id, name, address, lat, lng } 또는 null)
  const [from, setFrom] = useState(PLACES.sinnonhyeonExit5)
  const [to, setTo] = useState(null)
  // 검색 결과를 적용할 화면과 항목
  const [searchTarget, setSearchTarget] = useState({ page: '/home', field: 'to' })

  return (
    <RouteSearchContext.Provider value={{ from, to, setFrom, setTo, searchTarget, setSearchTarget }}>
      {children}
    </RouteSearchContext.Provider>
  )
}
