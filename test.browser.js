'use strict';

function _interopNamespace(e) {
  if (e && e.__esModule) { return e; } else {
    var n = {};
    if (e) {
      Object.keys(e).forEach(function (k) {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () {
            return e[k];
          }
        });
      });
    }
    n['default'] = e;
    return n;
  }
}

const nodeHash = async (message, secret = "") => {
  const crypto = await new Promise(function (resolve) { resolve(_interopNamespace(require('crypto'))); });
  return crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex");
};

// From here: https://stackoverflow.com/a/47332317/938236
const browserHash = async (message, secret) => {
  // Encoder to convert string to Uint8Array
  const enc = new TextEncoder("utf-8");

  const key = await window.crypto.subtle.importKey(
    "raw", // raw format of the key - should be Uint8Array
    enc.encode(secret),
    { name: "HMAC", hash: { name: "SHA-256" } },
    false, // export = false
    ["sign", "verify"] // what this key can do
  );
  const signature = await window.crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(message)
  );
  var b = new Uint8Array(signature);
  return Array.prototype.map
    .call(b, x => ("00" + x.toString(16)).slice(-2))
    .join("");
};

// Compare two hashes in constant time
const safeEqual = (a, b) => {
  if (a.length !== b.length) return false;
  var mismatch = 0;
  for (var i = 0; i < a.length; ++i) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
};

const hash = typeof crypto === "undefined" ? nodeHash : browserHash;

const sign = async (message, secret) => {
  if (!message) throw new TypeError("Provide a message to sign(message)");
  if (!secret) throw new TypeError("Provide a secret to sign(message, secret)");

  const signature = await hash(`${message}${secret}`, secret);
  return `${message}#${signature}`;
};

const check = async (signed, secret) => {
  // Requires two strings for the check
  if (!signed || typeof signed !== "string") return false;
  if (!secret || typeof secret !== "string") return false;
  if (!signed.includes("#")) return false;

  // Break it into two parts
  const parts = signed.split("#");
  const signature = parts.pop();
  const value = parts.join("#");

  // Get the signature again
  const hashed = await hash(`${value}${secret}`, secret);

  // Compare them in constant time
  return safeEqual(hashed, signature);
};

const log = msg => {
  if (typeof process === "undefined") {
    console.log(msg.replace(/\x1b\[\d+m/g, ""));
  } else {
    process.stdout.write(msg);
  }
};
let last;
const equal = (a, b, reason = "Must be equal") => {
  last = reason;
  if (a === b) {
    log(`\x1b[32m✓\x1b[0m \x1b[90m${reason}\x1b[0m\n`);
  } else {
    log(`\x1b[31m\x1b[5m✘\x1b[0m ${reason}\n  \x1b[31m${a}\n  ${b}\x1b[0m\n`);
  }
};
const throws = async (err, b = Error, reason = "did not throw") => {
  const a = await err.catch(err => err);
  if (a instanceof b) {
    log(`\x1b[32m✓\x1b[0m \x1b[90m${reason}\x1b[0m\n`);
  } else {
    log(`\x1b[31m\x1b[5m✘\x1b[0m ${reason}\n  \x1b[31m${a}\n  ${b}\x1b[0m\n`);
  }
};

// No easy way to bundle and put this in the browser/CloudflareWorkers
(async () => {
  try {
    equal(
      await sign("francisco", "123456"),
      "francisco#cc72290e44931616537934388d5c749b1bf9e63f9ff8701992534f8b0ded7923",
      "can sign strings"
    );

    equal(
      await sign("francisco#io", "123456"),
      "francisco#io#c8377bfa77a734e7b23097d397b6b36d8f593f9c2b8593fa73b9883a03f71559",
      "can sign strings with pound symbols"
    );

    equal(
      await check(await sign("francisco", "123456"), "123456"),
      true,
      "can verify signatures"
    );

    await throws(sign(), TypeError, "requires a message");
    await throws(sign({ hello: "world" }), TypeError, "requires a string");
    await throws(sign("francisco"), TypeError, "requires a secret");

    const signed = await sign("francisco", "123456");

    equal(await check(signed, "1234567"), false, "requires the same secret");
    equal(await check("a" + signed, "123456"), false, "requires the same msg");
    equal(await check(signed + "a", "123456"), false, "requires the same hash");
  } catch (error) {
    console.error(error);
    console.log(`Failed after ${last}`);
  }
})();
