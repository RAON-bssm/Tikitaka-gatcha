import { useMemo, type CSSProperties } from 'react';

import type { Prize } from '../prizes';
import PrizeArt from './PrizeArt';

const CONFETTI_COLORS = ['#FC8253', '#FDAB8C', '#4078FF', '#A7C1FF', '#FFE27A', '#ffffff'];

interface Props {
  prize: Prize;
  onDismiss: () => void;
}

export default function PrizeResult({ prize, onDismiss }: Props) {
  const confetti = useMemo(
    () =>
      Array.from({ length: prize.rare ? 90 : 48 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 200 + Math.random() * (prize.rare ? 420 : 300);
        return {
          key: i,
          style: {
            '--dx': `${Math.cos(angle) * distance}px`,
            '--dy': `${Math.sin(angle) * distance - 120}px`,
            '--rot': `${Math.random() * 720 - 360}deg`,
            '--delay': `${Math.random() * 120}ms`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            width: 8 + Math.random() * 8,
            height: 12 + Math.random() * 10,
          } as CSSProperties,
        };
      }),
    [prize],
  );

  return (
    <div
      className={`overlay result ${prize.rare ? 'is-rare' : ''}`}
      onClick={onDismiss}
      role="dialog"
      aria-label={`${prize.name} 당첨`}
    >
      <div className="overlay-backdrop" />
      {prize.rare ? <div className="rare-rays" /> : null}
      <div className="result-center">
        <div className="glow-ring ring-1" />
        <div className="glow-ring ring-2" />
        <div className="glow-ring ring-3" />
        <div className="confetti">
          {confetti.map((c) => (
            <span key={c.key} style={c.style} />
          ))}
        </div>

        <div className="result-content">
          {prize.rare ? <div className="rare-badge">RARE!</div> : null}
          <h2 className="result-name" data-text={prize.name}>
            {prize.name}
          </h2>
          <div className="result-art">
            <div className="result-float">
              <PrizeArt prize={prize} size={260} />
            </div>
          </div>
          <p className="result-desc">{prize.description}</p>
        </div>
      </div>
      <p className="result-hint">아무 곳이나 눌러 닫기</p>
    </div>
  );
}
