import { useState } from 'react'
import { RouteSearchContext } from './routeSearchContext'

export default function RouteSearchProvider({ children }) {
  // 화면 간 출발지, 도착지 공유
  const [from, setFrom] = useState('신논현역 5번 출구')
  const [to, setTo] = useState('')
  // 검색 결과를 적용할 화면과 항목
  const [searchTarget, setSearchTarget] = useState({ page: '/home', field: 'to' })

  return (
    <RouteSearchContext.Provider value={{ from, to, setFrom, setTo, searchTarget, setSearchTarget }}>
      {children}
    </RouteSearchContext.Provider>
  )
}
