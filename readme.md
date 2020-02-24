# sign

A universal javascript library for signing strings to avoid tampering:

```js
import { sign, check } from 'sign';

// Keep the secret long and safe! e.g., use `process.env.SECRET` or similar
const signed = await sign('Francisco', '123456');

console.log(signed);
// Francisco.pACXHmIctuGrwvidl7vVNyh5uvZMEHmp+D3NQB3uXJ4

// Only matches if the secret is the same used to sign
console.log(await check(signed, '123456'));    // true
console.log(await check(signed, 'badsecret')); // false

// Prevent tampering on the client side since they don't know the secret
const fakeCookie = await sign('Francisco', 'badsecret');
console.log(await check(fakeCookie, '123456')); // false

```

It works on Node.js, the browser and Cloudflare Workers.

It is used to make sure that only those with the `secret` have modified the message. This is ideal to sign session cookies, since those are created and modified only by the server, but can be used for many more things.

Note that this does *no* encrypt the messages, just checks whether the message has been modified by someone who knows the secret. The message remains in plain text.

## API

### sign(message, secret)

Both the message and secret must be plain strings. Make sure that the secret has high entropy and remains in a safe location, e.g.:

```js
const signed = sign('Francisco', process.env.SECRET);
```

The result looks like `{MESSAGE}.{SIGNATURE}`.


### check(signed, secret)

Check whether the message has been signed with this secret. The signed message looks like `{MESSAGE}#{SIGNATURE}`:

```js
// Signed with '123456'
const signed = "Francisco.pACXHmIctuGrwvidl7vVNyh5uvZMEHmp+D3NQB3uXJ4";

expect(await check(signed, '123456')).toBe(true);
expect(await check(signed, 'fake')).toBe(false);
```
