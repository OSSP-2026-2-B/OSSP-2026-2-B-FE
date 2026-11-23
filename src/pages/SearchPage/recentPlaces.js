// 최근 선택한 장소 (브라우저 localStorage에 30일 동안 보관)
const KEY = 'recentPlaces'
const KEEP_MS = 30 * 24 * 60 * 60 * 1000
const MAX_ITEMS = 20

function loadHistory(now) {
  try {
    const items = JSON.parse(localStorage.getItem(KEY)) ?? []
    if (!Array.isArray(items)) return []
    return items.filter((item) => item && typeof item.name === 'string' && Number.isFinite(item.lat) && Number.isFinite(item.lng))
      .map((item) => {
        // 기존 기록은 마지막 선택 한 번으로 이관합니다.
        const selections = (Array.isArray(item.selections) ? item.selections : [item.selectedAt])
          .filter((time) => Number.isFinite(time) && time <= now && now - time < KEEP_MS)
        return { ...item, selections, selectedAt: Math.max(...selections), count: selections.length }
      })
      .filter((item) => item.count > 0)
      .sort((a, b) => b.selectedAt - a.selectedAt)
  } catch {
    return []
  }
}

export function loadRecentPlaces(now = Date.now()) {
  return loadHistory(now).slice(0, MAX_ITEMS)
}

/** 최근 30일간 선택 횟수 순, 동률이면 최근 선택 순 */
export function loadFrequentPlaces(now = Date.now()) {
  return loadHistory(now)
    .filter((place) => typeof place.address === 'string' && place.address.trim())
    .sort((a, b) => b.count - a.count || b.selectedAt - a.selectedAt)
    .slice(0, 3)
}

/** 검색 결과·최근 장소에서 실제로 선택했을 때 한 번 집계 */
export function addRecentPlace({ id, name, address, lat, lng }, now = Date.now()) {
  const history = loadHistory(now)
  const previous = history.find((item) => item.id === id)
  const rest = history.filter((item) => item.id !== id)
  const selections = [...(previous?.selections ?? []), now]
  const items = [{ id, name, address, lat, lng, selectedAt: now, selections, count: selections.length }, ...rest]
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    // 저장 공간이 없거나 막힌 경우에도 장소 선택은 계속 진행합니다.
  }
  return items.slice(0, MAX_ITEMS)
}

/** 오늘: "오후 2:14", 어제: "어제", 그 전: "11월 10일" */
export function formatSelectedAt(time, now = new Date()) {
  const date = new Date(time)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  if (time >= startOfToday) {
    return date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })
  }
  if (time >= startOfToday - 24 * 60 * 60 * 1000) return '어제'
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}
