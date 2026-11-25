import type { Prize } from '../prizes';

/** 실물 사진(prize.image)이 있으면 그것을, 없으면 기본 일러스트를 그린다. */
export default function PrizeArt({ prize, size }: { prize: Prize; size: number }) {
  if (prize.image) {
    return (
      <img
        src={prize.image}
        alt={prize.name}
        width={size}
        height={size}
        style={{ objectFit: 'contain' }}
        draggable={false}
      />
    );
  }
  const Art = ART[prize.id];
  return <Art size={size} />;
}

const ART: Record<Prize['id'], (props: { size: number }) => JSX.Element> = {
  sticker: StickerArt,
  seal: SealArt,
  keyring: KeyringArt,
};

function StickerArt({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label="스티커">
      <defs>
        <linearGradient id="stickerBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FDAB8C" />
          <stop offset="1" stopColor="#FC8253" />
        </linearGradient>
        <linearGradient id="stickerPeel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EEF1F6" />
          <stop offset="1" stopColor="#C4CCDA" />
        </linearGradient>
        <filter id="stickerShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#1A202C" floodOpacity="0.18" />
        </filter>
      </defs>
      <g filter="url(#stickerShadow)" transform="rotate(-8 100 100)">
        {/* 칼선 흰 테두리 */}
        <path d="M40 30h120a14 14 0 0 1 14 14v86l-44 44H40a14 14 0 0 1-14-14V44a14 14 0 0 1 14-14z" fill="#fff" />
        <path d="M46 38h108a10 10 0 0 1 10 10v78l-38 38H46a10 10 0 0 1-10-10V48a10 10 0 0 1 10-10z" fill="url(#stickerBg)" />
        {/* 말풍선 두 개 = 티키타카 */}
        <rect x="52" y="62" width="62" height="38" rx="19" fill="#fff" />
        <path d="M64 96l-6 14 18-10z" fill="#fff" />
        <rect x="90" y="96" width="60" height="36" rx="18" fill="#4078FF" />
        <path d="M138 128l8 12-18-8z" fill="#4078FF" />
        <circle cx="72" cy="81" r="4" fill="#FC8253" />
        <circle cx="83" cy="81" r="4" fill="#FC8253" />
        <circle cx="94" cy="81" r="4" fill="#FC8253" />
        <circle cx="110" cy="114" r="4" fill="#fff" />
        <circle cx="120" cy="114" r="4" fill="#fff" />
        <circle cx="130" cy="114" r="4" fill="#fff" />
        {/* 벗겨진 모서리 */}
        <path d="M130 174l44-44c-6 22-22 38-44 44z" fill="url(#stickerPeel)" />
      </g>
    </svg>
  );
}

function SealArt({ size }: { size: number }) {
  // 가장자리를 물결 모양으로 자른 둥근 씰
  const bumps = 18;
  const outer = Array.from({ length: bumps * 2 }, (_, i) => {
    const angle = (Math.PI * i) / bumps;
    const r = i % 2 === 0 ? 82 : 75;
    return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
  }).join(' ');
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label="띠부띠부 씰">
      <defs>
        <linearGradient id="sealHolo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A7C1FF" />
          <stop offset="0.3" stopColor="#FED8CA" />
          <stop offset="0.55" stopColor="#FFF6B8" />
          <stop offset="0.8" stopColor="#C4F0E0" />
          <stop offset="1" stopColor="#C4D5FF" />
        </linearGradient>
        <radialGradient id="sealInner" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#6693FF" />
          <stop offset="1" stopColor="#2D55B5" />
        </radialGradient>
        <filter id="sealShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#1A202C" floodOpacity="0.2" />
        </filter>
      </defs>
      <g filter="url(#sealShadow)">
        <polygon points={outer} fill="url(#sealHolo)" stroke="#fff" strokeWidth="6" strokeLinejoin="round" />
        <circle cx="100" cy="100" r="56" fill="url(#sealInner)" />
        {/* 반짝이는 별 */}
        <path
          d="M100 62l9 26 27 1-21 17 7 26-22-15-22 15 7-26-21-17 27-1z"
          fill="#FFE27A"
          stroke="#fff"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path d="M58 70l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#fff" />
        <path d="M144 128l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff" />
        {/* 홀로그램 광택 */}
        <path d="M52 78a52 52 0 0 1 40-32" stroke="#fff" strokeOpacity="0.7" strokeWidth="6" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

function KeyringArt({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label="키캡 키링">
      <defs>
        <linearGradient id="keyRing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F8F9FB" />
          <stop offset="0.5" stopColor="#9DAABB" />
          <stop offset="1" stopColor="#DDE2EC" />
        </linearGradient>
        <linearGradient id="keySide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E5764C" />
          <stop offset="1" stopColor="#B35C3B" />
        </linearGradient>
        <linearGradient id="keyTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FEC6B0" />
          <stop offset="1" stopColor="#FC8253" />
        </linearGradient>
        <filter id="keyShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#1A202C" floodOpacity="0.22" />
        </filter>
      </defs>
      <g filter="url(#keyShadow)">
        {/* 링과 체인 */}
        <circle cx="100" cy="34" r="22" fill="none" stroke="url(#keyRing)" strokeWidth="7" />
        <rect x="95" y="54" width="10" height="16" rx="5" fill="none" stroke="#9DAABB" strokeWidth="5" />
        <rect x="95" y="68" width="10" height="14" rx="5" fill="none" stroke="#C4CCDA" strokeWidth="5" />
        {/* 키캡: 아래가 넓은 사다리꼴 + 오목한 윗면 */}
        <path d="M42 96h116l14 78a10 10 0 0 1-10 12H38a10 10 0 0 1-10-12z" fill="url(#keySide)" />
        <path d="M56 88h88a10 10 0 0 1 10 10l-4 52a10 10 0 0 1-10 9H60a10 10 0 0 1-10-9l-4-52a10 10 0 0 1 10-10z" fill="url(#keyTop)" />
        <path d="M62 96h76" stroke="#fff" strokeOpacity="0.6" strokeWidth="4" strokeLinecap="round" />
        <text
          x="100"
          y="138"
          textAnchor="middle"
          fontFamily="OkDanDan, Pretendard, sans-serif"
          fontSize="42"
          fill="#fff"
        >
          T
        </text>
      </g>
    </svg>
  );
}
