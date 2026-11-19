import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  AppIcon, BuildingIcon, HomeIcon, NavigationIcon,
  SubwayIcon,
} from '../../assets';
import PrimaryButton from '../../shared/ui/PrimaryButton';
import RouteSearchCard from '../../shared/ui/RouteSearchCard';
import { useRouteSearch } from '../../shared/routeSearchContext';
import RainObservationCard from './RainObservationCard';
import { PLACES } from '../../shared/data/places';
import { wakeServer } from '../../shared/api/health';

const favorites = [
  { label: '집으로 가기', caption: '서초구 서초동', place: PLACES.home, icon: HomeIcon },
  { label: '학교로 가기', caption: '역삼초등학교', place: PLACES.yeoksamSchool, icon: BuildingIcon },
  { label: '자주 가는 곳', caption: '강남역 11번 출구', place: PLACES.gangnamExit11, icon: SubwayIcon },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { setTo } = useRouteSearch();

  // 잠든 배포 서버를 미리 깨워 경로 화면에서 기다리지 않게
  useEffect(() => {
    wakeServer();
  }, []);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-4 pb-12">
      <header className="flex flex-col items-center pt-16 text-center">
        <AppIcon className="size-10" aria-label="비켜비 로고" />
        <h1 className="mt-4 text-xl font-bold">비켜비</h1>
        <p className="text-sm text-gray-500">침수 위험 회피 보행 내비</p>
      </header>

      {/* 경로 검색 */}
      <section className="mt-9" aria-label="경로 검색">
        <RouteSearchCard page="/home" />
        <PrimaryButton className="mt-5" icon={NavigationIcon} onClick={() => navigate('/main')}>안전 경로 찾기</PrimaryButton>
      </section>

      {/* 현재 강우 상황 */}
      <section className="mt-12" aria-labelledby="rain-heading">
        <h2 id="rain-heading" className="flex items-center gap-2 text-lg font-bold">현재 강우 상황</h2>
        <RainObservationCard />
      </section>

      {/* 추천 목적지 */}
      <section className="mt-8" aria-labelledby="favorite-heading">
        <h2 id="favorite-heading" className="flex items-center gap-2 text-lg font-bold">추천 목적지</h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {favorites.map(({ label, caption, place, icon: Icon }) => (
            <button key={label} type="button" onClick={() => setTo(place)} className="flex min-w-0 flex-col items-center rounded-2xl border border-gray-200 bg-white px-2 py-3 text-center active:bg-gray-100">
              <span className={`flex size-12 items-center justify-center rounded-xl bg-gray-200`} ><Icon className="size-6" aria-hidden="true" /></span>
              <span className="mt-2 text-sm font-bold">{label}</span>
              <span className="mt-1 w-full truncate text-xs text-[#6F7B75]">{caption}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
