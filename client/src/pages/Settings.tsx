import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  signOut,
  updatePassword,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';
import { auth } from '../lib/firebase';

interface Profile {
  display_name: string | null;
  about_md?: string | null;
  preferred_version: string;
}

const inputCls =
  'w-full rounded-lg border border-parchment-300 bg-white px-3 py-2 text-sm outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-xl border border-parchment-300 bg-white p-5 dark:border-parchment-700 dark:bg-parchment-800">
      <h2 className="font-display text-xl">{title}</h2>
      {children}
    </section>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const me = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api.get<{ profile: Profile | null }>('/me')).data,
  });

  const [displayName, setDisplayName] = useState('');
  const [aboutMd, setAboutMd] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [changingPw, setChangingPw] = useState(false);

  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (me.data?.profile) {
      setDisplayName(me.data.profile.display_name ?? '');
      setAboutMd(me.data.profile.about_md ?? '');
    }
  }, [me.data]);

  const hasPasswordProvider = user?.providerData.some((p) => p.providerId === 'password') ?? false;

  async function saveProfile() {
    if (savingProfile) return;
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await api.put('/me', {
        display_name: displayName.trim() || 'Reader',
        about_md: aboutMd,
        preferred_version: me.data?.profile?.preferred_version ?? 'WEB',
      });
      qc.invalidateQueries({ queryKey: ['me'] });
      setProfileMsg('Saved.');
    } catch {
      setProfileMsg('Could not save — try again.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    if (!auth?.currentUser || !user?.email || changingPw) return;
    setPwMsg(null);
    if (newPw.length < 6) {
      setPwMsg({ ok: false, text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ ok: false, text: 'New passwords don\'t match.' });
      return;
    }
    setChangingPw(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPw);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, newPw);
      setPwMsg({ ok: true, text: 'Password updated.' });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      setPwMsg({
        ok: false,
        text: code.includes('wrong-password') || code.includes('invalid-credential')
          ? 'Current password is incorrect.'
          : 'Could not update password — try again.',
      });
    } finally {
      setChangingPw(false);
    }
  }

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    setExportError(null);
    try {
      const response = await api.get('/export/obsidian', { responseType: 'blob' });
      const url = URL.createObjectURL(response.data as Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'scribe-obsidian-export.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed — try again.');
    } finally {
      setExporting(false);
    }
  }

  async function resendVerification() {
    if (!auth?.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
      setVerifyMsg(`Verification email sent to ${user?.email}.`);
    } catch {
      setVerifyMsg('Could not send just now — try again in a few minutes.');
    }
  }

  async function deleteAccount() {
    if (deleteText !== 'DELETE' || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.delete('/me');
      if (auth) await signOut(auth);
      navigate('/login');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Deletion failed — try again.');
      setDeleting(false);
    }
  }

  return (
    <div className="flex h-screen flex-col dark:bg-parchment-900">
      <TopBar onToggleSidebar={() => {}} />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl p-6 pb-16">
          <h1 className="font-display text-3xl">Account</h1>

          <Section title="Profile">
            <div className="mt-3 space-y-3">
              <label className="block text-xs font-medium text-ink-faint">
                Display name
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={`${inputCls} mt-1`} />
              </label>
              <label className="block text-xs font-medium text-ink-faint">
                About me
                <textarea
                  value={aboutMd}
                  onChange={(e) => setAboutMd(e.target.value)}
                  rows={3}
                  placeholder="A line or two about you and your walk — only you see this."
                  className={`${inputCls} mt-1`}
                />
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-deep disabled:opacity-50 dark:bg-gold dark:text-parchment-900"
                >
                  {savingProfile ? 'Saving…' : 'Save profile'}
                </button>
                {profileMsg && <span className="text-sm text-ink-faint">{profileMsg}</span>}
              </div>
            </div>
          </Section>

          <Section title="Email">
            <p className="mt-2 text-sm">
              {user?.email}{' '}
              {user?.emailVerified ? (
                <span className="rounded-full bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal dark:bg-gold/15 dark:text-gold-soft">
                  ✓ verified
                </span>
              ) : (
                <span className="rounded-full bg-gold-soft/30 px-2 py-0.5 text-xs font-medium text-ink-soft">
                  not verified
                </span>
              )}
            </p>
            {!user?.emailVerified && (
              <button onClick={resendVerification} className="mt-2 text-sm text-teal hover:underline dark:text-gold-soft">
                Send verification email
              </button>
            )}
            {verifyMsg && <p className="mt-2 text-xs text-ink-faint">{verifyMsg}</p>}
          </Section>

          <Section title="Password">
            {hasPasswordProvider ? (
              <div className="mt-3 max-w-sm space-y-3">
                <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Current password" className={inputCls} autoComplete="current-password" />
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password (min 6 characters)" className={inputCls} autoComplete="new-password" />
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Confirm new password" className={inputCls} autoComplete="new-password" />
                {pwMsg && (
                  <p className={`text-sm ${pwMsg.ok ? 'text-teal dark:text-gold-soft' : 'text-red-700'}`}>{pwMsg.text}</p>
                )}
                <button
                  onClick={changePassword}
                  disabled={changingPw || !currentPw || !newPw}
                  className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-deep disabled:opacity-50 dark:bg-gold dark:text-parchment-900"
                >
                  {changingPw ? 'Updating…' : 'Change password'}
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-ink-faint">
                You signed in with Google, so your password is managed by your Google account.
              </p>
            )}
          </Section>

          <Section title="Export to Obsidian">
            <p className="mt-2 text-sm leading-relaxed text-ink-faint">
              Download your graph nodes and study plans as Obsidian-ready markdown notes. Graph
              nodes link to each other with <code className="rounded bg-parchment-100 px-1 dark:bg-parchment-900">[[wikilinks]]</code>,
              so they&apos;ll appear connected in Obsidian&apos;s own graph view. This is a
              one-time snapshot — Obsidian vaults live on your device, so there&apos;s no live
              sync, but you can export again any time for a fresh copy.
            </p>
            {exportError && <p className="mt-2 text-sm text-red-700">{exportError}</p>}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="mt-3 rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-deep disabled:opacity-50 dark:bg-gold dark:text-parchment-900"
            >
              {exporting ? 'Preparing export…' : 'Download Obsidian export (.zip)'}
            </button>
          </Section>

          <Section title="Danger zone">
            <p className="mt-2 text-sm leading-relaxed text-ink-faint">
              Deleting your account permanently removes your profile, notes, devotionals, study
              plans and progress, knowledge graph, and personal connections. This cannot be undone.
            </p>
            <div className="mt-3 flex max-w-sm flex-col gap-2">
              <input
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder='Type DELETE to confirm'
                className={inputCls}
              />
              {deleteError && <p className="text-sm text-red-700">{deleteError}</p>}
              <button
                onClick={deleteAccount}
                disabled={deleteText !== 'DELETE' || deleting}
                className="self-start rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-950"
              >
                {deleting ? 'Deleting…' : 'Permanently delete my account'}
              </button>
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}
