import { useCallback, useRef, useState } from 'react';
import { PageHeader } from '../components/ui.jsx';
import { MUSCLES } from '@shared/muscles/index.js';
import { readStored, writeStored } from '../lib/persist.js';
import HumanAtlasExplorer from './atlas/HumanAtlasExplorer.jsx';
import MuscleChat from './muscles/MuscleChat.jsx';

// Nhớ cơ đang xem để rời trang (ví dụ sang Học tập) rồi quay lại vẫn đúng ngữ cảnh.
const STORAGE_KEY = 'ptbrain:muscle:last';

export default function MusclePage() {
  const [initial] = useState(() => readStored(STORAGE_KEY, {}));
  const [slug, setSlug] = useState(() =>
    initial?.slug && MUSCLES[initial.slug] ? initial.slug : '',
  );
  const lastSlugRef = useRef(slug);

  const selectedMuscle = slug && MUSCLES[slug] ? { slug, ...MUSCLES[slug] } : null;

  const handleMuscleChange = useCallback((muscle) => {
    // Explorer báo null lúc mount hoặc khi đóng panel: giữ cơ gần nhất để chat không nhảy.
    if (!muscle?.slug) return;
    lastSlugRef.current = muscle.slug;
    setSlug(muscle.slug);
    writeStored(STORAGE_KEY, { slug: muscle.slug });
  }, []);

  return (
    <div>
      <PageHeader
        title="Cơ bắp 3D"
        subtitle="Human Atlas: 2.234 mảnh giải phẫu, 15 hệ cơ quan và 3.432 cấu trúc được đặt tên. Bấm vào cơ để xem metadata, tách lớp, phóng to hoặc tìm bất kỳ cấu trúc nào."
        actions={<span className="badge badge-pine">BodyParts3D 4.0 · CC BY 4.0</span>}
      />

      <HumanAtlasExplorer onMuscleChange={handleMuscleChange} initialSlug={lastSlugRef.current} />

      <div className="mx-auto mt-4 w-full max-w-4xl">
        <MuscleChat muscle={selectedMuscle} />
      </div>
    </div>
  );
}
