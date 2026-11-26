// /api/route 응답 → 화면용 데이터 변환

// 응답 좌표 [경도, 위도] → 카카오맵 좌표 { lat, lng }
export const toLatLng = ([lng, lat]) => ({ lat, lng })

export const lineToPath = (geometry) => geometry?.coordinates?.map(toLatLng) ?? []

export const MODE_META = {
  shortest: { name: '빠른 경로', safe: false },
  balanced: { name: '안전 경로', safe: true },
  safety: { name: '안전 우선 경로', safe: true },
}

export const RECOMMENDED_MODE = 'balanced'

// 등급별 색 (위험도 박스, 지도 원)
export const GRADE_STYLE = {
  안전: { box: 'bg-[#E8ECF4] text-[#1A2A47]', stroke: '#1A2A47', fill: '#5B6E95', line: '#1A2A47' },
  주의: { box: 'bg-[#FFF6DC] text-[#D99A00]', stroke: '#D99A00', fill: '#F2C14E', line: '#E0A100' },
  위험: { box: 'bg-[#FFF0ED] text-[#E24739]', stroke: '#C8553D', fill: '#E8705A', line: '#F06A3C' },
  고위험: { box: 'bg-[#FFE1DC] text-[#C3271A]', stroke: '#A3271A', fill: '#E24739', line: '#D62F24' },
}

/**
 * routes[] → 비교 카드 목록
 * @param {object[]} routes
 * @param {number|null} unavoidableDangerM  응답 최상위 unavoidable_danger_m (어느 길로 가도 지나야 하는 위험 거리)
 */
export function buildRouteCards(routes = [], unavoidableDangerM = 0) {
  const shortest = routes.find((r) => r.mode === 'shortest')
  const unavoidable = unavoidableDangerM ?? 0
  return routes.map((route) => {
    const meta = MODE_META[route.mode] ?? { name: route.mode, safe: false }
    const avoidedSections = route.mode !== 'shortest'
      ? getAvoidedSections(shortest?.danger_sections, route.danger_sections)
      : []
    return {
      mode: route.mode,
      name: meta.name,
      safe: meta.safe,
      recommended: route.mode === RECOMMENDED_MODE,
      time: route.duration_min,
      distanceKm: (route.distance_m / 1000).toFixed(1),
      detourMin: route.detour_min,
      riskCount: route.danger_section_count,
      dangerLength: route.danger_length_m,
      cautionLength: route.caution_length_m ?? 0,
      unavoidableDanger: unavoidable,
      // 이 경로에서 피할 수 있었던 위험 거리 (0 이면 이미 가장 덜 위험한 경로)
      avoidableDanger: Math.max(route.danger_length_m - unavoidable, 0),
      reducedDangerLength: shortest
        ? Math.max(shortest.danger_length_m - route.danger_length_m, 0)
        : 0,
      avoidedSections,
      dangerSections: route.danger_sections ?? [],
      routeGrade: route.route_grade,
      path: lineToPath(route.geometry),
      hazards: route.hazards ?? [],
    }
  })
}

// [경도, 위도] 두 점 사이 대략 거리 (m)
function distanceM([lng1, lat1], [lng2, lat2]) {
  const dy = (lat2 - lat1) * 111320
  const dx = (lng2 - lng1) * 111320 * Math.cos(((lat1 + lat2) / 2) * (Math.PI / 180))
  return Math.hypot(dx, dy)
}

/** 최단 경로의 장소 중 선택한 경로와 구간이 하나도 겹치지 않는 곳 */
export function getAvoidedSections(shortestSections = [], ownSections = []) {
  const ownIds = new Set(ownSections.flatMap((section) => section.segment_ids))
  return shortestSections.filter((section) => !section.segment_ids.some((id) => ownIds.has(id)))
}

/** 서버가 묶은 장소 → 위험 근거 시트 카드 */
export function toSheetHazard(section, { avoided = false } = {}) {
  return {
    id: `section-${section.segment_ids.join('-')}`,
    name: `${section.grade} 구간 약 ${section.length_m}m`,
    level: 'danger',
    label: section.grade,
    type: 'danger',
    description: avoided
      ? '빠른 경로가 지나지만 이 경로에서는 피하는 곳이에요.'
      : `이 경로에서 위험 구간 ${section.length_m}m를 지나가요.`,
    tags: section.reasons,
  }
}

/** rain → 시트 강우 카드 { value, time } */
export function formatRain(rain) {
  if (!rain) return null
  return {
    value: rain.rain_1h_mm,
    time: rain.scenario || !rain.updated_at ? '시나리오' : formatClock(rain.updated_at),
  }
}

export function formatClock(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' })
}

/** "n분 전 갱신" */
export function formatUpdated(rain, now = Date.now()) {
  if (!rain) return ''
  if (rain.scenario) return '시나리오'
  if (!rain.updated_at) return ''
  const minutes = Math.max(Math.floor((now - new Date(rain.updated_at).getTime()) / 60000), 0)
  if (minutes < 1) return '방금 갱신'
  if (minutes < 60) return `${minutes}분 전 갱신`
  return `${formatClock(rain.updated_at)} 갱신`
}

/**
 * 경로 선에서 위험 구간에 해당하는 부분만 잘라 등급별로 묶기
 * 구간(최대 25m) 가운데에서 HAZARD_RADIUS_M 안에 있는 선 조각을 위험 구간으로 봄
 * @returns {{ grade: string, path: {lat, lng}[] }[]}
 */
const HAZARD_RADIUS_M = 15
const STEP_M = 8

// 긴 선분을 STEP_M 간격으로 쪼개서 위험 구간 경계가 정확히 잘리게 함
function densify(path) {
  const out = [path[0]]
  for (let i = 0; i < path.length - 1; i += 1) {
    const a = path[i]
    const b = path[i + 1]
    const steps = Math.max(Math.ceil(distanceM([a.lng, a.lat], [b.lng, b.lat]) / STEP_M), 1)
    for (let s = 1; s <= steps; s += 1) {
      const t = s / steps
      out.push({ lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t })
    }
  }
  return out
}

export function riskRuns(rawPath = [], hazards = []) {
  if (rawPath.length < 2 || hazards.length === 0) return []
  const path = densify(rawPath)
  const runs = []
  let current = null
  for (let i = 0; i < path.length - 1; i += 1) {
    const a = path[i]
    const b = path[i + 1]
    const mid = [(a.lng + b.lng) / 2, (a.lat + b.lat) / 2]
    const hit = hazards.find((h) => distanceM(mid, h.location) <= HAZARD_RADIUS_M)
    if (hit && current?.grade === hit.grade) {
      current.path.push(b)
    } else if (hit) {
      current = { grade: hit.grade, path: [a, b] }
      runs.push(current)
    } else {
      current = null
    }
  }
  return runs
}
