import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BibleReader } from '../components/reader/BibleReader';
import { PassageContextPanel } from '../components/reader/PassageContextPanel';
import { ThreePanelLayout } from '../components/layout/ThreePanelLayout';
import { useReaderStore } from '../stores/useReaderStore';

export default function Read() {
  const goToAdjacentChapter = useReaderStore((s) => s.goToAdjacentChapter);
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }
      if (e.key === 'j') goToAdjacentChapter(1);
      if (e.key === 'k') goToAdjacentChapter(-1);
      if (e.key === 'g') navigate('/graph');
      if (e.key === 'n') {
        const { book, chapter, selection } = useReaderStore.getState();
        const params = new URLSearchParams({ new: '1', book, chapter: String(chapter) });
        if (selection) {
          params.set('vs', String(selection.start));
          params.set('ve', String(selection.end));
        }
        navigate(`/notes?${params}`);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goToAdjacentChapter, navigate]);

  return (
    <ThreePanelLayout context={<PassageContextPanel />}>
      <BibleReader />
    </ThreePanelLayout>
  );
}
