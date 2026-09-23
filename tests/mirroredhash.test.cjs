const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { getMirroredHash } = require('../src/mirroredhash.cjs');

describe('MirroredHash', () => {
    let rootpath;

    beforeEach(() => {
        rootpath = fs.mkdtempSync(path.join(os.tmpdir(), 'mirroredhash-test-'));
    });

    afterEach(() => {
        fs.rmSync(rootpath, { recursive: true, force: true });
    });

    test.each([
        ['plain', {}],
        ['key encryption', { keyhash: 'key-secret' }],
        ['value encryption', { valuehash: 'value-secret' }],
        ['key and value encryption', { keyhash: 'key-secret', valuehash: 'value-secret' }]
    ])('%s round trips through initialization and disk', (_name, encryption) => {
        const filepath = path.join(rootpath, 'hash.dat');
        const options = { filepath, vector: 'shared-vector', ...encryption };
        const hash = getMirroredHash({ ...options, data: { alpha: 'secret', count: 3 } });

        hash.beta = { ok: true };

        expect(hash.alpha).toBe('secret');
        expect(hash.count).toBe(3);
        expect(hash.beta).toEqual({ ok: true });
        expect(Object.keys(hash)).toEqual(['alpha', 'count', 'beta']);
        expect('beta' in hash).toBe(true);
        expect(hash.hasOwnProperty('beta')).toBe(true);

        const reloaded = getMirroredHash(options);
        expect(reloaded.beta).toEqual({ ok: true });
        delete reloaded.alpha;
        expect(reloaded.hasOwnProperty('alpha')).toBe(false);
    });

    test('rejects tampered encrypted values', () => {
        const filepath = path.join(rootpath, 'hash.dat');
        const options = {
            filepath,
            valuehash: 'value-secret',
            vector: 'shared-vector'
        };
        const hash = getMirroredHash({ ...options, data: { alpha: 'secret' } });
        const stored = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        const key = Object.keys(stored)[0];
        stored[key] = `${stored[key].slice(0, -1)}A`;
        fs.writeFileSync(filepath, JSON.stringify(stored));

        const reloaded = getMirroredHash(options);
        expect(() => reloaded.alpha).toThrow();
    });

    test('rejects missing options and filepath', () => {
        expect(() => getMirroredHash()).toThrow('options missing filepath');
        expect(() => getMirroredHash({})).toThrow('options missing filepath');
    });

    test('requires a vector when encryption is configured', () => {
        const filepath = path.join(rootpath, 'hash.dat');

        expect(() => getMirroredHash({ filepath, keyhash: 'secret' }))
            .toThrow('options missing vector');
        expect(() => getMirroredHash({ filepath, valuehash: 'secret' }))
            .toThrow('options missing vector');
    });

    test('rejects conflicting initial data', () => {
        const filepath = path.join(rootpath, 'hash.dat');

        getMirroredHash({ filepath, data: { existing: true } });

        expect(() => getMirroredHash({ filepath, data: { replacement: true } }))
            .toThrow('data given in options');
    });

    test('handles symbol proxy operations and missing descriptors', () => {
        const hash = getMirroredHash({
            filepath: path.join(rootpath, 'hash.dat')
        });
        const symbol = Symbol('metadata');

        expect(Reflect.get(hash, symbol)).toBeUndefined();
        expect(Reflect.set(hash, symbol, 'value')).toBe(false);
        expect(Object.getOwnPropertyDescriptor(hash, symbol)).toBeUndefined();
        expect(Object.getOwnPropertyDescriptor(hash, 'missing')).toBeUndefined();
        expect(() => {
            delete hash.missing;
        }).not.toThrow();
    });

    test('rejects undefined encrypted values', () => {
        const hash = getMirroredHash({
            filepath: path.join(rootpath, 'hash.dat'),
            valuehash: 'value-secret',
            vector: 'shared-vector'
        });

        expect(() => {
            hash.invalid = undefined;
        }).toThrow('JSON-serializable');
    });
});
