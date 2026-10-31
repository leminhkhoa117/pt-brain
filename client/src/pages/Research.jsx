import { useSearchParams } from 'react-router-dom';
import { Segmented } from '../components/ui.jsx';
import ReaderPage from './ReaderPage.jsx';
import FinderPage from './FinderPage.jsx';

export default function Research() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'finder' ? 'finder' : 'reader';

  const changeTab = (value) => {
    const next = new URLSearchParams(params);
    if (value === 'finder') next.set('tab', 'finder');
    else {
      next.delete('tab');
      next.delete('doi');
      next.delete('url');
    }
    setParams(next);
  };

  return (
    <div>
      <div className="mb-4 overflow-x-auto">
        <Segmented
          options={[
            { value: 'reader', label: 'Đọc & tóm tắt' },
            { value: 'finder', label: 'Tìm nghiên cứu' },
          ]}
          value={tab}
          onChange={changeTab}
        />
      </div>
      {tab === 'finder' ? <FinderPage /> : <ReaderPage />}
    </div>
  );
}
