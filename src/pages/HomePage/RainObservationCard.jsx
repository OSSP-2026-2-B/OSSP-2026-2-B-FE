import useObservations from './useObservations';

const timeFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

export default function RainObservationCard() {
  const { data, error, retry } = useObservations();

  return (
    <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_12px_32px_#17221D0D]" aria-live="polite">
      {data ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex flex-wrap items-baseline gap-x-1.5 text-sm text-gray-600">
              최근 1시간 강우
              <span className="whitespace-nowrap text-xs text-[#6F7B75]">
                (<time dateTime={data.updated_at}>{timeFormat.format(new Date(data.updated_at))}</time> 기준)
              </span>
            </p>
            <p className="mt-2 text-4xl font-bold text-[#1A2A47]">{data.rain_1h_mm}<span className="ml-1 text-xl">mm</span></p>
            {data.delayed && <p className="mt-2 text-xs text-[#6F7B75]">갱신 지연</p>}
          </div>
          {data.badges.length > 0 && (
            <ul className="flex flex-col items-start gap-1.5">
              {data.badges.map(({ kind, label }) => (
                <li key={kind} className="rounded-xl bg-[#FFF0ED] px-3 py-2 text-sm font-bold text-[#A63125]">
                  [{kind === 'confirmed' ? '확인' : '추정'}] {label}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : error ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p>{error}</p>
          <button type="button" className="font-bold underline" onClick={retry}>다시 시도</button>
        </div>
      ) : (
        <p className="text-sm text-gray-600">강우 정보를 불러오는 중이에요.</p>
      )}
    </div>
  );
}
