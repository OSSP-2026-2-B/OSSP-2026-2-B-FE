import { waitForServer } from './axios'

// 배포 서버는 15분 미사용 시 잠들어 첫 요청에 약 1분이 걸리므로 미리 깨워 둔다
export function wakeServer() {
  return waitForServer()
}
