import { useEffect, useState } from 'react'
import { RouteSearchContext } from './routeSearchContext'
import { PLACES } from './data/places'

const STORAGE_KEY = 'routeSearch'
const DEFAULT_TARGET = { page: '/home', field: 'to' }

function loadSearch() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY))
    if (!saved || typeof saved !== 'object') return null
    const validPlace = (place) => place === null || (typeof place?.name === 'string' && Number.isFinite(place.lat) && Number.isFinite(place.lng))
    if (!validPlace(saved.from) || !validPlace(saved.to)) return null
    const target = saved.searchTarget
    return { ...saved, searchTarget: ['/home', '/main'].includes(target?.page) && ['from', 'to'].includes(target?.field) ? target : DEFAULT_TARGET }
  } catch {
    return null
  }
}

export default function RouteSearchProvider({ children }) {
  const [saved] = useState(loadSearch)
  // 화면 간 출발지, 도착지 공유 ({ id, name, address, lat, lng } 또는 null)
  const [from, setFrom] = useState(saved ? saved.from : PLACES.sinnonhyeonExit5)
  const [to, setTo] = useState(saved?.to ?? null)
  // 검색 결과를 적용할 화면과 항목
  const [searchTarget, setSearchTarget] = useState(saved?.searchTarget ?? DEFAULT_TARGET)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ from, to, searchTarget }))
    } catch {
      // 저장이 차단된 환경에서도 현재 화면의 검색은 유지합니다.
    }
  }, [from, to, searchTarget])

  return (
    <RouteSearchContext.Provider value={{ from, to, setFrom, setTo, searchTarget, setSearchTarget }}>
      {children}
    </RouteSearchContext.Provider>
  )
}
