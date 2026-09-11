import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import * as XLSX from 'xlsx';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Central Excel Workbook file path in the main code directory / project root
const EXCEL_FILE_NAME = 'athlete_nutrition_data.xlsx';
const EXCEL_FILE_PATH = path.join(process.cwd(), EXCEL_FILE_NAME);

// Data persistence setup in container
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'interactions.json');

// Middleware for parsing JSON and urlencoded form data with generous payload limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Universal Cross-Origin Resource Sharing (CORS)
// Allows ANY external website, Google Forms, or Google Apps Script to POST submissions
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const INITIAL_SEED_INTERACTIONS = [
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

let inMemoryStore: any[] = [...INITIAL_SEED_INTERACTIONS];

const xlsxLib: any = (XLSX as any)?.default || XLSX;
const xlsxUtils: any = xlsxLib?.utils || (XLSX as any)?.utils;

function writeWorkbookToPath(workbook: any, targetPath: string) {
  try {
    const writeFn = xlsxLib.write || (XLSX as any)?.write;
    if (typeof writeFn === 'function') {
      const buffer = writeFn(workbook, { bookType: 'xlsx', type: 'buffer' });
      fs.writeFileSync(targetPath, buffer);
      return;
    }
    const writeFileFn = xlsxLib.writeFile || (XLSX as any)?.writeFile;
    if (typeof writeFileFn === 'function') {
      writeFileFn(workbook, targetPath);
      return;
    }
    throw new Error('No XLSX write or writeFile function found');
  } catch (err) {
    console.error('[Central Excel] Error writing workbook to disk:', err);
    throw err;
  }
}

function readWorkbookFromPath(targetPath: string) {
  const fileBuffer = fs.readFileSync(targetPath);
  const readFn = xlsxLib.read || (XLSX as any)?.read;
  if (typeof readFn === 'function') {
    return readFn(fileBuffer, { type: 'buffer', cellDates: true });
  }
  const readFileFn = xlsxLib.readFile || (XLSX as any)?.readFile;
  if (typeof readFileFn === 'function') {
    return readFileFn(targetPath, { cellDates: true });
  }
  throw new Error('No XLSX read or readFile function found');
}

/**
 * Push all active records to the main Excel workbook directly in process.cwd()
 */
function syncExcelWorkbook() {
  try {
    const workbook = xlsxUtils.book_new();

    // Sheet 1: Master Registry
    const rows = inMemoryStore.map((record, index) => ({
      'S.No': index + 1,
      'Athlete ID': record.id || `ATH-${index + 1}`,
      'Date & Time': record.timestamp || new Date().toLocaleString(),
      'Full Name': record.name || 'Anonymous Athlete',
      'Contact Info': record.contact || 'N/A',
      'Personal Notes & Goals': record.notes || 'None provided',
      'Age Bracket': record.ageGroup || '-',
      'Exact Age': record.exactAge || '-',
      'Sex': record.sex || '-',
      'Height (cm)': record.height || '-',
      'Weight (kg)': record.weight || '-',
      'Activity Level': record.activity || '-',
      'Dietary Preference': record.foodStyle || '-',
      'Primary Goal': record.mainGoal || '-',
      'Caloric Strategy': record.energyGoal || '-',
      'Daily Budget': record.budget || '-',
      'Target Calories (kcal)': record.targetCalories || 0,
      'Protein Target (g)': record.proteinTarget || 0,
      'Submission Source': record.source || 'Nourish Pro Web',
    }));

    const worksheet = xlsxUtils.json_to_sheet(rows);

    // Optimized column widths for Excel
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 22 },
      { wch: 22 },
      { wch: 26 },
      { wch: 38 },
      { wch: 14 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 16 },
      { wch: 18 },
      { wch: 28 },
      { wch: 24 },
      { wch: 16 },
      { wch: 22 },
      { wch: 18 },
      { wch: 22 },
    ];

    xlsxUtils.book_append_sheet(workbook, worksheet, 'Athlete Submissions');

    // Sheet 2: Server Summary & Metadata
    const totalCount = inMemoryStore.length;
    const validCals = inMemoryStore.filter((r) => r.targetCalories && r.targetCalories > 0);
    const avgCal = validCals.length > 0 ? Math.round(validCals.reduce((sum, r) => sum + r.targetCalories, 0) / validCals.length) : 0;
    const validPro = inMemoryStore.filter((r) => r.proteinTarget && r.proteinTarget > 0);
    const avgPro = validPro.length > 0 ? Math.round(validPro.reduce((sum, r) => sum + r.proteinTarget, 0) / validPro.length) : 0;

    const summaryData = [
      { 'Server Parameter': 'Total Athlete Submissions Logged', 'Value': totalCount },
      { 'Server Parameter': 'Average Calorie Target (kcal)', 'Value': avgCal ? `${avgCal} kcal` : 'N/A' },
      { 'Server Parameter': 'Average Protein Target (g)', 'Value': avgPro ? `${avgPro} g` : 'N/A' },
      { 'Server Parameter': 'Central Excel File Location', 'Value': EXCEL_FILE_PATH },
      { 'Server Parameter': 'Relative Directory File', 'Value': `./${EXCEL_FILE_NAME}` },
      { 'Server Parameter': 'Local Server Host Port', 'Value': PORT },
      { 'Server Parameter': 'Last Synced Timestamp', 'Value': new Date().toISOString() },
      { 'Server Parameter': 'Format & Compatibility', 'Value': 'Microsoft Excel 2007+ (.xlsx)' },
    ];

    const summarySheet = xlsxUtils.json_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 35 }, { wch: 55 }];
    xlsxUtils.book_append_sheet(workbook, summarySheet, 'Server Summary & Stats');

    writeWorkbookToPath(workbook, EXCEL_FILE_PATH);
  } catch (err) {
    console.error('[Central Excel] Error writing workbook to directory:', err);
  }
}

/**
 * Live read & parse all records and names directly from the Excel workbook file on disk.
 */
function readExcelWorkbook(): any[] {
  try {
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      syncExcelWorkbook();
      return inMemoryStore;
    }

    const workbook = readWorkbookFromPath(EXCEL_FILE_PATH);
    // Use 'Athlete Submissions' sheet if available, or first sheet
    const sheetName = workbook.SheetNames.includes('Athlete Submissions')
      ? 'Athlete Submissions'
      : workbook.SheetNames[0];

    if (!sheetName) return inMemoryStore;

    const worksheet = workbook.Sheets[sheetName];
    const rawRows: any[] = xlsxUtils.sheet_to_json(worksheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return [];
    }

    const mappedRecords = rawRows.map((row: any, index: number) => {
      const name =
        row['Full Name'] ||
        row['Name'] ||
        row['Athlete Name'] ||
        row['name'] ||
        row['Athlete'] ||
        'Anonymous Athlete';

      const id =
        row['Athlete ID'] ||
        row['ID'] ||
        row['id'] ||
        (row['S.No'] ? `ATH-${row['S.No']}` : `excel-ath-${index + 1}`);

      const contact =
        row['Contact Info'] ||
        row['Contact'] ||
        row['Email'] ||
        row['Phone'] ||
        row['contact'] ||
        '';

      const notes =
        row['Personal Notes & Goals'] ||
        row['Notes'] ||
        row['Personal Notes'] ||
        row['notes'] ||
        '';

      const ageGroup =
        row['Age Bracket'] ||
        row['Age Group'] ||
        row['ageGroup'] ||
        '18–25';

      const exactAge = String(
        row['Exact Age'] || row['Age'] || row['exactAge'] || ''
      ).replace(/^-\s*$/, '');

      const sex =
        row['Sex'] || row['Gender'] || row['sex'] || '';

      const height = String(
        row['Height (cm)'] || row['Height'] || row['height'] || ''
      ).replace(/^-\s*$/, '');

      const weight = String(
        row['Weight (kg)'] || row['Weight'] || row['weight'] || ''
      ).replace(/^-\s*$/, '');

      const activity =
        row['Activity Level'] || row['Activity'] || row['activity'] || 'Moderate';

      const foodStyle =
        row['Dietary Preference'] ||
        row['Dietary Style'] ||
        row['Food Style'] ||
        row['foodStyle'] ||
        'Vegetarian';

      const mainGoal =
        row['Primary Goal'] ||
        row['Main Goal'] ||
        row['Goal'] ||
        row['mainGoal'] ||
        'Muscle & strength support';

      const energyGoal =
        row['Caloric Strategy'] ||
        row['Energy Goal'] ||
        row['energyGoal'] ||
        'Maintenance';

      const budget =
        row['Daily Budget'] || row['Budget'] || row['budget'] || '₹200/day';

      const targetCalories =
        Number(
          row['Target Calories (kcal)'] ||
            row['Target Calories'] ||
            row['Calories'] ||
            row['targetCalories'] ||
            0
        ) || undefined;

      const proteinTarget =
        Number(
          row['Protein Target (g)'] ||
            row['Protein Target'] ||
            row['Protein'] ||
            row['proteinTarget'] ||
            0
        ) || undefined;

      const source =
        row['Submission Source'] || row['Source'] || row['source'] || 'Central Excel Sheet';

      const timestamp =
        row['Date & Time'] ||
        row['Timestamp'] ||
        row['timestamp'] ||
        new Date().toLocaleString();

      return {
        id: String(id),
        excelRow: index + 2, // 1-indexed Excel row (row 1 is headers)
        name: String(name).trim(),
        contact: String(contact).trim(),
        notes: String(notes).trim(),
        ageGroup: String(ageGroup).trim(),
        exactAge: String(exactAge).trim(),
        sex: String(sex).trim(),
        height: String(height).trim(),
        weight: String(weight).trim(),
        activity: String(activity).trim(),
        foodStyle: String(foodStyle).trim(),
        mainGoal: String(mainGoal).trim(),
        energyGoal: String(energyGoal).trim(),
        budget: String(budget).trim(),
        targetCalories,
        proteinTarget,
        source: String(source).trim(),
        timestamp: String(timestamp).trim(),
      };
    });

    inMemoryStore = mappedRecords;
    return mappedRecords;
  } catch (err) {
    console.error('[Central Excel] Error reading/parsing Excel workbook live from disk:', err);
    return inMemoryStore;
  }
}

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_SEED_INTERACTIONS, null, 2), 'utf-8');
    } else {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryStore = parsed;
      }
    }
  } catch (err) {
    console.warn('Filesystem init warning, falling back to in-memory store:', err);
  }

  // Ensure Excel workbook is created immediately in main directory
  syncExcelWorkbook();
}

ensureDataFile();

function persistInteractions() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(inMemoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to write interactions to disk, held in memory:', err);
  }

  // Immediately push updated data to central Excel file in main directory
  syncExcelWorkbook();
}

// ---------------- API ROUTES FIRST ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    recordsCount: inMemoryStore.length,
    excelFile: EXCEL_FILE_NAME,
    excelExists: fs.existsSync(EXCEL_FILE_PATH),
  });
});

// Central Excel Status Endpoint
app.get('/api/excel/status', (req, res) => {
  const exists = fs.existsSync(EXCEL_FILE_PATH);
  let fileSizeBytes = 0;
  let lastModified = undefined;

  if (exists) {
    try {
      const stat = fs.statSync(EXCEL_FILE_PATH);
      fileSizeBytes = stat.size;
      lastModified = stat.mtime.toISOString();
    } catch {}
  }

  res.json({
    fileName: EXCEL_FILE_NAME,
    filePath: EXCEL_FILE_PATH,
    relativeCodePath: `./${EXCEL_FILE_NAME}`,
    exists,
    totalRecords: inMemoryStore.length,
    fileSizeBytes,
    lastModified,
    downloadUrl: '/api/excel/download',
  });
});

// Direct Download Central Excel File Endpoint
app.get('/api/excel/download', (req, res) => {
  // Ensure fresh sync before download
  syncExcelWorkbook();

  if (!fs.existsSync(EXCEL_FILE_PATH)) {
    return res.status(404).json({ error: 'Excel file not found on server' });
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${EXCEL_FILE_NAME}"`);
  res.sendFile(EXCEL_FILE_PATH);
});

// Manual Force Sync / Push to Excel Endpoint
app.post('/api/excel/push', (req, res) => {
  try {
    if (req.body && Array.isArray(req.body.interactions)) {
      inMemoryStore = req.body.interactions;
    }
    persistInteractions();
    res.json({
      success: true,
      message: `Pushed ${inMemoryStore.length} records to central Excel workbook in main directory`,
      filePath: EXCEL_FILE_PATH,
      fileName: EXCEL_FILE_NAME,
      totalRecords: inMemoryStore.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Local IP and network server info
app.get('/api/server-info', (req, res) => {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  res.json({
    port: PORT,
    localIps: addresses.length > 0 ? addresses : ['127.0.0.1'],
    primaryUrl: addresses.length > 0 ? `http://${addresses[0]}:${PORT}` : `http://localhost:${PORT}`,
    excelFile: EXCEL_FILE_NAME,
    isLocal: true,
  });
});

// Centralized GET: retrieve all interactions live-read and mapped from the Excel sheet
app.get('/api/interactions', (req, res) => {
  const liveExcelRecords = readExcelWorkbook();
  res.json({
    success: true,
    total: liveExcelRecords.length,
    interactions: liveExcelRecords,
    mappedFromExcel: true,
    excelFile: EXCEL_FILE_NAME,
    serverTime: new Date().toISOString(),
  });
});

// Dedicated endpoint: Live-mapped athlete records directly from the Excel sheet
app.get('/api/excel/records', (req, res) => {
  const liveRecords = readExcelWorkbook();
  res.json({
    success: true,
    fileName: EXCEL_FILE_NAME,
    filePath: EXCEL_FILE_PATH,
    total: liveRecords.length,
    records: liveRecords,
  });
});

// Dedicated endpoint: Live-mapped registered athlete names & profile summary from Excel sheet
app.get('/api/athletes/names', (req, res) => {
  const records = readExcelWorkbook();
  const athletes = records
    .map((r, idx) => ({
      rowNumber: r.excelRow || idx + 2,
      id: r.id,
      name: r.name,
      contact: r.contact,
      notes: r.notes,
      ageGroup: r.ageGroup,
      exactAge: r.exactAge,
      sex: r.sex,
      height: r.height,
      weight: r.weight,
      activity: r.activity,
      foodStyle: r.foodStyle,
      mainGoal: r.mainGoal,
      energyGoal: r.energyGoal,
      budget: r.budget,
      targetCalories: r.targetCalories,
      proteinTarget: r.proteinTarget,
      source: r.source,
      timestamp: r.timestamp,
    }))
    .filter((a) => a.name && a.name !== 'Anonymous Athlete');

  res.json({
    success: true,
    excelFile: EXCEL_FILE_NAME,
    total: athletes.length,
    athletes,
  });
});

// Helper to normalize any incoming submission (from this app, any external website, or a webhook)
function normalizePayload(body: any, defaultSource = 'Website Form'): any {
  const name =
    body.name ||
    body.fullName ||
    body['Full Name'] ||
    body['Athlete Name'] ||
    body['Name'] ||
    body.athleteName ||
    body.user ||
    'Anonymous Athlete';

  const contact =
    body.contact ||
    body.email ||
    body.phone ||
    body['Email'] ||
    body['Contact'] ||
    body['Phone Number'] ||
    body['Contact Information'] ||
    '';

  const notes =
    body.notes ||
    body.message ||
    body.goalNotes ||
    body['Notes'] ||
    body['Personal Goals'] ||
    body['Goal / Training Notes'] ||
    body.comments ||
    '';

  const ageGroup =
    body.ageGroup ||
    body['Age Bracket'] ||
    body['Age Group'] ||
    '18–25';

  const exactAge =
    body.exactAge ||
    body.age ||
    body['Exact Age'] ||
    body['Age'] ||
    '';

  const sex =
    body.sex ||
    body.gender ||
    body['Sex'] ||
    body['Gender'] ||
    '';

  const height =
    body.height ||
    body['Height'] ||
    body['Height (cm)'] ||
    '';

  const weight =
    body.weight ||
    body['Weight'] ||
    body['Weight (kg)'] ||
    '';

  const activity =
    body.activity ||
    body.activityLevel ||
    body['Activity Level'] ||
    'Moderate';

  const foodStyle =
    body.foodStyle ||
    body.diet ||
    body['Food Style'] ||
    body['Dietary Style'] ||
    'Vegetarian';

  const mainGoal =
    body.mainGoal ||
    body.goal ||
    body['Main Goal'] ||
    body['Performance Goal'] ||
    'Muscle & strength support';

  const energyGoal =
    body.energyGoal ||
    body['Energy Goal'] ||
    body['Energy Objective'] ||
    'Maintenance';

  const budget =
    body.budget ||
    body['Daily Budget'] ||
    body['Budget'] ||
    '₹200/day';

  const targetCalories =
    Number(body.targetCalories || body.calories || body['Target Calories'] || 0) || undefined;

  const proteinTarget =
    Number(body.proteinTarget || body.protein || body['Protein Target'] || 0) || undefined;

  const source = body.source || defaultSource;

  const timestamp =
    body.timestamp ||
    new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const id = body.id || `int-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  return {
    id,
    timestamp,
    name: String(name).trim(),
    contact: String(contact).trim(),
    notes: String(notes).trim(),
    source,
    ageGroup,
    exactAge: String(exactAge).trim(),
    sex,
    height: String(height).trim(),
    weight: String(weight).trim(),
    activity,
    foodStyle,
    mainGoal,
    energyGoal,
    budget,
    targetCalories,
    proteinTarget,
  };
}

// Centralized POST: save interaction from Nourish Pro or any website
app.post('/api/interactions', (req, res) => {
  try {
    const record = normalizePayload(req.body, req.body.source || 'Nourish Pro Web');
    inMemoryStore.unshift(record);
    persistInteractions();

    res.status(201).json({
      success: true,
      message: 'Interaction logged centrally',
      interaction: record,
      total: inMemoryStore.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Universal Webhook for ANY external website (e.g. WordPress, Webflow, custom landing page)
app.post('/api/webhook/form-fill', (req, res) => {
  try {
    const referer = req.headers.referer || req.headers.origin || 'External Website';
    const record = normalizePayload(req.body, `External: ${referer}`);
    inMemoryStore.unshift(record);
    persistInteractions();

    res.status(201).json({
      success: true,
      message: 'External website form fill recorded centrally',
      interaction: record,
      total: inMemoryStore.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete single interaction
app.delete('/api/interactions/:id', (req, res) => {
  const { id } = req.params;
  const prevLen = inMemoryStore.length;
  inMemoryStore = inMemoryStore.filter((item) => item.id !== id);
  if (inMemoryStore.length !== prevLen) {
    persistInteractions();
  }
  res.json({ success: true, remaining: inMemoryStore.length });
});

// Clear all interactions
app.delete('/api/interactions', (req, res) => {
  inMemoryStore = [];
  persistInteractions();
  res.json({ success: true, total: 0 });
});

// ---------------- VITE MIDDLEWARE / STATIC ASSETS ----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Local Nourish Server running on port ${PORT} (0.0.0.0)`);
  });
}

startServer();
