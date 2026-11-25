export type PrizeId = 'sticker' | 'seal' | 'keyring';

export interface Prize {
  id: PrizeId;
  name: string;
  /** 결과 화면에서 이름 아래 보이는 한 줄 */
  description: string;
  /** 재고가 남은 상품끼리 이 값의 비율로 뽑힌다. */
  weight: number;
  /** 처음 재고. 발표 중에는 설정 패널(S 키)에서 바꿀 수 있다. */
  initialStock: number;
  /** 결과 화면 강조. rare면 금빛 연출이 붙는다. */
  rare?: boolean;
  /** 실물 사진을 쓰려면 public/prizes/ 에 넣고 경로를 적는다. 비우면 기본 일러스트. */
  image?: string;
}

export const PRIZES: Prize[] = [
  {
    id: 'sticker',
    name: '스티커',
    description: '어디든 붙여 보세요!',
    weight: 60,
    initialStock: 30,
  },
  {
    id: 'seal',
    name: '띠부띠부 씰',
    description: '떼었다 붙였다 반짝반짝',
    weight: 30,
    initialStock: 20,
  },
  {
    id: 'keyring',
    name: '키캡 키링',
    description: '오늘의 대박 당첨!',
    weight: 10,
    initialStock: 5,
    rare: true,
  },
];

export type Stock = Record<PrizeId, number>;

export const initialStock = (): Stock =>
  Object.fromEntries(PRIZES.map((p) => [p.id, p.initialStock])) as Stock;

/** 재고가 남은 상품 중 weight 비율로 하나 고른다. 다 떨어졌으면 null. */
export function drawPrize(stock: Stock): Prize | null {
  const pool = PRIZES.filter((p) => stock[p.id] > 0 && p.weight > 0);
  const total = pool.reduce((sum, p) => sum + p.weight, 0);
  if (total === 0) return null;
  let roll = Math.random() * total;
  for (const prize of pool) {
    roll -= prize.weight;
    if (roll < 0) return prize;
  }
  return pool[pool.length - 1];
}

/** 현재 재고 기준 실제 당첨 확률(%) */
export function chanceOf(prize: Prize, stock: Stock): number {
  const total = PRIZES.filter((p) => stock[p.id] > 0).reduce((sum, p) => sum + p.weight, 0);
  if (total === 0 || stock[prize.id] <= 0) return 0;
  return (prize.weight / total) * 100;
}
