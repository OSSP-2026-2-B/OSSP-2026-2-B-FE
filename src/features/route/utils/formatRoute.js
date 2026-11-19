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

/** routes[] → 비교 카드 목록 */
export function buildRouteCards(routes = []) {
  const shortest = routes.find((r) => r.mode === 'shortest')
  return routes.map((route) => {
    const meta = MODE_META[route.mode] ?? { name: route.mode, safe: false }
    const avoided = shortest && route.mode !== 'shortest'
      ? Math.max(shortest.risk_segment_count - route.risk_segment_count, 0)
      : 0
    return {
      mode: route.mode,
      name: meta.name,
      safe: meta.safe,
      recommended: route.mode === RECOMMENDED_MODE,
      time: route.duration_min,
      distanceKm: (route.distance_m / 1000).toFixed(1),
      detourMin: route.detour_min,
      riskCount: route.risk_segment_count,
      dangerLength: route.danger_length_m,
      shortestRiskCount: shortest?.risk_segment_count ?? 0,
      avoided,
      maxGrade: route.max_grade,
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

/**
 * 이어진(25m 단위) 같은 등급·같은 이유의 구간을 하나로 묶기
 * hazards 는 경로 순서로 오고, 구간 가운데끼리 40m 이내면 이어진 것으로 봄
 */
export function groupHazards(hazards = []) {
  const groups = []
  for (const hazard of hazards) {
    const last = groups.at(-1)
    const reasonKey = hazard.reasons.join('|')
    const continuous = last
      && last.grade === hazard.grade
      && last.reasonKey === reasonKey
      && distanceM(last.locations.at(-1), hazard.location) <= 40
    if (continuous) {
      last.segmentIds.push(hazard.segment_id)
      last.locations.push(hazard.location)
      last.risk = Math.max(last.risk, hazard.risk)
    } else {
      groups.push({
        grade: hazard.grade,
        reasons: hazard.reasons,
        reasonKey,
        risk: hazard.risk,
        segmentIds: [hazard.segment_id],
        locations: [hazard.location],
      })
    }
  }
  return groups.map((g) => ({
    id: `seg-${g.segmentIds[0]}`,
    grade: g.grade,
    reasons: g.reasons,
    risk: g.risk,
    segmentIds: g.segmentIds,
    // 묶음 가운데 구간 위치
    center: toLatLng(g.locations[Math.floor(g.locations.length / 2)]),
    count: g.segmentIds.length,
  }))
}

/** 묶은 구간 → 위험 근거 시트 카드 */
export function toSheetHazard(group, { avoided = false } = {}) {
  const lengthText = group.count > 1 ? ` 약 ${group.count * 25}m` : ''
  return {
    id: group.id,
    name: `${group.grade} 구간${lengthText}`,
    level: 'danger',
    label: group.grade,
    type: 'danger',
    description: `${avoided ? '빠른 경로가 지나는 구간이에요. ' : ''}위험도 ${Math.round(group.risk * 100)}%`,
    tags: group.reasons,
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
