import { useEffect } from "react";
import { DangerIcon, RainIcon, RouteIcon, SafeIcon, XIcon } from "../../assets/index";

// 위험 등급별 스타일
const LEVEL_STYLE = {
    danger: {
        label: "위험",
        card: "bg-[#FBE9E5]",
        icon: "text-[#C8553D]",
        badge: "text-[#C8553D]",
    },
    caution: {
        label: "주의",
        card: "bg-[#FFF6DC]",
        icon: "text-[#D99A00]",
        badge: "text-[#D99A00]",
    },
};

// 위험 유형별 아이콘
const HAZARD_ICON = {
    danger: DangerIcon,
    route: RouteIcon,
};

// 강우량 슬라이더 눈금
const RAIN_TICKS = [0, 30, 50, 70, 100];
const RAIN_MAX = 100;

/**
 * 위험 근거 바텀시트 모달
 * - 경로 전체: 그 경로가 피하는(또는 지나는) 모든 위험 구간
 * - 지도 원 클릭: 그 구간 하나만
 * @param {boolean} open        열림 여부
 * @param {function} onClose    닫기 콜백
 * @param {string} title        시트 제목
 * @param {object} rainfall     { value, time }
 * @param {object[]} hazards    표시할 위험 구간 목록
 */
export default function RiskReasonSheet({ open, onClose, title, rainfall, hazards = [] }) {
    // ESC 키로 닫기
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    return (
        <div
            className={`absolute inset-0 z-30 ${open ? "" : "pointer-events-none"}`}
            aria-hidden={!open}
        >
            {/* ── 배경 딤 ── */}
            <div
                onClick={onClose}
                className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
                    open ? "opacity-100" : "opacity-0"
                }`}
            />

            {/* ── 시트 ── */}
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="risk-sheet-title"
                className={`absolute bottom-0 left-0 right-0 flex flex-col max-w-[403px] max-h-[85%] mx-auto bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out ${
                    open ? "translate-y-0" : "translate-y-full"
                }`}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between shrink-0 px-5 pt-5 pb-3">
                    <h2 id="risk-sheet-title" className="text-lg font-bold text-gray-900">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="닫기"
                        className="p-1 -mr-1 text-gray-700"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* 내용 (넘치면 스크롤) */}
                <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-5 flex flex-col gap-3">
                    {rainfall && <RainfallCard rainfall={rainfall} />}

                    {hazards.length === 0 ? (
                        <p className="py-6 text-center text-sm text-gray-500">
                            표시할 위험 구간이 없어요.
                        </p>
                    ) : (
                        hazards.map((hazard) => <HazardCard key={hazard.id} hazard={hazard} />)
                    )}

                    <SourceCard />
                </div>
            </section>
        </div>
    );
}

// ── 강우량 카드 ──
function RainfallCard({ rainfall }) {
    const percent = Math.min(Math.max(rainfall.value / RAIN_MAX, 0), 1) * 100;

    return (
        <div className="p-4 rounded-2xl bg-[#EAF2FD]">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-gray-800">
                    <RainIcon className="w-5 h-5 text-[#2F6FDB]" />
                    <span className="font-medium">강우량</span>
                    <span className="text-xs text-gray-500">({rainfall.time} 기준)</span>
                </div>
                <span className="text-xl font-bold text-[#2F6FDB]">
                    {rainfall.value} mm/h
                </span>
            </div>

            {/* 게이지 */}
            <div className="relative h-4 mt-4" aria-hidden="true">
                <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#C9DBF7]" />
                <div
                    className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#2F6FDB]"
                    style={{ width: `${percent}%` }}
                />
                <span
                    className="absolute top-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border-2 border-[#2F6FDB] shadow"
                    style={{ left: `${percent}%` }}
                />
            </div>

            {/* 눈금 */}
            <div className="relative h-4 mt-1 text-[10px] text-gray-500">
                {RAIN_TICKS.map((tick) => (
                    <span
                        key={tick}
                        className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full"
                        style={{ left: `${(tick / RAIN_MAX) * 100}%` }}
                    >
                        {tick}
                    </span>
                ))}
            </div>
        </div>
    );
}

// ── 위험 구간 카드 ──
function HazardCard({ hazard }) {
    const style = LEVEL_STYLE[hazard.level] ?? LEVEL_STYLE.caution;
    const Icon = HAZARD_ICON[hazard.type] ?? DangerIcon;

    return (
        <div className={`flex gap-3 p-4 rounded-2xl ${style.card}`}>
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.icon}`} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-bold text-gray-900">{hazard.name}</h3>
                    <span className={`text-xs font-medium ${style.badge}`}>{style.label}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-gray-600">{hazard.description}</p>
                {hazard.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {hazard.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-1 rounded-md bg-white border border-gray-200 text-[11px] text-gray-700"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── 데이터 출처 카드 ──
function SourceCard() {
    return (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-100">
            <SafeIcon className="w-5 h-5 shrink-0 text-gray-600" />
            <div className="min-w-0">
                <p className="text-xs font-medium text-gray-900">공공데이터 기반 추정</p>
                <p className="mt-0.5 text-[11px] text-gray-500">
                    기상청 강우 · 침수흔적도 · 지형 고도 · 하천 거리
                </p>
            </div>
        </div>
    );
}
