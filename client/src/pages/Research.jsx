import { useSearchParams } from 'react-router-dom';
import { Segmented } from '../components/ui.jsx';
import ReaderPage from './ReaderPage.jsx';
import FinderPage from './FinderPage.jsx';
import LibraryPage from './LibraryPage.jsx';

const TABS = [
  { value: 'reader', label: 'Đọc & tóm tắt' },
  { value: 'finder', label: 'Tìm nghiên cứu' },
  { value: 'library', label: 'Thư viện' },
];

export default function Research() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const tab = ['finder', 'library'].includes(raw) ? raw : 'reader';

  const changeTab = (value) => {
    const next = new URLSearchParams(params);
    if (value === 'reader') {
      next.delete('tab');
      next.delete('doi');
      next.delete('url');
      next.delete('summary');
    } else {
      next.set('tab', value);
    }
    setParams(next);
  };

  return (
    <div>
      <div className="mb-4 overflow-x-auto">
        <Segmented options={TABS} value={tab} onChange={changeTab} />
      </div>
      {tab === 'finder' ? (
        <FinderPage />
      ) : tab === 'library' ? (
        <LibraryPage />
      ) : (
        <ReaderPage />
      )}
    </div>
  );
}
