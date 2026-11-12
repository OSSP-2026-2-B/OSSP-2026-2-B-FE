// 임시 데이터 (나중에 백엔드 응답으로 교체)
export const RAINFALL = { value: 48, time: "00:00" };

// 위험 구간 (area가 있으면 지도에 원으로 표시 / level: danger | caution, type: 아이콘 종류)
export const HAZARDS = {
    gangnam: {
        id: "gangnam",
        name: "강남대로 396m 구간",
        level: "danger",
        type: "danger",
        description:
            "빠른 경로가 지나는 저지대 구간이에요. 현재 강우에서 침수 위험이 크게 활성화됩니다.",
        tags: ["2022 침수 흔적", "주변보다 2.4m 낮음"],
        // 지도에 표시할 위험 원 (임시 좌표)
        area: { center: { lat: 37.4992, lng: 127.0268 }, radius: 90 },
    },
    teheran: {
        id: "teheran",
        name: "테헤란로 지하보도",
        level: "caution",
        type: "route",
        description:
            "지하 공간은 시간당 70mm 이상에서 자동으로 경로에서 제외돼요.",
        tags: ["지하 구간", "과거 통제 이력"],
    },
    yeoksam: {
        id: "yeoksam",
        name: "역삼로 교차로 120m",
        level: "caution",
        type: "danger",
        description:
            "빗물받이 배수 용량이 작아 강한 비가 이어지면 물이 고이기 쉬운 구간이에요.",
        tags: ["배수 취약", "하천까지 350m"],
    },
    nonhyeon: {
        id: "nonhyeon",
        name: "논현로 이면도로",
        level: "caution",
        type: "danger",
        description:
            "경사가 완만한 내리막 끝 지점이라 빗물이 모이지만, 현재 강우에서는 통행 가능한 수준이에요.",
        tags: ["완만한 저지대"],
    },
};

export const ROUTES = [
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
        rainfall: RAINFALL,
        // 이 경로가 피하는 위험 구간
        hazards: [HAZARDS.gangnam, HAZARDS.teheran, HAZARDS.yeoksam],
    },
    {
        id: "fast",
        name: "빠른 경로",
        time: 18,
        distance: 1.4,
        risk: 58,
        recommended: false,
        totalRisk: 4,
        rainfall: RAINFALL,
        // 이 경로가 지나는 위험 구간
        hazards: [HAZARDS.gangnam, HAZARDS.teheran, HAZARDS.yeoksam, HAZARDS.nonhyeon],
    },
];
