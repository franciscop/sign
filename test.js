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
