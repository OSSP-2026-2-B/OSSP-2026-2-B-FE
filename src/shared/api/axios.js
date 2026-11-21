import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// 배포 서버는 15분 미사용 시 잠들어 첫 요청에 약 1분이 걸린다.
// 여러 요청이 동시에 타임아웃 나도 깨우기 요청은 하나만 보낸다.
let waking = null
export function waitForServer() {
    waking ??= api
        .get('/health', { timeout: 90000, skipWakeRetry: true })
        .catch(() => {})
        .finally(() => { waking = null })
    return waking
}

const isTimeout = (error) => error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // 화면 이동 등으로 취소한 요청은 오류 로그 없이 호출부로 전달합니다.
        if (axios.isCancel(error)) return Promise.reject(error)

        const config = error.config
        // 서버가 자고 있어 응답이 없던 요청은 서버를 깨운 뒤 한 번만 다시 보냅니다.
        if (!error.response && isTimeout(error) && config && !config.skipWakeRetry && !config.wakeRetried) {
            config.wakeRetried = true
            await waitForServer()
            if (config.signal?.aborted) return Promise.reject(error)
            return api(config)
        }

        if (error.response) {
        // 서버가 4xx/5xx로 응답한 경우
        console.error(`[API Error] ${error.response.status}`, error.response.data)
        } else if (error.request) {
        // 요청은 보냈으나 응답이 없는 경우 (네트워크 오류, 타임아웃 등)
        console.error('[Network Error]', error.message)
        }
        return Promise.reject(error)
    },
)

export default api
