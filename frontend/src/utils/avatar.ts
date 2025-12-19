export const md5 = (str: string) => {
  const x = (n: number, s: number) => (n << s) | (n >>> (32 - s));
  const add = (a: number, b: number) => (a + b) & 0xffffffff;
  const cmn = (
    q: number,
    a: number,
    b: number,
    x2: number,
    s: number,
    t: number
  ) => add(x(add(add(a, q), add(x2, t)), s), b);
  const ff = (
    a: number,
    b: number,
    c: number,
    d: number,
    x2: number,
    s: number,
    t: number
  ) => cmn((b & c) | (~b & d), a, b, x2, s, t);
  const gg = (
    a: number,
    b: number,
    c: number,
    d: number,
    x2: number,
    s: number,
    t: number
  ) => cmn((b & d) | (c & ~d), a, b, x2, s, t);
  const hh = (
    a: number,
    b: number,
    c: number,
    d: number,
    x2: number,
    s: number,
    t: number
  ) => cmn(b ^ c ^ d, a, b, x2, s, t);
  const ii = (
    a: number,
    b: number,
    c: number,
    d: number,
    x2: number,
    s: number,
    t: number
  ) => cmn(c ^ (b | ~d), a, b, x2, s, t);
  const toBlocks = (str2: string) => {
    const nblk = (((str2.length + 8) >> 6) + 1) * 16;
    const blks = new Array(nblk).fill(0);
    for (let i = 0; i < str2.length; i++)
      blks[i >> 2] |= str2.charCodeAt(i) << ((i % 4) * 8);
    blks[str2.length >> 2] |= 0x80 << ((str2.length % 4) * 8);
    blks[nblk - 2] = str2.length * 8;
    return blks;
  };
  const hex = (n: number) => {
    let s = "",
      v;
    for (let i = 0; i < 4; i++) {
      v = (n >> (i * 8)) & 0xff;
      s += ("0" + v.toString(16)).slice(-2);
    }
    return s;
  };
  const blocks = toBlocks(unescape(encodeURIComponent(str)));
  let a = 1732584193,
    b = -271733879,
    c = -1732584194,
    d = 271733878;
  for (let i = 0; i < blocks.length; i += 16) {
    const olda = a,
      oldb = b,
      oldc = c,
      oldd = d;
    a = ff(a, b, c, d, blocks[i + 0], 7, -680876936);
    d = ff(d, a, b, c, blocks[i + 1], 12, -389564586);
    c = ff(c, d, a, b, blocks[i + 2], 17, 606105819);
    b = ff(b, c, d, a, blocks[i + 3], 22, -1044525330);
    a = ff(a, b, c, d, blocks[i + 4], 7, -176418897);
    d = ff(d, a, b, c, blocks[i + 5], 12, 1200080426);
    c = ff(c, d, a, b, blocks[i + 6], 17, -1473231341);
    b = ff(b, c, d, a, blocks[i + 7], 22, -45705983);
    a = ff(a, b, c, d, blocks[i + 8], 7, 1770035416);
    d = ff(d, a, b, c, blocks[i + 9], 12, -1958414417);
    c = ff(c, d, a, b, blocks[i + 10], 17, -42063);
    b = ff(b, c, d, a, blocks[i + 11], 22, -1990404162);
    a = ff(a, b, c, d, blocks[i + 12], 7, 1804603682);
    d = ff(d, a, b, c, blocks[i + 13], 12, -40341101);
    c = ff(c, d, a, b, blocks[i + 14], 17, -1502002290);
    b = ff(b, c, d, a, blocks[i + 15], 22, 1236535329);
    a = gg(a, b, c, d, blocks[i + 1], 5, -165796510);
    d = gg(d, a, b, c, blocks[i + 6], 9, -1069501632);
    c = gg(c, d, a, b, blocks[i + 11], 14, 643717713);
    b = gg(b, c, d, a, blocks[i + 0], 20, -373897302);
    a = gg(a, b, c, d, blocks[i + 5], 5, -701558691);
    d = gg(d, a, b, c, blocks[i + 10], 9, 38016083);
    c = gg(c, d, a, b, blocks[i + 15], 14, -660478335);
    b = gg(b, c, d, a, blocks[i + 4], 20, -405537848);
    a = gg(a, b, c, d, blocks[i + 9], 5, 568446438);
    d = gg(d, a, b, c, blocks[i + 14], 9, -1019803690);
    c = gg(c, d, a, b, blocks[i + 3], 14, -187363961);
    b = gg(b, c, d, a, blocks[i + 8], 20, 1163531501);
    a = gg(a, b, c, d, blocks[i + 13], 5, -1444681467);
    d = gg(d, a, b, c, blocks[i + 2], 9, -51403784);
    c = gg(c, d, a, b, blocks[i + 7], 14, 1735328473);
    b = gg(b, c, d, a, blocks[i + 12], 20, -1926607734);
    a = hh(a, b, c, d, blocks[i + 5], 4, -378558);
    d = hh(d, a, b, c, blocks[i + 8], 11, -2022574463);
    c = hh(c, d, a, b, blocks[i + 11], 16, 1839030562);
    b = hh(b, c, d, a, blocks[i + 14], 23, -35309556);
    a = hh(a, b, c, d, blocks[i + 1], 4, -1530992060);
    d = hh(d, a, b, c, blocks[i + 4], 11, 1272893353);
    c = hh(c, d, a, b, blocks[i + 7], 16, -155497632);
    b = hh(b, c, d, a, blocks[i + 10], 23, -1094730640);
    a = hh(a, b, c, d, blocks[i + 13], 4, 681279174);
    d = hh(d, a, b, c, blocks[i + 0], 11, -358537222);
    c = hh(c, d, a, b, blocks[i + 3], 16, -722521979);
    b = hh(b, c, d, a, blocks[i + 6], 23, 76029189);
    a = ii(a, b, c, d, blocks[i + 0], 6, -198630844);
    d = ii(d, a, b, c, blocks[i + 7], 10, 1126891415);
    c = ii(c, d, a, b, blocks[i + 14], 15, -1416354905);
    b = ii(b, c, d, a, blocks[i + 5], 21, -57434055);
    a = ii(a, b, c, d, blocks[i + 12], 6, 1700485571);
    d = ii(d, a, b, c, blocks[i + 3], 10, -1894986606);
    c = ii(c, d, a, b, blocks[i + 10], 15, -1051523);
    b = ii(b, c, d, a, blocks[i + 1], 21, -2054922799);
    a = add(a, olda);
    b = add(b, oldb);
    c = add(c, oldc);
    d = add(d, oldd);
  }
  return hex(a) + hex(b) + hex(c) + hex(d);
};

export const gravatarUrl = (email: string, size = 40) => {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
};
