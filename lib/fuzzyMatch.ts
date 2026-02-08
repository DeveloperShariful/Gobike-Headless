// lib/fuzzyMatch.ts

export const getLevenshteinDistance = (a: string, b: string): number => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
    }
  }
  return matrix[b.length][a.length];
};

const VALID_PATHS = [
  '/about', '/bikes', '/blog', '/contact', '/faq', '/privacy-policy', '/products', '/refund-and-returns-policy', '/spare-parts', '/terms-and-conditions',
  '/product/heavy-duty-kenda-inner-tube-for-gobike-24-inch-bike-tyre',
  '/product/original-kenda-24x2-60-high-performance-tyre-for-gobike-24-electric-bike-all-terrain-grip',
  '/product/genuine-kenda-20-inch-heavy-duty-inner-tube-for-gobike-20-inch-bike-schrader-valve',
  '/product/original-kenda-20x2-60-off-road-tyre-for-gobike-20-electric-bike-premium-high-grip-rubber',
  '/product/16-inch-heavy-duty-inner-tube-for-electric-balance-bikes-for-easy-inflation',
  '/product/premium-16-inch-heavy-duty-off-road-replacement-tyre-for-gobike-kids-electric-bike',
  '/product/heavy-duty-12-inch-inner-tube-12x2-40-for-gobike-kids-electric-balance-bike-schrader-valve',
  '/product/premium-12-inch-off-road-replacement-tyre-for-gobike-kids-electric-balance-bike-high-grip-durable',
  '/product/official-48v-15ah-high-performance-battery-for-gobike-24inch-pro',
  '/product/official-replacement-charger-for-gobike-electric-balance-bikes',
  '/product/replacement-twist-throttle-with-lcd-display-for-gobike-16-20',
  '/product/gobike-crew-t-shirt-premium-kids-riding-apparel',
  '/product/gobike-24-inch-electric-bike-teens-high-speed-performance-for-ages-13',
  '/product/20-inch-motot',
  '/product/official-high-capacity-10ah-replacement-battery-for-gobike-20-inch',
  '/product/12-motor', '/product/16inch-hub-motor-2', '/product/12inch-controller-2', '/product/16inch-controller-2', '/product/20inch-controller-2', '/product/12inch-and-16inch-plastic-kit-2', '/product/20inch-plastic-kit-2',
  '/product/official-5ah-replacement-battery-for-gobike-12-and-16-inch',
  '/product/gobike-12inch-electric-balance-bike-ages-2-5',
  '/product/ebike-for-kids-12-inch-electric-bike-ages-2-5',
  '/product/ebike-for-sale-16-inch-gobike-ages-5-9',
  '/product/20-inch-electric-bikes-for-sale-ebike-for-kids',
  '/blog/benefits-of-outdoor-play', '/blog/ebike-battery-care-tips', '/blog/essential-safety-gear-for-kids', '/blog/family-adventure-ideas-with-gobike', '/blog/gobike-maintenance-tips', '/blog/my-first-post', '/blog/riding-with-friends-social-benefits', '/blog/top-3-biking-trails-for-families-nsw'
];

export const findClosestMatch = (inputPath: string): string | null => {
  const cleanInput = inputPath.replace(/^\//, '').toLowerCase(); 
  if (cleanInput.length < 1) return null;
  let closestPath = null;
  let minDistance = Infinity;

  if (cleanInput.length < 3) {
    for (const path of VALID_PATHS) {
      const slug = path.split('/').pop()?.toLowerCase() || "";
      if (slug.startsWith(cleanInput)) return path;
    }
  }

  for (const path of VALID_PATHS) {
    const slugOnly = path.split('/').pop()?.toLowerCase() || "";
    if (slugOnly && (slugOnly.includes(cleanInput) || cleanInput.includes(slugOnly.substring(0, 3)))) {
      return path; 
    }
  }

  for (const path of VALID_PATHS) {
    const slugOnly = path.split('/').pop() || "";
    const distance = getLevenshteinDistance(cleanInput, slugOnly);
    if (distance < minDistance && distance <= 4) {
      minDistance = distance;
      closestPath = path;
    }
  }

  return closestPath;
};