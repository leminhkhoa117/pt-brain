import { getCalculator } from '../services/calculators/registry.js';
import { CalcHistory } from '../models/CalcHistory.js';
import { ApiError } from '../utils/ApiError.js';

export async function calculate(req, res) {
  const { type } = req.params;
  const calculator = getCalculator(type);
  if (!calculator) throw ApiError.notFound(`Không có máy tính loại "${type}"`);

  const parsed = calculator.schema.safeParse(req.body ?? {});
  if (!parsed.success) {
    throw ApiError.badRequest(
      'Dữ liệu không hợp lệ',
      parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    );
  }

  const output = calculator.run(parsed.data);

  if (req.query.save === 'true') {
    await CalcHistory.create({
      userId: req.userId,
      type,
      inputs: parsed.data,
      outputs: output,
    });
  }

  res.json({ data: { type, inputs: parsed.data, output } });
}

export async function listHistory(req, res) {
  const history = await CalcHistory.find({ userId: req.userId })
    .sort({ date: -1 })
    .limit(50)
    .lean();
  res.json({ data: { history } });
}
