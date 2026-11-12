import { NavigationIcon, RainIcon, RouteIcon, SafeIcon, AppIcon } from '../assets';
import PrimaryButton from '../shared/ui/PrimaryButton.jsx';

const features = [
  { icon: SafeIcon, label: <>침수 위험 구간<br />자동 회피</> },
  { icon: RainIcon, label: <>실시간 강우량<br />반영 경로</> },
  { icon: RouteIcon, label: <>보행자 맞춤<br />안전 내비</> },
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[403px] flex-col justify-between px-4 py-12">
      <div className="pt-12">
        <header className="flex flex-col items-center">
          <AppIcon className="h-18 w-18 drop-shadow-[0_5px_6px_#FFC93C66]" aria-label="비켜비 로고" />
          <h1 className="mt-3 text-3xl font-bold">비켜비</h1>
          <p className="text-lg">침수 위험 회피 보행 내비</p>
        </header>

        <section className="mt-20 px-4" aria-label="서비스 소개">
          <h2 className="mb-1 text-lg font-bold">비 오는 날에도</h2>
          <p className="text-2xl"><span className="text-brand">안전한 길</span>로,<br />비켜비가 함께합니다.</p>
        </section>

        <section className="mt-10 flex justify-around items-center text-center">
          {features.map(({ icon: Icon, label }, index) => (
            <div key={index} className='flex flex-col items-center'>
              <Icon className="h-10 w-10 text-brand drop-shadow-[0_3px_3px_#FFC93C66]" aria-hidden="true" />
              <p className="mt-2 text-xs font-bold">{label}</p>
            </div>
          ))}
        </section>
      </div>

      <PrimaryButton className="mt-12" icon={NavigationIcon}>길 찾기 시작</PrimaryButton>
    </main>
  );
}
