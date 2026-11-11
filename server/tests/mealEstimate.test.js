import { describe, it, expect } from 'vitest';
import { mealEstimateSchema } from '../src/validation/vision.js';

const valid = {
  mealType: 'lunch',
  description: 'ức gà áp chảo',
  items: [
    { name: 'Ức gà', grams: 150 },
    { name: 'Cơm trắng', grams: 200 },
  ],
};

describe('meal estimate validation', () => {
  it('nhận món + khối lượng hợp lệ', () => {
    const parsed = mealEstimateSchema.parse(valid);
    expect(parsed.items).toHaveLength(2);
    expect(parsed.items[0].grams).toBe(150);
    expect(parsed.mealType).toBe('lunch');
  });

  it('mặc định mealType=lunch và ép gram từ chuỗi', () => {
    const parsed = mealEstimateSchema.parse({ items: [{ name: 'Trứng', grams: '100' }] });
    expect(parsed.mealType).toBe('lunch');
    expect(parsed.items[0].grams).toBe(100);
  });

  it('chặn khối lượng <= 0 và tên rỗng', () => {
    expect(() =>
      mealEstimateSchema.parse({ items: [{ name: 'Cơm', grams: 0 }] }),
    ).toThrow();
    expect(() =>
      mealEstimateSchema.parse({ items: [{ name: '   ', grams: 100 }] }),
    ).toThrow();
  });

  it('chặn danh sách rỗng, quá 20 món và field lạ', () => {
    expect(() => mealEstimateSchema.parse({ items: [] })).toThrow();
    expect(() =>
      mealEstimateSchema.parse({
        items: Array.from({ length: 21 }, (_, i) => ({ name: `Món ${i}`, grams: 100 })),
      }),
    ).toThrow();
    expect(() =>
      mealEstimateSchema.parse({ items: [{ name: 'Cơm', grams: 100, calories: 130 }] }),
    ).toThrow();
  });
});
