import { Curriculum } from '../types/school';

export interface ColorToken {
  text: string;
  bg: string;
  border: string;
  dot: string;
  accentBar: string;
  badge: string;
}

/**
 * Curriculum Semantic Colour Tokens:
 * CBSE → blue
 * ICSE → green / emerald
 * IB → violet
 * State Board → orange / coral
 * Cambridge / IGCSE → rose
 */
export const getCurriculumColor = (curriculum?: Curriculum | string | null): ColorToken => {
  if (!curriculum || typeof curriculum !== 'string') {
    return {
      text: 'text-stone-800',
      bg: 'bg-stone-100/90',
      border: 'border-stone-200/90',
      dot: 'bg-stone-500',
      accentBar: 'bg-teal-600',
      badge: 'bg-stone-100/90 text-stone-800 border border-stone-200/80',
    };
  }

  const norm = curriculum.toLowerCase();

  if (norm.includes('cbse')) {
    return {
      text: 'text-blue-900',
      bg: 'bg-blue-50/90',
      border: 'border-blue-200/90',
      dot: 'bg-blue-600',
      accentBar: 'bg-blue-600',
      badge: 'bg-blue-50/90 text-blue-900 border border-blue-200/80',
    };
  }

  if (norm.includes('icse')) {
    return {
      text: 'text-emerald-900',
      bg: 'bg-emerald-50/90',
      border: 'border-emerald-200/90',
      dot: 'bg-emerald-600',
      accentBar: 'bg-emerald-600',
      badge: 'bg-emerald-50/90 text-emerald-900 border border-emerald-200/80',
    };
  }

  if (norm.includes('ib') || norm.includes('international baccalaureate')) {
    return {
      text: 'text-violet-900',
      bg: 'bg-violet-50/90',
      border: 'border-violet-200/90',
      dot: 'bg-violet-600',
      accentBar: 'bg-violet-600',
      badge: 'bg-violet-50/90 text-violet-900 border border-violet-200/80',
    };
  }

  if (norm.includes('cambridge') || norm.includes('igcse')) {
    return {
      text: 'text-rose-900',
      bg: 'bg-rose-50/90',
      border: 'border-rose-200/90',
      dot: 'bg-rose-600',
      accentBar: 'bg-rose-600',
      badge: 'bg-rose-50/90 text-rose-900 border border-rose-200/80',
    };
  }

  if (norm.includes('state')) {
    return {
      text: 'text-amber-900',
      bg: 'bg-amber-50/90',
      border: 'border-amber-200/90',
      dot: 'bg-amber-600',
      accentBar: 'bg-amber-600',
      badge: 'bg-amber-50/90 text-amber-900 border border-amber-200/80',
    };
  }

  // Fallback
  return {
    text: 'text-teal-900',
    bg: 'bg-teal-50/90',
    border: 'border-teal-200/90',
    dot: 'bg-teal-600',
    accentBar: 'bg-teal-600',
    badge: 'bg-teal-50/90 text-teal-900 border border-teal-200/80',
  };
};

/**
 * Facility and Interest Semantic Tokens:
 * Sports → sky blue
 * STEM / Robotics → violet
 * Arts → coral / orange
 * Music → amber
 * Student Support / Wellness → teal
 * Transport / Campus → slate / stone
 */
export const getFacilityCategoryColor = (category?: string | null, name = ''): ColorToken => {
  const normCat = (category || '').toLowerCase();
  const normName = (name || '').toLowerCase();

  // Music check
  if (normName.includes('music') || normCat.includes('music')) {
    return {
      text: 'text-amber-900',
      bg: 'bg-amber-50/80',
      border: 'border-amber-200/80',
      dot: 'bg-amber-500',
      accentBar: 'bg-amber-500',
      badge: 'bg-amber-50/80 text-amber-900 border border-amber-200/80',
    };
  }

  // Arts / Drama / Culture
  if (normCat.includes('art') || normName.includes('drama') || normName.includes('performing') || normName.includes('dance')) {
    return {
      text: 'text-orange-900',
      bg: 'bg-orange-50/80',
      border: 'border-orange-200/80',
      dot: 'bg-orange-500',
      accentBar: 'bg-orange-500',
      badge: 'bg-orange-50/80 text-orange-900 border border-orange-200/80',
    };
  }

  // STEM & Tech / Robotics / Science Lab
  if (normCat.includes('stem') || normCat.includes('tech') || normName.includes('robotic') || normName.includes('lab') || normName.includes('stem')) {
    return {
      text: 'text-violet-900',
      bg: 'bg-violet-50/80',
      border: 'border-violet-200/80',
      dot: 'bg-violet-500',
      accentBar: 'bg-violet-500',
      badge: 'bg-violet-50/80 text-violet-900 border border-violet-200/80',
    };
  }

  // Sports / Swimming / Football / Athletics
  if (normCat.includes('sport') || normName.includes('swim') || normName.includes('turf') || normName.includes('cricket') || normName.includes('athletic')) {
    return {
      text: 'text-sky-900',
      bg: 'bg-sky-50/80',
      border: 'border-sky-200/80',
      dot: 'bg-sky-500',
      accentBar: 'bg-sky-500',
      badge: 'bg-sky-50/80 text-sky-900 border border-sky-200/80',
    };
  }

  // Wellness, Counselling, Special Needs
  if (normCat.includes('wellness') || normCat.includes('care') || normName.includes('counsell') || normName.includes('special')) {
    return {
      text: 'text-teal-900',
      bg: 'bg-teal-50/80',
      border: 'border-teal-200/80',
      dot: 'bg-teal-500',
      accentBar: 'bg-teal-500',
      badge: 'bg-teal-50/80 text-teal-900 border border-teal-200/80',
    };
  }

  // Infrastructure / Transport / Library
  return {
    text: 'text-stone-800',
    bg: 'bg-stone-100/90',
    border: 'border-stone-200/90',
    dot: 'bg-stone-500',
    accentBar: 'bg-stone-500',
    badge: 'bg-stone-100/90 text-stone-800 border border-stone-200/90',
  };
};

/**
 * Pedagogy / Learning Approach Semantic Color Tokens
 * Montessori → sky / indigo
 * Play-way → emerald
 * Reggio Emilia → violet
 * Waldorf / Steiner → amber
 * Activity-based → orange
 * Traditional → slate / stone
 */
export const getPedagogyColor = (pedagogy?: string | null): ColorToken => {
  if (!pedagogy || typeof pedagogy !== 'string') {
    return {
      text: 'text-stone-900',
      bg: 'bg-stone-50/90',
      border: 'border-stone-200/90',
      dot: 'bg-stone-600',
      accentBar: 'bg-stone-600',
      badge: 'bg-stone-50/90 text-stone-900 border border-stone-200/80',
    };
  }

  const norm = pedagogy.toLowerCase();
  if (norm.includes('montessori')) {
    return {
      text: 'text-sky-900',
      bg: 'bg-sky-50/90',
      border: 'border-sky-200/90',
      dot: 'bg-sky-600',
      accentBar: 'bg-sky-600',
      badge: 'bg-sky-50/90 text-sky-900 border border-sky-200/80',
    };
  }
  if (norm.includes('play-way') || norm.includes('playway')) {
    return {
      text: 'text-emerald-900',
      bg: 'bg-emerald-50/90',
      border: 'border-emerald-200/90',
      dot: 'bg-emerald-600',
      accentBar: 'bg-emerald-600',
      badge: 'bg-emerald-50/90 text-emerald-900 border border-emerald-200/80',
    };
  }
  if (norm.includes('reggio')) {
    return {
      text: 'text-violet-900',
      bg: 'bg-violet-50/90',
      border: 'border-violet-200/90',
      dot: 'bg-violet-600',
      accentBar: 'bg-violet-600',
      badge: 'bg-violet-50/90 text-violet-900 border border-violet-200/80',
    };
  }
  if (norm.includes('waldorf')) {
    return {
      text: 'text-amber-900',
      bg: 'bg-amber-50/90',
      border: 'border-amber-200/90',
      dot: 'bg-amber-600',
      accentBar: 'bg-amber-600',
      badge: 'bg-amber-50/90 text-amber-900 border border-amber-200/80',
    };
  }
  if (norm.includes('activity')) {
    return {
      text: 'text-orange-900',
      bg: 'bg-orange-50/90',
      border: 'border-orange-200/90',
      dot: 'bg-orange-600',
      accentBar: 'bg-orange-600',
      badge: 'bg-orange-50/90 text-orange-900 border border-orange-200/80',
    };
  }
  return {
    text: 'text-stone-900',
    bg: 'bg-stone-50/90',
    border: 'border-stone-200/90',
    dot: 'bg-stone-600',
    accentBar: 'bg-stone-600',
    badge: 'bg-stone-50/90 text-stone-900 border border-stone-200/80',
  };
};

/**
 * Match Score Semantic Rings:
 * 90–100 → emerald/teal
 * 75–89 → blue
 * 60–74 → amber
 * below 60 → slate
 */
export const getMatchScoreStyle = (score?: number | null) => {
  const safeScore = typeof score === 'number' && !isNaN(score) ? score : 75;

  if (safeScore >= 90) {
    return {
      tier: 'Strong fit',
      textColor: 'text-teal-900',
      ringColor: 'text-teal-600',
      strokeColor: '#0D9488',
      trackColor: '#CCFBF1',
      bgTint: 'bg-teal-50/60',
      badge: 'text-teal-900 bg-teal-50/80 border-teal-200',
    };
  }
  if (safeScore >= 75) {
    return {
      tier: 'Good match',
      textColor: 'text-blue-900',
      ringColor: 'text-blue-600',
      strokeColor: '#3B82F6',
      trackColor: '#DBEAFE',
      bgTint: 'bg-blue-50/60',
      badge: 'text-blue-900 bg-blue-50/80 border-blue-200',
    };
  }
  if (safeScore >= 60) {
    return {
      tier: 'Moderate fit',
      textColor: 'text-amber-900',
      ringColor: 'text-amber-600',
      strokeColor: '#F59E0B',
      trackColor: '#FEF3C7',
      bgTint: 'bg-amber-50/60',
      badge: 'text-amber-900 bg-amber-50/80 border-amber-200',
    };
  }
  return {
    tier: 'Partial fit',
    textColor: 'text-stone-700',
    ringColor: 'text-stone-500',
    strokeColor: '#78716C',
    trackColor: '#F5F5F4',
    bgTint: 'bg-stone-50/60',
    badge: 'text-stone-700 bg-stone-100 border-stone-200',
  };
};

/**
 * Explore By Area Destination Styles:
 * Each Chennai hub has an architectural or botanical identity and accent palette.
 */
export interface ChennaiAreaHub {
  name: string;
  queryParam: string;
  tagline: string;
  schoolCount: number;
  avgFee: string;
  color: {
    accent: string;
    border: string;
    bgHover: string;
    badge: string;
    iconColor: string;
  };
}

export const CHENNAI_HUBS: ChennaiAreaHub[] = [
  {
    name: 'Anna Nagar & Mogappair',
    queryParam: 'Anna Nagar',
    tagline: 'Historic leafy avenues & established CBSE academies',
    schoolCount: 42,
    avgFee: '₹95,000/yr',
    color: {
      accent: 'emerald',
      border: 'border-emerald-200/80',
      bgHover: 'hover:border-emerald-400 group-hover:bg-emerald-50/30',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconColor: 'text-emerald-700',
    },
  },
  {
    name: 'OMR & Sholinganallur',
    queryParam: 'OMR',
    tagline: 'Expansive tech corridor & Cambridge / IB world campuses',
    schoolCount: 38,
    avgFee: '₹1,35,000/yr',
    color: {
      accent: 'teal',
      border: 'border-teal-200/80',
      bgHover: 'hover:border-teal-400 group-hover:bg-teal-50/30',
      badge: 'bg-teal-50 text-teal-800 border-teal-200',
      iconColor: 'text-teal-700',
    },
  },
  {
    name: 'Adyar & Besant Nagar',
    queryParam: 'Adyar',
    tagline: 'Seaside heritage, Krishnamurti philosophy & academic prestige',
    schoolCount: 29,
    avgFee: '₹1,10,000/yr',
    color: {
      accent: 'rose',
      border: 'border-rose-200/80',
      bgHover: 'hover:border-rose-400 group-hover:bg-rose-50/30',
      badge: 'bg-rose-50 text-rose-800 border-rose-200',
      iconColor: 'text-rose-700',
    },
  },
  {
    name: 'Tambaram & GST Corridor',
    queryParam: 'Tambaram',
    tagline: 'Sprawling green acreage, ICSE bastions & sports academies',
    schoolCount: 34,
    avgFee: '₹88,000/yr',
    color: {
      accent: 'amber',
      border: 'border-amber-200/80',
      bgHover: 'hover:border-amber-400 group-hover:bg-amber-50/30',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      iconColor: 'text-amber-700',
    },
  },
  {
    name: 'Porur & Manapakkam',
    queryParam: 'Porur',
    tagline: 'Rapidly emerging West Chennai education & robotics cluster',
    schoolCount: 26,
    avgFee: '₹1,05,000/yr',
    color: {
      accent: 'violet',
      border: 'border-violet-200/80',
      bgHover: 'hover:border-violet-400 group-hover:bg-violet-50/30',
      badge: 'bg-violet-50 text-violet-800 border-violet-200',
      iconColor: 'text-violet-700',
    },
  },
  {
    name: 'Velachery & Guindy',
    queryParam: 'Velachery',
    tagline: 'Central connectivity, contemporary arts & day-boarding',
    schoolCount: 21,
    avgFee: '₹98,000/yr',
    color: {
      accent: 'orange',
      border: 'border-orange-200/80',
      bgHover: 'hover:border-orange-400 group-hover:bg-orange-50/30',
      badge: 'bg-orange-50 text-orange-800 border-orange-200',
      iconColor: 'text-orange-700',
    },
  },
];
