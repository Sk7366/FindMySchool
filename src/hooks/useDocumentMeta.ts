import { useEffect } from 'react';

export interface DocumentMetaOptions {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  structuredData?: Record<string, any>;
}

/**
 * Custom hook to dynamically manage Document Title, Meta Description,
 * Canonical URL link, OpenGraph tags, Twitter Card tags, and Schema.org JSON-LD.
 *
 * Preserves semantic HTML and conforms to WCAG accessibility guidelines.
 */
export function useDocumentMeta({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  ogImage,
  structuredData,
}: DocumentMetaOptions) {
  useEffect(() => {
    // 1. Set document.title
    document.title = title;

    // 2. Helper to set or update meta tag
    const setMetaTag = (attribute: 'name' | 'property', key: string, content: string) => {
      let tag = document.querySelector(`meta[${attribute}="${key}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);

    if (ogImage) {
      setMetaTag('property', 'og:image', ogImage);
      setMetaTag('name', 'twitter:image', ogImage);
    }

    // 3. Canonical URL
    const fullCanonicalUrl = canonicalPath
      ? `${window.location.origin}${canonicalPath}`
      : `${window.location.origin}${window.location.pathname}${window.location.search}`;

    setMetaTag('property', 'og:url', fullCanonicalUrl);

    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullCanonicalUrl);

    // 4. Schema.org JSON-LD structured data
    let jsonLdScript = document.querySelector<HTMLScriptElement>('script#schema-structured-data');
    if (structuredData) {
      if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        jsonLdScript.id = 'schema-structured-data';
        jsonLdScript.type = 'application/ld+json';
        document.head.appendChild(jsonLdScript);
      }
      jsonLdScript.textContent = JSON.stringify(structuredData);
    } else if (jsonLdScript) {
      jsonLdScript.remove();
    }
  }, [title, description, canonicalPath, ogType, ogImage, JSON.stringify(structuredData)]);
}
