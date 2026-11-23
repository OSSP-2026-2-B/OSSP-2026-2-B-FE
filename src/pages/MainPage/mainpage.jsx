import Header from "./main_header";
import { Map } from "react-kakao-maps-sdk";
import { GANGNAM_STATION, useKakaoMapLoader } from "../../shared/kakao";
import { EndPin, RouteLine, StartPin } from "../../features/route/components/MapRouteLayer";
import RouteSearchCard from "../../shared/ui/RouteSearchCard";
import RouteBottomSheet from "./main_bottom_sheet";
import RiskReasonSheet from "./main_risk_sheet";
import RiskLayer from "./main_risk_layer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useRouteSearch } from "../../shared/routeSearchContext";
import useRoutes from "../../features/route/hooks/useRoutes";
import { getApiErrorMessage } from "../../shared/api/errors";
import {
    RECOMMENDED_MODE,
    buildRouteCards,
    formatRain,
    formatUpdated,
    lineToPath,
    toLatLng,
    toSheetHazard,
} from "../../features/route/utils/formatRoute";

export default function MainPage() {
    const navigate = useNavigate();
    const [loading, error] = useKakaoMapLoader();

    const { from, to } = useRouteSearch();
    const destination = to;
    const route = useRoutes(from, destination);

    const routeCards = useMemo(() => buildRouteCards(route.data?.routes), [route.data]);
    const fallback = route.data?.fallback ?? null;
    const rainfall = formatRain(route.data?.rain);

    // 선택한 경로 (없으면 추천 → 첫 번째)
    const [selectedMode, setSelectedMode] = useState(RECOMMENDED_MODE);
    const selected =
        routeCards.find((r) => r.mode === selectedMode) ??
        routeCards.find((r) => r.recommended) ??
        routeCards[0] ??
        null;

    const shelterPath = useMemo(() => lineToPath(fallback?.geometry), [fallback]);

    // 위험 근거 시트 (내용은 닫힐 때도 유지해서 내려가는 애니메이션 동안 비지 않게)
    const [riskOpen, setRiskOpen] = useState(false);
    const [riskContent, setRiskContent] = useState({ title: "", rainfall: null, hazards: [] });

    // 바텀시트 "구간별 위험 근거 보기"
    // - 빠른 경로: 그 경로가 지나는 위험 구간
    // - 안전 경로: 빠른 경로에서 피한 구간 + 그래도 지나는 구간
    const openRouteRisk = (card) => {
        const own = card.dangerSections.map((section) => toSheetHazard(section));
        if (!card.safe) {
            setRiskContent({ title: "이 경로의 위험 구간", rainfall, hazards: own });
        } else {
            const avoided = card.avoidedSections.map((section) => toSheetHazard(section, { avoided: true }));
            setRiskContent({ title: "왜 이 길을 피하나요?", rainfall, hazards: [...avoided, ...own] });
        }
        setRiskOpen(true);
    };

    // 지도 원 또는 통행 제외 아이콘 클릭 → API의 해당 구간
    const openHazardRisk = (hazard) => {
        setRiskContent({
            title: "왜 이 구간을 피하나요?",
            rainfall: null,
            hazards: [hazard],
            sourceDescription: "강우와 구간별 위험·통제 정보를 반영한 결과입니다.",
        });
        setRiskOpen(true);
    };

    const closeRiskSheet = useCallback(() => setRiskOpen(false), []);

    // 경로가 바뀌면 지도 범위를 경로에 맞춤
    const [map, setMap] = useState(null);
    const boundsPoints = useMemo(() => {
        const points = [...routeCards.flatMap((r) => r.path), ...shelterPath];
        if (points.length === 0 && from && destination) return [from, destination];
        return points;
    }, [routeCards, shelterPath, from, destination]);

    useEffect(() => {
        const kakao = window.kakao;
        if (!map || !kakao || boundsPoints.length === 0) return;
        const bounds = new kakao.maps.LatLngBounds();
        boundsPoints.forEach((p) => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)));
        // 위: 검색 카드, 아래: 바텀시트 만큼 여백
        map.setBounds(bounds, 170, 30, 400, 30);
    }, [map, boundsPoints]);

    return (
        <div className="flex flex-col h-dvh max-w-md mx-auto">
            <Header onBack={() => navigate('/home')} />
            <main className="relative flex-1 overflow-hidden">
                {loading && <p className="p-4 text-sm text-gray-500">지도 불러오는 중...</p>}
                {error && <p className="p-4 text-sm text-red-500">지도를 불러오지 못했어요</p>}

                {!loading && !error && (
                    <>
                    <Map
                        center={GANGNAM_STATION}
                        level={4}
                        className="absolute inset-0"
                        onCreate={setMap}
                    >
                        <RiskLayer key={from && destination ? "route" : "browse"} routeMode={Boolean(from && destination)} riskAreas={route.data?.risk_areas} onSelect={openHazardRisk} />

                        {/* 선택하지 않은 경로 먼저 (아래), 선택한 경로는 위에 */}
                        {routeCards
                            .filter((r) => r.mode !== selected?.mode)
                            .map((r) => (
                                <RouteLine key={r.mode} path={r.path} onClick={() => setSelectedMode(r.mode)} />
                            ))}
                        {selected && (
                            <RouteLine key={`selected-${selected.mode}`} path={selected.path} hazards={selected.hazards} selected />
                        )}
                        <RouteLine path={shelterPath} selected dashed />

                        {from && <StartPin position={{ lat: from.lat, lng: from.lng }} />}
                        {fallback ? (
                            <EndPin position={toLatLng(fallback.location)} label={fallback.name} tone="shelter" />
                        ) : (
                            destination && <EndPin position={{ lat: destination.lat, lng: destination.lng }} />
                        )}
                    </Map>
                    <div className="absolute top-4 left-4 right-4 z-10">
                        <RouteSearchCard page="/main"  />
                    </div>
                    {/* 접힌 시트의 원래 자리에서는 지도 터치를 통과시킵니다. */}
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20">
                        <RouteBottomSheet
                            routes={routeCards}
                            selected={selected}
                            onSelect={setSelectedMode}
                            loading={route.loading}
                            error={
                                !from
                                    ? "출발지를 선택해 주세요."
                                    : !destination
                                      ? "목적지를 선택해 주세요."
                                    : route.error
                                      ? getApiErrorMessage(route.error)
                                      : null
                            }
                            onRetry={from && destination ? route.retry : undefined}
                            fallback={fallback}
                            updatedLabel={formatUpdated(route.data?.rain)}
                            onShowRisk={openRouteRisk}
                        />
                    </div>
                    <RiskReasonSheet
                        open={riskOpen}
                        onClose={closeRiskSheet}
                        {...riskContent}
                    />
                    </>
                )}
            </main>
        </div>
    )
}
