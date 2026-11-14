import { useState } from 'react';
import { PageHeader } from '../components/ui.jsx';
import HumanAtlasExplorer from './atlas/HumanAtlasExplorer.jsx';
import MuscleChat from './muscles/MuscleChat.jsx';

export default function MusclePage() {
  const [selectedMuscle, setSelectedMuscle] = useState(null);

  return (
    <div>
      <PageHeader
        title="Cơ bắp 3D"
        subtitle="Human Atlas: 2.234 mảnh giải phẫu, 15 hệ cơ quan và 3.432 cấu trúc được đặt tên. Bấm vào cơ để xem metadata, tách lớp, phóng to hoặc tìm bất kỳ cấu trúc nào."
        actions={
          <span className="badge badge-pine">
            BodyParts3D 4.0 · CC BY 4.0
          </span>
        }
      />

      <HumanAtlasExplorer onMuscleChange={setSelectedMuscle} />

      <div className="mx-auto mt-4 w-full max-w-4xl">
        <MuscleChat muscle={selectedMuscle} />
      </div>
    </div>
  );
}
