/**
 * Focus Management and Keyboard Navigation Utilities
 * ST-038: A11y compliance - Phase 8 Accessibility & Interaction Polish
 */

// Focusable element selectors
export const FOCUSABLE_SELECTORS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
  'select:not([disabled]):not([aria-hidden])',
  'textarea:not([disabled]):not([aria-hidden])',
  'button:not([disabled]):not([aria-hidden])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex^="-"])',
].join(', ');

// Get all focusable elements within a container
export const getFocusableElements = (container: Element): HTMLElement[] => {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS))
    .filter((element) => {
      return (
        element instanceof HTMLElement &&
        !element.hasAttribute('aria-hidden') &&
        element.tabIndex !== -1 &&
        isElementVisible(element)
      );
    }) as HTMLElement[];
};

// Check if an element is visible
export const isElementVisible = (element: HTMLElement): boolean => {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0
  );
};

// Focus the first focusable element in a container
export const focusFirstElement = (container: Element): boolean => {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
    return true;
  }
  return false;
};

// Focus the last focusable element in a container
export const focusLastElement = (container: Element): boolean => {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusableElements[focusableElements.length - 1].focus();
    return true;
  }
  return false;
};

// Create a focus trap for modal dialogs
export class FocusTrap {
  private container: Element;
  private previouslyFocusedElement: HTMLElement | null;
  private isActive: boolean = false;

  constructor(container: Element) {
    this.container = container;
    this.previouslyFocusedElement = document.activeElement as HTMLElement;
  }

  activate(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.container.addEventListener('keydown', this.handleKeyDown);
    
    // Focus the first focusable element in the container
    setTimeout(() => {
      focusFirstElement(this.container);
    }, 0);
  }

  deactivate(): void {
    if (!this.isActive) return;

    this.isActive = false;
    this.container.removeEventListener('keydown', this.handleKeyDown);
    
    // Restore focus to previously focused element
    if (this.previouslyFocusedElement && isElementVisible(this.previouslyFocusedElement)) {
      this.previouslyFocusedElement.focus();
    }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.isActive || event.key !== 'Tab') return;

    const focusableElements = getFocusableElements(this.container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab - moving backwards
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab - moving forwards
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };
}

// Keyboard navigation handler for roving tabindex pattern
export class RovingTabIndexManager {
  private container: Element;
  private items: HTMLElement[];
  private currentIndex: number = 0;

  constructor(container: Element, itemSelector?: string) {
    this.container = container;
    this.items = itemSelector
      ? Array.from(container.querySelectorAll(itemSelector))
      : getFocusableElements(container);

    this.setupRovingTabindex();
    this.container.addEventListener('keydown', this.handleKeyDown);
    this.container.addEventListener('click', this.handleClick);
  }

  private setupRovingTabindex(): void {
    this.items.forEach((item, index) => {
      item.tabIndex = index === 0 ? 0 : -1;
      item.setAttribute('role', item.getAttribute('role') || 'button');
    });
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const { key } = event;
    
    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this.moveToNext();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this.moveToPrevious();
        break;
      case 'Home':
        event.preventDefault();
        this.moveToFirst();
        break;
      case 'End':
        event.preventDefault();
        this.moveToLast();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.activateCurrentItem();
        break;
    }
  };

  private handleClick = (event: Event): void => {
    const target = event.target as HTMLElement;
    const index = this.items.indexOf(target);
    if (index !== -1) {
      this.moveTo(index);
    }
  };

  private moveToNext(): void {
    const nextIndex = (this.currentIndex + 1) % this.items.length;
    this.moveTo(nextIndex);
  }

  private moveToPrevious(): void {
    const prevIndex = this.currentIndex === 0 ? this.items.length - 1 : this.currentIndex - 1;
    this.moveTo(prevIndex);
  }

  private moveToFirst(): void {
    this.moveTo(0);
  }

  private moveToLast(): void {
    this.moveTo(this.items.length - 1);
  }

  private moveTo(index: number): void {
    if (index < 0 || index >= this.items.length) return;

    // Update tabindex
    this.items[this.currentIndex].tabIndex = -1;
    this.items[index].tabIndex = 0;

    // Update current index and focus
    this.currentIndex = index;
    this.items[this.currentIndex].focus();
  }

  private activateCurrentItem(): void {
    const currentItem = this.items[this.currentIndex];
    if (currentItem) {
      currentItem.click();
    }
  }

  destroy(): void {
    this.container.removeEventListener('keydown', this.handleKeyDown);
    this.container.removeEventListener('click', this.handleClick);
  }
}

// Skip link functionality
export const createSkipLink = (targetId: string, text: string = 'Skip to main content'): HTMLAnchorElement => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-3 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium';
  
  skipLink.addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  return skipLink;
};

// Ensure skip links are present
export const ensureSkipLinks = (): void => {
  if (document.querySelector('a[href="#main-content"]')) return;

  const skipLink = createSkipLink('main-content');
  document.body.insertBefore(skipLink, document.body.firstChild);
};

// Live region announcer for screen readers
export class LiveRegionAnnouncer {
  private politeRegion: HTMLDivElement;
  private assertiveRegion: HTMLDivElement;

  constructor() {
    this.politeRegion = this.createLiveRegion('polite');
    this.assertiveRegion = this.createLiveRegion('assertive');
  }

  private createLiveRegion(politeness: 'polite' | 'assertive'): HTMLDivElement {
    const region = document.createElement('div');
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    region.id = `live-region-${politeness}`;
    document.body.appendChild(region);
    return region;
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const region = priority === 'polite' ? this.politeRegion : this.assertiveRegion;
    
    // Clear the region first to ensure the message is announced
    region.textContent = '';
    
    // Set the message after a brief delay
    setTimeout(() => {
      region.textContent = message;
    }, 100);

    // Clear the message after announcement
    setTimeout(() => {
      region.textContent = '';
    }, 1000);
  }

  destroy(): void {
    this.politeRegion.remove();
    this.assertiveRegion.remove();
  }
}

// Global live region announcer instance
let globalAnnouncer: LiveRegionAnnouncer | null = null;

export const announce = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  if (!globalAnnouncer) {
    globalAnnouncer = new LiveRegionAnnouncer();
  }
  globalAnnouncer.announce(message, priority);
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Check if user prefers high contrast
export const prefersHighContrast = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

// Manage focus restoration for route changes
export class RouteAccessibilityManager {
  private previousElement: HTMLElement | null = null;

  onRouteChange(newRoute: string): void {
    // Store current focused element
    this.previousElement = document.activeElement as HTMLElement;

    // Focus management for new route
    setTimeout(() => {
      // First try to focus the main heading
      const mainHeading = document.querySelector('h1');
      if (mainHeading && mainHeading instanceof HTMLElement) {
        mainHeading.setAttribute('tabindex', '-1');
        mainHeading.focus();
        return;
      }

      // Fallback to main content area
      const mainContent = document.querySelector('main, [role="main"], #main-content');
      if (mainContent && mainContent instanceof HTMLElement) {
        mainContent.setAttribute('tabindex', '-1');
        mainContent.focus();
        return;
      }

      // Last resort - focus first focusable element
      focusFirstElement(document.body);
    }, 100);

    // Announce route change
    const routeName = this.getRouteDisplayName(newRoute);
    announce(`Navigated to ${routeName}`, 'polite');
  }

  private getRouteDisplayName(route: string): string {
    const routeNames: Record<string, string> = {
      '/': 'Home',
      '/dashboard': 'Dashboard',
      '/subscriptions': 'Subscriptions',
      '/planning': 'Planning',
      '/intelligence': 'Intelligence',
    };

    return routeNames[route] || 'Page';
  }

  restorePreviousFocus(): void {
    if (this.previousElement && isElementVisible(this.previousElement)) {
      this.previousElement.focus();
    }
  }
}

// Error boundary for accessibility-related errors
export const handleAccessibilityError = (error: Error, componentName: string): void => {
  console.error(`Accessibility error in ${componentName}:`, error);
  announce(`An error occurred in ${componentName}. Please refresh the page if the problem persists.`, 'assertive');
};

// Initialize accessibility features
export const initializeAccessibility = (): void => {
  // Ensure skip links
  ensureSkipLinks();

  // Initialize global announcer
  if (!globalAnnouncer) {
    globalAnnouncer = new LiveRegionAnnouncer();
  }

  // Add keyboard navigation indicators
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('user-is-tabbing');
  });

  // Add focus visible polyfill styles
  const style = document.createElement('style');
  style.textContent = `
    .user-is-tabbing *:focus {
      outline: 3px solid #4f46e5 !important;
      outline-offset: 2px !important;
    }
    
    .user-is-tabbing *:focus:not(:focus-visible) {
      outline: none !important;
    }
  `;
  document.head.appendChild(style);
};
