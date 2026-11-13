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

const recentLocations = [
  { id: 1, name: '역삼초등학교', address: '서울 강남구 역삼동 833', date: '오후 2:14', Icon: BuildingIcon, color: 'text-[#3676FF]', background: 'bg-[#EAF3FC]' },
  { id: 2, name: '집', address: '서울 서초구 서초동', date: '오전 8:42', Icon: HomeIcon, color: 'text-[#D58A0B]', background: 'bg-[#FFF4DC]' },
  { id: 3, name: '신논현역 5번 출구', address: '서울 강남구 봉은사로', date: '어제', Icon: SubwayIcon, color: 'text-[#008562]', background: 'bg-[#E6F4EE]' },
  { id: 4, name: '카페 테라', address: '서울 강남구 테헤란로 123', date: '어제', Icon: CafeIcon, color: 'text-[#D58A0B]', background: 'bg-[#FFF4DC]' },
  { id: 5, name: '강남구청', address: '서울 강남구 학동로 426', date: '11월 10일', Icon: BuildingIcon, color: 'text-[#3676FF]', background: 'bg-[#EAF3FC]' },
  { id: 6, name: '강남역 11번 출구', address: '서울 강남구 강남대로', date: '11월 10일', Icon: SubwayIcon, color: 'text-[#008562]', background: 'bg-[#E6F4EE]' },
  { id: 7, name: '회사', address: '서울 강남구 테헤란로 152', date: '11월 8일', Icon: BuildingIcon, color: 'text-[#3676FF]', background: 'bg-[#EAF3FC]' },
]

export default function SearchPage() {
  const navigate = useNavigate()
  const { searchTarget, setFrom, setTo } = useRouteSearch()

  const selectLocation = (location) => {
    if (searchTarget.field === 'from') setFrom(location.name)
    else setTo(location.name)
    navigate(searchTarget.page)
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-white px-4 pt-5 pb-11">
      <header className="flex items-center gap-6">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로 가기" className="flex size-6 shrink-0 items-center justify-center text-black">
          <LeftIcon className="size-6" aria-hidden="true" />
        </button>
        <div className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-200 px-4 text-gray-500">
          <SearchIcon className="size-5 shrink-0" aria-hidden="true" />
          <input
            type="search"
            aria-label="목적지 검색"
            placeholder="목적지 검색"
            className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-gray-500"
          />
        </div>
      </header>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between px-4">
          <h1 className="text-sm font-semibold text-black">최근 30일</h1>
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
