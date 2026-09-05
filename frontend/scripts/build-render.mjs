import { copyFile, mkdir } from 'node:fs/promises';

await copyFile('dist/index.html', 'dist/404.html');

const routes = [
  'login',
  'register',
  'dashboard',
  'users',
  'ekubs',
  'draws',
  'draws/new',
];

for (const route of routes) {
  const directory = `dist/${route}`;
  await mkdir(directory, { recursive: true });
  await copyFile('dist/index.html', `${directory}/index.html`);
}
