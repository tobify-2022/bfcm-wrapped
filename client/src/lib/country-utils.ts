/**
 * Country utilities for displaying country flags and names
 */

const COUNTRY_FLAGS: Record<string, string> = {
  'US': '🇺🇸',
  'United States': '🇺🇸',
  'UK': '🇬🇧',
  'United Kingdom': '🇬🇧',
  'GB': '🇬🇧',
  'AU': '🇦🇺',
  'Australia': '🇦🇺',
  'CA': '🇨🇦',
  'Canada': '🇨🇦',
  'DE': '🇩🇪',
  'Germany': '🇩🇪',
  'NZ': '🇳🇿',
  'New Zealand': '🇳🇿',
  'SG': '🇸🇬',
  'Singapore': '🇸🇬',
  'AE': '🇦🇪',
  'United Arab Emirates': '🇦🇪',
  'FR': '🇫🇷',
  'France': '🇫🇷',
  'IT': '🇮🇹',
  'Italy': '🇮🇹',
  'ES': '🇪🇸',
  'Spain': '🇪🇸',
  'NL': '🇳🇱',
  'Netherlands': '🇳🇱',
  'JP': '🇯🇵',
  'Japan': '🇯🇵',
  'CN': '🇨🇳',
  'China': '🇨🇳',
  'BR': '🇧🇷',
  'Brazil': '🇧🇷',
  'MX': '🇲🇽',
  'Mexico': '🇲🇽',
  'IN': '🇮🇳',
  'India': '🇮🇳',
};

/**
 * Get country flag emoji from country name or code
 */
export function getCountryFlag(country: string): string {
  // Try exact match first
  if (COUNTRY_FLAGS[country]) {
    return COUNTRY_FLAGS[country];
  }
  
  // Try case-insensitive match
  const upperCountry = country.toUpperCase();
  if (COUNTRY_FLAGS[upperCountry]) {
    return COUNTRY_FLAGS[upperCountry];
  }
  
  // Try finding by partial match
  const found = Object.keys(COUNTRY_FLAGS).find(key => 
    key.toLowerCase().includes(country.toLowerCase()) || 
    country.toLowerCase().includes(key.toLowerCase())
  );
  
  if (found) {
    return COUNTRY_FLAGS[found];
  }
  
  // Default to globe emoji if not found
  return '🌍';
}

/**
 * Format country name for display
 */
export function formatCountryName(country: string): string {
  // Common country name mappings
  const mappings: Record<string, string> = {
    'US': 'United States',
    'UK': 'United Kingdom',
    'GB': 'United Kingdom',
    'AU': 'Australia',
    'CA': 'Canada',
    'DE': 'Germany',
    'NZ': 'New Zealand',
    'SG': 'Singapore',
    'AE': 'United Arab Emirates',
  };
  
  return mappings[country] || country;
}

