import axios from 'axios'

// 백엔드 오류 code → 화면 문구
const CODE_MESSAGES = {
  OUT_OF_PILOT_AREA: '출발지나 도착지가 시범 지역(강남역 반경 1km) 밖이에요.',
  NO_ROUTE: '갈 수 있는 경로와 안내할 임시주거시설을 찾지 못했어요.',
  INVALID_REQUEST: '요청 형식이 올바르지 않아요.',
  DATA_UNAVAILABLE: '강우 자료를 받을 수 없어요. 잠시 후 다시 시도해 주세요.',
}

// 응답 본문에 code 가 없을 때 HTTP 상태로 추정
const STATUS_CODES = {
  400: 'OUT_OF_PILOT_AREA',
  404: 'NO_ROUTE',
  422: 'INVALID_REQUEST',
  503: 'DATA_UNAVAILABLE',
}

export function getApiErrorCode(error) {
  const data = error?.response?.data
  return data?.code ?? data?.detail?.code ?? data?.error?.code ?? STATUS_CODES[error?.response?.status] ?? null
}

export function getApiErrorMessage(error) {
  const code = getApiErrorCode(error)
  if (code && CODE_MESSAGES[code]) return CODE_MESSAGES[code]
  if (error?.code === 'ECONNABORTED') return '서버 응답이 늦어요. 서버가 깨어나는 중일 수 있으니 잠시 후 다시 시도해 주세요.'
  if (!error?.response) return '서버에 연결할 수 없어요.'
  return '경로를 불러오지 못했어요.'
}

export const isCanceled = (error) => axios.isCancel(error)
