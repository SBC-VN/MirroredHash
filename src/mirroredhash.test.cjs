const fs = require('fs');
const { getMirroredHash } = require("./mirroredhash.cjs");

test("Missing filepath", () => {
  expect(() => getMirroredHash({valuehash:"xxxysaaerf", keyhash:"xxseaerarf", vector: "xdaqedf"}).toThrow('getMirroredHash: options missing filepath'))
});

test("Missing valuehash", () => {
  expect(() => getMirroredHash({filepath:"c:/temp/mhash", keyhash:"xxseaerarf", vector:"xyatqdw"}).toThrow('getMirroredHash: options missing valuehash'))
});

test("Missing vector", () => {
  expect(() => getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", keyhash:"xxseaerarf"}).toThrow('getMirroredHash: options missing valuehash'))
});

test("File and data", () => {
  let data = {"one":"first data","two":"second data"};
  if (fs.existsSync("c:/temp/mhash/mhash.dat")) {
    fs.rmSync("c:/temp/mhash/mhash.dat", {force:true});
  }
  let mhash = getMirroredHash({filepath:"c:/temp/mhash/mhash.dat",data:data});
  expect (() => getMirroredHash({filepath:"c:/temp/mhash/mhash.dat",data:data}).toThrow('getMirroredHash: data given in options AND file already exists.  There can be only one!'))
});

test("Create parent directory", () => {
  if (fs.existsSync("c:/temp/mhashcreate")) {
    fs.rmSync("c:/temp/mhashcreate", {force:true, recursive:true});
  }
  let mhash = getMirroredHash({filepath:"c:/temp/mhashcreate"});
  mhash["one"] = "first value";
  let result = mhash["one"];
  expect(result).toEqual("first value");
});


test("Unhashed", () => {
  if (fs.existsSync("c:/temp/mhash/mhash.dat")) {
    fs.rmSync("c:/temp/mhash/mhash.dat", {force:true});
  }
  let mhash = getMirroredHash({filepath:"c:/temp/mhash"});
  mhash["one"] = "first value";
  let result = mhash["one"];
  expect(result).toEqual("first value");
});


test("Value Hashed", () => {
  if (fs.existsSync("c:/temp/mhash/mhash.dat")) {
    fs.rmSync("c:/temp/mhash/mhash.dat", {force:true});
  }
  let mhash = getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", vector:"xyatqdw"});
  mhash["one"] = "first value";
  mhash["two"] = "second value";
  let result = mhash["one"];
  expect(result).toEqual("first value");
});

test("Key Hashed", () => {
  if (fs.existsSync("c:/temp/mhash/mhash.dat")) {
    fs.rmSync("c:/temp/mhash/mhash.dat", {force:true});
  }
  let mhash = getMirroredHash({filepath:"c:/temp/mhash", keyhash:"xxxysaaerf", vector:"xyatqdw"});
  mhash["one"] = "first value";
  mhash["two"] = "second value";
  let result = mhash["one"];
  expect(result).toEqual("first value");
});

test("Fully Hashed", () => {
  if (fs.existsSync("c:/temp/mhash/mhash.dat")) {
    fs.rmSync("c:/temp/mhash/mhash.dat", {force:true});
  }
  let mhash = getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", keyhash:"xxseaerarf", vector:"xyatqdw"});
  mhash["one"] = "first value";
  mhash["two"] = "second value";
  let result = mhash["one"];
  expect(result).toEqual("first value");
});

test("Get Second value", () => {
  if (fs.existsSync("c:/temp/mhash/mhash.dat")) {
    fs.rmSync("c:/temp/mhash/mhash.dat", {force:true});
  }
  let mhash = getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", keyhash:"xxseaerarf", vector:"xyatqdw"});
  mhash["one"] = "first value";
  mhash["two"] = "second value";
  mhash["three"] = "third value";
  mhash["four"] = "fourth value";
  let result = mhash["two"];
  expect(result).toEqual("second value");
});

test("Delete", () => {
  if (fs.existsSync("c:/temp/mhash/mhash.dat")) {
    fs.rmSync("c:/temp/mhash/mhash.dat", {force:true});
  }
  let mhash = getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", keyhash:"xxseaerarf", vector:"xyatqdw"});
  mhash["one"] = "first value";
  mhash["two"] = "second value";
  mhash["three"] = "third value";
  mhash["four"] = "fourth value";
  delete mhash["two"];
  let result = mhash["two"];
  expect(result).toBeNull();
});

test ("Delete, Reread, then get null", () => {
  if (fs.existsSync("c:/temp/mhash/mhash.dat")) {
    fs.rmSync("c:/temp/mhash/mhash.dat", {force:true});
  }
  let mhash = getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", keyhash:"xxseaerarf", vector:"xyatqdw"});
  mhash["one"] = "first value";
  mhash["two"] = "second value";
  mhash["three"] = "third value";
  mhash["four"] = "fourth value";
  delete mhash["two"];
  mhash = null;
  mhash = getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", keyhash:"xxseaerarf", vector:"xyatqdw"});
  let result = mhash["two"];
  expect(result).toBeNull();
});


test ("Delete, Reread, then get key", () => {
  if (fs.existsSync("c:/temp/mhash/mhash.dat")) {
    fs.rmSync("c:/temp/mhash/mhash.dat", {force:true});
  }
  let mhash = getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", keyhash:"xxseaerarf", vector:"xyatqdw"});
  mhash["one"] = "first value";
  mhash["two"] = "second value";
  mhash["three"] = "third value";
  mhash["four"] = "fourth value";
  mhash = null;
  mhash = getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", keyhash:"xxseaerarf", vector:"xyatqdw"});
  let result = mhash["two"];
  expect(result).toEqual("second value");
});


test ("Get Keys", () => {
  if (fs.existsSync("c:/temp/mhash/mhash.dat")) {
    fs.rmSync("c:/temp/mhash/mhash.dat", {force:true});
  }
  let mhash = getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", keyhash:"xxseaerarf", vector:"xyatqdw"});
  mhash["one"] = "first value";
  mhash["two"] = "second value";
  mhash["three"] = "third value";
  mhash["four"] = "fourth value";
  let result = Object.keys(mhash);
  expect(result).toEqual(["one", "two", "three", "four"]);
});