(() => {
  const MARK = "?path=/v6/trackOfTheWeek/image/";
  const cache = new Map();

  const toDataUrl = (url) => {
    if (!cache.has(url)) {
      cache.set(url, fetch(url)
        .then(r => r.text())
        .then(b64 => "data:image/webp;base64," + b64.trim()));
    }
    return cache.get(url);
  };

  const isProxyImage = (v) =>
    typeof v === "string" && v.includes("script.google.com") && v.includes(MARK);

  const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
  const setSrc = (img, v) => desc.set.call(img, v);

  Object.defineProperty(HTMLImageElement.prototype, "src", {
    configurable: true,
    enumerable: true,
    get() { return desc.get.call(this); },
    set(v) {
      if (isProxyImage(v)) {
        toDataUrl(v).then(d => setSrc(this, d)).catch(() => setSrc(this, v));
      } else {
        setSrc(this, v);
      }
    },
  });

  const setAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    if (this instanceof HTMLImageElement && name === "src" && isProxyImage(value)) {
      toDataUrl(value).then(d => setSrc(this, d)).catch(() => setSrc(this, value));
      return;
    }
    return setAttr.call(this, name, value);
  };
})();
