const fs = require('fs');
const CryptoJS = require("crypto-js");
const path = require('node:path');

// Using 'proxy' around a hashtable
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy

function getMirroredHash(options) {
    if (!options.hasOwnProperty('filepath')) {
        throw new Error("getMirroredHash: options missing filepath");
    }

    // Must have vector if there's either a value or key hash
    if ((options.hasOwnProperty('valuehash') ||
         options.hasOwnProperty('keyhash')) &&
         !options.hasOwnProperty('vector')){
            throw new Error("getMirroredHash: options missing vector");
         }

    // Define the file to be used, create it.
    let filename = "";
    let rootpath = "";
    let indx = options.filepath.lastIndexOf('.');
    if (indx > 0) {
        filename = path.basename(options.filepath);
        rootpath = path.dirname(options.filepath);
    }
    else {
        // No filename was given, default to "mhash.dat"
        filename = "mhash.dat";
        rootpath = options.filepath;
    }

    // Now we know the root path and filename, we can create them if they don't already exist.
    if (!fs.existsSync(rootpath)) {
        fs.mkdirSync(rootpath, {recursive:true});
    }

    let hashfile = rootpath + path.sep + filename;

    // Next, let's encode the hash keys for the hashtable values and.... well.. hashtable keys.  Yeah, different
    // meanings of 'key' confuse things a bit.  But hey, english.
    
    // Convert the given hash and vector into 32 character strings.
    let paddedvaluekey = null;
    let paddedkeykey = null;       // Cue music to 'can can'
    let paddedvector = null;

    if (options.hasOwnProperty('valuehash')) {
        paddedvaluekey = CryptoJS.enc.Hex.parse(options.valuehash.padEnd(32,"5").substring(0,32));
    }

    if (options.hasOwnProperty('keyhash')) {
        paddedkeykey = CryptoJS.enc.Hex.parse(options.keyhash.padEnd(32,"5").substring(0,32));
    }

    if (options.hasOwnProperty('vector')) {
        paddedvector = CryptoJS.enc.Hex.parse(options.vector.padEnd(32,"5").substring(0,32));
    }
    
    // Set / Read the data for the hashtable, if any.
    let data = {};
    if (options.hasOwnProperty('data') && (options.hasOwnProperty('overwiteFile') || !fs.existsSync(hashfile))) {
        // We've been given data to use and been told to overwrite any file -or- there is no file.
        for (let [key, value] of Object.entries(options.data)) {
            let eKey = paddedvaluekey ? CryptoJS.AES.encrypt(key, paddedvaluekey, {iv: this.paddedvector}).toString() : key;
            let eValue = paddedvaluekey ? CryptoJS.AES.encrypt(value, paddedvaluekey, {iv: this.paddedvector}).toString(): value;
            data[eKey] = eValue;
        }
    }
    else if (fs.existsSync(hashfile)) {
        // We have a file.  But if we have data too that could be a problem.
        if (options.hasOwnProperty('data') && !options.hasOwnProperty('overwriteData')) {
            // We want to make sure the caller explicitly specifies that we should use the file even if data is specified.
            throw new Error('getMirroredHash: data given in options AND file already exists.  There can be only one!')
        }
        let filedata = fs.readFileSync(hashfile);
        data = JSON.parse(filedata);
    }
   
    const handler = {
        "file": hashfile,
        "paddedkeykey": paddedkeykey,
        "paddedvaluekey": paddedvaluekey,
        "paddedvector": paddedvector,
        save() {
            fs.writeFileSync(this.file, JSON.stringify(data,null,2));
        },
        // Intercepts reading a value
        get(target, key) {
            let eKey = this.paddedkey ? CryptoJS.AES.encrypt(key, this.paddedkeykey, {iv: this.paddedvector}).toString(): key;
            if (target.hasOwnProperty(eKey)) {
                return this.paddedhashkey ? CryptoJS.AES.decrypt(target[eKey], this.paddedvaluekey, {iv: this.paddedvector}).toString(): target[eKey];
            }
            return null;
        },
        // Intercepts setting a value
        set(target, key, value) {
            let eKey = this.paddedkey ? CryptoJS.AES.encrypt(key, this.paddedkeykey, {iv: this.paddedvector}).toString(): key;
            let eValue = this.paddedhashkey ? CryptoJS.AES.encrypt(value, this.paddedvaluekey, {iv: this.paddedvector}).toString(): value;
            target[eKey] = eValue;
            this.save();
            return true; // Success
        },
        ownKeys(target) {
            return Object.keys(target).map(key => {
                return this.paddedkey ? CryptoJS.AES.encrypt(key, this.paddedkeykey, {iv: this.paddedvector}).toString(): key;
            });
        },
        deleteProperty(target, key) {
            let eKey = this.paddedkey ? CryptoJS.AES.encrypt(key, this.paddedkeykey, {iv: this.paddedvector}).toString(): key;
            if (target.hasOwnProperty(eKey)) {
                delete target[eKey];
                this.save();
            }
        },
    };


    //return new Proxy(data, traphandler);
    let proxy = new Proxy(data, handler);
    return proxy;
}

module.exports = { getMirroredHash }