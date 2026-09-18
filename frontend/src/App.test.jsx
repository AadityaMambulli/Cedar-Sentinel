import { test, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

function expectOverview(container) {
  expect(screen.getByRole('heading', { name: 'Overview' })).toBeVisible();
  expect(within(container.querySelector('.app-topbar')).getByText('SIMULATION MODE')).toBeVisible();
  expect(within(container.querySelector('.workspace-label')).getByText('Demo workspace')).toBeVisible();
  const metrics = container.querySelectorAll('.metrics article strong');
  expect(metrics).toHaveLength(3);
  expect(metrics[0]).toHaveTextContent('0');
  expect(metrics[1]).toHaveTextContent('0%');
  expect(metrics[2]).toHaveTextContent('No events yet');
  expect(screen.getByText('A safe place to explore.')).toBeVisible();
  expect(screen.getByText('THE ACTIVE DEMO BOUNDARY')).toBeVisible();
  expect(screen.getByRole('link', { name: /New request/ })).toHaveAttribute('href', '#/app/commands');
  expect(screen.getByRole('link', { name: /View audit log/ })).toHaveAttribute('href', '#/app/audit');
}

test('overview shows session metrics, empty decisions, and the boundary panel', () => {
  window.location.hash = '#/app/dashboard';
  const { container } = render(<App />);
  expectOverview(container);
  expect(screen.getByText('No decisions. Yet.')).toBeVisible();
  expect(screen.getByRole('link', { name: /Run your first simulation/ })).toHaveAttribute('href', '#/app/commands');
  expect(container.querySelector('.boundary-panel dl')).toHaveTextContent('refund-bot');
  expect(container.querySelector('.boundary-panel')).toHaveTextContent('Up to $100');
});

test('command center keeps the fixed demo scenario and presets', async () => {
  window.location.hash = '#/app/commands';
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Command center' })).toBeVisible();
  const task = screen.getByLabelText('Task description');
  expect(task.tagName).toBe('TEXTAREA');
  await user.type(task, 'note only');
  expect(task).toHaveValue('note only');
  const amount = screen.getByLabelText('Amount (USD)');
  expect(amount).toHaveValue(49.99);
  expect(screen.getByLabelText('Agent principal')).toHaveValue('refund-bot');
  for (const name of ['Allowed refund', 'Over the limit']) {
    expect(screen.getByRole('button', { name: new RegExp(name) })).toBeEnabled();
  }
  expect(screen.getByText('Demo policy')).toBeVisible();
  expect(screen.getByRole('button', { name: /Run simulation/ })).toBeEnabled();
  expect(screen.getByText('Every action starts', { exact: false })).toBeVisible();
});

test('empty audit filters remain usable without events', async () => {
  window.location.hash = '#/app/audit';
  const user = userEvent.setup();
  const { container } = render(<App />);
  expect(screen.getByRole('heading', { name: 'Audit log' })).toBeVisible();
  expect(screen.getByText('Your audit trail starts here.')).toBeVisible();
  expect(screen.getByText('0 of 0 events')).toBeVisible();
  expect(screen.getByRole('link', { name: /Try a request/ })).toHaveAttribute('href', '#/app/commands');
  const decision = screen.getByLabelText('Decision filter');
  await user.selectOptions(decision, 'Deny');
  expect(decision).toHaveValue('Deny');
  const agent = screen.getByLabelText('Agent filter');
  await user.selectOptions(agent, 'refund-bot');
  expect(agent).toHaveValue('refund-bot');
  await user.type(screen.getByLabelText('Search actions, agents, resources'), 'no match');
  expect(screen.getByText('0 of 0 events')).toBeVisible();
  expect(container.querySelector('tbody')).toBeEmptyDOMElement();
});

test('console never reads or writes storage and makes no requests', async () => {
  localStorage.clear();
  const readStorage = localStorage.getItem.bind(localStorage);
  const storageLength = localStorage.length;
  const storagePrototypes = new Set([Object.getPrototypeOf(localStorage), Object.getPrototypeOf(window.localStorage)]);
  const storageSpies = [...storagePrototypes].flatMap(prototype =>
    ['getItem', 'setItem', 'removeItem', 'clear', 'key'].map(method => vi.spyOn(prototype, method)));
  const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(() => { throw new Error('Unexpected network request'); });
  const xhr = vi.spyOn(XMLHttpRequest.prototype, 'send').mockImplementation(() => { throw new Error('Unexpected network request'); });
  const user = userEvent.setup();
  let view;
  try {
    window.location.hash = '';
    view = render(<App />);
    await user.click(screen.getByRole('link', { name: 'See it in action' }));
    await screen.findByRole('heading', { name: 'Overview' });
    expectOverview(view.container);
    await user.click(screen.getByRole('link', { name: /New request/ }));
    expect(await screen.findByRole('heading', { name: 'Command center' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: /Run simulation/ }));
    expect(screen.getByText('Every action starts', { exact: false })).toBeVisible();
    await user.click(screen.getByRole('link', { name: 'Audit log', exact: true }));
    expect(await screen.findByText('0 of 0 events')).toBeVisible();
    view.unmount();
    view = render(<App />);
    expect(screen.getByText('0 of 0 events')).toBeVisible();
    await user.click(screen.getByRole('link', { name: 'Overview', exact: true }));
    await screen.findByRole('heading', { name: 'Overview' });
    expectOverview(view.container);
    view.unmount();
    for (const spy of storageSpies) expect(spy).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(xhr).not.toHaveBeenCalled();
    expect(readStorageLength()).toBe(storageLength);
  } finally {
    view?.unmount();
    vi.restoreAllMocks();
  }
});

function readStorageLength() {
  return localStorage.length;
}

test('landing page opens the demo dashboard and returns home', async () => {
  window.location.hash = '';
  const user = userEvent.setup();
  const { container } = render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Let agents move');
  expect(screen.getByRole('link', { name: 'See it in action' })).toHaveAttribute('href', '#/app/dashboard');
  await user.click(screen.getAllByRole('link', { name: /Open console/i })[0]);
  expect(await screen.findByRole('heading', { name: 'Overview' })).toBeVisible();
  expectOverview(container);
  await user.click(screen.getByRole('link', { name: /Back to website/i }));
  expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Let agents move');
});

test('landing navigation has an accessible menu and toggles open and closed', async () => {
  window.location.hash = '';
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByRole('navigation', { name: 'Main navigation' })).toHaveAttribute('id', 'site-menu');
  expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
  await user.click(screen.getByRole('button', { name: 'Open menu' }));
  expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
  await user.click(screen.getByRole('button', { name: 'Close menu' }));
  expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
});

test('selecting Platform closes the landing navigation menu', async () => {
  window.location.hash = '';
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'Open menu' }));
  expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
  const navigation = screen.getByRole('navigation', { name: 'Main navigation' });
  const platform = within(navigation).getByRole('link', { name: 'Platform' });
  expect(platform).toHaveAttribute('href', '#platform');
  await user.click(platform);
  expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
});

test('Escape closes the landing navigation menu', async () => {
  window.location.hash = '';
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'Open menu' }));
  expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
  await user.keyboard('{Escape}');
  expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
});

test('platform defaults to the boundary and switches between illustrative panels', async () => {
  window.location.hash = '';
  const user = userEvent.setup();
  const { container } = render(<App />);
  const section = container.querySelector('section#platform');
  expect(section).toBeInTheDocument();
  const platform = within(section);
  const boundary = platform.getByRole('button', { name: 'Set the boundary.', exact: true });
  const check = platform.getByRole('button', { name: 'Check before the action.', exact: true });
  const story = platform.getByRole('button', { name: 'Keep the whole story.', exact: true });
  expect(boundary).toHaveAttribute('aria-pressed', 'true');
  expect(check).toHaveAttribute('aria-pressed', 'false');
  expect(story).toHaveAttribute('aria-pressed', 'false');
  expect(platform.getByText(/^illustrative$/i)).toBeVisible();
  await user.click(check);
  expect(boundary).toHaveAttribute('aria-pressed', 'false');
  expect(check).toHaveAttribute('aria-pressed', 'true');
  expect(story).toHaveAttribute('aria-pressed', 'false');
  expect(platform.getByText('Every request gets a decision.')).toBeVisible();
  expect(platform.getByText(/^illustrative$/i)).toBeVisible();
  await user.click(story);
  expect(boundary).toHaveAttribute('aria-pressed', 'false');
  expect(check).toHaveAttribute('aria-pressed', 'false');
  expect(story).toHaveAttribute('aria-pressed', 'true');
  expect(platform.getByText('Every decision leaves a trace.')).toBeVisible();
  expect(platform.getByText(/^illustrative$/i)).toBeVisible();
  await user.click(boundary);
  expect(boundary).toHaveAttribute('aria-pressed', 'true');
  expect(check).toHaveAttribute('aria-pressed', 'false');
  expect(story).toHaveAttribute('aria-pressed', 'false');
  expect(platform.getByText(/^illustrative$/i)).toBeVisible();
});
