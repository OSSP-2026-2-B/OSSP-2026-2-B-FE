import { AppIcon, LeftIcon } from "../../assets";

export default function Header({ onBack }){
    return(
        <header className="w-[403px] h-[62px] flex items-center px-[18px] gap-x-[10px]">
            <button type="button" onClick={onBack} aria-label="뒤로 가기">
                <LeftIcon />
            </button>
            <AppIcon className="w-[34px] h-[34px]" />
            <div className="flex-1 min-w-0">
                <h1 className="text-[18px] font-bold">비켜비</h1>
                <p className="text-[10px] text-[#6F7B75]">침수 위험 회피 보행 지도</p>
            </div>
        </header>
    )
}