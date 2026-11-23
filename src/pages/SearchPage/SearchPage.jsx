import { ClockIcon, LeftIcon, SearchIcon } from '../../assets'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useRouteSearch } from '../../shared/routeSearchContext'
import LocationCard from './LocationCard'
import usePlaceSearch from './usePlaceSearch'
import { addRecentPlace, formatSelectedAt, loadRecentPlaces } from './recentPlaces'

const formatDistance = (m) => (m == null ? '' : m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`)

const SEARCH_MESSAGES = {
  loading: '검색 중...',
  empty: '강남역 반경 1km 안에서 찾은 장소가 없어요.',
  error: '장소를 검색하지 못했어요. 잠시 후 다시 시도해 주세요.',
}

export default function SearchPage() {
  const navigate = useNavigate()
  const { searchTarget, setFrom, setTo } = useRouteSearch()
  const [query, setQuery] = useState('')
  const search = usePlaceSearch(query)
  const searchLabel = searchTarget.field === 'from' ? '출발지 검색' : '목적지 검색'
  const [recentLocations] = useState(() =>
    loadRecentPlaces().map((place) => ({ ...place, date: formatSelectedAt(place.selectedAt) })),
  )

  const selectLocation = (location) => {
    const { id, name, address, lat, lng } = location
    const place = { id, name, address, lat, lng }
    addRecentPlace(place)
    if (searchTarget.field === 'from') setFrom(place)
    else setTo(place)
    navigate(searchTarget.page)
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-white px-4 pt-5 pb-11">
      <header className="flex items-center gap-6">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로 가기" className="flex size-6 shrink-0 items-center justify-center text-black">
          <LeftIcon className="size-6" aria-hidden="true" />
        </button>
        <div className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-gray-500 transition-colors focus-within:border-[#1A2A47] focus-within:text-[#1A2A47]">
          <SearchIcon className="size-5 shrink-0" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            aria-label={searchLabel}
            placeholder={searchLabel}
            className="min-w-0 flex-1 bg-transparent text-sm text-[#1A2A47] outline-none placeholder:text-gray-500"
          />
        </div>
      </header>

      {search.status === 'idle' ? (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between px-4">
            <h1 className="text-sm font-bold text-[#1A2A47]">최근 30일</h1>
          </div>
          {recentLocations.length === 0 && <p className="py-8 text-center text-sm text-gray-500">최근 선택한 장소가 없어요. 장소를 검색해 주세요.</p>}
          <ul className="overflow-hidden rounded-2xl border border-gray-200">
            {recentLocations.map((location) => <LocationCard key={location.id} location={location} onSelect={selectLocation} />)}
          </ul>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
            <ClockIcon className="size-4" aria-hidden="true" />
            최근 선택한 장소는 30일 동안 보관돼요.
          </p>
        </section>
      ) : (
        <section className="mt-10" aria-label="검색 결과" aria-live="polite">
          <p className="mb-4 px-4 text-xs text-gray-500">강남역 반경 1km 안의 장소만 길찾기를 할 수 있어요.</p>
          {search.status === 'ok' ? (
            <ul className="overflow-hidden rounded-2xl border border-gray-200">
              {search.places.map((place) => (
                <LocationCard key={place.id} location={{ ...place, date: formatDistance(place.distanceM) }} onSelect={selectLocation} />
              ))}
            </ul>
          ) : (
            <p className="py-10 text-center text-sm text-gray-500">{SEARCH_MESSAGES[search.status]}</p>
          )}
        </section>
      )}
    </main>
  )
}
