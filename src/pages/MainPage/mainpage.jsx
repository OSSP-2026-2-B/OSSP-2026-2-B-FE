import Header from "./main_header";
import { Map, useKakaoLoader } from "react-kakao-maps-sdk";
import RouteSearchCard from "../../shared/ui/RouteSearchCard";
import RouteBottomSheet from "./main_bottom_sheet";
import RiskReasonSheet from "./main_risk_sheet";
import RiskLayer from "./main_risk_layer";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";

export default function MainPage() {
    const navigate = useNavigate();
    const [loading, error] = useKakaoLoader({
        appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
    });

    // 위험 근거 시트 (내용은 닫힐 때도 유지해서 내려가는 애니메이션 동안 비지 않게)
    const [riskOpen, setRiskOpen] = useState(false);
    const [riskContent, setRiskContent] = useState({ title: "", rainfall: null, hazards: [] });

    // 바텀시트 "구간별 위험 근거 보기" → 경로의 모든 위험 구간
    const openRouteRisk = (route) => {
        setRiskContent({
            title: route.id === "safe" ? "왜 이 길을 피하나요?" : "이 경로의 위험 구간",
            rainfall: route.rainfall,
            hazards: route.hazards,
        });
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

    return (
        <div className="flex flex-col h-dvh max-w-md mx-auto">
            <Header onBack={() => navigate('/home')} />
            <main className="relative flex-1 overflow-hidden">
                {loading && <p className="p-4 text-sm text-gray-500">지도 불러오는 중...</p>}
                {error && <p className="p-4 text-sm text-red-500">지도를 불러오지 못했어요</p>}

                {!loading && !error && (
                    <>
                    <Map
                        center = {{lat: 37.4979, lng: 127.0276}}
                        level={4}
                        className="absolute inset-0"
                    >
                        <RiskLayer onSelect={openHazardRisk} />
                    </Map>
                    <div className="absolute top-4 left-4 right-4 z-10">
                        <RouteSearchCard page="/main" defaultTo="역삼초등학교" />
                    </div>
                    {/* 접힌 시트의 원래 자리에서는 지도 터치를 통과시킵니다. */}
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20">
                        <RouteBottomSheet onShowRisk={openRouteRisk} />
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
