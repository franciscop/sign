# sign

A universal javascript library for signing strings and validating those signatures:

```js
import { sign, check } from 'sign';

// Keep the secret long and safe! e.g., use `process.env.SECRET` or similar
const secret = '123456';
const signed = await sign('Francisco', secret);
expect(signed).toBe('Francisco#b4c4c3d6e52559c7b13421ae0ef6d9c0f1c774b98c931f5f080a2a578cba5c69');
expect(await check(signed, secret)).toBe(true);
```

It works on Node.js, the browser (through the Web Crypto API) and serverless environments like Cloudflare Workers.

It is useful to make sure that only those who know the `secret` have modified the message. This is ideal to sign session cookies, since those are created and modified only by the server, but can be used for many more things.

Note that this does *no* encrypt the messages, just checks whether the message has been modified by someone who knows the secret. The message remains plain text.

## API

### sign(message, secret)

Both the message and secret must be plain strings. Make sure that the secret has high entropy and remains in a safe location, e.g.:

```js
sign('Francisco', process.env.SECRET);
```


### check(signed, secret)

Check whether the message has been signed with this secret. The signed message looks like `{MESSAGE}#{SIGNATURE}`:

```js
// Signed with '123456'
const signed = "Francisco#b4c4c3d6e52559c7b13421ae0ef6d9c0f1c774b98c931f5f080a2a578cba5c69";

expect(await check(signed, '123456')).toBe(true);
expect(await check(signed, 'fake')).toBe(false);
```
