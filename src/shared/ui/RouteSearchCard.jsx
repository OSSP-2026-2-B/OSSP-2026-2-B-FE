import { useNavigate } from "react-router";
import { SearchIcon, UpsideDownIcon } from "../../assets";
import { useRouteSearch } from "../routeSearchContext";

/**
 * 출발/도착 카드
 * @param {string} page        검색 후 돌아올 화면
 * @param {object|null} defaultTo
 * @param {boolean} compact    지도 위에 띄울 때: 높이를 줄여 지도를 더 보이게
 */
export default function RouteSearchCard({ page, defaultTo = null, compact = false }) {
    const navigate = useNavigate();
    const { from, to, setFrom, setTo, setSearchTarget } = useRouteSearch();
    const currentFrom = from;
    const currentTo = to ?? defaultTo;
    const openSearch = (field) => {
        setSearchTarget({ page, field });
        if (defaultTo && !to) setTo(defaultTo);
        navigate('/search');
    };

    // 출발 ↔ 도착 바꾸기
    const swap = () => {
        setFrom(currentTo);
        setTo(currentFrom);
    };

    return (
        // ── 출발/도착 카드: 두 줄이 같은 높이라 마커·검색 아이콘이 줄마다 정렬된다 ──
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
            {/* 두 마커를 잇는 세로선 (마커는 각 줄의 세로 가운데 = 카드의 1/4, 3/4 지점) */}
            <span className="absolute left-[17.5px] top-1/4 bottom-1/4 border-l border-dashed border-gray-400" aria-hidden="true" />

            <SearchRow
                label="출발"
                place={currentFrom}
                placeholder="출발지를 입력하세요"
                marker={<span className="relative z-10 size-3 shrink-0 rounded-full border-[3px] border-[#1A2A47] bg-white" />}
                compact={compact}
                onClick={() => openSearch('from')}
            />
            <div className="border-t border-gray-200" aria-hidden="true" />
            <SearchRow
                label="도착"
                place={currentTo}
                placeholder="목적지를 입력하세요"
                marker={<span className="relative z-10 size-3 shrink-0 rounded-sm bg-[#1A2A47]" />}
                compact={compact}
                onClick={() => openSearch('to')}
            />

            {/* 바꾸기 버튼: 두 줄 사이 구분선 위 */}
            <button
                type="button"
                onClick={swap}
                aria-label="출발지와 도착지 바꾸기"
                className="absolute right-11 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 active:bg-gray-50"
            >
                <UpsideDownIcon size={18} />
            </button>
        </div>
    );
}

function SearchRow({ label, place, placeholder, marker, compact, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={`${label}지 검색: ${place?.name || placeholder}`}
            className={`flex w-full items-center gap-3 px-3 text-left active:bg-gray-50 ${compact ? 'py-2' : 'py-3'}`}
        >
            {marker}
            {/* 오른쪽 바꾸기 버튼 자리만큼 비워 둠 */}
            <div className="mr-11 min-w-0 flex-1">
                <p className="text-xs text-gray-500">{label}</p>
                <p className={`truncate ${compact ? 'text-[15px] leading-5' : ''} ${place ? 'font-bold text-gray-900' : 'font-normal text-gray-500'}`}>
                    {place?.name || placeholder}
                </p>
            </div>
            <SearchIcon className="shrink-0 text-gray-600" aria-hidden="true" />
        </button>
    );
}
