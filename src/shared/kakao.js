import { useKakaoLoader } from 'react-kakao-maps-sdk'

// 경로 API 시범 지역: 강남역 반경 1km
export const GANGNAM_STATION = { lat: 37.4979, lng: 127.0276 }
export const PILOT_RADIUS_M = 1000

// 카카오 SDK는 한 번만 불러오므로 모든 화면이 같은 옵션을 써야 한다 (옵션이 다르면 오류)
export function useKakaoMapLoader() {
  return useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
    libraries: ['services'],
  })
}
