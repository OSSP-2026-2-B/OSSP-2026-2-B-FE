import { useState } from "react";
import { Search, ArrowRightLeft } from "lucide-react";

export default function RouteSearchCard() {
    const [from, setFrom] = useState("신논현역 5번 출구");
    const [to, setTo] = useState("역삼초등학교");

    // 출발 ↔ 도착 바꾸기
    const swap = () => {
        setFrom(to);
        setTo(from);
    };

    return (
        // ── 출발/도착 카드 ──
        <div className="flex items-center gap-2 p-4 bg-white rounded-2xl shadow-lg">
            {/* 왼쪽: 출발/도착 두 줄 */}
            <div className="relative flex-1 min-w-0">
            {/* 두 마커를 잇는 세로선 */}
            <span className="absolute left-[5px] top-7 bottom-7 w-px bg-gray-200" />

            {/* 출발 */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <span className="w-3 h-3 shrink-0 rounded-full border-[3px] border-[#FFC93C] bg-white" />
                <div className="min-w-0">
                <p className="text-xs text-gray-500">출발</p>
                <p className="font-bold text-gray-900 truncate">{from}</p>
                </div>
            </div>

            {/* 도착 */}
            <div className="flex items-center gap-3 pt-3">
                <span className="w-3 h-3 shrink-0 rounded-sm bg-[#C8553D]" />
                <div className="min-w-0">
                <p className="text-xs text-gray-500">도착</p>
                <p className="font-bold text-gray-900 truncate">{to}</p>
                </div>
            </div>
            </div>

            {/* 가운데: 바꾸기 버튼 */}
            <button
            type="button"
            onClick={swap}
            aria-label="출발지와 도착지 바꾸기"
            className="flex items-center justify-center w-9 h-9 shrink-0 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
            <ArrowRightLeft size={18} />
            </button>

            {/* 오른쪽: 검색 버튼 두 개 */}
            <div className="flex flex-col gap-6">
            <button type="button" aria-label="출발지 검색" className="p-1 text-gray-600">
                <Search size={22} />
            </button>
            <button type="button" aria-label="도착지 검색" className="p-1 text-gray-600">
                <Search size={22} />
            </button>
            </div>
        </div>
    );
}