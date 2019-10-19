import { check, hash, sign } from "./index.js";

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
      "francisco.SDucxDGCVvBwEq5/CMoConqdZvA4Td8mai5yWa5Vyjs",
      "can sign strings"
    );

    equal(
      await sign("francisco.io", "123456"),
      "francisco.io.xFF4o51hmFPUJfxqy/9RharxvzqH+aLeZ0a6AM0wxLY",
      "can sign strings with pound symbols"
    );

    const tobi = await sign("hello", "tobiiscool");
    equal(
      tobi,
      "hello.DGDUkGlIkCzPz+C0B064FNgHdEjox7ch8tOBGslZ5QI",
      "signs the same as cookie-signature"
    );

    equal(await check(tobi, "tobiiscool"), true, "tobi is cool");

    equal(await check(tobi, "luna"), false, "luna is not cool");

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
