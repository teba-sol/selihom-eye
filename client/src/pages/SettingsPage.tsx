import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../lib/api';
import { Settings } from 'lucide-react';

type Tab = 'name' | 'email' | 'password';

export const SettingsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [tab, setTab] = useState<Tab>('name');

  // Name form — split stored "First Last" back to parts
  const [nameParts] = useState(() => {
    const parts = (user?.name ?? '').split(' ');
    return { first: parts[0] ?? '', last: parts.slice(1).join(' ') };
  });
  const [firstName, setFirstName] = useState(nameParts.first);
  const [lastName, setLastName] = useState(nameParts.last);
  const [nameStatus, setNameStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [nameError, setNameError] = useState('');

  // Email form
  const [newEmail, setNewEmail] = useState(user?.email ?? '');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

  // Password form
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwStatus, setPwStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [pwError, setPwError] = useState('');

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    const newName = `${firstName.trim()} ${lastName.trim()}`;
    if (newName === user?.name) return;
    setNameStatus('saving');
    setNameError('');
    try {
      const updated = await api.patch<{ firstName: string; lastName: string }>('/auth/me', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setUser({ ...user!, name: `${updated.firstName} ${updated.lastName}` });
      setNameStatus('saved');
      setTimeout(() => setNameStatus('idle'), 3000);
    } catch (err: any) {
      setNameError(err.message ?? 'Failed to update name.');
      setNameStatus('error');
    }
  };

  const handleEmailSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || newEmail === user?.email) return;
    setEmailStatus('saving');
    setEmailError('');
    try {
      const updated = await api.patch<{ email: string }>('/auth/me', { email: newEmail.trim() });
      setUser({ ...user!, email: updated.email });
      setEmailStatus('saved');
      setTimeout(() => setEmailStatus('idle'), 3000);
    } catch (err: any) {
      setEmailError(err.message ?? 'Failed to update email.');
      setEmailStatus('error');
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw) return;
    if (newPw !== confirmPw) {
      setPwError('New passwords do not match.');
      setPwStatus('error');
      return;
    }
    if (newPw.length < 6) {
      setPwError('Password must be at least 6 characters.');
      setPwStatus('error');
      return;
    }
    setPwStatus('saving');
    setPwError('');
    try {
      await api.patch('/auth/me', { currentPassword: currentPw, newPassword: newPw });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setPwStatus('saved');
      setTimeout(() => setPwStatus('idle'), 3000);
    } catch (err: any) {
      setPwError(err.message ?? 'Failed to update password.');
      setPwStatus('error');
    }
  };

  const inputCls = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-500';
  const tabCls = (t: Tab) =>
    `px-5 py-2.5 text-sm font-semibold rounded-md transition-colors ${
      tab === t ? 'bg-[#1e3a5f] text-white' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-xl">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-[#2563eb]" />
          <h1 className="text-xl font-semibold text-[#2563eb]">Account Settings</h1>
        </div>

        {/* User info */}
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 mb-6">
          <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
          <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            {user?.role === 'DOCTOR' ? 'Doctor' : 'Receptionist'}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button type="button" className={tabCls('name')} onClick={() => setTab('name')}>
            Change Name
          </button>
          <button type="button" className={tabCls('email')} onClick={() => setTab('email')}>
            Change Email
          </button>
          <button type="button" className={tabCls('password')} onClick={() => setTab('password')}>
            Change Password
          </button>
        </div>

        {/* Name form */}
        {tab === 'name' && (
          <form onSubmit={handleNameSave} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setNameStatus('idle'); setNameError(''); }}
                className={inputCls}
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); setNameStatus('idle'); setNameError(''); }}
                className={inputCls}
                placeholder="Last name"
              />
            </div>
            {nameError && <p className="text-xs text-red-600">{nameError}</p>}
            {nameStatus === 'saved' && <p className="text-xs text-green-600">Name updated successfully.</p>}
            <button
              type="submit"
              disabled={
                nameStatus === 'saving' ||
                !firstName.trim() ||
                !lastName.trim() ||
                `${firstName.trim()} ${lastName.trim()}` === user?.name
              }
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md transition-colors"
            >
              {nameStatus === 'saving' ? 'Saving…' : 'Save Name'}
            </button>
          </form>
        )}

        {/* Email form */}
        {tab === 'email' && (
          <form onSubmit={handleEmailSave} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Email Address</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => { setNewEmail(e.target.value); setEmailStatus('idle'); setEmailError(''); }}
                className={inputCls}
                placeholder="Enter new email"
              />
            </div>
            {emailError && <p className="text-xs text-red-600">{emailError}</p>}
            {emailStatus === 'saved' && <p className="text-xs text-green-600">Email updated successfully.</p>}
            <button
              type="submit"
              disabled={emailStatus === 'saving' || newEmail === user?.email}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md transition-colors"
            >
              {emailStatus === 'saving' ? 'Saving…' : 'Save Email'}
            </button>
          </form>
        )}

        {/* Password form */}
        {tab === 'password' && (
          <form onSubmit={handlePasswordSave} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={currentPw}
                onChange={(e) => { setCurrentPw(e.target.value); setPwStatus('idle'); setPwError(''); }}
                className={inputCls}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={newPw}
                onChange={(e) => { setNewPw(e.target.value); setPwStatus('idle'); setPwError(''); }}
                className={inputCls}
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPw}
                onChange={(e) => { setConfirmPw(e.target.value); setPwStatus('idle'); setPwError(''); }}
                className={inputCls}
                placeholder="Repeat new password"
              />
            </div>
            {pwError && <p className="text-xs text-red-600">{pwError}</p>}
            {pwStatus === 'saved' && <p className="text-xs text-green-600">Password updated successfully.</p>}
            <button
              type="submit"
              disabled={pwStatus === 'saving'}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md transition-colors"
            >
              {pwStatus === 'saving' ? 'Saving…' : 'Save Password'}
            </button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};
