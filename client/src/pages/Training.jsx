import { useSearchParams } from 'react-router-dom';
import { Segmented } from '../components/ui.jsx';
import PlannerPage from './training/PlannerPage.jsx';
import WorkoutPage from './training/WorkoutPage.jsx';

export default function Training() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'workout' ? 'workout' : 'planner';

  const change = (value) => {
    const next = new URLSearchParams(params);
    if (value === 'workout') next.set('tab', 'workout');
    else next.delete('tab');
    setParams(next);
  };

  return (
    <div>
      <div className="mb-4 overflow-x-auto">
        <Segmented
          options={[
            { value: 'planner', label: 'Giáo án' },
            { value: 'workout', label: 'Log buổi tập' },
          ]}
          value={tab}
          onChange={change}
        />
      </div>
      {tab === 'workout' ? <WorkoutPage /> : <PlannerPage />}
    </div>
  );
}
