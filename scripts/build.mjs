import { cp, mkdir, writeFile } from 'node:fs/promises';

const output = new URL('../dist/', import.meta.url);
await mkdir(output, { recursive: true });
for (const name of ['index.html', 'styles.css', 'main.js', 'booking.js']) {
  await cp(new URL(`../${name}`, import.meta.url), new URL(name, output));
}
await cp(new URL('../assets/', import.meta.url), new URL('assets/', output), { recursive: true });
await writeFile(new URL('.nojekyll', output), '');
console.log('Built static site in dist/');
