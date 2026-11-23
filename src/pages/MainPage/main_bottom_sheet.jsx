import { useState, useRef } from "react";
import {
    SafeIcon,
    ClockIcon,
    DangerIcon,
    RightIcon,
    NavigationIcon,
} from "../../assets/index";
import PrimaryButton from "../../shared/ui/PrimaryButton";
import { GRADE_STYLE } from "../../features/route/utils/formatRoute";

    // 시트 크기 (px)
    const SHEET_HEIGHT = 388;
    const PEEK_HEIGHT = 38; // 접었을 때 보이는 높이 (손잡이 부분)
    const MAX_OFFSET = SHEET_HEIGHT - PEEK_HEIGHT; // 최대로 내려가는 거리
    const DRAG_THRESHOLD = 60; // 이만큼 이상 끌어야 열림/닫힘이 바뀜

/**
 * 경로 비교 바텀시트
 * @param {object[]} routes       buildRouteCards 결과
 * @param {object|null} selected  선택된 경로 카드
 * @param {function} onSelect     (mode) => void
 * @param {boolean} loading
 * @param {string|null} error     오류 문구
 * @param {function} onRetry
 * @param {object|null} fallback  경로가 없을 때 임시주거시설
 * @param {string} updatedLabel   "n분 전 갱신"
 * @param {function} onShowRisk   (route) => void
 */
export default function RouteBottomSheet({
    routes = [],
    selected = null,
    onSelect,
    loading = false,
    error = null,
    onRetry,
    fallback = null,
    updatedLabel = "",
    onShowRisk,
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [dragOffset, setDragOffset] = useState(null); // 드래그 중일 때만 숫자, 아니면 null

    const startY = useRef(0); // 손가락을 처음 댄 위치
    const startOffset = useRef(0); // 드래그 시작 시점의 시트 위치

    const isDragging = dragOffset !== null;
    const ready = !loading && !error;

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
        className={`pointer-events-auto flex flex-col w-full max-w-[403px] h-[388px] mx-auto px-4 pb-3 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] ${
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
                <p className="text-xs font-medium text-[#1A2A47]">추천 경로 비교</p>
                <h2 className="text-xl font-bold text-gray-900">
                    {ready && fallback ? "가까운 임시주거시설로 안내해요" : "조금 돌아도, 더 안전하게"}
                </h2>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
                {ready && updatedLabel && <span className="text-xs text-gray-400">{updatedLabel}</span>}
                {ready && onRetry && (
                    <button type="button" onClick={onRetry} className="text-xs text-[#1A2A47] underline">새로고침</button>
                )}
            </div>
            </div>

            {loading && (
                <p className="py-10 text-center text-sm text-gray-500">경로를 계산하고 있어요...</p>
            )}

            {!loading && error && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <p className="text-sm text-[#E24739]">{error}</p>
                    {onRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 active:bg-gray-50"
                        >
                            다시 시도
                        </button>
                    )}
                </div>
            )}

            {ready && fallback && <ShelterCard shelter={fallback} />}

            {ready && routes.length > 0 && (
                <>
                {/* 경로 카드 목록 */}
                <div className="flex flex-col gap-2">
                {routes.map((route) => (
                    <RouteCard
                    key={route.mode}
                    route={route}
                    selected={route.mode === selected?.mode}
                    onSelect={() => onSelect?.(route.mode)}
                    />
                ))}
                </div>

                {/* 근거 보기 링크 */}
                <button
                type="button"
                onClick={() => selected && onShowRisk?.(selected)}
                className="flex items-center justify-center gap-1 w-full py-2 text-sm text-gray-600"
                >
                구간별 위험 근거 보기
                <RightIcon className="w-[18px] h-[18px]" />
                </button>
                </>
            )}
        </div>

        {/* ── 출발 버튼 ── */}
        {ready && (selected || fallback?.reachable) && (
            <PrimaryButton
                icon={NavigationIcon}
                className="shrink-0 active:scale-[0.98] transition-transform"
            >
                {selected ? `${selected.name}로 출발` : "임시주거시설로 출발"}
            </PrimaryButton>
        )}
        </section>
    );
}

// ── 경로 카드 하나 ──
function RouteCard({ route, selected, onSelect }) {
    const isSafe = route.safe;
    const gradeStyle = GRADE_STYLE[route.routeGrade] ?? GRADE_STYLE["주의"];

    return (
        <button
        type="button"
        onClick={onSelect}
        className={`flex items-center gap-3 w-full p-3 text-left rounded-2xl border transition-colors ${
            selected ? "border-[#1A2A47] bg-[#F3F5FA]" : "border-gray-200 bg-white"
        }`}
        >
        {/* 라디오 동그라미 */}
        <span
            className={`w-5 h-5 shrink-0 rounded-full ${
            selected ? "border-[6px] border-[#1A2A47]" : "border-2 border-gray-300"
            }`}
        />

        {/* 가운데 내용 */}
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
            {isSafe ? (
                <SafeIcon className="w-5 h-5 text-[#1A2A47]" />
            ) : (
                <ClockIcon className="w-5 h-5 text-gray-800" />
            )}
            <span className={`text-sm font-bold ${isSafe ? "text-[#1A2A47]" : "text-gray-900"}`}>
                {route.name}
            </span>
            {route.recommended && (
                <span className="px-2 py-0.5 rounded-full bg-[#1A2A47] text-xs font-medium text-white">
                추천
                </span>
            )}
            </div>

            <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-[22px] leading-7 font-bold text-gray-900">{route.time}분</span>
            <span className="text-xs text-gray-500">{route.distanceKm}km</span>
            </div>

            {isSafe ? (
            <p className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs text-gray-600">
                <span className="px-1.5 py-0.5 rounded bg-gray-100">+{route.detourMin}분</span>
                <span>{route.dangerLength > 0 ? `위험 구간 ${route.dangerLength}m 통과` : "위험 구간 없이 이동"}</span>
                {route.reducedDangerLength > 0 && (
                    <span className="font-medium text-[#1A2A47]">빠른 경로보다 {route.reducedDangerLength}m 감소</span>
                )}
            </p>
            ) : route.dangerLength > 0 ? (
            <p className="flex items-center gap-1.5 mt-0.5 text-xs text-[#E24739]">
                <DangerIcon className="w-[18px] h-[18px]" />
                위험 구간 {route.dangerLength}m 통과
            </p>
            ) : (
            <p className="mt-0.5 text-xs text-gray-600">지나는 위험 구간이 없어요</p>
            )}
        </div>

        {/* 오른쪽 위험도 박스 (경로 대표 등급) */}
        <div
            className={`flex flex-col items-center justify-center w-14 h-16 shrink-0 rounded-xl ${gradeStyle.box}`}
        >
            <span className="text-xs">위험도</span>
            <span className={`font-bold ${route.routeGrade?.length > 2 ? "text-base" : "text-xl"}`}>
                {route.routeGrade}
            </span>
        </div>
        </button>
    );
}

// ── 경로가 없을 때 임시주거시설 카드 ──
function ShelterCard({ shelter }) {
    const km = (shelter.distance_m / 1000).toFixed(1);

    return (
        <div className="flex flex-col gap-2 p-4 rounded-2xl border border-gray-200">
            <p className="flex items-start gap-1.5 text-xs text-[#E24739]">
                <DangerIcon className="w-[18px] h-[18px] shrink-0" />
                {shelter.reason}
            </p>
            <div>
                <h3 className="text-base font-bold text-gray-900">{shelter.name}</h3>
                <p className="mt-0.5 text-xs text-gray-500">{shelter.address}</p>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-700">
                {shelter.reachable ? (
                    <span>
                        도보 <b>{shelter.duration_min}분</b> · {km}km
                    </span>
                ) : (
                    <span>직선거리 {km}km · 걸어갈 수 있는 경로가 없어요</span>
                )}
                {shelter.capacity != null && <span>수용 {shelter.capacity}명</span>}
            </div>
        </div>
    );
}
