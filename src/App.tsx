import { useEffect, useRef, useState } from 'react';

import CapsuleReveal from './components/CapsuleReveal';
import GachaMachine, { type GachaMachineHandle } from './components/GachaMachine';
import PrizeResult from './components/PrizeResult';
import SettingsPanel from './components/SettingsPanel';
import { chanceOf, drawPrize, PRIZES, type Prize } from './prizes';
import { useStock } from './useStock';

// cranking: 손잡이 돌리는 중 → revealing: 캡슐이 나와 열리길 기다림 → result: 결과 표시
type Phase = 'idle' | 'cranking' | 'revealing' | 'result';

export default function App() {
  const { stock, history, remaining, consume, setCount, reset } = useStock();
  const machineRef = useRef<GachaMachineHandle>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [prize, setPrize] = useState<Prize | null>(null);
  const [revealFrom, setRevealFrom] = useState<{ x: number; y: number } | null>(null);
  const [openSignal, setOpenSignal] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const canPull = phase === 'idle' && remaining > 0;

  // 클릭과 키 입력이 같은 틱에 겹치면 phase가 아직 idle이라 두 번 뽑힌다. ref로 막는다.
  const pullingRef = useRef(false);

  const pull = async () => {
    if (!canPull || pullingRef.current) return;
    // 결과는 손잡이를 돌리기 전에 정해 둔다. 연출 도중 재고가 바뀌어도 결과가 흔들리지 않는다.
    const picked = drawPrize(stock);
    if (!picked) return;
    pullingRef.current = true;
    setPrize(picked);
    setPhase('cranking');
    await machineRef.current?.crank();
    pullingRef.current = false;
    setRevealFrom(machineRef.current?.exitPoint() ?? { x: innerWidth / 2, y: innerHeight });
    setPhase('revealing');
  };

  const handleOpened = () => {
    if (prize) consume(prize.id);
    setRevealFrom(null);
    setPhase('result');
  };

  const dismiss = () => {
    setPrize(null);
    setPhase('idle');
  };

  // 발표 리모컨(→, PageDown)이나 스페이스·엔터 하나로 뽑기 → 열기 → 닫기를 진행한다.
  const advance = useRef<() => void>(() => {});
  advance.current = () => {
    if (phase === 'idle') pull();
    else if (phase === 'revealing') setOpenSignal((n) => n + 1);
    else if (phase === 'result') dismiss();
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 's' || e.key === 'S' || e.key === 'ㄴ') {
        setSettingsOpen((open) => !open);
        return;
      }
      if (e.key === 'f' || e.key === 'F' || e.key === 'ㄹ') {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen().catch(() => {});
        return;
      }
      if (settingsOpen) return;
      if ([' ', 'Enter', 'ArrowRight', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        advance.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [settingsOpen]);

  return (
    <main className="page">
      <header className="page-header">
        <img src="/tikitaka-logo.png" alt="티키타카" className="logo" />
        <button type="button" className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="설정">
          ⚙︎
        </button>
      </header>

      <section className="title">
        <h1>행운의 가챠</h1>
        <p>무엇이 나올까요? 두근두근...</p>
      </section>

      <div className="stage">
        <ul className="prize-list" aria-label="상품 목록">
          {PRIZES.map((p) => (
            <li key={p.id} className={`prize-chip ${stock[p.id] === 0 ? 'is-out' : ''} ${p.rare ? 'is-rare' : ''}`}>
              <div>
                <strong>{p.name}</strong>
                <span>
                  {stock[p.id] === 0 ? '소진' : `확률 ${chanceOf(p, stock).toFixed(0)}%`}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div className="machine-wrap">
          <GachaMachine ref={machineRef} />
        </div>
      </div>

      <div className="actions">
        <button type="button" className="pull-button" onClick={pull} disabled={!canPull}>
          {remaining === 0 ? '모두 소진!' : phase === 'idle' ? '뽑기!' : '두근두근...'}
        </button>
        <p className="keys-hint">스페이스 / 엔터로 진행 · F 전체화면 · S 재고 설정</p>
      </div>

      {phase === 'revealing' && revealFrom ? (
        <CapsuleReveal from={revealFrom} onOpened={handleOpened} openSignal={openSignal} />
      ) : null}

      {phase === 'result' && prize ? <PrizeResult prize={prize} onDismiss={dismiss} /> : null}

      {settingsOpen ? (
        <SettingsPanel
          stock={stock}
          history={history}
          onChange={setCount}
          onReset={reset}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}
    </main>
  );
}
