// 시연용 가상 강우 모드
// 주소에 ?rain=50 처럼 붙이면 실측 강우 대신 그 값(1시간 강우, mm)으로 경로·위험 구간을 계산한다.
// 화면을 이동해도 유지되도록 sessionStorage에 저장하고, ?rain=off 로 끈다.
const KEY = 'scenarioRainMm'

export function getScenarioRainMm() {
  const param = new URLSearchParams(window.location.search).get('rain')
  if (param !== null) {
    const value = Number(param)
    if (param !== '' && Number.isFinite(value) && value >= 0) {
      sessionStorage.setItem(KEY, String(value))
    } else {
      sessionStorage.removeItem(KEY)
    }
  }

  const stored = sessionStorage.getItem(KEY)
  return stored === null ? null : Number(stored)
}
