// Acha a pasta raiz de um pacote npm mesmo quando o "exports" dele não expõe o package.json nem a pasta dist.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
export function pkgRoot(name) {
  let dir = path.dirname(require.resolve(name));
  for (let i = 0; i < 8; i++) {
    const pj = path.join(dir, 'package.json');
    if (fs.existsSync(pj) && JSON.parse(fs.readFileSync(pj, 'utf8')).name === name) return dir;
    dir = path.dirname(dir);
  }
  throw new Error('Pacote não encontrado: ' + name);
}
