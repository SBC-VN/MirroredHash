const fs = require('fs');
const { getMirroredHash } = require("./mirroredhash.cjs");

test("Missing filepath", () => {
  console.log("create without filepath");
  expect(() => getMirroredHash({valuehash:"xxxysaaerf", keyhash:"xxseaerarf", vector: "xdaqedf"}).toThrow('getMirroredHash: options missing filepath'))
});


test("Missing valuehash", () => {
  expect(() => getMirroredHash({filepath:"c:/temp/mhash", keyhash:"xxseaerarf", vector:"xyatqdw"}).toThrow('getMirroredHash: options missing valuehash'))
});

test("Missing vector", () => {
  expect(() => getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", keyhash:"xxseaerarf"}).toThrow('getMirroredHash: options missing valuehash'))
});

test("Unhashed", () => {
  let mhash = getMirroredHash({filepath:"c:/temp/mhash"});
  mhash.set("one","first value");
  result = mhash.get("one");
  expect(result).toEqual("first value");
});

test("Value Hashed", () => {
  let mhash = getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", vector:"xyatqdw"});
  mhash.set("one","first value");
  result = mhash.get("one");
  expect(result).toEqual("first value");
});

test("Key Hashed", () => {
  let mhash = getMirroredHash({filepath:"c:/temp/mhash", keyhash:"xxxysaaerf", vector:"xyatqdw"});
  mhash.set("one","first value");
  result = mhash.get("one");
  expect(result).toEqual("first value");
});


test("One Hash", () => {
  let mhash = getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", keyhash:"xxseaerarf", vector:"xyatqdw"});
  mhash.set("one","first value");
  result = mhash.get("one");
  expect(result).toEqual("first value");
});

test("No File", () => {
  if (fs.existsSync("c:/temp/mhash")) {
    fs.rmSync("c:/temp/mhash", {recursive:true, force:true});
  }
  let mhash = getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", keyhash:"xxseaerarf", vector:"xyatqdw"});
  mhash.set("one","first value");
  result = mhash.get("one");
  expect(result).toEqual("first value");
});


test("Two Hash", () => {
  let mhash = getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", keyhash:"xxseaerarf", vector:"xyatqdw"});
  mhash.set("one","first value");
  mhash.set("two","second value");
  mhash.set("three","third value");
  mhash.set("four","fourth value");
  result = mhash.get("three");
  expect(result).toEqual("third value");
});

test("Delete test", () => {
  let mhash = getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", keyhash:"xxseaerarf", vector:"xyatqdw"});
  mhash.set("one","first value");
  mhash.set("two","second value");
  mhash.set("three","third value");
  mhash.set("four","fourth value");
  result = mhash.remove("three");
  result = mhash.get("three");
  expect(result).toBeNull();
});

test("ReRead test (removed)", () => {
  let mhash = getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", keyhash:"xxseaerarf", vector:"xyatqdw"});
  mhash.set("one","first value");
  mhash.set("two","second value");
  mhash.set("three","third value");
  mhash.set("four","fourth value");
  result = mhash.remove("three");
  mhash = getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", keyhash:"xxseaerarf", vector:"xyatqdw"});
  result = mhash.get("three");
  expect(result).toBeNull();
});

test("ReRead test (present)", () => {
  let mhash = getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", keyhash:"xxseaerarf", vector:"xyatqdw"});
  mhash.set("one","first value");
  mhash.set("two","second value");
  mhash.set("three","third value");
  mhash.set("four","fourth value");
  result = mhash.remove("three");
  mhash = getMirroredHash({filepath:"c:/temp/mhash", valuehash:"xxxysaaerf", keyhash:"xxseaerarf", vector:"xyatqdw"});
  result = mhash.get("four");
  expect(result).toEqual("fourth value");
});


test("Create directory", () => {
  if (fs.existsSync("c:/temp/testdir")) {
    fs.rmSync("c:/temp/testdir", {recursive:true, force:true});
  }
  let mhash = getMirroredHash({filepath:"c:/temp/testdir/myfile.dat", valuehash:"xxxysaaerf", keyhash:"xxseaerarf", vector:"xyatqdw"});
  mhash.set("one","first value");
  result = mhash.get("one");
  expect(result).toEqual("first value");
});