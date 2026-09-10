import { UserInteraction, AgeGroup, Sex, ActivityLevel, FoodStyle, MainGoal, EnergyGoal, BudgetTier } from '../types';
import { ADMIN_CONFIG } from '../config/adminConfig';

declare global {
  interface Window {
    google?: any;
  }
}

const STORAGE_KEY_TOKEN = 'nourish_google_sheets_access_token';
const STORAGE_KEY_TOKEN_EXPIRY = 'nourish_google_sheets_token_expiry';
const STORAGE_KEY_SHEET_INFO = 'nourish_connected_google_sheet_info';
const STORAGE_KEY_USER_EMAIL = 'nourish_connected_google_email';

export interface ConnectedSheetInfo {
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetTitle: string;
  userEmail?: string;
  lastSyncedAt?: string;
}

const DEFAULT_HEADERS = [
  'Timestamp',
  'Source / Platform',
  'Athlete Name',
  'Contact Info',
  'Personal Goals / Notes',
  'Age Group',
  'Exact Age',
  'Sex',
  'Height (cm)',
  'Weight (kg)',
  'Activity Level',
  'Dietary Style',
  'Main Goal',
  'Energy Goal',
  'Daily Budget',
  'Target Calories (kcal)',
  'Protein Target (g)',
];

/**
 * Get active stored Google Access Token if not expired
 */
export function getStoredGoogleToken(): string | null {
  try {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const expiry = localStorage.getItem(STORAGE_KEY_TOKEN_EXPIRY);
    if (token && expiry) {
      if (Date.now() < parseInt(expiry, 10)) {
        return token;
      }
    }
  } catch (err) {
    console.error('Failed reading stored token:', err);
  }
  return null;
}

/**
 * Store Google Access Token with expiration
 */
export function saveGoogleToken(token: string, expiresInSeconds = 3500, userEmail?: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    localStorage.setItem(STORAGE_KEY_TOKEN_EXPIRY, (Date.now() + expiresInSeconds * 1000).toString());
    if (userEmail) {
      localStorage.setItem(STORAGE_KEY_USER_EMAIL, userEmail);
    }
  } catch (err) {
    console.error('Failed storing token:', err);
  }
}

/**
 * Disconnect Google Sheets session
 */
export function disconnectGoogleSheets(): void {
  try {
    const token = getStoredGoogleToken();
    if (token && window.google?.accounts?.oauth2?.revoke) {
      window.google.accounts.oauth2.revoke(token, () => {
        console.log('Google token revoked');
      });
    }
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_TOKEN_EXPIRY);
    localStorage.removeItem(STORAGE_KEY_SHEET_INFO);
    localStorage.removeItem(STORAGE_KEY_USER_EMAIL);
  } catch (err) {
    console.error('Error disconnecting Google:', err);
  }
}

/**
 * Get the saved Google Sheet Info
 */
export function getConnectedSheetInfo(): ConnectedSheetInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHEET_INFO);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading sheet info:', err);
  }
  return null;
}

/**
 * Save Google Sheet Info
 */
export function saveConnectedSheetInfo(info: ConnectedSheetInfo | null): void {
  try {
    if (info) {
      localStorage.setItem(STORAGE_KEY_SHEET_INFO, JSON.stringify(info));
    } else {
      localStorage.removeItem(STORAGE_KEY_SHEET_INFO);
    }
  } catch (err) {
    console.error('Failed saving sheet info:', err);
  }
}

/**
 * Request Access Token via Google Identity Services popup
 */
export function requestGoogleAccessToken(customHint?: string): Promise<{ accessToken: string; userEmail: string }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window not available'));
    }

    if (!window.google?.accounts?.oauth2) {
      return reject(
        new Error('Google Identity Services library is not loaded. Check internet connection or refresh.')
      );
    }

    const clientId =
      ((import.meta as any)?.env?.VITE_GOOGLE_CLIENT_ID as string) ||
      ADMIN_CONFIG.GOOGLE.CLIENT_ID;

    const emailHint = customHint || ADMIN_CONFIG.GOOGLE.GMAIL_ID;

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
        hint: emailHint,
        prompt: '',
        callback: (response: any) => {
          if (response.error) {
            console.error('Google OAuth error:', response);
            return reject(new Error(response.error_description || response.error));
          }
          if (response.access_token) {
            const expiresIn = response.expires_in ? parseInt(response.expires_in, 10) : 3500;
            saveGoogleToken(response.access_token, expiresIn, emailHint);
            resolve({ accessToken: response.access_token, userEmail: emailHint });
          } else {
            reject(new Error('No access token returned from Google'));
          }
        },
      });

      client.requestAccessToken();
    } catch (err: any) {
      reject(err);
    }
  });
}

/**
 * Auto-find or create the centralized Google Sheet in the user's Drive
 */
export async function autoConnectOrCreateSheet(
  accessToken: string,
  preferredTitle?: string
): Promise<ConnectedSheetInfo> {
  const sheetTitle = preferredTitle || ADMIN_CONFIG.GOOGLE.DEFAULT_SHEET_TITLE;

  // 1. Search Google Drive for existing spreadsheet
  try {
    const query = encodeURIComponent(`name = '${sheetTitle}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`);
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const existing = searchData.files[0];
        const info: ConnectedSheetInfo = {
          spreadsheetId: existing.id,
          spreadsheetUrl: existing.webViewLink || `https://docs.google.com/spreadsheets/d/${existing.id}/edit`,
          sheetTitle: existing.name,
          userEmail: localStorage.getItem(STORAGE_KEY_USER_EMAIL) || ADMIN_CONFIG.GOOGLE.GMAIL_ID,
          lastSyncedAt: new Date().toLocaleString(),
        };
        saveConnectedSheetInfo(info);
        return info;
      }
    }
  } catch (err) {
    console.warn('Drive search warning, proceeding to create sheet:', err);
  }

  // 2. Not found, create new spreadsheet with stylized headers
  const createPayload = {
    properties: {
      title: sheetTitle,
    },
    sheets: [
      {
        properties: {
          title: 'Submissions',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: DEFAULT_HEADERS.map((h) => ({
                  userEnteredValue: { stringValue: h },
                  userEnteredFormat: {
                    textFormat: { bold: true },
                    backgroundColor: { red: 0.8, green: 1.0, blue: 0.0 }, // #CCFF00 neon accent
                  },
                })),
              },
            ],
          },
        ],
      },
    ],
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Sheet: ${errText}`);
  }

  const createdData = await createRes.json();
  const info: ConnectedSheetInfo = {
    spreadsheetId: createdData.spreadsheetId,
    spreadsheetUrl: createdData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${createdData.spreadsheetId}/edit`,
    sheetTitle: sheetTitle,
    userEmail: localStorage.getItem(STORAGE_KEY_USER_EMAIL) || ADMIN_CONFIG.GOOGLE.GMAIL_ID,
    lastSyncedAt: new Date().toLocaleString(),
  };

  saveConnectedSheetInfo(info);
  return info;
}

/**
 * Append an athlete interaction row to the connected Google Sheet
 */
export async function appendInteractionToGoogleSheet(
  interaction: UserInteraction,
  accessToken?: string,
  sheetId?: string
): Promise<boolean> {
  const token = accessToken || getStoredGoogleToken();
  const info = getConnectedSheetInfo();
  const targetSheetId = sheetId || info?.spreadsheetId;

  if (!token || !targetSheetId) {
    return false;
  }

  const rowValues = [
    interaction.timestamp || new Date().toLocaleString(),
    interaction.source || 'Nourish Pro Web',
    interaction.name || 'Anonymous Athlete',
    interaction.contact || '',
    interaction.notes || '',
    interaction.ageGroup || '',
    interaction.exactAge || '',
    interaction.sex || '',
    interaction.height || '',
    interaction.weight || '',
    interaction.activity || '',
    interaction.foodStyle || '',
    interaction.mainGoal || '',
    interaction.energyGoal || '',
    interaction.budget || '',
    interaction.targetCalories || '',
    interaction.proteinTarget || '',
  ];

  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${targetSheetId}/values/Submissions!A:Q:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      }
    );

    if (!res.ok) {
      // If Submissions sheet name doesn't exist, try appending to default range
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${targetSheetId}/values/A:Q:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [rowValues],
          }),
        }
      );
    }
    return true;
  } catch (err) {
    console.error('Error appending row to Google Sheet:', err);
    return false;
  }
}

/**
 * Read all athlete interactions directly from the connected Google Sheet
 */
export async function fetchInteractionsFromGoogleSheet(
  accessToken?: string,
  sheetId?: string
): Promise<UserInteraction[]> {
  const token = accessToken || getStoredGoogleToken();
  const info = getConnectedSheetInfo();
  const targetSheetId = sheetId || info?.spreadsheetId;

  if (!token || !targetSheetId) {
    throw new Error('Google Sheet is not connected or token expired');
  }

  // Try Submissions sheet first, fallback to Sheet1
  let res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${targetSheetId}/values/Submissions!A2:Q`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${targetSheetId}/values/A2:Q`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to read from Google Sheet: ${errText}`);
  }

  const data = await res.json();
  const rows: any[][] = data.values || [];

  const parsed: UserInteraction[] = rows.map((r, idx) => {
    return {
      id: `gsheet-${idx}-${Date.now()}`,
      timestamp: r[0] || 'Unknown Date',
      source: r[1] || 'Google Sheet',
      name: r[2] || 'Anonymous Athlete',
      contact: r[3] || '',
      notes: r[4] || '',
      ageGroup: (r[5] as AgeGroup) || '18–25',
      exactAge: r[6] || '',
      sex: (r[7] as Sex) || '',
      height: r[8] || '',
      weight: r[9] || '',
      activity: (r[10] as ActivityLevel) || 'Moderate',
      foodStyle: (r[11] as FoodStyle) || 'Vegetarian',
      mainGoal: (r[12] as MainGoal) || 'Muscle & strength support',
      energyGoal: (r[13] as EnergyGoal) || 'Maintenance',
      budget: (r[14] as BudgetTier) || '₹200/day',
      targetCalories: Number(r[15]) || undefined,
      proteinTarget: Number(r[16]) || undefined,
    };
  });

  // Update last synced time
  if (info) {
    info.lastSyncedAt = new Date().toLocaleString();
    saveConnectedSheetInfo(info);
  }

  return parsed;
}
