import Module from 'module';
import type { File } from './types.ts';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
export default _require('../../assets/files.cjs') as Record<string, File[]>;
