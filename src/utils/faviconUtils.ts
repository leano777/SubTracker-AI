// Favicon utility functions for generating service logos

export const generateFavicon = (serviceName: string): string => {
  // Temporarily disabled to fix performance issues
  // Use fallback logo instead
  return getFallbackLogo(serviceName);
};

export const getServiceDomain = (serviceName: string): string => {
  const serviceMap: Record<string, string> = {
    netflix: "netflix.com",
    spotify: "spotify.com",
    adobe: "adobe.com",
    figma: "figma.com",
    notion: "notion.so",
    chatgpt: "openai.com",
    youtube: "youtube.com",
    dropbox: "dropbox.com",
    "1password": "1password.com",
    linear: "linear.app",
    discord: "discord.com",
    slack: "slack.com",
    github: "github.com",
    microsoft: "microsoft.com",
    google: "google.com",
    amazon: "amazon.com",
    apple: "apple.com",
    canva: "canva.com",
    zoom: "zoom.us",
    trello: "trello.com",
    asana: "asana.com",
    monday: "monday.com",
    mailchimp: "mailchimp.com",
    hubspot: "hubspot.com",
    salesforce: "salesforce.com",
    shopify: "shopify.com",
    stripe: "stripe.com",
    paypal: "paypal.com",
    twilio: "twilio.com",
    cloudflare: "cloudflare.com",
    vercel: "vercel.com",
    netlify: "netlify.com",
    aws: "aws.amazon.com",
    digitalocean: "digitalocean.com",
    heroku: "heroku.com",
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
  if (firstWord.endsWith("tv") || firstWord.endsWith("stream")) {
    return `${firstWord}.com`;
  }

  return `${firstWord}.com`;
};

export const getFallbackLogo = (serviceName: string): string => {
  // Return empty string to disable logo loading temporarily
  // This will prevent the performance issues with base64 images
  return '';
};

export const getServiceLogo = (
  serviceName: string,
  fallbackToGenerated: boolean = true
): string => {
  if (!serviceName) return getFallbackLogo("Unknown");

  // Try to get favicon first
  const favicon = generateFavicon(serviceName);

  // Return favicon with fallback
  return fallbackToGenerated ? favicon : getFallbackLogo(serviceName);
};

// Function to get favicon from URL (for SubscriptionForm.tsx compatibility)
export const getFaviconUrl = (url: string): string | null => {
  if (!url) return null;

  try {
    // Temporarily disabled to fix performance issues
    // Extract service name from URL and use fallback
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    const serviceName = domain.split('.')[0];
    return getFallbackLogo(serviceName);
  } catch (error) {
    // If URL is invalid, try to extract domain-like string
    const domainMatch = url.match(/([a-zA-Z0-9-]+)/);
    if (domainMatch) {
      return getFallbackLogo(domainMatch[1]);
    }

    return getFallbackLogo('Unknown');
  }
};
