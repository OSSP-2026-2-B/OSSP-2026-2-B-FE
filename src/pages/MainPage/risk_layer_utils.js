export const GRADE_COLORS = {
    안전: "#32805C",
    주의: "#D99A00",
    위험: "#E87928",
    고위험: "#D93636",
};

export function boundsToBbox(bounds) {
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    return [sw.getLng(), sw.getLat(), ne.getLng(), ne.getLat()].join(",");
}

// Polygon의 바깥 고리와 구멍을 모두 유지합니다.
export function featureToArea(feature) {
    const { area_id, grade, excluded, reasons, center, length_m } = feature.properties;
    return {
        id: area_id,
        path: feature.geometry.coordinates.map((ring) => ring.map(([lng, lat]) => ({ lat, lng }))),
        center: { lat: center[1], lng: center[0] },
        color: excluded ? "#D93636" : GRADE_COLORS[grade],
        excluded,
        name: `${excluded ? "통행 제외" : grade} 구역`,
        level: "danger",
        label: excluded ? "통행 제외" : grade,
        type: "danger",
        description: excluded
            ? `위험 등급: ${grade}. 현재 경로 계산에서 제외되는 구역입니다.`
            : `현재 강우 기준으로 '${grade}' 등급인 구역입니다. 포함된 구간 총 ${length_m}m.`,
        tags: reasons,
    };
}
