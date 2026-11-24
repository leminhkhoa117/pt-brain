import { useSearchParams } from 'react-router-dom';
import { Segmented } from '../components/ui.jsx';
import KeepAliveTabs from '../components/KeepAliveTabs.jsx';
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
      // Giữ ?summary để quay lại đúng bài đang đọc thay vì rơi về thư viện.
      next.delete('doi');
      next.delete('url');
      next.delete('auto');
      next.delete('from');
    } else {
      next.set('tab', value);
    }
    setParams(next);
  };

  const panes = [
    { value: 'reader', children: <ReaderPage /> },
    { value: 'finder', children: <FinderPage /> },
    { value: 'library', children: <LibraryPage /> },
  ];

  return (
    <div>
      <div className="mb-4 overflow-x-auto">
        <Segmented options={TABS} value={tab} onChange={changeTab} />
      </div>
      {/* Giữ pane đã mở mounted để state + request không mất khi đổi tab. */}
      <KeepAliveTabs active={tab} items={panes} />
    </div>
  );
}
