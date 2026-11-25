import { forwardRef, useImperativeHandle, useRef } from 'react';

import machineBody from '../assets/gacha/machine-body.svg';
import machineCapsules from '../assets/gacha/machine-capsules.svg';
import machineDome from '../assets/gacha/machine-dome.svg';
import machineHandle from '../assets/gacha/machine-handle.svg';

// 레이어는 모두 같은 400×600 캔버스에 제자리로 그려져 있어 겹치기만 하면 맞는다.
const CANVAS = { width: 400, height: 600 };
export const MACHINE_ASPECT_RATIO = CANVAS.width / CANVAS.height;
/** 출구 중앙(캔버스 비율). 캡슐이 여기서 튀어나온다. */
const EXIT = { x: 199.5 / CANVAS.width, y: 525 / CANVAS.height };
// 손잡이 레이어도 캔버스 전체 크기라, 손잡이 중심을 축으로 지정해야 제자리에서 돈다.
const HANDLE_ORIGIN = `${(280.3 / CANVAS.width) * 100}% ${(407.8 / CANVAS.height) * 100}%`;

const TURNS = 2;
const TURN_MS = 800;
const PILE_JUMP_PX = 6;
const PILE_TILT_DEG = 3;
const SWAY_DEG = 1.5;
/** 한 바퀴 동안 캡슐·통이 흔들리는 궤적(-1~1). 점점 잦아들게 해 덜컹임이 자연스럽다. */
const JIGGLE_STEPS = [0, 1, -0.6, 0.35, 0];

export interface GachaMachineHandle {
  /** 손잡이를 돌린다. 다 돌면 resolve. */
  crank: () => Promise<void>;
  /** 캡슐이 나올 출구의 화면 좌표 */
  exitPoint: () => { x: number; y: number };
}

const jiggleFrames = (toTransform: (v: number) => string) =>
  Array.from({ length: TURNS }, (_, turn) =>
    JIGGLE_STEPS.slice(turn === 0 ? 0 : 1).map((v) => ({ transform: toTransform(v) })),
  ).flat();

const GachaMachine = forwardRef<GachaMachineHandle>(function GachaMachine(_, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const swayRef = useRef<HTMLDivElement>(null);
  const pileRef = useRef<HTMLImageElement>(null);
  const handleRef = useRef<HTMLImageElement>(null);

  useImperativeHandle(ref, () => ({
    crank: async () => {
      const duration = TURN_MS * TURNS;
      // 바퀴마다 가속·감속하도록 keyframe 구간마다 easing을 준다.
      const handle = handleRef.current?.animate(
        Array.from({ length: TURNS + 1 }, (_, i) => ({
          transform: `rotate(${i * 360}deg)`,
          easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
        })),
        { duration },
      );
      swayRef.current?.animate(
        jiggleFrames((v) => `rotate(${v * SWAY_DEG}deg)`),
        { duration, easing: 'ease-in-out' },
      );
      pileRef.current?.animate(
        jiggleFrames(
          (v) => `translateY(${-Math.abs(v) * PILE_JUMP_PX}px) rotate(${v * PILE_TILT_DEG}deg)`,
        ),
        { duration, easing: 'ease-in-out' },
      );
      await handle?.finished;
    },
    exitPoint: () => {
      const rect = rootRef.current!.getBoundingClientRect();
      return { x: rect.left + rect.width * EXIT.x, y: rect.top + rect.height * EXIT.y };
    },
  }));

  return (
    <div ref={rootRef} className="machine" style={{ aspectRatio: MACHINE_ASPECT_RATIO }}>
      <div ref={swayRef} className="machine-layer" style={{ transformOrigin: 'bottom' }}>
        <img src={machineDome} className="machine-layer" alt="" draggable={false} />
        <img ref={pileRef} src={machineCapsules} className="machine-layer" alt="" draggable={false} />
        <img src={machineBody} className="machine-layer" alt="" draggable={false} />
        <img
          ref={handleRef}
          src={machineHandle}
          className="machine-layer"
          style={{ transformOrigin: HANDLE_ORIGIN }}
          alt=""
          draggable={false}
        />
      </div>
    </div>
  );
});

export default GachaMachine;
