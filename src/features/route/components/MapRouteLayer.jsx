import { CustomOverlayMap, Polyline } from "react-kakao-maps-sdk";
import { GRADE_STYLE, riskRuns } from "../utils/formatRoute";

const NAVY = "#1A2A47";

/**
 * 그림자 + 흰 테두리 + 본선 3겹으로 그려 지도 위에서 또렷하게 보이게 함
 * selected 면 위험 구간을 등급 색으로 덧칠
 */
export function RouteLine({ path, selected = false, hazards = [], dashed = false, onClick }) {
    if (!path?.length) return null;

    if (!selected) {
        return (
            <>
                <Polyline path={path} strokeWeight={9} strokeColor="#FFFFFF" strokeOpacity={0.9} zIndex={1} onClick={onClick} />
                <Polyline path={path} strokeWeight={5} strokeColor="#9AA6BA" strokeOpacity={1} zIndex={2} onClick={onClick} />
            </>
        );
    }

    return (
        <>
            {/* 그림자 */}
            <Polyline path={path} strokeWeight={16} strokeColor="#0B1220" strokeOpacity={0.15} zIndex={3} />
            {/* 흰 테두리 */}
            <Polyline path={path} strokeWeight={12} strokeColor="#FFFFFF" strokeOpacity={1} zIndex={4} />
            {/* 본선 */}
            <Polyline
                path={path}
                strokeWeight={7}
                strokeColor={NAVY}
                strokeOpacity={1}
                strokeStyle={dashed ? "shortdash" : "solid"}
                zIndex={5}
            />
            {/* 위험 구간 덧칠 */}
            {riskRuns(path, hazards).map((run, i) => (
                <Polyline
                    key={i}
                    path={run.path}
                    strokeWeight={7}
                    strokeColor={(GRADE_STYLE[run.grade] ?? GRADE_STYLE["위험"]).line}
                    strokeOpacity={1}
                    zIndex={6}
                />
            ))}
        </>
    );
}

// 출발 지점: 흰 테두리 동그라미
export function StartPin({ position, label = "출발" }) {
    return (
        <CustomOverlayMap position={position} yAnchor={0.5} zIndex={10}>
            <div className="relative flex items-center justify-center">
                <span className="block size-5 rounded-full border-[5px] border-[#1A2A47] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.35)]" />
                <span className="absolute bottom-full mb-1 whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#1A2A47] shadow-[0_2px_6px_rgba(0,0,0,0.2)]">
                    {label}
                </span>
            </div>
        </CustomOverlayMap>
    );
}

// 도착·시설 지점: 말풍선 핀 (아래 꼭짓점이 좌표)
export function EndPin({ position, label = "도착", tone = "navy" }) {
    const bg = tone === "shelter" ? "bg-[#2F7D5B]" : "bg-[#1A2A47]";
    const border = tone === "shelter" ? "border-t-[#2F7D5B]" : "border-t-[#1A2A47]";
    return (
        <CustomOverlayMap position={position} yAnchor={1} zIndex={11}>
            <div className="flex flex-col items-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]">
                <span className={`max-w-40 truncate rounded-full px-2.5 py-1 text-xs font-bold text-white ${bg}`}>
                    {label}
                </span>
                <span className={`-mt-px size-0 border-x-[6px] border-t-[8px] border-x-transparent ${border}`} />
            </div>
        </CustomOverlayMap>
    );
}
