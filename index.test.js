import { describe, expect, it } from "bun:test";
import { check, sign } from "./index.js";

describe("sign", () => {
  it("can sign strings", async () => {
    expect(await sign("francisco", "123456")).toBe("francisco.SDucxDGCVvBwEq5/CMoConqdZvA4Td8mai5yWa5Vyjs");
  });

  it("can sign strings with pound symbols", async () => {
    expect(await sign("francisco.io", "123456")).toBe("francisco.io.xFF4o51hmFPUJfxqy/9RharxvzqH+aLeZ0a6AM0wxLY");
  });

  it("signs the same as cookie-signature", async () => {
    expect(await sign("hello", "tobiiscool")).toBe("hello.DGDUkGlIkCzPz+C0B064FNgHdEjox7ch8tOBGslZ5QI");
  });

  it("checks signatures", async () => {
    const tobi = await sign("hello", "tobiiscool");
    expect(await check(tobi, "tobiiscool")).toBe(true);
    expect(await check(tobi, "luna")).toBe(false);
    expect(await check(await sign("francisco", "123456"), "123456")).toBe(true);
  });

  it("requires a message, a string and a secret", async () => {
    await expect(sign()).rejects.toThrow(TypeError);
    await expect(sign({ hello: "world" })).rejects.toThrow(TypeError);
    await expect(sign("francisco")).rejects.toThrow(TypeError);
  });

  it("requires the same secret, message and hash", async () => {
    const signed = await sign("francisco", "123456");
    expect(await check(signed, "1234567")).toBe(false);
    expect(await check("a" + signed, "123456")).toBe(false);
    expect(await check(signed + "a", "123456")).toBe(false);
  });
});
