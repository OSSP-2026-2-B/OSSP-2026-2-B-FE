import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isCancel(error)) {
        // 일부러 취소한 요청 (화면 이동, 출발·도착 변경, StrictMode 재실행 등) → 오류 아님
        } else if (error.response) {
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
