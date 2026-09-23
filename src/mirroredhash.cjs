const fs = require('fs');
const crypto = require('node:crypto');
const path = require('node:path');

const hasOption = (options, name) => Object.prototype.hasOwnProperty.call(options, name);

function deriveKey(secret, vector) {
    return crypto.createHash('sha256').update(`${vector}\0${secret}`).digest();
}

function encryptKey(value, key) {
    const nonce = crypto.createHmac('sha256', key).update(value).digest().subarray(0, 12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce);
    const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return `k1:${nonce.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${ciphertext.toString('base64url')}`;
}

function decryptKey(value, key) {
    const [, nonceHex, tagHex, ciphertext] = value.split(':');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(nonceHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    return Buffer.concat([
        decipher.update(Buffer.from(ciphertext, 'base64url')),
        decipher.final()
    ]).toString('utf8');
}

function encryptValue(value, key) {
    const nonce = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce);
    const serialized = JSON.stringify(value);
    if (serialized === undefined) {
        throw new TypeError('MirroredHash values must be JSON-serializable');
    }
    const ciphertext = Buffer.concat([cipher.update(serialized, 'utf8'), cipher.final()]);
    return `v1:${nonce.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${ciphertext.toString('base64url')}`;
}

function decryptValue(value, key) {
    const [, nonceHex, tagHex, ciphertext] = value.split(':');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(nonceHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const plaintext = Buffer.concat([
        decipher.update(Buffer.from(ciphertext, 'base64url')),
        decipher.final()
    ]).toString('utf8');
    return JSON.parse(plaintext);
}

function getMirroredHash(options) {
    if (!options || !hasOption(options, 'filepath')) {
        throw new Error('getMirroredHash: options missing filepath');
    }

    if ((hasOption(options, 'valuehash') || hasOption(options, 'keyhash')) && !hasOption(options, 'vector')) {
        throw new Error('getMirroredHash: options missing vector');
    }

    let filename;
    let rootpath;
    if (options.filepath.lastIndexOf('.') > 0) {
        filename = path.basename(options.filepath);
        rootpath = path.dirname(options.filepath);
    }
    else {
        filename = 'mhash.dat';
        rootpath = options.filepath;
    }

    if (!fs.existsSync(rootpath)) {
        fs.mkdirSync(rootpath, { recursive: true });
    }

    const hashfile = path.join(rootpath, filename);
    const keyKey = hasOption(options, 'keyhash') ? deriveKey(String(options.keyhash), String(options.vector)) : null;
    const valueKey = hasOption(options, 'valuehash') ? deriveKey(String(options.valuehash), String(options.vector)) : null;
    const fileExists = fs.existsSync(hashfile);
    let data = {};

    if (hasOption(options, 'data') && (hasOption(options, 'overwiteFile') || !fileExists)) {
        data = {};
    }
    else if (fileExists) {
        if (hasOption(options, 'data') && !hasOption(options, 'overwriteData')) {
            throw new Error('getMirroredHash: data given in options AND file already exists. There can be only one!');
        }
        data = JSON.parse(fs.readFileSync(hashfile, 'utf8'));
    }

    const encodeKey = (key) => keyKey ? encryptKey(String(key), keyKey) : String(key);
    const decodeKey = (key) => keyKey ? decryptKey(key, keyKey) : key;
    const encodeValue = (value) => valueKey ? encryptValue(value, valueKey) : value;
    const decodeValue = (value) => valueKey ? decryptValue(value, valueKey) : value;

    const handler = {
        file: hashfile,
        save() {
            fs.writeFileSync(this.file, JSON.stringify(data, null, 2));
        },
        get(target, property) {
            if (property === 'hasOwnProperty') {
                return (key) => Object.prototype.hasOwnProperty.call(target, encodeKey(key));
            }
            if (typeof property !== 'string') {
                return Reflect.get(target, property);
            }
            const encodedKey = encodeKey(property);
            return Object.prototype.hasOwnProperty.call(target, encodedKey) ? decodeValue(target[encodedKey]) : null;
        },
        set(target, property, value) {
            if (typeof property !== 'string') {
                return false;
            }
            target[encodeKey(property)] = encodeValue(value);
            this.save();
            return true;
        },
        ownKeys(target) {
            return Object.keys(target).map(decodeKey);
        },
        deleteProperty(target, property) {
            const encodedKey = encodeKey(property);
            if (Object.prototype.hasOwnProperty.call(target, encodedKey)) {
                delete target[encodedKey];
                this.save();
            }
            return true;
        },
        has(target, property) {
            return Object.prototype.hasOwnProperty.call(target, encodeKey(property));
        },
        getOwnPropertyDescriptor(target, property) {
            if (typeof property !== 'string') {
                return Reflect.getOwnPropertyDescriptor(target, property);
            }
            const encodedKey = encodeKey(property);
            if (!Object.prototype.hasOwnProperty.call(target, encodedKey)) {
                return undefined;
            }
            return {
                enumerable: true,
                configurable: true,
                writable: true,
                value: decodeValue(target[encodedKey])
            };
        }
    };

    const proxy = new Proxy(data, handler);
    if (hasOption(options, 'data') && (hasOption(options, 'overwiteFile') || !fileExists)) {
        for (const [key, value] of Object.entries(options.data)) {
            proxy[key] = value;
        }
    }
    return proxy;
}

module.exports = { getMirroredHash };