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
    <svg ref={svgRef} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full overflow-visible" aria-hidden="true">
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

      const svgRect = svg.getBoundingClientRect();
      const biRect = bi.getBoundingClientRect();
      const k = svgRect.width / VIEW_W; // viewBox 1단위 = k px
      const baselineY = biRect.top + m.fontAscent;
      const strokeTopY = baselineY - m.topFromBaseline;

      setEnd({
        x: (biRect.left + m.centerX - svgRect.left) / k,
        // ㅣ 획 안쪽으로 조금 더 내려가서 이음새가 보이지 않게
        y: (strokeTopY - svgRect.top) / k + 12,
        stroke: m.width / k,
      });
    };

    update();
    document.fonts?.ready.then(update);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[403px] flex-col bg-[#FAFAFA] text-[#212833]">
      <RouteIllustration svgRef={svgRef} end={end} />

      <div className="flex flex-1 flex-col px-6 pb-12">
        <h1 className="mt-4 text-[96px] font-black leading-none tracking-tighter">
          비켜<span ref={lastBiRef}>비</span>
        </h1>
        <p className="mt-10 break-keep text-lg font-bold leading-relaxed">
          비오는 날 침수위험구역 피해서<br />안내하는 보행 내비게이션 서비스
        </p>

        <button
          type="button"
          onClick={() => navigate('/home')}
          className="mt-auto flex h-15 w-full items-center justify-between rounded-2xl bg-[#212833] px-6 text-lg font-[600] text-[#FAFAFA]"
        >
          <span>길찾기 시작하기</span>
          <Search className="size-6" strokeWidth={2.5} aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}
