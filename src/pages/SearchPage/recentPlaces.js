// 최근 선택한 장소 (브라우저 localStorage에 30일 동안 보관)
const KEY = 'recentPlaces'
const KEEP_MS = 30 * 24 * 60 * 60 * 1000
const MAX_ITEMS = 20

export function loadRecentPlaces(now = Date.now()) {
  try {
    const items = JSON.parse(localStorage.getItem(KEY)) ?? []
    return items.filter((item) => now - item.selectedAt < KEEP_MS)
  } catch {
    return []
  }
}

/** 장소를 맨 앞에 추가 (같은 장소가 있으면 앞으로 옮김) */
export function addRecentPlace({ id, name, address, lat, lng }, now = Date.now()) {
  const rest = loadRecentPlaces(now).filter((item) => item.id !== id)
  const items = [{ id, name, address, lat, lng, selectedAt: now }, ...rest].slice(0, MAX_ITEMS)
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    // 저장 공간이 없거나 막힌 경우: 최근 목록만 저장되지 않음
  }
  return items
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
