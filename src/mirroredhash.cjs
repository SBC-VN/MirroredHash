const fs = require('fs');
const CryptoJS = require("crypto-js");
const path = require('node:path');

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
        filename = "mhash.dat";
        rootpath = options.filepath;
    }

    if (!fs.existsSync(rootpath)) {
        fs.mkdirSync(rootpath, {recursive:true});
    }

    let hashfile = rootpath + path.sep + filename;
    
    let data = null;
    if (fs.existsSync(hashfile)) {
        let filedata = fs.readFileSync(hashfile);
        data = JSON.parse(filedata);
    }
    else {
        data = {};
    }
  
    let hashObject = {
        "file": hashfile,
        "data": data,
        "paddedkey": null,
        "paddedvector": null,
        "paddedhashkey": null,
        "save": function() {
                fs.writeFileSync(this.file, JSON.stringify(data,null,2));
            },
        "set": function(key, value) {
                let eKey = this.paddedkey ? CryptoJS.AES.encrypt(key, this.paddedkey, {iv: this.paddedvector}).toString() : key;
                let eValue = this.paddedhashkey ? CryptoJS.AES.encrypt(value, this.paddedhashkey, {iv: this.paddedvector}).toString(): value;
                this.data[eKey] = eValue;
                this.save();
            },
        "remove": function(key) {
                let eKey = this.paddedkey ? CryptoJS.AES.encrypt(key, this.paddedkey, {iv: this.paddedvector}).toString() : key;
                if (data.hasOwnProperty(eKey)) {
                    delete data[eKey];
                    this.save();
                }
            },
        "get": function(key) {
                let eKey = this.paddedkey ? CryptoJS.AES.encrypt(key, this.paddedkey, {iv: this.paddedvector}).toString() : key;
                if (data.hasOwnProperty(eKey)) {
                    let value = data[eKey];
                    if (this.paddedhashkey) {
                        let bytes = CryptoJS.AES.decrypt(value, this.paddedhashkey, {iv: this.paddedvector});
                        value = bytes.toString(CryptoJS.enc.Utf8);
                    }
                    return value;
                }
                else {
                    return null;
                }
            }
    }

    // Convert the given hash and vector into 32 character strings.
    if (options.hasOwnProperty('valuehash')) {
        hashObject.paddedhashkey = CryptoJS.enc.Hex.parse(options.valuehash.padEnd(32,"5").substring(0,32));
    }

    if (options.hasOwnProperty('keyhash')) {
        hashObject.paddedkey = CryptoJS.enc.Hex.parse(options.keyhash.padEnd(32,"5").substring(0,32));
    }

    if (options.hasOwnProperty('vector')) {
        hashObject.paddedvector = CryptoJS.enc.Hex.parse(options.vector.padEnd(32,"5").substring(0,32));
    }

    return hashObject;
}

module.exports = { getMirroredHash }