import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Helper to detect if a window or object is cross-origin
const isCrossOrigin = (win: any): boolean => {
  if (!win) return false;
  try {
    // Attempt to read the document property. Same-origin will succeed, cross-origin will throw.
    const doc = win.document;
    return !doc;
  } catch (e) {
    return true;
  }
};

// Standard safe properties allowed on cross-origin windows per HTML specification
const ALLOWED_CROSS_ORIGIN_PROPERTIES = new Set([
  'postMessage',
  'blur',
  'focus',
  'close',
  'closed',
  'frames',
  'length',
  'location',
  'opener',
  'parent',
  'top',
  'window',
  'self',
  'replace' // location.replace is writable on cross-origin
]);

// Safely wrap any window-like object (especially cross-origin ones) in a Proxy to intercept and suppress SecurityErrors.
const makeSafeWindowProxy = (targetWindow: any): any => {
  if (!targetWindow) return targetWindow;

  // Use a cache to avoid recreating proxies for the same Window object
  let proxyCache = (window as any).__safeWindowProxyCache;
  if (!proxyCache) {
    try {
      proxyCache = new WeakMap();
      (window as any).__safeWindowProxyCache = proxyCache;
    } catch (e) {
      proxyCache = null;
    }
  }

  if (proxyCache) {
    try {
      if (proxyCache.has(targetWindow)) {
        return proxyCache.get(targetWindow);
      }
    } catch (e) {}
  }

  const proxy = new Proxy(targetWindow, {
    get(target, prop) {
      const isCross = isCrossOrigin(target);

      if (typeof prop === 'symbol') {
        if (isCross) return undefined;
        try {
          return target[prop];
        } catch (e) {
          return undefined;
        }
      }

      if (typeof prop === 'string') {
        if (isCross) {
          // If accessing an indexed frame like window[0] on a cross-origin window
          if (/^\d+$/.test(prop)) {
            try {
              const frame = target[prop];
              return frame ? makeSafeWindowProxy(frame) : frame;
            } catch (e) {
              return undefined;
            }
          }

          // If the property is not allowed on cross-origin frames, block it immediately
          if (!ALLOWED_CROSS_ORIGIN_PROPERTIES.has(prop)) {
            return undefined;
          }
        }
      }

      try {
        const value = target[prop];
        if (typeof value === 'function') {
          return value.bind(target);
        }
        if (value && typeof value === 'object') {
          return makeSafeWindowProxy(value);
        }
        return value;
      } catch (e) {
        // Return undefined for any properties that throw a SecurityError
        return undefined;
      }
    },
    has(target, prop) {
      const isCross = isCrossOrigin(target);
      if (isCross) {
        if (typeof prop === 'string') {
          return ALLOWED_CROSS_ORIGIN_PROPERTIES.has(prop) || /^\d+$/.test(prop);
        }
        return false;
      }
      try {
        return prop in target;
      } catch (e) {
        return false;
      }
    },
    set(target, prop, value) {
      try {
        target[prop] = value;
        return true;
      } catch (e) {
        return false;
      }
    },
    getOwnPropertyDescriptor(target, prop) {
      if (isCrossOrigin(target)) {
        return undefined; // Hide descriptors on cross-origin windows to be safe
      }
      try {
        return Reflect.getOwnPropertyDescriptor(target, prop);
      } catch (e) {
        return undefined;
      }
    },
    ownKeys(target) {
      if (isCrossOrigin(target)) {
        return Array.from(ALLOWED_CROSS_ORIGIN_PROPERTIES);
      }
      try {
        return Reflect.ownKeys(target);
      } catch (e) {
        return [];
      }
    },
    getPrototypeOf(target) {
      try {
        return Reflect.getPrototypeOf(target);
      } catch (e) {
        return null;
      }
    },
    setPrototypeOf(target, prototype) {
      return false;
    },
    isExtensible(target) {
      try {
        return Reflect.isExtensible(target);
      } catch (e) {
        return false;
      }
    },
    preventExtensions(target) {
      return false;
    },
    defineProperty(target, prop, descriptor) {
      return false;
    },
    deleteProperty(target, prop) {
      return false;
    }
  });

  if (proxyCache) {
    try {
      proxyCache.set(targetWindow, proxy);
    } catch (e) {}
  }

  return proxy;
};

// Safeguard top-level properties on the main window
const safeguardWindowProperty = (propName: 'parent' | 'top' | 'opener') => {
  try {
    const originalValue = window[propName];
    if (!originalValue) return;

    Object.defineProperty(window, propName, {
      get() {
        return makeSafeWindowProxy(originalValue);
      },
      configurable: true,
      enumerable: true,
    });
  } catch (e) {}
};

safeguardWindowProperty('parent');
safeguardWindowProperty('top');
safeguardWindowProperty('opener');

// Also safeguard window.frames if accessed recursively
try {
  const originalFrames = window.frames;
  Object.defineProperty(window, 'frames', {
    get() {
      return makeSafeWindowProxy(originalFrames);
    },
    configurable: true,
    enumerable: true,
  });
} catch (e) {}

// Safeguard MessageEvent.prototype.source to protect against postMessage event source inspection
try {
  const originalSourceGet = Object.getOwnPropertyDescriptor(MessageEvent.prototype, 'source')?.get;
  if (originalSourceGet) {
    Object.defineProperty(MessageEvent.prototype, 'source', {
      get() {
        const source = originalSourceGet.call(this);
        return source ? makeSafeWindowProxy(source) : source;
      },
      configurable: true,
      enumerable: true
    });
  }
} catch (e) {}

// Gracefully intercept and suppress cross-origin iframe SecurityErrors.
// This prevents benign Same-Origin Policy checks by browser extensions or devtools from bubbling up.
window.addEventListener('error', (event) => {
  const msg = event.message || '';
  if (
    msg.includes('SecurityError') || 
    msg.includes('cross-origin frame') || 
    msg.includes("Failed to read a named property '$$typeof' from 'Window'") ||
    msg.includes("Failed to read a named property") ||
    msg.includes('Blocked a frame with origin')
  ) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const msg = reason?.message || String(reason || '');
  if (
    msg.includes('SecurityError') || 
    msg.includes('cross-origin frame') || 
    msg.includes("Failed to read a named property '$$typeof' from 'Window'") ||
    msg.includes("Failed to read a named property") ||
    msg.includes('Blocked a frame with origin')
  ) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
