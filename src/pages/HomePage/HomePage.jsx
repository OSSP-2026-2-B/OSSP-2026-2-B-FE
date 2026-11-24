import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AppIcon, NavigationIcon } from '../../assets';
import PrimaryButton from '../../shared/ui/PrimaryButton';
import RouteSearchCard from '../../shared/ui/RouteSearchCard';
import { useRouteSearch } from '../../shared/routeSearchContext';
import RainObservationCard from './RainObservationCard';
import { loadFrequentPlaces } from '../SearchPage/recentPlaces';
import { wakeServer } from '../../shared/api/health';

export default function HomePage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(() => loadFrequentPlaces());

  useEffect(() => {
    const refresh = () => setFavorites(loadFrequentPlaces());
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  const { from, to, setTo, setSearchTarget } = useRouteSearch();

  const findRoute = () => {
    if (!from || !to) {
      setSearchTarget({ page: '/home', field: !from ? 'from' : 'to' });
      navigate('/search');
      return;
    }
    navigate('/main');
  };

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
        <PrimaryButton className="mt-5" icon={NavigationIcon} onClick={findRoute}>안전 경로 찾기</PrimaryButton>
      </section>

      {/* 현재 강우 상황 */}
      <section className="mt-12" aria-labelledby="rain-heading">
        <h2 id="rain-heading" className="flex items-center gap-2 text-lg font-bold">현재 강우 상황</h2>
        <RainObservationCard />
      </section>

      {/* 실제로 선택한 장소의 빈도 기반 추천 */}
      <section className="mt-8" aria-labelledby="favorite-heading">
        <h2 id="favorite-heading" className="text-lg font-bold">자주 찾은 곳</h2>
        {favorites.length > 0 ? (
          <div className="mt-4 grid gap-2">
            {favorites.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => setTo(place)}
                aria-label={`${place.address} 목적지로 선택`}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left text-sm font-medium text-[#1A2A47] break-words active:bg-gray-100"
              >
                {place.address}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-gray-200 px-4 py-6 text-sm text-gray-500">
            장소를 검색하고 선택하면 자주 찾은 주소가 여기에 표시돼요.
          </p>
        )}
      </section>
    </main>
  );
}
