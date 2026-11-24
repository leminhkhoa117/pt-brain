import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ANATOMY_FOR_MUSCLE,
  CONNECTIVE_TISSUES,
  getAnatomyStructure,
  resolveAtlasStructure,
} from '../../shared/anatomy/index.js';
import { buildStructureMessages } from '../src/services/ai/muscleCoach.js';
import { muscleChatSchema } from '../src/validation/muscle.js';

const atlasPath = path.resolve(process.cwd(), '../client/public/models/human-atlas/atlas.json');
const atlas = JSON.parse(fs.readFileSync(atlasPath, 'utf8'));
const conceptById = new Map(atlas.concepts.map((concept) => [concept.id, concept]));

describe('anatomy knowledge base', () => {
  it('phủ toàn bộ concept xương và mô liên kết của atlas', () => {
    const seen = new Set();
    let missing = 0;
    for (const part of atlas.parts) {
      if (part.system !== 'skeletal' && part.system !== 'connective') continue;
      const concept = conceptById.get(part.conceptId);
      if (!concept || seen.has(concept.id)) continue;
      seen.add(concept.id);
      const resolved = resolveAtlasStructure({
        id: concept.id,
        name: concept.name,
        system: part.system,
      });
      if (!resolved) missing += 1;
    }
    expect(seen.size).toBeGreaterThan(300);
    expect(missing).toBe(0);
  });

  it('resolve đúng xương lớn, xương sinh tên tự động và mô liên kết', () => {
    const femur = getAnatomyStructure('FMA24474');
    expect(femur.vi).toBe('Xương đùi bên phải');
    expect(femur.attachments).toContain('gluteus-maximus');

    const rib = resolveAtlasStructure({
      id: 'FMA8248',
      name: 'right seventh costal cartilage',
      system: 'skeletal',
    });
    expect(rib.vi).toBe('Sụn sườn thứ 7 bên phải');
    expect(rib.type).toBe('cartilage');

    const disk = resolveAtlasStructure({
      id: 'FMA10446',
      name: 'intervertebral disk',
      system: 'skeletal',
    });
    expect(disk.kind).toBe('connective');
    expect(disk.vi).toContain('Đĩa đệm');

    const tendon = getAnatomyStructure('FMA264844');
    expect(tendon.vi).toContain('Gân gót');
    expect(tendon.kind).toBe('connective');
    expect(Object.keys(CONNECTIVE_TISSUES).length).toBeGreaterThan(10);
  });

  it('nối cơ với xương/mô liên kết liên quan', () => {
    const related = ANATOMY_FOR_MUSCLE['gluteus-maximus'] || [];
    expect(related.some((item) => item.vi.startsWith('Xương đùi'))).toBe(true);
    expect(related.some((item) => item.vi.includes('Xương hông'))).toBe(true);
  });
});

describe('AI anatomy context', () => {
  const profile = { goal: 'cut', experience: 'intermediate', healthConditions: ['knee_pain'] };

  it('prompt của xương chứa mô tả, chức năng, tải tập và lưu ý an toàn — không chỉ tên', () => {
    const structure = getAnatomyStructure('FMA24474');
    const messages = buildStructureMessages({
      structure: { ...structure, kind: 'bone' },
      message: 'Đau xương đùi khi squat thì nên làm gì?',
      profile,
    });
    const system = messages[0].content;
    expect(system).toContain('Xương đùi');
    expect(system).toContain('Femur');
    expect(system).toContain('Mô tả:');
    expect(system).toContain('Chức năng:');
    expect(system).toContain('Ứng dụng tập luyện:');
    expect(system).toContain('Lưu ý an toàn/lâm sàng:');
    expect(system).toContain('knee_pain');
  });

  it('prompt của cơ chứa chức năng, bài tập và ghi chú kỹ thuật của PT Brain', () => {
    const messages = buildStructureMessages({
      structure: {
        kind: 'muscle',
        slug: 'pectoralis-major',
        vi: 'Cơ ngực lớn',
        en: 'Pectoralis major',
        groupVi: 'Cơ ngực',
        region: 'Cơ ngực',
        description: 'Khép và xoay trong cánh tay, gấp vai.',
        functions: ['Khép và xoay trong cánh tay, gấp vai.'],
        exercises: ['Bench press', 'Dumbbell fly'],
        note: 'Giữ vai hạ xuống và bả vai hơi khép.',
        relatedBones: ANATOMY_FOR_MUSCLE['pectoralis-major'],
      },
      message: 'Nên tập mấy set?',
      profile,
    });
    const system = messages[0].content;
    expect(system).toContain('Bench press');
    expect(system).toContain('Giữ vai hạ xuống');
    expect(system).toContain('Cấu trúc xương/mô liên kết liên quan');
  });

  it('validation cho phép chat xương theo FMA và chặn id sai', () => {
    const valid = muscleChatSchema.parse({
      kind: 'bone',
      id: 'FMA24474',
      message: 'Xương này có chức năng gì?',
    });
    expect(valid.kind).toBe('bone');
    expect(() => muscleChatSchema.parse({ kind: 'bone', id: 'bad-id', message: 'hỏi gì đó' })).toThrow();
  });
});
