import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import capsuleBottom from '../assets/gacha/capsule-bottom.svg';
import capsuleTop from '../assets/gacha/capsule-top.svg';

const SIZE = 180;
const START_SCALE = 0.25;
const POP_MS = 750;
/** 출구에서 가운데로 날아올 때 위로 솟는 높이. 직선으로 오면 밋밋하다. */
const ARC_PX = 160;
const SPIN_DEG = 360;
const OPEN_MS = 380;
const ARC_STEPS = 24;

interface Props {
  /** 캡슐이 튀어나올 출구 위치(화면 좌표) */
  from: { x: number; y: number };
  /** 캡슐이 다 열려 결과를 보여 줄 차례 */
  onOpened: () => void;
  /** 키보드로 열 수 있게 부모가 올리는 신호 */
  openSignal: number;
}

export default function CapsuleReveal({ from, onOpened, openSignal }: Props) {
  const capsuleRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLImageElement>(null);
  const bottomRef = useRef<HTMLImageElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  useLayoutEffect(() => {
    const start = { x: from.x - SIZE / 2, y: from.y - SIZE / 2 };
    const end = { x: (window.innerWidth - SIZE) / 2, y: (window.innerHeight - SIZE) / 2 };
    // 포물선은 keyframe을 촘촘히 찍어 만든다. 전체 easing이 진행도에 걸린다.
    const frames = Array.from({ length: ARC_STEPS + 1 }, (_, i) => {
      const p = i / ARC_STEPS;
      const x = start.x + (end.x - start.x) * p;
      const y = start.y + (end.y - start.y) * p - ARC_PX * 4 * p * (1 - p);
      const scale = START_SCALE + (1 - START_SCALE) * p;
      return { transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${(p - 1) * SPIN_DEG}deg)` };
    });
    const pop = capsuleRef.current!.animate(frames, {
      duration: POP_MS,
      easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
      fill: 'forwards',
    });
    backdropRef.current!.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: POP_MS,
      fill: 'forwards',
    });
    pop.finished.then(() => setIsReady(true)).catch(() => {});
    return () => pop.cancel();
  }, [from.x, from.y]);

  const handleOpen = () => {
    if (!isReady || isOpening) return;
    setIsOpening(true);
    const timing = { duration: OPEN_MS, easing: 'cubic-bezier(0.33, 1, 0.68, 1)', fill: 'forwards' as const };
    topRef.current!.animate(
      [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-140px) rotate(-35deg)', opacity: 0 }],
      timing,
    );
    bottomRef.current!.animate(
      [{ transform: 'none', opacity: 1 }, { transform: 'translateY(90px) rotate(15deg)', opacity: 0 }],
      timing,
    );
    flashRef
      .current!.animate(
        [
          { transform: 'scale(0)', opacity: 1 },
          { transform: 'scale(5)', opacity: 0 },
        ],
        timing,
      )
      .finished.then(onOpened)
      .catch(() => {});
  };

  // 부모(키보드)에서 열기 신호가 오면 연다.
  const lastSignal = useRef(openSignal);
  useEffect(() => {
    if (openSignal === lastSignal.current) return;
    lastSignal.current = openSignal;
    handleOpen();
  });

  return (
    <div className="overlay" onClick={handleOpen} role="button" aria-label="캡슐 열기">
      <div ref={backdropRef} className="overlay-backdrop" style={{ opacity: 0 }} />
      <div
        ref={flashRef}
        className="capsule-flash"
        style={{ width: SIZE, height: SIZE, left: `calc(50% - ${SIZE / 2}px)`, top: `calc(50% - ${SIZE / 2}px)` }}
      />
      <div ref={capsuleRef} className="capsule" style={{ width: SIZE, height: SIZE }}>
        <div className={`capsule-wobble ${isReady && !isOpening ? 'is-wobbling' : ''}`}>
          <img ref={bottomRef} src={capsuleBottom} alt="" draggable={false} />
          <img ref={topRef} src={capsuleTop} alt="" draggable={false} />
        </div>
      </div>
      {isReady && !isOpening ? (
        <p className="capsule-hint" style={{ top: `calc(50% + ${SIZE / 2 + 28}px)` }}>
          탭해서 열어보세요
        </p>
      ) : null}
    </div>
  );
}
