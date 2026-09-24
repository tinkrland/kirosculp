// helper component that injects basic seo meta tags on the fly.
//
// keeps it simple: title, description, canonical, og:title, og:description,
// og:image. tags get reused across the marketplace so consolidating the
// dom mutation logic here avoids each page reimplementing it.

import { useEffect } from 'react';

function setOrCreateMeta(selector, attrName, attrValue, content) {
  if (!content) return;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setOrCreateLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export default function SeoTags({ title, description, image, canonical, keywords }) {
  useEffect(() => {
    if (title) document.title = title;
    setOrCreateMeta('meta[name="description"]', 'name', 'description', description);
    setOrCreateMeta('meta[name="keywords"]', 'name', 'keywords', keywords);
    setOrCreateMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setOrCreateMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setOrCreateMeta('meta[property="og:image"]', 'property', 'og:image', image);
    setOrCreateMeta('meta[name="twitter:card"]', 'name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setOrCreateLink('canonical', canonical);
  }, [title, description, image, canonical, keywords]);
  return null;
}
