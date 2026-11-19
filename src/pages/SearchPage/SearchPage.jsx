import {
  BuildingIcon,
  CafeIcon,
  ClockIcon,
  HomeIcon,
  LeftIcon,
  SearchIcon,
  SubwayIcon,
} from '../../assets'
import { useNavigate } from 'react-router'
import { useRouteSearch } from '../../shared/routeSearchContext'
import LocationCard from './LocationCard'
import { PLACES } from '../../shared/data/places'

const recentLocations = [
  { ...PLACES.yeoksamSchool, date: '오후 2:14', Icon: BuildingIcon },
  { ...PLACES.home, date: '오전 8:42', Icon: HomeIcon },
  { ...PLACES.sinnonhyeonExit5, date: '어제', Icon: SubwayIcon },
  { ...PLACES.cafeTera, date: '어제', Icon: CafeIcon },
  { ...PLACES.gangnamGu, date: '11월 10일', Icon: BuildingIcon },
  { ...PLACES.gangnamExit11, date: '11월 10일', Icon: SubwayIcon },
  { ...PLACES.office, date: '11월 8일', Icon: BuildingIcon },
]

export default function SearchPage() {
  const navigate = useNavigate()
  const { searchTarget, setFrom, setTo } = useRouteSearch()

  const selectLocation = (location) => {
    const { id, name, address, lat, lng } = location
    const place = { id, name, address, lat, lng }
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
            aria-label="목적지 검색"
            placeholder="목적지 검색"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#1A2A47] outline-none placeholder:text-gray-500"
          />
        </div>
      </header>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between px-4">
          <h1 className="text-sm font-bold text-[#1A2A47]">최근 30일</h1>
          <span className="text-xs font-semibold text-gray-500">편집</span>
        </div>
        <ul className="overflow-hidden rounded-2xl border border-gray-200">
          {recentLocations.map((location) => <LocationCard key={location.id} location={location} onSelect={selectLocation} />)}
        </ul>
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
          <ClockIcon className="size-4" aria-hidden="true" />
          최근 목적지는 30일 동안 보관돼요.
        </p>
      </section>
    </main>
  )
}
