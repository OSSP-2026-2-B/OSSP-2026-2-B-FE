import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Info } from 'lucide-react';
import {
  AppIcon, BuildingIcon, DangerIcon, HomeIcon, NavigationIcon, RainIcon, StarIcon,
  SubwayIcon,
} from '../../assets';
import PrimaryButton from '../../shared/ui/PrimaryButton';
import RouteSearchCard from '../../shared/ui/RouteSearchCard';
import { RAINFALL } from '../MainPage/mock_data';

const favorites = [
  { label: '집으로 가기', address: '서초구 서초동', icon: HomeIcon },
  { label: '학교로 가기', address: '역삼초등학교', icon: BuildingIcon },
  { label: '자주 가는 곳', address: '강남역 11번 출구', icon: SubwayIcon },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('신논현역 5번 출구');
  const [to, setTo] = useState('');

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-4 pb-12">
      <header className="flex flex-col items-center pt-16 text-center">
        <AppIcon className="size-10 drop-shadow-[0_5px_6px_#FFC93C66]" aria-label="비켜비 로고" />
        <h1 className="mt-4 text-xl font-bold">비켜비</h1>
        <p className="text-sm text-gray-500">침수 위험 회피 보행 내비</p>
      </header>

      {/* 경로 검색 */}
      <section className="mt-9" aria-label="경로 검색">
        <RouteSearchCard from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
        <PrimaryButton className="mt-5" icon={NavigationIcon} onClick={() => navigate('/main')}>안전 경로 찾기</PrimaryButton>
      </section>

      {/* 현재 강우 상황 */}
      <section className="mt-12" aria-labelledby="rain-heading">
        <h2 id="rain-heading" className="flex items-center gap-2 text-lg font-bold"><RainIcon className="size-6 text-[#366BEA]" aria-hidden="true" />현재 강우 상황</h2>
        <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_12px_32px_#17221D0D]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="mt-2 text-4xl font-bold text-[#366BEA]">{RAINFALL.value}<span className="ml-1 text-xl">mm/h</span></p>
            </div>
            <div className="text-right">
              <div className="rounded-xl bg-[#FFF0ED] px-3 py-2 font-bold text-sm text-[#E24739] flex gap-1.5 items-center">
                <DangerIcon className="size-4.5"/>
                <p>집중 호우</p>
              </div>
              <p className="mt-2 text-xs text-[#6F7B75]">13:20 기준 · 기상청</p>
            </div>
          </div>
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-3 text-xs text-[#6F7B75]"><Info className="size-4 shrink-0" aria-hidden="true" />현재 강우량은 경로 위험도 산정에 반영됩니다.</p>
        </div>
      </section>

      {/* 추천 목적지 */}
      <section className="mt-8" aria-labelledby="favorite-heading">
        <h2 id="favorite-heading" className="flex items-center gap-2 text-lg font-bold"><StarIcon className="size-6 text-brand" aria-hidden="true" />추천 목적지</h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {favorites.map(({ label, address, icon: Icon }, index) => (
            <button key={label} type="button" onClick={() => setTo(address)} className="flex min-w-0 flex-col items-center rounded-2xl border border-gray-200 bg-white px-2 py-3 text-center active:bg-gray-100">
              <span className={`flex size-12 items-center justify-center rounded-xl ${index === 0 ? 'bg-[#E4F3ED] text-[#0B8766]' : index === 1 ? 'bg-[#E9F2FF] text-[#366BEA]' : 'bg-[#FFF3DC] text-[#D58A08]'}`}><Icon className="size-6" aria-hidden="true" /></span>
              <span className="mt-2 text-sm font-bold">{label}</span>
              <span className="mt-1 w-full truncate text-xs text-[#6F7B75]">{address}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
