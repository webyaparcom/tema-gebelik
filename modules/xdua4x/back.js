/* sss-bolunmus — Bölünmüş SSS: yapışkan yan sütun + numaralı soru listesi (15 Kas 2026, G4 · mcp:webmaker/20261115-202337-k60m · D17–D18).
   Yer tutucular: sblsinif sblust sblbaslik sblmetin sblcta sblarama sblfiltre sblliste.
   data: [{ soru, cevap, kategori? }] — her metin dil sözlüğü ({"<dil>": "…"}) ya da düz metin. Soru boşsa satır atlanır; veri yoksa blok basılmaz.
   baslik boşsa @faq-title@ (lang.json); ust · metin · cta yalnız doluysa. Dil listesi ezberi yok (D18). */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const medyaUrl = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|file):/i.test(s)) return "";
  if (/^data:/i.test(s)) return /^data:(image|video|audio)\//i.test(s) ? s : "";
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return `/img/${s}`;
};
const href = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|data):/i.test(s)) return "";
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s)) return s;
  return wxLangInternalHref(s);
};
const dogru = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");
const ikonAd = (v) => String(v ?? "").trim().replace(/[^a-z0-9_]/gi, "");
const satirlar = (s) => esc(s).replace(/\r?\n/g, "<br />");
const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const veri = Array.isArray(json.data) ? json.data : [];

const ogeler = veri
  .map((o) => ({ soru: pick(o && o.soru).trim(), cevap: pick(o && o.cevap).trim(), kategori: pick(o && o.kategori).trim() }))
  .filter((o) => o.soru);

const kategoriler = [...new Set(ogeler.map((o) => o.kategori).filter(Boolean))];
const filtreVar = kategoriler.length >= 2 && dogru(des.filtre, true);
const aramaVar = dogru(des.arama, true) && ogeler.length >= 4;
const tekAcik = dogru(des.tekAcik, true);
const ilkAcik = dogru(des.ilkAcik, true);
const kod = (k) => "k" + (kategoriler.indexOf(k) + 1);

const sblListe = ogeler.map((o, i) => {
  const no = String(i + 1).padStart(2, "0");
  return `<details class="modulex-sbl-oge"${tekAcik ? ' name="sbl-{{id}}"' : ""}${i === 0 && ilkAcik ? " open" : ""}${o.kategori ? ` data-kategori="${kod(o.kategori)}"` : ""}>`
    + `<summary class="modulex-sbl-soru"><span class="modulex-sbl-no" aria-hidden="true">${no}</span><span class="modulex-sbl-soru-metin">${esc(o.soru)}</span>`
    + '<span class="modulex-sbl-arti" aria-hidden="true"></span></summary>'
    + (o.cevap ? `<div class="modulex-sbl-cevap"><p>${satirlar(o.cevap)}</p></div>` : "")
    + "</details>";
}).join("");

const ust = pick(des.ust).trim();
const baslik = pick(des.baslik).trim();
const metin = pick(des.metin).trim();
const ctaAd = pick(des.cta_ad).trim();
const ctaUrl = href(des.cta_url);

const sblFiltre = filtreVar
  ? '<div class="modulex-sbl-filtre" role="group" aria-label="@categories@">'
    + '<button class="modulex-sbl-cip" type="button" aria-pressed="true" data-kategori="">@all@</button>'
    + kategoriler.map((k) => `<button class="modulex-sbl-cip" type="button" aria-pressed="false" data-kategori="${kod(k)}">${esc(k)}</button>`).join("")
    + "</div>"
  : "";

const sblArama = aramaVar
  ? '<div class="modulex-sbl-arama"><span class="material-symbols-outlined" aria-hidden="true">search</span>'
    + '<input class="modulex-sbl-girdi" type="search" placeholder="@faq-search@" aria-label="@faq-search@" autocomplete="off" />'
    + '<p class="modulex-sbl-yok" role="status" hidden>@no-results@</p></div>'
  : "";

html = html
  .replaceAll("{{sblsinif}}", () => (ogeler.length ? "" : " modulex-sbl--bos") + (ctaAd && ctaUrl ? "" : " modulex-sbl--ctasiz"))
  .replaceAll("{{sblust}}", () => (ust ? `<p class="modulex-sbl-ust">${esc(ust)}</p>` : ""))
  .replaceAll("{{sblbaslik}}", () => (baslik ? esc(baslik) : "@faq-title@"))
  .replaceAll("{{sblmetin}}", () => (metin ? `<p class="modulex-sbl-metin">${satirlar(metin)}</p>` : ""))
  .replaceAll("{{sblcta}}", () => (ctaAd && ctaUrl ? `<a class="modulex-sbl-cta" href="${esc(ctaUrl)}">${esc(ctaAd)}<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : ""))
  .replaceAll("{{sblarama}}", () => sblArama)
  .replaceAll("{{sblfiltre}}", () => sblFiltre)
  .replaceAll("{{sblliste}}", () => sblListe);
/* veri yoksa blok yok */
if (!ogeler.length) html = "";
