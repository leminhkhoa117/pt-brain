import { useState } from 'react';
import { Card, Icon } from '../ui.jsx';
import { RESEARCH_TOPICS } from '@shared/research/topics.js';
import ResearchGuide from './ResearchGuide.jsx';

const INITIAL_COUNT = 6;

export default function ResearchTopics({ onSelect, disabled = false }) {
  const [showAll, setShowAll] = useState(false);
  const topics = showAll ? RESEARCH_TOPICS : RESEARCH_TOPICS.slice(0, INITIAL_COUNT);

  return (
    <Card className="mb-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Chủ đề gợi ý</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Chọn một chủ đề để nạp 4 truy vấn chuẩn và tìm ngay — không cần tự nghĩ từ khóa tiếng Anh.
          </p>
        </div>
        <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {RESEARCH_TOPICS.length} chủ đề
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {topics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => onSelect(topic)}
            disabled={disabled}
            className="group rounded-xl border border-slate-200 p-3 text-left transition hover:border-brand-300 hover:bg-brand-50/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:border-brand-700 dark:hover:bg-brand-950/20"
          >
            <span className="flex items-start justify-between gap-2">
              <span className="text-sm font-semibold text-slate-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
                {topic.label}
              </span>
              <Icon
                name="search"
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400"
              />
            </span>
            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
              {topic.description}
            </span>
            <span className="mt-2 flex flex-wrap gap-1">
              {topic.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                >
                  {tag}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>

      {RESEARCH_TOPICS.length > INITIAL_COUNT && (
        <button
          type="button"
          className="btn-ghost mt-2 !px-2.5 !py-1.5 text-xs"
          onClick={() => setShowAll((value) => !value)}
        >
          {showAll
            ? 'Thu gọn'
            : `Xem thêm ${RESEARCH_TOPICS.length - INITIAL_COUNT} chủ đề`}
        </button>
      )}

      <ResearchGuide />
    </Card>
  );
}
