import { useState, useRef } from "react";
import {
    SafeIcon,
    ClockIcon,
    DangerIcon,
    RightIcon,
    NavigationIcon,
} from "../../assets/index";

// 임시 데이터 (나중에 백엔드 응답으로 교체)
const ROUTES = [
    {
        id: "safe",
        name: "안전 경로",
        time: 22,
        distance: 1.7,
        risk: 16,
        recommended: true,
        extraTime: 4,
        totalRisk: 4,
        avoided: 3,
    },
    {
        id: "fast",
        name: "빠른 경로",
        time: 18,
        distance: 1.4,
        risk: 58,
        recommended: false,
        totalRisk: 4,
    },
    ];

    // 시트 크기 (px)
    const SHEET_HEIGHT = 388;
    const PEEK_HEIGHT = 38; // 접었을 때 보이는 높이 (손잡이 부분)
    const MAX_OFFSET = SHEET_HEIGHT - PEEK_HEIGHT; // 최대로 내려가는 거리
    const DRAG_THRESHOLD = 60; // 이만큼 이상 끌어야 열림/닫힘이 바뀜

export default function RouteBottomSheet() {
    const [selectedId, setSelectedId] = useState("safe");
    const [collapsed, setCollapsed] = useState(false);
    const [dragOffset, setDragOffset] = useState(null); // 드래그 중일 때만 숫자, 아니면 null

    const startY = useRef(0); // 손가락을 처음 댄 위치
    const startOffset = useRef(0); // 드래그 시작 시점의 시트 위치

    const selected = ROUTES.find((r) => r.id === selectedId);
    const isDragging = dragOffset !== null;

    // 지금 시트가 얼마나 내려가 있는지 (0 = 다 펼침, MAX_OFFSET = 다 접음)
    const baseOffset = collapsed ? MAX_OFFSET : 0;
    const offset = isDragging ? dragOffset : baseOffset;

    const handlePointerDown = (e) => {
        e.currentTarget.setPointerCapture(e.pointerId); // 손가락이 손잡이 밖으로 나가도 계속 추적
        startY.current = e.clientY;
        startOffset.current = baseOffset;
        setDragOffset(baseOffset);
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        const delta = e.clientY - startY.current;
        // 0 ~ MAX_OFFSET 범위를 벗어나지 않게 자르기
        const next = Math.min(Math.max(startOffset.current + delta, 0), MAX_OFFSET);
        setDragOffset(next);
    };

    const handlePointerUp = (e) => {
        if (!isDragging) return;
        const delta = e.clientY - startY.current;

        if (Math.abs(delta) < 5) {
        setCollapsed(!collapsed); // 거의 안 움직였으면 탭으로 보고 토글
        } else if (delta > DRAG_THRESHOLD) {
        setCollapsed(true); // 아래로 충분히 끌었으면 접기
        } else if (delta < -DRAG_THRESHOLD) {
        setCollapsed(false); // 위로 충분히 끌었으면 펼치기
        }
        // 조금만 끌었으면 원래 상태로 돌아감
        setDragOffset(null);
    };

    return (
        <section
        style={{ transform: `translateY(${offset}px)` }}
        className={`flex flex-col w-full max-w-[403px] h-[388px] mx-auto px-4 pb-3 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] ${
            isDragging ? "" : "transition-transform duration-300 ease-out"
        }`}
        >
        {/* ── 손잡이: 위아래로 드래그하거나 탭해서 접기/펼치기 ── */}
        <div
            role="button"
            tabIndex={0}
            aria-expanded={!collapsed}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={(e) => e.key === "Enter" && setCollapsed(!collapsed)}
            className="flex flex-col items-center shrink-0 w-full pt-2 pb-1 touch-none select-none cursor-grab active:cursor-grabbing"
        >
            <span className="w-10 h-1 rounded-full bg-gray-300" />
            <span className="mt-1 text-xs text-gray-500">
            {collapsed ? "위로 올려 경로 보기" : "아래로 밀어 지도 넓게 보기"}
            </span>
        </div>

        {/* ── 내용: 남는 높이를 차지하고, 넘치면 스크롤 ── */}
        <div className="flex-1 min-h-0 overflow-y-auto">
            {/* 제목 */}
            <div className="flex items-end justify-between mb-2">
            <div>
                <p className="text-xs font-medium text-[#3E6B50]">추천 경로 비교</p>
                <h2 className="text-xl font-bold text-gray-900">조금 돌아도, 더 안전하게</h2>
            </div>
            <span className="text-xs text-gray-400">2분 전 갱신</span>
            </div>

            {/* 경로 카드 목록 */}
            <div className="flex flex-col gap-2">
            {ROUTES.map((route) => (
                <RouteCard
                key={route.id}
                route={route}
                selected={route.id === selectedId}
                onSelect={() => setSelectedId(route.id)}
                />
            ))}
            </div>

            {/* 근거 보기 링크 */}
            <button
            type="button"
            className="flex items-center justify-center gap-1 w-full py-2 text-sm text-gray-600"
            >
            구간별 위험 근거 보기
            <RightIcon className="w-[18px] h-[18px]" />
            </button>
        </div>

        {/* ── 출발 버튼 ── */}
        <button
            type="button"
            className="flex items-center justify-center gap-2 shrink-0 w-full h-11 rounded-2xl bg-[#3E6B50] text-white font-bold shadow-md active:scale-[0.98] transition-transform"
        >
            <NavigationIcon className="w-5 h-5" />
            {selected.name}로 출발
        </button>
        </section>
    );
}

// ── 경로 카드 하나 ──
function RouteCard({ route, selected, onSelect }) {
    const isSafe = route.id === "safe";

    return (
        <button
        type="button"
        onClick={onSelect}
        className={`flex items-center gap-3 w-full p-3 text-left rounded-2xl border transition-colors ${
            selected ? "border-[#3E6B50] bg-[#F7FAF8]" : "border-gray-200 bg-white"
        }`}
        >
        {/* 라디오 동그라미 */}
        <span
            className={`w-5 h-5 shrink-0 rounded-full ${
            selected ? "border-[6px] border-[#3E6B50]" : "border-2 border-gray-300"
            }`}
        />

        {/* 가운데 내용 */}
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
            {isSafe ? (
                <SafeIcon className="w-5 h-5 text-[#3E6B50]" />
            ) : (
                <ClockIcon className="w-5 h-5 text-gray-800" />
            )}
            <span className={`text-sm font-bold ${isSafe ? "text-[#3E6B50]" : "text-gray-900"}`}>
                {route.name}
            </span>
            {route.recommended && (
                <span className="px-2 py-0.5 rounded-full bg-[#E8F1EB] text-xs text-[#3E6B50]">
                추천
                </span>
            )}
            </div>

            <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-[22px] leading-7 font-bold text-gray-900">{route.time}분</span>
            <span className="text-xs text-gray-500">{route.distance}km</span>
            </div>

            {isSafe ? (
            <p className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-600">
                <span className="px-1.5 py-0.5 rounded bg-gray-100">+{route.extraTime}분</span>
                위험 구간 {route.totalRisk}개 중
                <span className="font-medium text-[#3E6B50]">{route.avoided}개 회피</span>
            </p>
            ) : (
            <p className="flex items-center gap-1.5 mt-0.5 text-xs text-[#C8553D]">
                <DangerIcon className="w-[18px] h-[18px]" />
                위험 구간 {route.totalRisk}개 통과
            </p>
            )}
        </div>

        {/* 오른쪽 위험도 박스 */}
        <div
            className={`flex flex-col items-center justify-center w-14 h-16 shrink-0 rounded-xl ${
            isSafe ? "bg-[#E8F1EB] text-[#3E6B50]" : "bg-[#FBE9E5] text-[#C8553D]"
            }`}
        >
            <span className="text-xs">위험도</span>
            <span className="text-xl font-bold">{route.risk}</span>
        </div>
        </button>
    );
}