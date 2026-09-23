# MirroredHash

This code creates a JavaScript hash table that is 'mirrored' to the filesystem.\
The filesystem mirror data can be encrypted or in the clear.\
\
This is intended for cases where a lightweight persistent data store is needed, but a database table would be excessive.

## Usage
Pretty much like a regular JavaScript hash table once it is created.

```
const { getMirroredHash } = require("./mirroredhash.cjs");

let mhash = getMirroredHash(<options>);

mhash[key] = value;
value = mhash[key];
delete mhash[key];
keys = Object.keys(mhash);
```

## Options
```
{
    filepath:<filepath>,
    [keyhash:<hkey>],
    [vector:<iv>],
    [valuehash:<vkey>],
    [data:<{initial}>],
    [overwiteFile:<true>],
    [overwriteData:<true>]
}
```
\
filepath  - Path to a directory -or- file.  The filename will default to 'mhash.dat' if just a directory is given.\
\
keyhash   - [optional] A hash key to use with key values.  (up to 32 characters)\
\
valuehash - [optional] A hash key to use with the stored values. (up to 32 characters)\
\
vector    - [optional] The initialization vector to use with the keyhash/valuehash. (up to 32 characters)\
\
data      - [optional] An initial hashtable.\
\
overwiteFile - [optional] Data from the option should override any existing data from the file.
\
overwriteData - [optional] Data from the file should override any data given as an option. \

### Behavior
<ul>
<li>The mirrored hash can be set to encrypt keys and/or values, or not encrypt either.</li>
<li>The 'keyhash' property specifies the value to use when encrypting keys</li> 
<li>The 'valuehash' property specifies the value to use when encrypting values.</li>
<li>If they are null the corresponding item will not be encrypted and will be stored 'in the clear'.</li>
<li>If either a keyhash or valuehash are specified, a vector is required.</li>
<li>If initial data is provided and there is already a mirror file, the code will throw an error unless
it has been told how to handle the conflict (overwriteData/overwiteFile).</li>
</ul>