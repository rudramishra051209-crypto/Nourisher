import { UserInteraction } from '../types';

const STORAGE_KEY = 'nourish_pro_user_interactions_v1';

// Initial baseline seed so the admin dashboard demonstrates full capability immediately
const INITIAL_SEED_INTERACTIONS: UserInteraction[] = [
  {
    id: 'seed-int-01',
    timestamp: '2026-09-08, 09:30 AM',
    name: 'Aarav Sharma',
    contact: 'aarav.sharma@example.com',
    notes: 'Aiming to build lean muscle for college football team',
    source: 'Nourish Pro Web',
    ageGroup: '18–25',
    exactAge: '21',
    sex: 'Male',
    height: '178',
    weight: '74',
    activity: 'High',
    foodStyle: 'Vegetarian',
    mainGoal: 'Muscle & strength support',
    energyGoal: 'Muscle-building surplus',
    budget: '₹200/day',
    targetCalories: 2850,
    proteinTarget: 148,
  },
  {
    id: 'seed-int-02',
    timestamp: '2026-09-09, 02:15 PM',
    name: 'Priya Nair',
    contact: '+91 98765 43210',
    notes: 'Preparing for half marathon while maintaining fat loss',
    source: 'Google Form Webhook',
    ageGroup: '26–40',
    exactAge: '29',
    sex: 'Female',
    height: '164',
    weight: '60',
    activity: 'Moderate',
    foodStyle: 'Eggetarian',
    mainGoal: 'More daily energy',
    energyGoal: 'Fat-loss deficit',
    budget: '₹350/day',
    targetCalories: 1820,
    proteinTarget: 110,
  },
  {
    id: 'seed-int-03',
    timestamp: '2026-09-10, 08:45 AM',
    name: 'Kabir Patel',
    contact: 'kabir.patel@workmail.com',
    notes: 'Desk worker wanting sustained focus without energy slumps',
    source: 'External Form Fill',
    ageGroup: '26–40',
    exactAge: '34',
    sex: 'Male',
    height: '172',
    weight: '80',
    activity: 'Light',
    foodStyle: 'Jain',
    mainGoal: 'Study-day nutrition',
    energyGoal: 'Recomposition',
    budget: 'Under ₹100/day',
    targetCalories: 2100,
    proteinTarget: 130,
  },
];

/**
 * Get fallback or locally cached interactions
 */
export function getLocalCachedInteractions(): UserInteraction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_INTERACTIONS));
      return INITIAL_SEED_INTERACTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to read local interactions cache:', err);
  }
  return INITIAL_SEED_INTERACTIONS;
}

/**
 * Fetch centralized interactions directly from the server API
 * Ensures any submissions from any device, external website, or Google Form are loaded
 */
export async function fetchCentralizedInteractions(): Promise<{
  interactions: UserInteraction[];
  isServerConnected: boolean;
}> {
  try {
    const res = await fetch('/api/interactions', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.interactions)) {
        // Update local cache as well
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.interactions));
        } catch {
          // ignore cache quota issues
        }
        return { interactions: data.interactions, isServerConnected: true };
      }
    }
  } catch (err) {
    console.warn('Centralized server unreachable, using local fallback:', err);
  }

  return { interactions: getLocalCachedInteractions(), isServerConnected: false };
}

/**
 * Save an interaction centrally on the server and update local cache
 */
export async function saveInteraction(
  interaction: Omit<UserInteraction, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
): Promise<UserInteraction> {
  const newRecord: UserInteraction = {
    id: interaction.id || `int-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp:
      interaction.timestamp ||
      new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    name: interaction.name.trim() || 'Anonymous Athlete',
    contact: interaction.contact?.trim() || '',
    notes: interaction.notes?.trim() || '',
    source: interaction.source || 'Nourish Pro Web',
    ageGroup: interaction.ageGroup,
    exactAge: interaction.exactAge,
    sex: interaction.sex,
    height: interaction.height,
    weight: interaction.weight,
    activity: interaction.activity,
    foodStyle: interaction.foodStyle,
    mainGoal: interaction.mainGoal,
    energyGoal: interaction.energyGoal,
    budget: interaction.budget,
    targetCalories: interaction.targetCalories,
    proteinTarget: interaction.proteinTarget,
  };

  // 1. Immediately cache locally
  try {
    const local = getLocalCachedInteractions();
    const updated = [newRecord, ...local.filter((x) => x.id !== newRecord.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  // 2. Central server submission
  try {
    await fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
    });
  } catch (err) {
    console.warn('Central server save failed, stored locally:', err);
  }

  return newRecord;
}

/**
 * Delete single interaction on the central server and update local cache
 */
export async function deleteInteractionById(id: string): Promise<void> {
  // Update local
  try {
    const local = getLocalCachedInteractions();
    const updated = local.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  // Delete on server
  try {
    await fetch(`/api/interactions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Failed to delete on central server:', err);
  }
}

/**
 * Clear all interactions on the central server
 */
export async function clearAllInteractions(): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch {
    // ignore
  }

  try {
    await fetch('/api/interactions', {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Failed to clear on central server:', err);
  }
}

/**
 * Trigger sync with a Google Sheet CSV
 */
export async function syncGoogleSheetUrl(sheetUrl: string): Promise<{
  success: boolean;
  message: string;
  addedCount?: number;
  total?: number;
}> {
  const res = await fetch('/api/sync-google-sheet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheetUrl }),
  });
  return res.json();
}
