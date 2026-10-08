import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Header } from './Header';

const { login, prepare } = vi.hoisted(() => ({ login: vi.fn(), prepare: vi.fn() }));
vi.mock('../utils/firebaseLogin', () => ({ prepareFirebaseLogin: prepare }));
vi.mock('./PWAInstallButton', () => ({ PWAInstallButton: () => null }));

const firebase = { apiKey: 'test-key', authDomain: 'test.firebaseapp.com', projectId: 'test', appId: 'test-app' };
const user = { id: 'firebase-user', name: 'Test Learner', email: 'learner@example.com' };

function renderHeader(onUserChange = vi.fn()) {
  return render(<Header activeTab="lessons" setActiveTab={vi.fn()} audioSpeed={1} setAudioSpeed={vi.fn()} onUserChange={onUserChange} />);
}

function mockSession(data: object) {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => data });
  vi.stubGlobal('fetch', fetchMock);
  prepare.mockReturnValue(login);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('Header account controls', () => {
  it('shows one direct sign-in button outside the navigation dropdown and supports login/logout', async () => {
    const fetchMock = mockSession({ configured: true, user: null, firebase });
    login.mockResolvedValue(user);
    const onUserChange = vi.fn();
    renderHeader(onUserChange);
    const button = await screen.findByRole('button', { name: 'Sign in with Google' });
    expect(button.closest('details')).toBeNull();
    expect(button.closest('header')).not.toBeNull();
    expect(screen.getAllByRole('region', { name: 'Your account' })).toHaveLength(1);
    expect(screen.getByLabelText('More navigation').closest('details')).not.toHaveAttribute('open');
    fireEvent.click(button);
    const logout = await screen.findByRole('button', { name: 'Sign out' });
    expect(screen.getByText(user.name)).toBeInTheDocument();
    await waitFor(() => expect(onUserChange).toHaveBeenLastCalledWith(user));
    expect(screen.getByText('Learner account')).toBeInTheDocument();
    fireEvent.click(logout);
    await screen.findByRole('button', { name: 'Sign in with Google' });
    await waitFor(() => expect(onUserChange).toHaveBeenLastCalledWith(null));
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
  });

  it('shows an existing signed-in account outside the dropdown', async () => {
    mockSession({ configured: true, user, firebase });
    renderHeader();
    const logout = await screen.findByRole('button', { name: 'Sign out' });
    expect(logout.closest('details')).toBeNull();
    expect(screen.getByLabelText(`Signed in as ${user.name} (${user.email})`)).toBeInTheDocument();
  });

  it('keeps popup failures visible outside the menu and lets the user retry', async () => {
    mockSession({ configured: true, user: null, firebase });
    login.mockRejectedValueOnce({ code: 'auth/popup-blocked' }).mockResolvedValueOnce(user);
    renderHeader();
    fireEvent.click(await screen.findByRole('button', { name: 'Sign in with Google' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Please allow pop-ups');
    expect(alert.closest('details')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }));
    await screen.findByRole('button', { name: 'Sign out' });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('can retry a failed account check without opening a menu', async () => {
    const fetchMock = mockSession({ configured: false, user: null, firebase: null });
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    renderHeader();
    fireEvent.click(await screen.findByRole('button', { name: 'Retry sign-in' }));
    await waitFor(() => expect(screen.getByText('Guest mode')).toBeInTheDocument());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
