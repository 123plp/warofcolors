// UrbanShade OS v3.1 - Achievements System

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'onboarding' | 'social' | 'contribution' | 'longevity' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  hidden?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Onboarding
  {
    id: 'first_login',
    name: 'First Boot',
    description: 'Successfully logged into UrbanShade OS',
    icon: '🖥️',
    category: 'onboarding',
    rarity: 'common',
    points: 10,
  },
  {
    id: 'profile_complete',
    name: 'Identity Established',
    description: 'Complete your user profile with a bio',
    icon: '👤',
    category: 'onboarding',
    rarity: 'common',
    points: 15,
  },
  {
    id: 'first_message',
    name: 'First Transmission',
    description: 'Send your first direct message',
    icon: '📨',
    category: 'onboarding',
    rarity: 'common',
    points: 10,
  },
  {
    id: 'first_chat',
    name: 'Hello World',
    description: 'Send your first global chat message',
    icon: '💬',
    category: 'onboarding',
    rarity: 'common',
    points: 10,
  },

  // Social
  {
    id: 'chat_10',
    name: 'Chatterbox',
    description: 'Send 10 global chat messages',
    icon: '🗣️',
    category: 'social',
    rarity: 'common',
    points: 20,
  },
  {
    id: 'chat_50',
    name: 'Communicator',
    description: 'Send 50 global chat messages',
    icon: '📢',
    category: 'social',
    rarity: 'uncommon',
    points: 35,
  },
  {
    id: 'chat_100',
    name: 'Social Butterfly',
    description: 'Send 100 global chat messages',
    icon: '🦋',
    category: 'social',
    rarity: 'rare',
    points: 50,
  },
  {
    id: 'chat_500',
    name: 'Voice of the Deep',
    description: 'Send 500 global chat messages',
    icon: '🔊',
    category: 'social',
    rarity: 'epic',
    points: 100,
  },
  {
    id: 'friend_1',
    name: 'Connection Made',
    description: 'Add your first friend',
    icon: '🤝',
    category: 'social',
    rarity: 'common',
    points: 15,
  },
  {
    id: 'friend_5',
    name: 'Networked',
    description: 'Add 5 friends',
    icon: '🔗',
    category: 'social',
    rarity: 'uncommon',
    points: 30,
  },
  {
    id: 'friend_20',
    name: 'Popular',
    description: 'Add 20 friends',
    icon: '⭐',
    category: 'social',
    rarity: 'rare',
    points: 60,
  },

  // Contribution
  {
    id: 'uur_submit',
    name: 'Package Creator',
    description: 'Submit a UUR package for review',
    icon: '📦',
    category: 'contribution',
    rarity: 'uncommon',
    points: 25,
  },
  {
    id: 'uur_approved',
    name: 'Verified Contributor',
    description: 'Have a UUR package approved',
    icon: '✅',
    category: 'contribution',
    rarity: 'rare',
    points: 75,
  },
  {
    id: 'bug_report',
    name: 'Bug Hunter',
    description: 'Submit a bug report that gets resolved',
    icon: '🐛',
    category: 'contribution',
    rarity: 'uncommon',
    points: 30,
  },
  {
    id: 'helper',
    name: 'Community Helper',
    description: 'Recognized for helping the community',
    icon: '🎗️',
    category: 'contribution',
    rarity: 'rare',
    points: 50,
  },

  // Longevity
  {
    id: 'week_active',
    name: 'Weekly Operator',
    description: 'Active member for 7 days',
    icon: '📅',
    category: 'longevity',
    rarity: 'common',
    points: 20,
  },
  {
    id: 'month_active',
    name: 'Veteran',
    description: 'Active member for 30 days',
    icon: '🎖️',
    category: 'longevity',
    rarity: 'uncommon',
    points: 40,
  },
  {
    id: 'quarter_active',
    name: 'Seasoned Operator',
    description: 'Active member for 90 days',
    icon: '🏅',
    category: 'longevity',
    rarity: 'rare',
    points: 75,
  },
  {
    id: 'year_active',
    name: 'Legacy',
    description: 'Active member for 1 year',
    icon: '🏆',
    category: 'longevity',
    rarity: 'epic',
    points: 150,
  },

  // Special (Admin-granted)
  {
    id: 'beta_tester',
    name: 'Beta Tester',
    description: 'Participated in beta testing',
    icon: '🧪',
    category: 'special',
    rarity: 'rare',
    points: 50,
  },
  {
    id: 'founding_member',
    name: 'Founding Member',
    description: 'Early adopter of UrbanShade OS',
    icon: '🌟',
    category: 'special',
    rarity: 'legendary',
    points: 200,
  },
  {
    id: 'vip',
    name: 'VIP Access',
    description: 'Granted VIP status',
    icon: '👑',
    category: 'special',
    rarity: 'epic',
    points: 100,
  },
  {
    id: 'staff_member',
    name: 'Staff Member',
    description: 'Part of the UrbanShade team',
    icon: '🛡️',
    category: 'special',
    rarity: 'legendary',
    points: 0,
    hidden: true,
  },
];

export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(a => a.id === id);
};

export const getAchievementsByCategory = (category: Achievement['category']): Achievement[] => {
  return ACHIEVEMENTS.filter(a => a.category === category);
};

export const getRarityColor = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common': return 'text-muted-foreground';
    case 'uncommon': return 'text-green-400';
    case 'rare': return 'text-blue-400';
    case 'epic': return 'text-purple-400';
    case 'legendary': return 'text-yellow-400';
    default: return 'text-muted-foreground';
  }
};

export const getRarityBgColor = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common': return 'bg-muted/50';
    case 'uncommon': return 'bg-green-500/10 border-green-500/30';
    case 'rare': return 'bg-blue-500/10 border-blue-500/30';
    case 'epic': return 'bg-purple-500/10 border-purple-500/30';
    case 'legendary': return 'bg-yellow-500/10 border-yellow-500/30';
    default: return 'bg-muted/50';
  }
};

export const calculateTotalPoints = (unlockedIds: string[]): number => {
  return unlockedIds.reduce((total, id) => {
    const achievement = getAchievementById(id);
    return total + (achievement?.points || 0);
  }, 0);
};
