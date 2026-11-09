import Header from "./home_header";
import { Map, useKakaoLoader } from "react-kakao-maps-sdk";

export default function HomePage() {
    const [loading, error] = useKakaoLoader({
        appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
    });

    return (
        <div className="flex flex-col h-dvh max-w-md mx-auto">
            <Header />
            <main className="relative flex-1">
                {loading && <p className="p-4 text-sm text-gray-500">지도 불러오는 중...</p>}
                {error && <p className="p-4 text-sm text-red-500">지도를 불러오지 못했어요</p>}

                {!loading && !error && (
                    <Map
                        center = {{lat: 37.4979, lng: 127.0276}}
                        level={4}
                        className="absolute inset-0"
                    />
                )}
            </main>
        </div>
    )
}
