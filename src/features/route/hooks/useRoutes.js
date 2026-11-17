import { useCallback, useEffect, useState } from 'react'
import { postRoute } from '../api/routeApi'
import { isCanceled } from '../../../shared/api/errors'

const MODES = ['shortest', 'balanced']

// 출발·도착 좌표가 바뀔 때마다 경로를 다시 계산
export default function useRoutes(start, end) {
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState({ key: null, data: null, error: null })

  const startLat = start?.lat
  const startLng = start?.lng
  const endLat = end?.lat
  const endLng = end?.lng
  const ready = startLat != null && startLng != null && endLat != null && endLng != null
  const key = ready ? `${startLat},${startLng}|${endLat},${endLng}|${reloadKey}` : null

  useEffect(() => {
    if (!key) return
    const controller = new AbortController()
    postRoute(
      { start: { lat: startLat, lng: startLng }, end: { lat: endLat, lng: endLng }, modes: MODES },
      controller.signal,
    )
      .then((data) => setResult({ key, data, error: null }))
      .catch((error) => {
        if (!isCanceled(error)) setResult({ key, data: null, error })
      })
    return () => controller.abort()
  }, [key, startLat, startLng, endLat, endLng])

  const retry = useCallback(() => setReloadKey((k) => k + 1), [])
  const settled = key !== null && result.key === key

  return {
    loading: key !== null && !settled,
    data: settled ? result.data : null,
    error: settled ? result.error : null,
    retry,
  }
}
