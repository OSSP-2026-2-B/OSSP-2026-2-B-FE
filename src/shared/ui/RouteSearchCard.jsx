import { useState } from "react";
import { useNavigate } from "react-router";
import { SearchIcon, UpsideDownIcon } from "../../assets";

export default function RouteSearchCard({ from, to, onFromChange, onToChange, defaultTo = '' }) {
    const navigate = useNavigate();
    const [localFrom, setLocalFrom] = useState('신논현역 5번 출구');
    const [localTo, setLocalTo] = useState(defaultTo);
    const currentFrom = from ?? localFrom;
    const currentTo = to ?? localTo;
    const changeFrom = onFromChange ?? setLocalFrom;
    const changeTo = onToChange ?? setLocalTo;

    // 출발 ↔ 도착 바꾸기
    const swap = () => {
        changeFrom(currentTo);
        changeTo(currentFrom);
    };

    return (
        // ── 출발/도착 카드 ──
        <div className="relative flex items-center gap-2 overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-lg">
            <span className="absolute inset-x-0 top-1/2 border-t border-gray-200" aria-hidden="true" />
            {/* 왼쪽: 출발/도착 두 줄 */}
            <div className="relative flex-1 min-w-0">
            {/* 두 마커를 잇는 세로선 */}
            <span className="absolute left-[5px] top-9 bottom-9 border-l border-dashed border-gray-400" aria-hidden="true" />

            {/* 출발 */}
            <button type="button" onClick={() => navigate('/search')} className="flex w-full items-center gap-3 pb-3 text-left">
                <span className="relative z-10 w-3 h-3 shrink-0 rounded-full border-[3px] border-[#FFC93C] bg-white" />
                <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">출발</p>
                <p className={`truncate ${currentFrom ? 'font-bold text-gray-900' : 'font-normal text-gray-500'}`}>{currentFrom || '출발지를 입력하세요'}</p>
                </div>
            </button>

            {/* 도착 */}
            <button type="button" onClick={() => navigate('/search')} className="flex w-full items-center gap-3 pt-3 text-left">
                <span className="relative z-10 w-3 h-3 shrink-0 rounded-sm bg-[#C8553D]" />
                <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">도착</p>
                <p className={`truncate ${currentTo ? 'font-bold text-gray-900' : 'font-normal text-gray-500'}`}>{currentTo || '목적지를 입력하세요'}</p>
                </div>
            </button>
            </div>

            {/* 가운데: 바꾸기 버튼 */}
            <button
            type="button"
            onClick={swap}
            aria-label="출발지와 도착지 바꾸기"
            className="relative z-10 flex items-center justify-center w-9 h-9 shrink-0 rounded-full border border-gray-200 bg-white text-gray-500 active:bg-gray-50"
            >
            <UpsideDownIcon size={18} />
            </button>

            {/* 오른쪽: 검색 버튼 두 개 */}
            <div className="flex flex-col gap-6">
            <button type="button" onClick={() => navigate('/search')} aria-label="출발지 검색" className="p-1 text-gray-600">
                <SearchIcon size={22} />
            </button>
            <button type="button" onClick={() => navigate('/search')} aria-label="도착지 검색" className="p-1 text-gray-600">
                <SearchIcon size={22} />
            </button>
            </div>
        </div>
    );
}
