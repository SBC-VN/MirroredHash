# MirroredHash

This code creates a JavaScript hashtable that is 'mirrored' to the filesystem.\
The filesystem mirror data can be encrypted or in the clear.\
\
This is intended to be for when a light-weight persistant data store is needed, but not to the point where\
a table in a database is needed.\

## Usage
```
const { getMirroredHash } = require("./mirroredhash.cjs");

let mhash = getMirroredHash(<options>);

mhash.set(key,value);
value = mhash.get(key);
mhash.remove(key);
```

```
## Options
{
    filepath:<filepath>,
    [keyhash:<hkey>],
    [vector:<iv>],
    [valuehash:<vkey>]
}
```
\
filepath  - Path to a directory -or- file.  The filename will default to 'mhash.dat' if just a directory is given.\
\
keyhash   - [optional] A hash key to use with key values.  (up to 32 characters)\
\
valuehash - [optional] A hash key to use with the stored values. (up to 32 characters)\
\
vector    - [optional] The initialization vector to use with the keyhash/valuehash. (up to 32 characters)

### Behavior
The mirrored hash can be set to encrypt keys and/or values, or not encrypt either.   The 'keyhash' property specifies the value \
to use when encrypting keys, and the 'valuehash' property specifies the value to use when encrypting values. \
If they are null the corresponding item will not be encrypted and will be stored 'in the clear'.  \
If either a keyhash or valuehash are specified, a vector is required.