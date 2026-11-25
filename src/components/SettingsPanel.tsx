import { PRIZES, type PrizeId, type Stock } from '../prizes';
import type { HistoryEntry } from '../useStock';

interface Props {
  stock: Stock;
  history: HistoryEntry[];
  onChange: (id: PrizeId, count: number) => void;
  onReset: () => void;
  onClose: () => void;
}

export default function SettingsPanel({ stock, history, onChange, onReset, onClose }: Props) {
  const drawnCount = (id: PrizeId) => history.filter((h) => h.prizeId === id).length;

  return (
    <div className="overlay settings" onClick={onClose}>
      <div className="overlay-backdrop" />
      <div className="settings-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="재고 설정">
        <h2>재고 설정</h2>
        <p className="settings-sub">확률은 재고가 남은 상품끼리 가중치(prizes.ts의 weight) 비율로 정해져요.</p>
        <table>
          <thead>
            <tr>
              <th>상품</th>
              <th>가중치</th>
              <th>남은 재고</th>
              <th>뽑힌 수</th>
            </tr>
          </thead>
          <tbody>
            {PRIZES.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.weight}</td>
                <td>
                  <input
                    type="number"
                    min={0}
                    value={stock[p.id]}
                    onChange={(e) => onChange(p.id, Number(e.target.value))}
                  />
                </td>
                <td>{drawnCount(p.id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="settings-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              if (window.confirm('재고와 뽑기 기록을 처음 상태로 되돌릴까요?')) onReset();
            }}
          >
            처음 상태로 초기화
          </button>
          <button type="button" className="primary-button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
