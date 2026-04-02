const COLORS = [
  '#e03131', '#c2255c', '#9c36b5', '#3b5bdb',
  '#1971c2', '#0c8599', '#2f9e44', '#e8590c',
];

const ADJECTIVES = ['Swift', 'Bold', 'Calm', 'Keen', 'Wise', 'Bright'];
const ANIMALS = ['Fox', 'Bear', 'Hawk', 'Wolf', 'Lynx', 'Owl', 'Deer'];

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUserInfo() {
  const id = `user-${Math.random().toString(36).slice(2, 10)}`;
  return {
    id,
    name: `${random(ADJECTIVES)} ${random(ANIMALS)}`,
    color: random(COLORS),
  };
}

const SESSION_KEY = 'dolphboard_user_info';

export function getSessionUserInfo(): { id: string; name: string; color: string } {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  const info = generateUserInfo();
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(info));
  } catch {
    // ignore
  }
  return info;
}
