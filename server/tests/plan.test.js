import { describe, it, expect } from 'vitest';
import { computeProgramMetrics, gradeForScore } from '../src/services/training/programMetrics.js';
import { EVIDENCE_BASE, getEvidence, formatEvidence } from '../src/research/evidenceBase.js';

function makeProgram(overrides = {}) {
  return {
    name: 'Test',
    daysPerWeek: 4,
    deloadEveryWeeks: 6,
    days: [
      {
        name: 'Upper',
        exercises: [
          { name: 'Bench', muscleGroup: 'chest', sets: 4, repRange: { min: 6, max: 10 }, targetRir: 2 },
          { name: 'Row', muscleGroup: 'back', sets: 4, repRange: { min: 6, max: 10 }, targetRir: 2 },
          { name: 'OHP', muscleGroup: 'shoulders', sets: 3, repRange: { min: 8, max: 12 }, targetRir: 2 },
        ],
      },
      {
        name: 'Lower',
        exercises: [
          { name: 'Squat', muscleGroup: 'quads', sets: 4, repRange: { min: 6, max: 10 }, targetRir: 2 },
          { name: 'RDL', muscleGroup: 'hamstrings', sets: 4, repRange: { min: 6, max: 10 }, targetRir: 2 },
          { name: 'Hip Thrust', muscleGroup: 'glutes', sets: 3, repRange: { min: 8, max: 12 }, targetRir: 2 },
        ],
      },
    ],
    ...overrides,
  };
}

const exerciseMap = {
  Bench: { isCompound: true },
  Row: { isCompound: true },
  OHP: { isCompound: true },
  Squat: { isCompound: true },
  RDL: { isCompound: true },
  'Hip Thrust': { isCompound: true },
};

describe('computeProgramMetrics', () => {
  it('trả điểm 0-100 và đủ 7 subscores', () => {
    const metrics = computeProgramMetrics(makeProgram(), exerciseMap);
    expect(metrics.score).toBeGreaterThanOrEqual(0);
    expect(metrics.score).toBeLessThanOrEqual(100);
    expect(metrics.subscores).toHaveLength(7);
    expect(metrics.volume.chest).toBe(4);
    expect(metrics.totalSets).toBe(22);
  });

  it('giáo án volume thấp bị điểm volume thấp hơn', () => {
    const low = computeProgramMetrics(
      {
        ...makeProgram(),
        days: [
          {
            name: 'Upper',
            exercises: [
              { name: 'Bench', muscleGroup: 'chest', sets: 2, repRange: { min: 6, max: 10 }, targetRir: 2 },
            ],
          },
        ],
      },
      exerciseMap,
    );
    const normal = computeProgramMetrics(makeProgram(), exerciseMap);
    const lowVolume = low.subscores.find((s) => s.key === 'volume').score;
    const normalVolume = normal.subscores.find((s) => s.key === 'volume').score;
    expect(lowVolume).toBeLessThan(normalVolume);
    expect(low.totalSets).toBe(2);
  });

  it('gradeForScore trả hạng đúng', () => {
    expect(gradeForScore(95)).toBe('A+');
    expect(gradeForScore(85)).toBe('A');
    expect(gradeForScore(75)).toBe('B');
    expect(gradeForScore(65)).toBe('C');
    expect(gradeForScore(50)).toBe('D');
  });
});

describe('evidence base', () => {
  it('có đủ id và DOI cho các nguồn chính', () => {
    expect(EVIDENCE_BASE.length).toBeGreaterThanOrEqual(8);
    for (const item of EVIDENCE_BASE) {
      expect(item.id).toMatch(/^E\d+$/);
      expect(item.citation.doi).toMatch(/^10\./);
    }
  });

  it('formatEvidence chứa id và DOI', () => {
    const text = formatEvidence(getEvidence(['E1', 'E2']));
    expect(text).toContain('[E1]');
    expect(text).toContain('10.1080/02640414.2016.1210197');
    expect(text).toContain('10.1007/s40279-016-0543-8');
  });
});
