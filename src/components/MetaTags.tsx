import { useEffect } from 'react';

interface MetaTagsProps {
  title: string;
  description: string;
  canonicalUrl: string;
  isAmharic?: boolean;
}

export default function MetaTags({ title, description, canonicalUrl, isAmharic = false }: MetaTagsProps) {
  useEffect(() => {
    // 1. Update document title
    document.title = title;

    // 2. Set html lang attribute
    document.documentElement.lang = isAmharic ? 'am' : 'en';

    // 3. Helper to create or update meta elements
    const setMetaTag = (attributeName: string, attributeValue: string, content: string, isProperty = false) => {
      const selector = isProperty 
        ? `meta[property="${attributeValue}"]` 
        : `meta[${attributeName}="${attributeValue}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) {
          el.setAttribute('property', attributeValue);
        } else {
          el.setAttribute(attributeName, attributeValue);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 4. Helper to update canonical link tag
    const setCanonicalLink = (href: string) => {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // 5. Update SEO tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', 'index, follow');
    setCanonicalLink(canonicalUrl);

    // 6. Open Graph tags
    setMetaTag('property', 'og:title', title, true);
    setMetaTag('property', 'og:description', description, true);
    setMetaTag('property', 'og:url', canonicalUrl, true);
    setMetaTag('property', 'og:type', 'website', true);
    setMetaTag('property', 'og:image', 'https://habeshatracker.com/og-image.png', true);

    // 7. Twitter Card tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', 'https://habeshatracker.com/og-image.png');

  }, [title, description, canonicalUrl, isAmharic]);

  return null;
}
