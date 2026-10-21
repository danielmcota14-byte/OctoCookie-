// Bytecode de RUNTIME esperado do OctoToken (o que eth_getCode devolve). Usado só para informar se o contrato
// implantado é idêntico ao conhecido; a validação que bloqueia pagamentos continua sendo a de seletores do ABI.
import fs from 'node:fs';
import { ethers } from 'ethers';

const raw = fs.readFileSync(new URL('./octotoken.runtime-bytecode.txt', import.meta.url), 'utf8').trim().toLowerCase();
export const EXPECTED_RUNTIME_BYTECODE = raw.startsWith('0x') ? raw : '0x' + raw;
export const EXPECTED_CODEHASH = ethers.keccak256(EXPECTED_RUNTIME_BYTECODE);
