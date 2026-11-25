import { useEffect, useState } from 'react';

import { initialStock, PRIZES, type PrizeId, type Stock } from './prizes';

const STOCK_KEY = 'tikitaka-gacha:stock';
const HISTORY_KEY = 'tikitaka-gacha:history';

export interface HistoryEntry {
  prizeId: PrizeId;
  at: number;
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 시크릿 창 등에서 저장이 막혀도 발표는 계속된다.
  }
}

/** 새로고침해도 재고·기록이 유지되도록 localStorage에 둔다. */
export function useStock() {
  const [stock, setStock] = useState<Stock>(() => {
    const saved = load<Partial<Stock>>(STOCK_KEY, {});
    // config에 상품이 추가됐을 때 저장본에 없는 상품은 초기 재고로 채운다.
    return { ...initialStock(), ...saved };
  });
  const [history, setHistory] = useState<HistoryEntry[]>(() => load(HISTORY_KEY, []));

  useEffect(() => save(STOCK_KEY, stock), [stock]);
  useEffect(() => save(HISTORY_KEY, history), [history]);

  const consume = (prizeId: PrizeId) => {
    setStock((prev) => ({ ...prev, [prizeId]: Math.max(prev[prizeId] - 1, 0) }));
    setHistory((prev) => [...prev, { prizeId, at: Date.now() }]);
  };

  const setCount = (prizeId: PrizeId, count: number) =>
    setStock((prev) => ({ ...prev, [prizeId]: Math.max(Math.floor(count) || 0, 0) }));

  const reset = () => {
    setStock(initialStock());
    setHistory([]);
  };

  const remaining = PRIZES.reduce((sum, p) => sum + stock[p.id], 0);

  return { stock, history, remaining, consume, setCount, reset };
}
