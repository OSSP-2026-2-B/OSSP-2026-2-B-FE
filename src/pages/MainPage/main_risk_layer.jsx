import { Fragment, useEffect, useMemo, useState } from "react";
import { CustomOverlayMap, Polyline, useMap } from "react-kakao-maps-sdk";
import api from "../../shared/api/axios";
import { boundsToBbox, featureToSegment } from "./risk_layer_utils";
import { getScenarioRainMm } from "../../shared/scenario";

export default function RiskLayer({ onSelect }) {
    const map = useMap();
    const [result, setResult] = useState(null);

    useEffect(() => {
        let timer;
        let controller;
        let disposed = false;

        const refresh = () => {
            clearTimeout(timer);
            controller?.abort();
            // 이동·확대가 멈춘 뒤 마지막 화면 범위만 요청합니다.
            timer = setTimeout(async () => {
                const request = new AbortController();
                controller = request;
                setResult(null);
                try {
                    const { data } = await api.get("/api/risk-layer", {
                        params: {
                            bbox: boundsToBbox(map.getBounds()),
                            // 시연 모드면 가상 강우로 계산 (null이면 axios가 파라미터를 생략)
                            rain_mm: getScenarioRainMm(),
                        },
                        signal: request.signal,
                    });
                    if (disposed || request.signal.aborted) return;
                    if (data?.type !== "FeatureCollection" || !Array.isArray(data.features)) {
                        throw new Error("위험 구간 API가 GeoJSON 대신 잘못된 응답을 반환했습니다. API 서버 주소를 확인해 주세요.");
                    }
                    setResult(data);
                } catch (error) {
                    if (disposed || request.signal.aborted) return;
                    console.error("[Risk Layer]", error.response?.data?.error?.message || error.message);
                }
            }, 250);
        };

        window.kakao.maps.event.addListener(map, "idle", refresh);
        refresh();
        return () => {
            disposed = true;
            clearTimeout(timer);
            controller?.abort();
            window.kakao.maps.event.removeListener(map, "idle", refresh);
        };
    }, [map]);

    const segments = useMemo(
        () => (result?.features ?? []).map(featureToSegment),
        [result],
    );

    return (
        <>
            {segments.map((segment) => (
                <Fragment key={segment.id}>
                    {/* 도로를 따라 등급 색으로 칠한다. 이웃 구간이 이어져 한 줄의 도로처럼 보이고, 경로 선(zIndex 1 이상)보다 아래에 깔린다. */}
                    <Polyline
                        path={segment.path}
                        strokeWeight={segment.excluded ? 7 : 5}
                        strokeColor={segment.color}
                        strokeOpacity={segment.excluded ? 0.85 : 0.5}
                        zIndex={0}
                        onClick={() => onSelect(segment)}
                    />
                    {segment.excluded && (
                        <CustomOverlayMap position={segment.center} clickable zIndex={3}>
                            <button
                                type="button"
                                aria-label={`${segment.name} 통행 제외 이유 보기`}
                                title="통행 제외 이유 보기"
                                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#D93636] shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                                onClick={() => onSelect(segment)}
                            >
                                <span aria-hidden="true" className="h-1 w-4 rounded-full bg-white" />
                            </button>
                        </CustomOverlayMap>
                    )}
                </Fragment>
            ))}
        </>
    );
}
