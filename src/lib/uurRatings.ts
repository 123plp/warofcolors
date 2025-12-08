// UUR Package Ratings & Reviews System
// Stores ratings locally in localStorage

export interface PackageRating {
  packageId: string;
  rating: number; // 1-5 stars
  review?: string;
  timestamp: string;
  userId?: string;
}

const UUR_RATINGS_KEY = 'urbanshade_uur_ratings';

export const getRatings = (): PackageRating[] => {
  try {
    const stored = localStorage.getItem(UUR_RATINGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const getPackageRatings = (packageId: string): PackageRating[] => {
  return getRatings().filter(r => r.packageId === packageId);
};

export const getAverageRating = (packageId: string): number => {
  const ratings = getPackageRatings(packageId);
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
};

export const addRating = (packageId: string, rating: number, review?: string): boolean => {
  try {
    const ratings = getRatings();
    
    // Check if user already rated (using a simple check - can only rate once per package)
    const existingIndex = ratings.findIndex(r => r.packageId === packageId);
    
    const newRating: PackageRating = {
      packageId,
      rating: Math.min(5, Math.max(1, rating)),
      review,
      timestamp: new Date().toISOString()
    };
    
    if (existingIndex !== -1) {
      // Update existing rating
      ratings[existingIndex] = newRating;
    } else {
      ratings.push(newRating);
    }
    
    localStorage.setItem(UUR_RATINGS_KEY, JSON.stringify(ratings));
    return true;
  } catch {
    return false;
  }
};

export const getUserRating = (packageId: string): PackageRating | null => {
  const ratings = getPackageRatings(packageId);
  return ratings[0] || null;
};

// Featured packages - curated list with scoring
export interface FeaturedPackage {
  id: string;
  reason: 'trending' | 'staff_pick' | 'new' | 'popular';
  addedAt: string;
}

const FEATURED_PACKAGES: FeaturedPackage[] = [
  { id: 'hello-world', reason: 'staff_pick', addedAt: new Date().toISOString() },
  { id: 'system-info', reason: 'popular', addedAt: new Date().toISOString() },
];

export const getFeaturedPackages = (): FeaturedPackage[] => {
  try {
    const custom = localStorage.getItem('urbanshade_uur_featured');
    if (custom) return JSON.parse(custom);
  } catch {}
  return FEATURED_PACKAGES;
};

export const addFeaturedPackage = (id: string, reason: FeaturedPackage['reason']): boolean => {
  try {
    const featured = getFeaturedPackages();
    if (!featured.find(f => f.id === id)) {
      featured.push({ id, reason, addedAt: new Date().toISOString() });
      localStorage.setItem('urbanshade_uur_featured', JSON.stringify(featured));
    }
    return true;
  } catch {
    return false;
  }
};

export const removeFeaturedPackage = (id: string): boolean => {
  try {
    const featured = getFeaturedPackages().filter(f => f.id !== id);
    localStorage.setItem('urbanshade_uur_featured', JSON.stringify(featured));
    return true;
  } catch {
    return false;
  }
};
