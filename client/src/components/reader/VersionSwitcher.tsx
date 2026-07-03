import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '../../lib/api';
import { useReaderStore } from '../../stores/useReaderStore';

export interface VersionInfo {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
}

export function VersionSwitcher() {
  const version = useReaderStore((s) => s.version);
  const setVersion = useReaderStore((s) => s.setVersion);

  const { data } = useQuery({
    queryKey: ['versions'],
    queryFn: async () => (await api.get<{ versions: VersionInfo[] }>('/versions')).data.versions,
    staleTime: Infinity,
  });

  // If the stored version isn't offered (e.g. the scripture source changed),
  // fall back to WEB or the first available version.
  useEffect(() => {
    if (!data?.length) return;
    if (data.some((v) => v.id === version)) return;
    const web = data.find((v) => v.abbreviation.toUpperCase().includes('WEB'));
    setVersion((web ?? data[0]).id);
  }, [data, version, setVersion]);

  if (!data?.length) return null;

  return (
    <select
      value={version}
      onChange={(e) => setVersion(e.target.value)}
      title="Bible version"
      className="max-w-44 rounded-lg border border-parchment-300 bg-white px-2 py-1.5 text-sm text-ink-soft outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-800 dark:text-ink-invert"
    >
      {data.map((v) => (
        <option key={v.id} value={v.id}>
          {v.abbreviation} — {v.name}
        </option>
      ))}
    </select>
  );
}
