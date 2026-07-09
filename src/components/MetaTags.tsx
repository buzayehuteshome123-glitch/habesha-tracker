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

    // 8. Dynamic Structured Data JSON-LD
    const setStructuredData = () => {
      let script = document.getElementById('structured-data-json');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('id', 'structured-data-json');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      
      const schemas = [
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": "https://habeshatracker.com/#organization",
          "name": "Habesha Tracker",
          "url": "https://habeshatracker.com",
          "logo": "https://habeshatracker.com/apple-touch-icon.png",
          "sameAs": [
            "https://t.me/Manbuza12"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+251986580996",
            "contactType": "customer support",
            "email": "buzayehuteshome123@gmail.com",
            "availableLanguage": ["Amharic", "English"]
          }
        },
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "@id": "https://habeshatracker.com/#software",
          "name": "Habesha Tracker",
          "operatingSystem": "All",
          "applicationCategory": "BusinessApplication",
          "description": description || "Optimized business management ERP for Ethiopian enterprises. Track sales, inventory, expenses, CBE records, telebirr, and client loans in English and Amharic.",
          "offers": {
            "@type": "Offer",
            "price": "199.00",
            "priceCurrency": "ETB",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "price": "199.00",
              "priceCurrency": "ETB",
              "description": "Founding Merchant Plan per month"
            }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "1250"
          },
          "author": {
            "@type": "Organization",
            "name": "Habesha Tracker Dev Group",
            "url": "https://habeshatracker.com"
          }
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": "https://habeshatracker.com/#website",
          "name": "Habesha Tracker",
          "url": "https://habeshatracker.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://habeshatracker.com/?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }
      ];

      script.textContent = JSON.stringify(schemas, null, 2);
    };

    setStructuredData();

    // Clean up dynamic structured data script tag on unmount (optional, but clean)
    return () => {
      const script = document.getElementById('structured-data-json');
      if (script) {
        script.remove();
      }
    };

  }, [title, description, canonicalUrl, isAmharic]);

  return null;
}
