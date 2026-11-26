import { useLayoutEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router';

const VIEW_W = 400;
const VIEW_H = 500;
const INK = '#212833';

// 화면 위쪽에 드문드문 떨어지는 빗방울 (x, y, 크기, 애니메이션 지연)
const raindrops = [
  { x: 40, y: 40, s: 1, d: 0 },
  { x: 300, y: 30, s: 0.8, d: 1.2 },
  { x: 350, y: 140, s: 1.1, d: 2.4 },
  { x: 200, y: 110, s: 0.7, d: 0.6 },
  { x: 30, y: 200, s: 0.9, d: 1.8 },
  { x: 330, y: 380, s: 0.8, d: 3.0 },
  { x: 120, y: 420, s: 1, d: 0.9 },
  { x: 370, y: 260, s: 0.7, d: 2.1 },
];

/**
 * 글자를 캔버스에 그려서 오른쪽 세로획(ㅣ)의 위치·굵기를 픽셀 단위로 찾는다.
 * 시스템 폰트가 기기마다 달라도 실제 렌더링된 글리프 기준으로 맞출 수 있다.
 */
function measureVerticalStroke(el) {
  const style = getComputedStyle(el);
  const fontSize = parseFloat(style.fontSize);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  ctx.font = font;
  const metrics = ctx.measureText(el.textContent);

  const w = Math.ceil(metrics.width) + 4;
  const h = Math.ceil(fontSize * 1.5);
  const baseline = Math.ceil(fontSize * 1.1);
  canvas.width = w;
  canvas.height = h;
  ctx.font = font;
  ctx.fillStyle = '#000';
  ctx.fillText(el.textContent, 0, baseline);

  const { data } = ctx.getImageData(0, 0, w, h);
  const counts = new Array(w).fill(0);
  let inkTop = h;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 128) {
        counts[x]++;
        if (y < inkTop) inkTop = y;
      }
    }
  }

  // 세로로 길게 칠해진 열 = ㅣ 획. 오른쪽에서부터 연속 구간을 찾는다.
  const threshold = Math.max(...counts) * 0.85;
  let right = w - 1;
  while (right >= 0 && counts[right] < threshold) right--;
  if (right < 0) return null;
  let left = right;
  while (left > 0 && counts[left - 1] >= threshold) left--;

  // 세로획 자체의 윗끝(대각선 등 다른 획 제외)
  let strokeTop = inkTop;
  const mid = Math.round((left + right) / 2);
  for (let y = 0; y < h; y++) {
    if (data[(y * w + mid) * 4 + 3] > 128) { strokeTop = y; break; }
  }

  return {
    centerX: (left + right + 1) / 2,
    width: right - left + 1,
    // DOM 인라인 박스의 baseline = rect.top + fontBoundingBoxAscent
    topFromBaseline: baseline - strokeTop,
    fontAscent: metrics.fontBoundingBoxAscent,
  };
}

function RouteIllustration({ svgRef, end }) {
  const { x: ex, y: ey, stroke } = end;
  const d = `M152 0 C150 90 80 190 80 270 C80 340 150 370 200 395 C245 418 ${ex} ${ey - 90} ${ex} ${ey}`;

  return (
    // 남는 높이를 꽉 채우고(slice) 아래쪽을 기준으로 맞춰서, 화면이 낮으면 그림 위쪽이 잘린다
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 block size-full overflow-visible"
      aria-hidden="true"
    >
      {raindrops.map(({ x, y, s, d: delay }, i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path
            className="landing-raindrop"
            style={{ animationDelay: `${delay}s` }}
            d="M0 -9 C3 -4 6 -1 6 3 A6 6 0 0 1 -6 3 C-6 -1 -3 -4 0 -9 Z"
            fill="#CACACA"
          />
        </g>
      ))}

      {/* 물웅덩이 */}
      <ellipse cx="232" cy="290" rx="76" ry="32" fill="#4A6A9C" />
      <ellipse className="landing-ripple" cx="232" cy="290" rx="51" ry="19" fill="none" stroke="#A9C1E6" strokeWidth="2.5" />
      <ellipse cx="232" cy="290" rx="24" ry="9" fill="none" stroke="#A9C1E6" strokeWidth="2.5" />

      {/* 웅덩이를 피해 가서 '비'의 ㅣ 획으로 이어지는 길 */}
      <path d={d} fill="none" stroke={INK} strokeWidth={stroke} strokeLinecap="butt" strokeLinejoin="round" />
    </svg>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const lastBiRef = useRef(null);
  const [end, setEnd] = useState({ x: 252, y: VIEW_H, stroke: 11 });

  useLayoutEffect(() => {
    const update = () => {
      const svg = svgRef.current;
      const bi = lastBiRef.current;
      if (!svg || !bi) return;
      const m = measureVerticalStroke(bi);
      if (!m) return;

      // 화면 좌표 → viewBox 좌표 (preserveAspectRatio로 생긴 배율·여백까지 반영)
      const ctm = svg.getScreenCTM();
      // 레이아웃 전이거나 화면에서 사라진 상태(크기 0)면 역변환이 안 되므로 건너뛴다
      if (!ctm || !(ctm.a > 0)) return;
      const biRect = bi.getBoundingClientRect();
      const baselineY = biRect.top + m.fontAscent;
      const strokeTopY = baselineY - m.topFromBaseline;
      const top = new DOMPoint(biRect.left + m.centerX, strokeTopY).matrixTransform(ctm.inverse());

      const next = {
        x: top.x,
        // ㅣ 획 안쪽으로 조금 더 내려가서 이음새가 보이지 않게
        y: top.y + 12,
        stroke: m.width / ctm.a,
      };
      // fontBoundingBoxAscent 미지원 브라우저 등에서 NaN이 나오면 기존 값 유지
      if (!Object.values(next).every(Number.isFinite)) return;
      setEnd(next);
    };

    update();
    document.fonts?.ready.then(update);
    // 모바일 주소창이 접히고 펴질 때도 그림 영역 크기가 바뀌므로 요소 크기를 직접 지켜본다
    const observer = new ResizeObserver(update);
    if (svgRef.current) observer.observe(svgRef.current);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    // 배경은 화면 전체 폭, 내용은 가운데 열(최대 480px)
    <div className="min-h-dvh w-full bg-[#FAFAFA]">
      {/* 한 화면(dvh)에 다 들어가게: 글자·버튼 높이를 먼저 잡고 그림이 남는 높이를 채운다.
          글자·간격은 화면 폭(vw)과 높이(dvh) 중 작은 쪽에 맞춰 함께 커지고 작아진다. */}
      <main className="mx-auto flex h-dvh min-h-[320px] w-full max-w-[480px] flex-col overflow-hidden text-[#212833]">
        <div className="relative min-h-0 flex-1">
          <RouteIllustration svgRef={svgRef} end={end} />
        </div>

        <div className="flex shrink-0 flex-col px-[clamp(20px,6vw,32px)] pb-[max(clamp(16px,4dvh,40px),env(safe-area-inset-bottom))]">
          <h1 className="mt-[clamp(8px,2dvh,20px)] text-[clamp(56px,min(26vw,13dvh),128px)] font-black leading-none tracking-tighter">
            비켜<span ref={lastBiRef}>비</span>
          </h1>
          <p className="mt-[clamp(12px,4dvh,40px)] break-keep text-[clamp(15px,min(4.8vw,2.6dvh),22px)] font-bold leading-relaxed">
            비오는 날 침수위험구역 피해서<br />안내하는 보행 내비게이션 서비스
          </p>

          <button
            type="button"
            onClick={() => navigate('/home')}
            className="mt-[clamp(20px,6dvh,56px)] flex h-[clamp(52px,7.5dvh,64px)] w-full items-center justify-between rounded-2xl bg-[#212833] px-6 text-[clamp(16px,min(4.8vw,2.6dvh),20px)] font-[600] text-[#FAFAFA]"
          >
            <span>길찾기 시작하기</span>
            <Search className="size-6" strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
      </main>
    </div>
  );
}
