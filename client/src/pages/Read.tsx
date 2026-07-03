import { useEffect } from 'react';
import { BibleReader } from '../components/reader/BibleReader';
import { PassageContextPanel } from '../components/reader/PassageContextPanel';
import { ThreePanelLayout } from '../components/layout/ThreePanelLayout';
import { useReaderStore } from '../stores/useReaderStore';

export default function Read() {
  const goToAdjacentChapter = useReaderStore((s) => s.goToAdjacentChapter);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }
      if (e.key === 'j') goToAdjacentChapter(1);
      if (e.key === 'k') goToAdjacentChapter(-1);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goToAdjacentChapter]);

  return (
    <ThreePanelLayout context={<PassageContextPanel />}>
      <BibleReader />
    </ThreePanelLayout>
  );
}
