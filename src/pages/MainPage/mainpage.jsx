import Header from "./main_header";
import { Map, useKakaoLoader } from "react-kakao-maps-sdk";
import RouteSearchCard from "./main_route_card";
import RouteBottomSheet from "./main_bottom_sheet";

export default function MainPage() {
    const [loading, error] = useKakaoLoader({
        appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
    });

    return (
        <div className="flex flex-col h-dvh max-w-md mx-auto">
            <Header />
            <main className="relative flex-1 overflow-hidden">
                {loading && <p className="p-4 text-sm text-gray-500">지도 불러오는 중...</p>}
                {error && <p className="p-4 text-sm text-red-500">지도를 불러오지 못했어요</p>}

                {!loading && !error && (
                    <>
                    <Map
                        center = {{lat: 37.4979, lng: 127.0276}}
                        level={4}
                        className="absolute inset-0"
                    />
                    <div className="absolute top-4 left-4 right-4 z-10">
                        <RouteSearchCard />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 z-20">
                        <RouteBottomSheet />
                    </div>
                    </>
                )}
            </main>
        </div>
    )
}
