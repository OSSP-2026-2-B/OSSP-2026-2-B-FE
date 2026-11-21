import { useEffect, useState } from 'react'
import { GANGNAM_STATION, PILOT_RADIUS_M, useKakaoMapLoader } from '../../shared/kakao'

const DEBOUNCE_MS = 300

const toPlace = (doc) => ({
  id: doc.id,
  name: doc.place_name,
  address: doc.road_address_name || doc.address_name,
  lat: Number(doc.y),
  lng: Number(doc.x),
  distanceM: doc.distance ? Number(doc.distance) : null,
})

/**
 * 카카오 장소 키워드 검색. 경로 API가 받는 범위(강남역 반경 1km) 안의 장소만 찾는다.
 * @returns {{ status: 'idle' | 'loading' | 'ok' | 'empty' | 'error', places: object[] }}
 */
export default function usePlaceSearch(query) {
  const [sdkLoading, sdkError] = useKakaoMapLoader()
  const [result, setResult] = useState({ keyword: '', status: 'idle', places: [] })
  const keyword = query.trim()

  useEffect(() => {
    if (sdkLoading || sdkError || !keyword) return
    let ignore = false

    const timer = setTimeout(() => {
      const { maps } = window.kakao
      // 개발 중 핫 리로드로 services 없이 로드된 SDK가 남아 있으면 검색할 수 없다 (새로고침하면 해결)
      if (!maps.services) {
        setResult({ keyword, status: 'error', places: [] })
        return
      }
      const { Status, SortBy } = maps.services
      new maps.services.Places().keywordSearch(
        keyword,
        (data, status) => {
          if (ignore) return
          if (status === Status.OK) setResult({ keyword, status: 'ok', places: data.map(toPlace) })
          else if (status === Status.ZERO_RESULT) setResult({ keyword, status: 'empty', places: [] })
          else setResult({ keyword, status: 'error', places: [] })
        },
        {
          location: new maps.LatLng(GANGNAM_STATION.lat, GANGNAM_STATION.lng),
          radius: PILOT_RADIUS_M,
          sort: SortBy.ACCURACY,
        },
      )
    }, DEBOUNCE_MS)

    return () => {
      ignore = true
      clearTimeout(timer)
    }
  }, [keyword, sdkLoading, sdkError])

  if (!keyword) return { status: 'idle', places: [] }
  if (sdkError) return { status: 'error', places: [] }
  // 입력이 바뀌었는데 아직 그 검색어 결과가 오지 않았으면 검색 중
  if (result.keyword !== keyword) return { status: 'loading', places: [] }
  return { status: result.status, places: result.places }
}
