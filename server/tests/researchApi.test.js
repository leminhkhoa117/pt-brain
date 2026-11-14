import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

// Phải set trước khi import env.js.
process.env.NODE_ENV = 'test';

const DB_NAME = `pt-brain-research-api-${process.pid}-${Date.now()}`;
const DB_URI = `mongodb://127.0.0.1:27017/${DB_NAME}`;

// Mock lớp HTTP để test API graph không phụ thuộc OpenAlex thật.
vi.mock('../src/utils/http.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, fetchJson: vi.fn() };
});

let app;
let agent;
let models;
let mongoose;
let summaryId;
let paperId;
let fetchJson;

const WORK = (id, overrides = {}) => ({
  id: `https://openalex.org/${id}`,
  doi: `https://doi.org/10.1000/${id.toLowerCase()}`,
  title: `Paper ${id}`,
  publication_year: 2020,
  type: 'article',
  cited_by_count: 12,
  authorships: [{ author: { display_name: 'Test Author' } }],
  primary_location: { source: { display_name: 'Test Journal' } },
  open_access: { is_oa: true, oa_status: 'green' },
  is_retracted: false,
  ...overrides,
});

beforeAll(async () => {
  const { connectDb } = await import('../src/config/db.js');
  await connectDb(DB_URI);

  mongoose = (await import('mongoose')).default;
  const { createApp } = await import('../src/app.js');
  const { User } = await import('../src/models/User.js');
  const { Paper } = await import('../src/models/Paper.js');
  const { Summary } = await import('../src/models/Summary.js');
  models = { User, Paper, Summary };

  fetchJson = (await import('../src/utils/http.js')).fetchJson;
  fetchJson.mockImplementation(async (url) => {
    if (url.includes('filter=openalex_id:')) {
      return { results: [WORK('W1'), WORK('W2')] };
    }
    if (url.includes('filter=cites:')) {
      return { results: [WORK('W3', { cited_by_count: 99 })] };
    }
    if (url.includes('?select=id&')) return { id: 'https://openalex.org/W123' };
    if (url.includes('select=referenced_works')) {
      return { referenced_works: ['https://openalex.org/W1', 'https://openalex.org/W2'] };
    }
    if (url.includes('select=related_works')) {
      return { related_works: ['https://openalex.org/W4'] };
    }
    if (url.includes('filter=doi:')) {
      return {
        results: [
          {
            doi: 'https://doi.org/10.1249/MSS.0000000000001764',
            ids: { pmcid: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6303131' },
            open_access: { is_oa: true, oa_status: 'green' },
            best_oa_location: { pdf_url: 'https://repo.example/paper.pdf' },
            is_retracted: false,
          },
        ],
      };
    }
    throw new Error(`Unexpected fetchJson URL in test: ${url}`);
  });

  app = createApp();
  agent = request.agent(app);

  await agent
    .post('/api/auth/register')
    .send({
      name: 'Research API Test',
      email: 'research-api@example.com',
      password: 'mat-khau-rat-dai-123',
    })
    .expect(201);

  const me = await agent.get('/api/me').expect(200);
  const userId = me.body.data.user._id;

  const paper = await models.Paper.create({
    userId,
    title: 'Resistance Training Volume Enhances Muscle Hypertrophy but Not Strength in Trained Men',
    authors: ['Brad J Schoenfeld', 'Bret Contreras'],
    year: 2019,
    journal: 'Medicine & Science in Sports & Exercise',
    volume: '51',
    issue: '1',
    pages: '94-103',
    doi: '10.1249/mss.0000000000001764',
    isOpenAccess: true,
    oaStatus: 'green',
    isRetracted: false,
  });
  paperId = paper._id;

  const summary = await models.Summary.create({
    userId,
    paperId,
    inputType: 'doi',
    basedOn: 'fulltext',
    content: {
      metadata: { title: paper.title, doi: paper.doi },
      tldr: 'Test',
      mainResults: [],
      confidence: { basedOn: 'fulltext', missingInfo: [] },
    },
    status: 'ready',
    cacheKey: 'research-api-test',
  });
  summaryId = summary._id;
});

afterAll(async () => {
  if (mongoose) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

describe('Research API integration', () => {
  it('chặn graph khi chưa đăng nhập', async () => {
    await request(app).get('/api/research/graph?doi=10.1249/mss.0000000000001764').expect(401);
  });

  it('từ chối kind không hợp lệ', async () => {
    await agent
      .get('/api/research/graph')
      .query({ doi: '10.1249/mss.0000000000001764', kind: 'all' })
      .expect(400);
  });

  it('trả references từ OpenAlex (mock)', async () => {
    const res = await agent
      .get('/api/research/graph')
      .query({ doi: '10.1249/mss.0000000000001764', kind: 'references', limit: 3 })
      .expect(200);

    expect(res.body.data.kind).toBe('references');
    expect(res.body.data.items).toHaveLength(2);
    expect(res.body.data.items[0].title).toBe('Paper W1');
  });

  it('trả citations từ OpenAlex (mock)', async () => {
    const res = await agent
      .get('/api/research/graph')
      .query({ doi: '10.1249/mss.0000000000001764', kind: 'citations', limit: 3 })
      .expect(200);

    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].citationCount).toBe(99);
  });

  it('tải BibTeX với header attachment', async () => {
    const res = await agent
      .get(`/api/summaries/${summaryId}/citation`)
      .query({ format: 'bibtex' })
      .expect(200);

    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.headers['content-disposition']).toContain('.bib');
    expect(res.text).toContain('@article{');
    expect(res.text).toContain('Schoenfeld, Brad J');
    expect(res.text).toContain('10.1249/mss.0000000000001764');
  });

  it('tải RIS và APA', async () => {
    const ris = await agent
      .get(`/api/summaries/${summaryId}/citation?format=ris`)
      .expect(200);
    expect(ris.text).toContain('TY  - JOUR');
    expect(ris.text).toContain('ER  -');

    const apa = await agent
      .get(`/api/summaries/${summaryId}/citation?format=apa`)
      .expect(200);
    expect(apa.text).toContain('(2019).');
    expect(apa.text).toContain('https://doi.org/10.1249/mss.0000000000001764');
  });

  it('từ chối format trích dẫn lạ', async () => {
    await agent.get(`/api/summaries/${summaryId}/citation?format=mla`).expect(400);
  });

  it('trả 404 với summary không tồn tại', async () => {
    await agent
      .get(`/api/summaries/${new mongoose.Types.ObjectId()}/citation?format=bibtex`)
      .expect(404);
  });

  it('enrich batch full-text cập nhật đúng PMCID/PDF', async () => {
    const { enrichFullTextAvailability } = await import(
      '../src/services/research/oaCandidates.js'
    );
    const items = await enrichFullTextAvailability([
      { doi: '10.1249/MSS.0000000000001764', isOpenAccess: false, pmcid: '' },
    ]);
    expect(items[0]).toMatchObject({
      isOpenAccess: true,
      oaStatus: 'green',
      pmcid: 'PMC6303131',
      pdfUrl: 'https://repo.example/paper.pdf',
    });
  });
});
