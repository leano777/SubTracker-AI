// Favicon utility functions for generating service logos

export const generateFavicon = (serviceName: string): string => {
  // Clean the service name for URL safety
  const cleanName = serviceName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Use a simple, reliable favicon service that provides consistent results
  return `https://www.google.com/s2/favicons?domain=${getServiceDomain(serviceName)}&sz=64`;
};

export const getServiceDomain = (serviceName: string): string => {
  const serviceMap: Record<string, string> = {
    'netflix': 'netflix.com',
    'spotify': 'spotify.com',
    'adobe': 'adobe.com',
    'figma': 'figma.com',
    'notion': 'notion.so',
    'chatgpt': 'openai.com',
    'youtube': 'youtube.com',
    'dropbox': 'dropbox.com',
    '1password': '1password.com',
    'linear': 'linear.app',
    'discord': 'discord.com',
    'slack': 'slack.com',
    'github': 'github.com',
    'microsoft': 'microsoft.com',
    'google': 'google.com',
    'amazon': 'amazon.com',
    'apple': 'apple.com',
    'canva': 'canva.com',
    'zoom': 'zoom.us',
    'trello': 'trello.com',
    'asana': 'asana.com',
    'monday': 'monday.com',
    'mailchimp': 'mailchimp.com',
    'hubspot': 'hubspot.com',
    'salesforce': 'salesforce.com',
    'shopify': 'shopify.com',
    'stripe': 'stripe.com',
    'paypal': 'paypal.com',
    'twilio': 'twilio.com',
    'cloudflare': 'cloudflare.com',
    'vercel': 'vercel.com',
    'netlify': 'netlify.com',
    'aws': 'aws.amazon.com',
    'digitalocean': 'digitalocean.com',
    'heroku': 'heroku.com'
  };

  // Find matching service
  const serviceLower = serviceName.toLowerCase();
  for (const [key, domain] of Object.entries(serviceMap)) {
    if (serviceLower.includes(key)) {
      return domain;
    }
  }

  // Fallback: try to extract domain from service name
  const words = serviceLower.split(/\s+/);
  const firstWord = words[0];
  
  // Common patterns
  if (firstWord.endsWith('tv') || firstWord.endsWith('stream')) {
    return `${firstWord}.com`;
  }
  
  return `${firstWord}.com`;
};

export const getFallbackLogo = (serviceName: string): string => {
  // Generate a simple letter-based avatar as fallback
  const firstLetter = serviceName.charAt(0).toUpperCase();
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];
  
  const colorIndex = serviceName.charCodeAt(0) % colors.length;
  const color = colors[colorIndex];
  
  // Return a data URL for a simple colored circle with letter
  const svg = `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="${color}"/>
      <text x="32" y="40" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">${firstLetter}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const getServiceLogo = (serviceName: string, fallbackToGenerated: boolean = true): string => {
  if (!serviceName) return getFallbackLogo('Unknown');
  
  // Try to get favicon first
  const favicon = generateFavicon(serviceName);
  
  // Return favicon with fallback
  return fallbackToGenerated ? favicon : getFallbackLogo(serviceName);
};

// Function to get favicon from URL (for SubscriptionForm.tsx compatibility)
export const getFaviconUrl = (url: string): string | null => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // Use Google's favicon service
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch (error) {
    // If URL is invalid, try to extract domain-like string
    const domainMatch = url.match(/([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
    if (domainMatch) {
      return `https://www.google.com/s2/favicons?domain=${domainMatch[1]}&sz=64`;
    }
    
    return null;
  }
};