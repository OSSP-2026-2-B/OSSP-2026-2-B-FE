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

// 꺾인 선도 실제 구간 길이의 중간에 아이콘을 놓습니다.
export function getPathMidpoint(path) {
    const lngScale = Math.cos(path[0].lat * Math.PI / 180);
    const lengths = path.slice(1).map((point, i) => Math.hypot(
        (point.lng - path[i].lng) * lngScale,
        point.lat - path[i].lat,
    ));
    let remaining = lengths.reduce((sum, length) => sum + length, 0) / 2;
    for (let i = 0; i < lengths.length; i += 1) {
        if (lengths[i] > 0 && remaining <= lengths[i]) {
            const ratio = remaining / lengths[i];
            return {
                lat: path[i].lat + (path[i + 1].lat - path[i].lat) * ratio,
                lng: path[i].lng + (path[i + 1].lng - path[i].lng) * ratio,
            };
        }
        remaining -= lengths[i];
    }
    return path[0];
}

export function featureToSegment(feature) {
    const { segment_id, grade, excluded, reasons } = feature.properties;
    const path = feature.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
    return {
        id: segment_id,
        path,
        midpoint: getPathMidpoint(path),
        color: excluded ? "#D93636" : GRADE_COLORS[grade],
        excluded,
        name: `도로 구간 ${segment_id}`,
        level: excluded || grade === "위험" || grade === "고위험" ? "danger" : "caution",
        label: excluded ? "통행 제외" : grade,
        type: "danger",
        description: excluded
            ? `위험 등급: ${grade}. 현재 경로 계산에서 제외되는 구간입니다.`
            : `현재 강우 기준으로 '${grade}' 등급인 구간입니다.`,
        tags: reasons,
    };
}
