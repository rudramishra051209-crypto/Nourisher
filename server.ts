import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

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

// Data persistence setup in container
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'interactions.json');

const INITIAL_SEED_INTERACTIONS = [
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

let inMemoryStore: any[] = [...INITIAL_SEED_INTERACTIONS];

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
}

// ---------------- API ROUTES FIRST ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', recordsCount: inMemoryStore.length });
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
    isLocal: true,
  });
});

// Centralized GET: retrieve all interactions from all visitors
app.get('/api/interactions', (req, res) => {
  res.json({
    success: true,
    total: inMemoryStore.length,
    interactions: inMemoryStore,
    serverTime: new Date().toISOString(),
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
