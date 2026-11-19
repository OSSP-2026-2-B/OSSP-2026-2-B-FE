import api from '../../../shared/api/axios'

/**
 * POST /api/route
 * @param {{ start: {lat, lng}, end: {lat, lng}, modes?: string[], rainMm?: number, closures?: {lat, lng}[] }} params
 * @param {AbortSignal} [signal]
 */
export async function postRoute({ start, end, modes, rainMm, closures }, signal) {
  const body = {
    start: { lat: start.lat, lng: start.lng },
    end: { lat: end.lat, lng: end.lng },
  }
  if (modes) body.modes = modes
  if (rainMm != null) body.rain_mm = rainMm
  if (closures?.length) body.closures = closures

  const { data } = await api.post('/api/route', body, { signal })
  return data
}
