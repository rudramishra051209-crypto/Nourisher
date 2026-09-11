import { UserInteraction, ExcelServerStatus, ExcelMappedAthlete } from '../types';

const STORAGE_KEY = 'nourish_pro_user_interactions_v1';

// Initial baseline seed so the admin dashboard demonstrates full capability immediately
const INITIAL_SEED_INTERACTIONS: UserInteraction[] = [
  {
    id: 'seed-int-01',
    timestamp: '2026-09-08, 09:30 AM',
    name: 'David Miller',
    contact: 'david.miller@example.com',
    notes: 'Aiming to build lean muscle for university rugby team',
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
    name: 'Emma Watson',
    contact: 'emma.w@example.com',
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
    name: 'Alex Carter',
    contact: 'alex.carter@workmail.com',
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
    console.warn('Local server save failed, stored locally in browser:', err);
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
 * Clear all interactions on the local server
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
    console.warn('Failed to clear on local server:', err);
  }
}

/**
 * Fetch status of the central Excel file stored in the project directory
 */
export async function fetchExcelServerStatus(): Promise<ExcelServerStatus | null> {
  try {
    const res = await fetch('/api/excel/status');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to fetch Excel server status:', err);
  }
  return null;
}

/**
 * Manually force-push current interaction records to the central Excel file in the main code directory
 */
export async function triggerServerExcelPush(
  interactions?: UserInteraction[]
): Promise<{ success: boolean; message: string; totalRecords: number }> {
  try {
    const body = interactions ? { interactions } : {};
    const res = await fetch('/api/excel/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err: any) {
    console.warn('Failed to trigger server Excel push:', err);
    return { success: false, message: err.message || 'Server error', totalRecords: 0 };
  }
  return { success: false, message: 'Server responded with error', totalRecords: 0 };
}

/**
 * Directly download the central Excel file generated on the server
 */
export function downloadServerExcelFile(): void {
  const link = document.createElement('a');
  link.href = '/api/excel/download';
  link.setAttribute('download', 'athlete_nutrition_data.xlsx');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Fetch registered athlete names and profiles live-read from the Excel sheet
 */
export async function fetchLiveExcelAthletes(): Promise<ExcelMappedAthlete[]> {
  try {
    const res = await fetch('/api/athletes/names');
    if (res.ok) {
      const data = await res.json();
      return data.athletes || [];
    }
  } catch (err) {
    console.warn('Failed to fetch live Excel athletes:', err);
  }
  return [];
}

/**
 * Fetch all raw records live-read and mapped from the Excel sheet
 */
export async function fetchLiveExcelRecords(): Promise<{ fileName: string; total: number; records: any[] } | null> {
  try {
    const res = await fetch('/api/excel/records');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to fetch live Excel records:', err);
  }
  return null;
}
