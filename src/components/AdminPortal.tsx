import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserInteraction } from '../types';
import { ADMIN_CONFIG } from '../config/adminConfig';
import { 
  fetchCentralizedInteractions, 
  deleteInteractionById, 
  clearAllInteractions, 
  syncGoogleSheetUrl 
} from '../utils/interactionsStorage';
import { 
  requestGoogleAccessToken, 
  autoConnectOrCreateSheet, 
  fetchInteractionsFromGoogleSheet, 
  getConnectedSheetInfo, 
  disconnectGoogleSheets, 
  saveConnectedSheetInfo,
  appendInteractionToGoogleSheet,
  ConnectedSheetInfo,
  getStoredGoogleToken
} from '../utils/googleSheetsService';
import { exportInteractionsToExcel } from '../utils/excelExporter';
import { 
  Shield, 
  Lock, 
  X, 
  Trash2, 
  RefreshCw, 
  Search, 
  Users, 
  FileSpreadsheet, 
  Eye, 
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  KeyRound,
  Globe,
  Radio,
  FileText,
  Copy,
  Check,
  Send,
  ExternalLink,
  Table,
  Link as LinkIcon,
  Unlink,
  CheckCheck
} from 'lucide-react';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ isOpen, onClose }) => {
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('nourish_admin_auth') === 'true';
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [isServerConnected, setIsServerConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'interactions' | 'sheets' | 'webhooks'>('interactions');

  // Google Sheets Connection State
  const [connectedSheet, setConnectedSheet] = useState<ConnectedSheetInfo | null>(() => getConnectedSheetInfo());
  const [isConnectingGoogle, setIsConnectingGoogle] = useState<boolean>(false);
  const [googleActionMessage, setGoogleActionMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedFoodStyle, setSelectedFoodStyle] = useState<string>('all');
  const [selectedEnergyGoal, setSelectedEnergyGoal] = useState<string>('all');

  // Modals & triggers
  const [selectedRecord, setSelectedRecord] = useState<UserInteraction | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Google Sheets sync state for manual CSV URL
  const [sheetUrlInput, setSheetUrlInput] = useState<string>('');
  const [sheetSyncStatus, setSheetSyncStatus] = useState<{ loading: boolean; message?: string; isError?: boolean }>({ loading: false });

  // Webhook code copy status
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState<boolean>(false);
  const [testWebhookStatus, setTestWebhookStatus] = useState<{ loading: boolean; message?: string }>({ loading: false });

  // Dynamic endpoint origin
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';
  const googleFormWebhookUrl = `${origin}/api/webhook/google-forms`;
  const universalWebhookUrl = `${origin}/api/webhook/form-fill`;

  // Fetch data centrally (both from server and from connected Google Sheet)
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const result = await fetchCentralizedInteractions();
      let combined = [...result.interactions];
      setIsServerConnected(result.isServerConnected);

      // If Google Sheet is connected and token is available, also sync from Google Sheet
      const token = getStoredGoogleToken();
      if (token && connectedSheet?.spreadsheetId) {
        try {
          const sheetRows = await fetchInteractionsFromGoogleSheet(token, connectedSheet.spreadsheetId);
          if (sheetRows.length > 0) {
            // Merge sheet rows with server interactions, avoiding duplicates
            const existingKeys = new Set(combined.map((x) => `${x.name}_${x.timestamp}`));
            sheetRows.forEach((r) => {
              const key = `${r.name}_${r.timestamp}`;
              if (!existingKeys.has(key)) {
                combined.unshift(r);
                existingKeys.add(key);
              }
            });
            // Update last synced
            setConnectedSheet((prev) => (prev ? { ...prev, lastSyncedAt: new Date().toLocaleString() } : null));
          }
        } catch (sheetErr) {
          console.warn('Google Sheet live sync note:', sheetErr);
        }
      }

      setInteractions(combined);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      refreshData();
      // Auto poll every 12 seconds
      const timer = setInterval(() => {
        refreshData();
      }, 12000);
      return () => clearInterval(timer);
    }
  }, [isOpen, isAuthenticated, connectedSheet?.spreadsheetId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_CONFIG.ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('nourish_admin_auth', 'true');
      setAuthError(null);
      setPasswordInput('');
      refreshData();
    } else {
      setAuthError('Incorrect admin password. (Password configured in src/config/adminConfig.ts)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('nourish_admin_auth');
    setPasswordInput('');
  };

  // Connect Google Sheets automatically with configured Gmail ID
  const handleAutoConnectGoogleSheets = async () => {
    setIsConnectingGoogle(true);
    setGoogleActionMessage(null);

    try {
      // 1. Request access token with hint prefilled to user's Gmail ID
      const { accessToken, userEmail } = await requestGoogleAccessToken(ADMIN_CONFIG.GOOGLE.GMAIL_ID);

      // 2. Auto-find or create the centralized spreadsheet in user's Drive
      const sheetInfo = await autoConnectOrCreateSheet(accessToken);
      sheetInfo.userEmail = userEmail || ADMIN_CONFIG.GOOGLE.GMAIL_ID;
      setConnectedSheet(sheetInfo);

      // 3. Immediately pull rows from the sheet
      try {
        const rows = await fetchInteractionsFromGoogleSheet(accessToken, sheetInfo.spreadsheetId);
        if (rows.length > 0) {
          setInteractions((prev) => {
            const existingKeys = new Set(prev.map((x) => `${x.name}_${x.timestamp}`));
            const merged = [...prev];
            rows.forEach((r) => {
              if (!existingKeys.has(`${r.name}_${r.timestamp}`)) {
                merged.unshift(r);
              }
            });
            return merged;
          });
        }
      } catch {
        // empty sheet is normal on first creation
      }

      setGoogleActionMessage({
        text: `Connected successfully to Google Sheet: "${sheetInfo.sheetTitle}" (${sheetInfo.userEmail})!`,
        isError: false,
      });
    } catch (err: any) {
      console.error('Google Sheets connect error:', err);
      setGoogleActionMessage({
        text: err.message || 'Failed to authenticate with Google. Make sure popups are allowed.',
        isError: true,
      });
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleDisconnectGoogleSheets = () => {
    disconnectGoogleSheets();
    setConnectedSheet(null);
    setGoogleActionMessage({
      text: 'Google Sheets disconnected from this session.',
      isError: false,
    });
  };

  const handleSyncGoogleSheetLive = async () => {
    if (!connectedSheet?.spreadsheetId) return;
    setIsLoading(true);
    setGoogleActionMessage(null);

    try {
      let token = getStoredGoogleToken();
      if (!token) {
        const authRes = await requestGoogleAccessToken(ADMIN_CONFIG.GOOGLE.GMAIL_ID);
        token = authRes.accessToken;
      }

      const rows = await fetchInteractionsFromGoogleSheet(token, connectedSheet.spreadsheetId);
      setInteractions((prev) => {
        const existingKeys = new Set(prev.map((x) => `${x.name}_${x.timestamp}`));
        const merged = [...prev];
        let added = 0;
        rows.forEach((r) => {
          if (!existingKeys.has(`${r.name}_${r.timestamp}`)) {
            merged.unshift(r);
            added++;
          }
        });
        setGoogleActionMessage({
          text: `Synced with Google Sheet! Loaded ${rows.length} total rows (${added} new entries).`,
          isError: false,
        });
        return merged;
      });
    } catch (err: any) {
      setGoogleActionMessage({
        text: `Sync error: ${err.message}`,
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteInteractionById(id);
    setInteractions((prev) => prev.filter((item) => item.id !== id));
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
  };

  const handleClearAll = async () => {
    await clearAllInteractions();
    setInteractions([]);
    setIsConfirmingClear(false);
    setSelectedRecord(null);
  };

  const handleExportExcel = () => {
    exportInteractionsToExcel(filteredInteractions);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  // Google Sheet manual CSV sync
  const handleSyncGoogleSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrlInput.trim()) return;

    setSheetSyncStatus({ loading: true });
    try {
      const res = await syncGoogleSheetUrl(sheetUrlInput.trim());
      if (res.success) {
        setSheetSyncStatus({ loading: false, message: res.message, isError: false });
        await refreshData();
      } else {
        setSheetSyncStatus({ loading: false, message: res.message || 'Sync failed', isError: true });
      }
    } catch (err: any) {
      setSheetSyncStatus({ loading: false, message: err.message || 'Network error syncing sheet', isError: true });
    }
  };

  // Test webhook simulator
  const handleTestWebhook = async () => {
    setTestWebhookStatus({ loading: true, message: 'Submitting test athlete record via webhook...' });
    try {
      const testNames = ['Vikram Rathore', 'Simran Kaur', 'Aditya Sen', 'Tanvi Mehta'];
      const randomName = testNames[Math.floor(Math.random() * testNames.length)];
      
      const payload: UserInteraction = {
        id: `test-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        name: randomName,
        contact: `${randomName.toLowerCase().replace(/\s+/g, '.')}@googleform-test.com`,
        notes: 'Submitted via external Google Form webhook trigger',
        ageGroup: '18–25',
        exactAge: '23',
        sex: 'Male',
        height: '176',
        weight: '72',
        activity: 'High',
        foodStyle: 'Vegetarian',
        mainGoal: 'Muscle & strength support',
        energyGoal: 'Muscle-building surplus',
        budget: '₹200/day',
        targetCalories: 2750,
        proteinTarget: 140,
        source: 'Google Form Webhook',
      };

      const res = await fetch('/api/webhook/google-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Also append to connected Google Sheet if connected
      if (connectedSheet) {
        appendInteractionToGoogleSheet(payload).catch(console.warn);
      }

      if (res.ok) {
        setTestWebhookStatus({ loading: false, message: `Success! Created test record for "${randomName}". Updating live feed...` });
        await refreshData();
      } else {
        setTestWebhookStatus({ loading: false, message: 'Server responded with error.' });
      }
    } catch (err: any) {
      setTestWebhookStatus({ loading: false, message: `Error: ${err.message}` });
    }
  };

  const copyToClipboard = (text: string, setFn: (val: boolean) => void) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setFn(true);
      setTimeout(() => setFn(false), 2500);
    }
  };

  const googleAppsScriptCode = `// Google Apps Script for Google Form or Google Sheet
// In Google Sheet / Form: Extensions -> Apps Script -> Paste this code -> Add Trigger: On Form Submit
function onFormSubmit(e) {
  var webhookUrl = "${googleFormWebhookUrl}";
  
  // Captures submitted form questions automatically
  var payload = {
    source: "Google Form",
    timestamp: new Date().toLocaleString(),
    namedValues: e.namedValues || {}
  };
  
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  UrlFetchApp.fetch(webhookUrl, options);
}`;

  // Filtered interactions
  const filteredInteractions = useMemo(() => {
    return interactions.filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.contact && item.contact.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.mainGoal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.source && item.source.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchSource =
        selectedSource === 'all' ||
        (selectedSource === 'google-form' && (item.source?.toLowerCase().includes('google') || false)) ||
        (selectedSource === 'website' && (item.source?.toLowerCase().includes('web') || false)) ||
        (selectedSource === 'external' && (item.source?.toLowerCase().includes('external') || false));

      const matchDiet = selectedFoodStyle === 'all' || item.foodStyle === selectedFoodStyle;
      const matchGoal = selectedEnergyGoal === 'all' || item.energyGoal === selectedEnergyGoal;

      return matchSearch && matchSource && matchDiet && matchGoal;
    });
  }, [interactions, searchQuery, selectedSource, selectedFoodStyle, selectedEnergyGoal]);

  // Analytics
  const metrics = useMemo(() => {
    const total = interactions.length;
    if (total === 0) {
      return { total: 0, topGoal: 'N/A', topDiet: 'N/A', avgCalories: 0, googleFormsCount: 0 };
    }

    const goalCounts: Record<string, number> = {};
    const dietCounts: Record<string, number> = {};
    let totalCals = 0;
    let calCount = 0;
    let googleFormsCount = 0;

    interactions.forEach((i) => {
      goalCounts[i.mainGoal] = (goalCounts[i.mainGoal] || 0) + 1;
      dietCounts[i.foodStyle] = (dietCounts[i.foodStyle] || 0) + 1;
      if (i.targetCalories) {
        totalCals += i.targetCalories;
        calCount += 1;
      }
      if (i.source?.toLowerCase().includes('google')) {
        googleFormsCount++;
      }
    });

    const topGoal = Object.entries(goalCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const topDiet = Object.entries(dietCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const avgCalories = calCount > 0 ? Math.round(totalCals / calCount) : 0;

    return { total, topGoal, topDiet, avgCalories, googleFormsCount };
  }, [interactions]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-[#0E131E] border border-slate-200 dark:border-[#20293D] rounded-3xl w-full max-w-6xl shadow-2xl relative z-10 max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-white"
        >
          {/* Header Bar */}
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-[#1E2638] flex items-center justify-between bg-slate-50/80 dark:bg-[#121724]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 dark:bg-[#CCFF00]/15 text-emerald-700 dark:text-[#CCFF00] flex items-center justify-center border border-emerald-500/20 dark:border-[#CCFF00]/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Outfit'] font-black text-base sm:text-lg text-slate-950 dark:text-white uppercase tracking-tight">
                    Centralized Admin Portal
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 ${
                    connectedSheet
                      ? 'bg-emerald-100 dark:bg-[#CCFF00]/20 text-emerald-800 dark:text-[#CCFF00]'
                      : isServerConnected
                      ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#CCFF00] animate-pulse" />
                    {connectedSheet ? 'Google Sheets Connected' : isServerConnected ? 'Central Server Live' : 'Offline Cache'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  Auto-synced with <span className="font-mono text-emerald-700 dark:text-[#CCFF00]">{ADMIN_CONFIG.GOOGLE.GMAIL_ID}</span> • Live Google Forms & Sheets
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-[#263147] hover:bg-slate-200 dark:hover:bg-[#1C2436] text-xs font-['Outfit'] font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Log Out
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1C2436] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {!isAuthenticated ? (
            /* LOGIN VIEW */
            <div className="p-8 sm:p-12 flex flex-col items-center justify-center max-w-md mx-auto text-center w-full my-auto">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-[#151D2C] text-emerald-600 dark:text-[#CCFF00] flex items-center justify-center mb-5 border border-slate-200 dark:border-[#243046]">
                <Lock className="w-8 h-8" />
              </div>
              <h4 className="font-['Outfit'] font-black text-2xl text-slate-950 dark:text-white uppercase tracking-tight mb-2">
                Admin Authentication
              </h4>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed mb-6">
                Enter the administrator password to manage Google Sheets synchronization, view submissions from any website/form, and export Excel reports.
              </p>

              <form onSubmit={handleLogin} className="w-full space-y-4">
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="Enter Admin Password..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#151D2C] border border-slate-300 dark:border-[#263348] text-sm text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-[#CCFF00] transition"
                    autoFocus
                  />
                </div>

                {authError && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium text-left">
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-[#CCFF00] dark:hover:bg-[#BAE600] text-white dark:text-slate-950 font-['Outfit'] font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
                >
                  Authenticate & View Logs
                </button>
              </form>

              <div className="mt-8 p-3 rounded-xl bg-slate-100/80 dark:bg-[#121824] border border-slate-200 dark:border-[#1E2638] text-[11px] text-slate-500 dark:text-[#64748B] w-full text-left space-y-1">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Admin Password: </span>
                  <code className="text-slate-800 dark:text-white font-bold font-mono">admin123</code> (in <code className="text-emerald-700 dark:text-[#CCFF00] font-mono">src/config/adminConfig.ts</code>)
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Target Gmail ID: </span>
                  <code className="text-emerald-700 dark:text-[#CCFF00] font-mono">{ADMIN_CONFIG.GOOGLE.GMAIL_ID}</code>
                </div>
              </div>
            </div>
          ) : (
            /* ADMIN DASHBOARD VIEW */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Tab Selector Bar */}
              <div className="flex items-center justify-between px-5 pt-3 pb-0 border-b border-slate-200 dark:border-[#1E2638] bg-slate-50/50 dark:bg-[#101522]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('interactions')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-['Outfit'] font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
                      activeTab === 'interactions'
                        ? 'border-emerald-600 dark:border-[#CCFF00] text-emerald-800 dark:text-[#CCFF00]'
                        : 'border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    <Table className="w-4 h-4" />
                    <span>Submissions ({interactions.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('sheets')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-['Outfit'] font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
                      activeTab === 'sheets'
                        ? 'border-emerald-600 dark:border-[#CCFF00] text-emerald-800 dark:text-[#CCFF00]'
                        : 'border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Google Sheet Auto-Sync</span>
                    {connectedSheet && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#CCFF00] animate-pulse" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('webhooks')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-['Outfit'] font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
                      activeTab === 'webhooks'
                        ? 'border-emerald-600 dark:border-[#CCFF00] text-emerald-800 dark:text-[#CCFF00]'
                        : 'border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                    <span>Google Forms Integration</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pb-2">
                  <button
                    type="button"
                    onClick={refreshData}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#151D2C] border border-slate-200 dark:border-[#243046] text-xs text-slate-600 dark:text-[#94A3B8] hover:text-slate-950 dark:hover:text-white transition cursor-pointer"
                    title="Live poll data from central database & connected Google Sheet"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline text-[11px] font-mono">Live Sync</span>
                  </button>
                </div>
              </div>

              {/* Notification Banner */}
              {googleActionMessage && (
                <div className={`px-5 py-2.5 text-xs flex items-center justify-between border-b ${
                  googleActionMessage.isError
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-300'
                    : 'bg-emerald-50 dark:bg-[#CCFF00]/10 border-emerald-200 dark:border-[#CCFF00]/20 text-emerald-900 dark:text-[#CCFF00]'
                }`}>
                  <div className="flex items-center gap-2">
                    {googleActionMessage.isError ? (
                      <X className="w-4 h-4 text-red-500" />
                    ) : (
                      <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-[#CCFF00]" />
                    )}
                    <span>{googleActionMessage.text}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGoogleActionMessage(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* TAB 1: SUBMISSIONS TABLE */}
              {activeTab === 'interactions' && (
                <>
                  {/* Google Sheet Quick Sync Banner */}
                  {connectedSheet ? (
                    <div className="px-5 py-2.5 bg-emerald-50/70 dark:bg-[#131A26] border-b border-emerald-100 dark:border-[#1E2638] flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#CCFF00]" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          Active Google Sheet: <strong className="text-slate-950 dark:text-white font-['Outfit']">{connectedSheet.sheetTitle}</strong>
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">({connectedSheet.userEmail})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={connectedSheet.spreadsheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1D2638] border border-slate-200 dark:border-[#2C3850] text-[11px] font-bold text-emerald-700 dark:text-[#CCFF00] hover:underline"
                        >
                          <span>Open in Google Sheets</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={handleSyncGoogleSheetLive}
                          disabled={isLoading}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 dark:bg-[#CCFF00] text-white dark:text-slate-950 text-[11px] font-bold font-['Outfit'] uppercase transition cursor-pointer"
                        >
                          Pull Rows Now
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-5 py-2.5 bg-amber-50/70 dark:bg-[#161A22] border-b border-amber-100 dark:border-[#222B3D] flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-slate-700 dark:text-slate-300">
                          Google Sheet is not connected. Connect with <code className="font-mono font-bold text-slate-950 dark:text-white">{ADMIN_CONFIG.GOOGLE.GMAIL_ID}</code> to save all form fills into your Google Drive spreadsheet!
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoConnectGoogleSheets}
                        disabled={isConnectingGoogle}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-[#CCFF00] dark:hover:bg-[#BAE600] text-white dark:text-slate-950 text-[11px] font-black font-['Outfit'] uppercase transition cursor-pointer shadow-xs"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>{isConnectingGoogle ? 'Connecting...' : 'Connect Google Sheet Now'}</span>
                      </button>
                    </div>
                  )}

                  {/* Top Stats Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-slate-50/40 dark:bg-[#101522] border-b border-slate-200 dark:border-[#1E2638]">
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141A28] border border-slate-200 dark:border-[#20293D]">
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-[#94A3B8] uppercase block">
                        Total Submissions
                      </span>
                      <p className="text-2xl font-['Space_Grotesk'] font-bold text-slate-950 dark:text-white mt-0.5">
                        {metrics.total}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141A28] border border-slate-200 dark:border-[#20293D]">
                      <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-[#CCFF00] uppercase block">
                        Top Training Goal
                      </span>
                      <p className="text-sm font-['Outfit'] font-bold text-slate-950 dark:text-white mt-1 truncate">
                        {metrics.topGoal}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141A28] border border-slate-200 dark:border-[#20293D]">
                      <span className="text-[10px] font-mono font-bold text-cyan-700 dark:text-[#00F0FF] uppercase block">
                        Most Chosen Diet
                      </span>
                      <p className="text-sm font-['Outfit'] font-bold text-slate-950 dark:text-white mt-1 truncate">
                        {metrics.topDiet}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141A28] border border-slate-200 dark:border-[#20293D]">
                      <span className="text-[10px] font-mono font-bold text-orange-600 dark:text-[#FF6B00] uppercase block">
                        Avg Calorie Target
                      </span>
                      <p className="text-2xl font-['Space_Grotesk'] font-bold text-slate-950 dark:text-white mt-0.5">
                        {metrics.avgCalories ? `${metrics.avgCalories.toLocaleString()} kcal` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Action Toolbar */}
                  <div className="p-3.5 sm:px-5 border-b border-slate-200 dark:border-[#1E2638] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#0E131E]">
                    {/* Search and Filters */}
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      <div className="relative flex-1 min-w-[180px] max-w-xs">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search athlete, email, goal..."
                          className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#151D2C] border border-slate-200 dark:border-[#243046] text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <select
                        value={selectedSource}
                        onChange={(e) => setSelectedSource(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#151D2C] border border-slate-200 dark:border-[#243046] text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                      >
                        <option value="all">All Sources</option>
                        <option value="google-form">Google Forms / Sheets</option>
                        <option value="website">Nourish Pro Web</option>
                        <option value="external">External Form Fills</option>
                      </select>

                      <select
                        value={selectedFoodStyle}
                        onChange={(e) => setSelectedFoodStyle(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#151D2C] border border-slate-200 dark:border-[#243046] text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                      >
                        <option value="all">All Diets</option>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Eggetarian">Eggetarian</option>
                        <option value="Non-vegetarian">Non-vegetarian</option>
                        <option value="Jain">Jain</option>
                        <option value="Mostly plant-based">Plant-based</option>
                      </select>

                      <select
                        value={selectedEnergyGoal}
                        onChange={(e) => setSelectedEnergyGoal(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#151D2C] border border-slate-200 dark:border-[#243046] text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                      >
                        <option value="all">All Goals</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Muscle-building surplus">Bulking Surplus</option>
                        <option value="Fat-loss deficit">Fat-loss Deficit</option>
                        <option value="Recomposition">Recomposition</option>
                      </select>
                    </div>

                    {/* Primary Excel Export Button */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleExportExcel}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-[#CCFF00] dark:hover:bg-[#BAE600] text-white dark:text-slate-950 font-['Outfit'] font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
                        title="Export interactions to a Microsoft Excel (.xlsx) file"
                      >
                        {exportSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Downloaded Excel!</span>
                          </>
                        ) : (
                          <>
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Download Excel (.xlsx)</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsConfirmingClear(true)}
                        className="p-1.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 transition cursor-pointer"
                        title="Clear all logs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Interactions Table View */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                    {filteredInteractions.length === 0 ? (
                      <div className="text-center py-16">
                        <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="font-['Outfit'] font-bold text-sm text-slate-700 dark:text-slate-300">
                          No matching athlete submissions found.
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Try adjusting filters or connecting your Google Sheet to pull entries.
                        </p>
                      </div>
                    ) : (
                      <div className="border border-slate-200 dark:border-[#1E2638] rounded-2xl overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-100/70 dark:bg-[#141A28] border-b border-slate-200 dark:border-[#1E2638] text-slate-600 dark:text-[#94A3B8] font-mono text-[10px] uppercase tracking-wider">
                                <th className="py-3 px-4">Date / Source</th>
                                <th className="py-3 px-4">Athlete Info</th>
                                <th className="py-3 px-4">Demographics</th>
                                <th className="py-3 px-4">Diet & Strategy</th>
                                <th className="py-3 px-4">Target Energy / Protein</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#192234]">
                              {filteredInteractions.map((item) => {
                                const isGoogle = item.source?.toLowerCase().includes('google');
                                const isExternal = item.source?.toLowerCase().includes('external');

                                return (
                                  <tr
                                    key={item.id}
                                    className="hover:bg-slate-50 dark:hover:bg-[#131926] transition-colors"
                                  >
                                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-[#94A3B8] whitespace-nowrap">
                                      <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3 text-slate-400" />
                                        <span>{item.timestamp}</span>
                                      </div>
                                      <div className="mt-1">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                                          isGoogle
                                            ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40'
                                            : isExternal
                                            ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40'
                                            : 'bg-emerald-100 dark:bg-[#CCFF00]/15 text-emerald-900 dark:text-[#CCFF00] border border-emerald-300 dark:border-[#CCFF00]/30'
                                        }`}>
                                          {isGoogle && <FileText className="w-2.5 h-2.5" />}
                                          {isExternal && <Globe className="w-2.5 h-2.5" />}
                                          <span>{item.source || 'Nourish Pro Web'}</span>
                                        </span>
                                      </div>
                                    </td>

                                    <td className="py-3 px-4">
                                      <div className="font-['Outfit'] font-bold text-sm text-slate-950 dark:text-white">
                                        {item.name}
                                      </div>
                                      {item.contact && (
                                        <div className="text-[11px] text-emerald-700 dark:text-[#CCFF00] font-mono flex items-center gap-1 mt-0.5">
                                          {item.contact.includes('@') ? (
                                            <Mail className="w-3 h-3" />
                                          ) : (
                                            <Phone className="w-3 h-3" />
                                          )}
                                          <span>{item.contact}</span>
                                        </div>
                                      )}
                                    </td>

                                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-[#94A3B8]">
                                      <div>
                                        {item.ageGroup} {item.exactAge ? `(${item.exactAge}y)` : ''} • {item.sex || 'Unspecified'}
                                      </div>
                                      <div className="text-[11px] text-slate-400">
                                        {item.height ? `${item.height}cm` : 'Ref'} • {item.weight ? `${item.weight}kg` : 'Ref'} • {item.activity || 'Moderate'}
                                      </div>
                                    </td>

                                    <td className="py-3 px-4">
                                      <div className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1B2335] text-[10px] font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#27324B]">
                                        {item.foodStyle}
                                      </div>
                                      <div className="text-[11px] text-slate-600 dark:text-[#94A3B8] mt-1 font-['Outfit']">
                                        {item.mainGoal} ({item.energyGoal})
                                      </div>
                                    </td>

                                    <td className="py-3 px-4 font-mono">
                                      <div className="font-bold text-slate-950 dark:text-white">
                                        {item.targetCalories ? `${item.targetCalories.toLocaleString()} kcal` : 'Estimated'}
                                      </div>
                                      <div className="text-[10px] text-emerald-700 dark:text-[#CCFF00]">
                                        {item.proteinTarget ? `~${item.proteinTarget}g Protein` : ''}
                                      </div>
                                    </td>

                                    <td className="py-3 px-4 text-right">
                                      <div className="inline-flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => setSelectedRecord(item)}
                                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-[#CCFF00] hover:bg-slate-100 dark:hover:bg-[#1C2436] transition cursor-pointer"
                                          title="View full record details"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDelete(item.id)}
                                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                                          title="Delete record"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* TAB 2: GOOGLE SHEETS LIVE CONNECTION */}
              {activeTab === 'sheets' && (
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                  {/* Connection Manager Card */}
                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111724] border border-slate-200 dark:border-[#1E2638]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-[#CCFF00]/15 text-emerald-600 dark:text-[#CCFF00] flex items-center justify-center border border-emerald-500/20 dark:border-[#CCFF00]/30">
                          <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-['Outfit'] font-black text-lg text-slate-950 dark:text-white uppercase tracking-tight">
                            Google Sheets Live Auto-Sync
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                            Centralized cloud storage via your authorized Google Account (<code className="font-mono text-emerald-700 dark:text-[#CCFF00]">{ADMIN_CONFIG.GOOGLE.GMAIL_ID}</code>)
                          </p>
                        </div>
                      </div>

                      {connectedSheet ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSyncGoogleSheetLive}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-[#CCFF00] dark:hover:bg-[#BAE600] text-white dark:text-slate-950 font-['Outfit'] font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-xs"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                            <span>Sync Now</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleDisconnectGoogleSheets}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200 dark:bg-[#1C2436] hover:bg-red-100 hover:text-red-600 text-xs font-['Outfit'] font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                          >
                            <Unlink className="w-3.5 h-3.5" />
                            <span>Disconnect</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleAutoConnectGoogleSheets}
                          disabled={isConnectingGoogle}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-[#CCFF00] dark:hover:bg-[#BAE600] text-white dark:text-slate-950 font-['Outfit'] font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          <span>{isConnectingGoogle ? 'Authorizing Google...' : `Auto-Connect with ${ADMIN_CONFIG.GOOGLE.GMAIL_ID}`}</span>
                        </button>
                      )}
                    </div>

                    {/* Connected Status Box */}
                    {connectedSheet ? (
                      <div className="p-4 rounded-2xl bg-white dark:bg-[#151D2C] border border-slate-200 dark:border-[#243046] space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#1E2638] pb-3">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-emerald-700 dark:text-[#CCFF00] font-bold block">
                              Connected Spreadsheet
                            </span>
                            <span className="font-['Outfit'] font-bold text-base text-slate-950 dark:text-white">
                              {connectedSheet.sheetTitle}
                            </span>
                          </div>
                          <a
                            href={connectedSheet.spreadsheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-[#CCFF00]/10 text-emerald-800 dark:text-[#CCFF00] border border-emerald-200 dark:border-[#CCFF00]/30 text-xs font-['Outfit'] font-bold hover:underline"
                          >
                            <span>Open in Google Sheets</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase block">Google Account</span>
                            <strong className="font-mono text-slate-800 dark:text-slate-200">{connectedSheet.userEmail || ADMIN_CONFIG.GOOGLE.GMAIL_ID}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase block">Spreadsheet ID</span>
                            <strong className="font-mono text-slate-800 dark:text-slate-200 truncate block">{connectedSheet.spreadsheetId}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase block">Last Synced</span>
                            <span className="font-mono text-slate-800 dark:text-slate-200">{connectedSheet.lastSyncedAt || 'Just now'}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-white dark:bg-[#151D2C] border border-slate-200 dark:border-[#243046]">
                        <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                          Clicking <strong>Auto-Connect with {ADMIN_CONFIG.GOOGLE.GMAIL_ID}</strong> will open a Google authorization window. The app will automatically find or create the spreadsheet <code className="font-mono text-emerald-700 dark:text-[#CCFF00] font-bold">"{ADMIN_CONFIG.GOOGLE.DEFAULT_SHEET_TITLE}"</code> in your Google Drive and set up automatic two-way row synchronization!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Manual Sheet URL Import (Fallback) */}
                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#111724] border border-slate-200 dark:border-[#1E2638]">
                    <div className="flex items-center gap-2 mb-2">
                      <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                      <h4 className="font-['Outfit'] font-black text-sm text-slate-950 dark:text-white uppercase tracking-tight">
                        Import Any Public/Shared Google Sheet URL
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed mb-4">
                      Alternatively, paste any Google Sheet URL (e.g. from Google Forms responses) to parse and pull submissions directly into your central view.
                    </p>

                    <form onSubmit={handleSyncGoogleSheet} className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="url"
                        value={sheetUrlInput}
                        onChange={(e) => setSheetUrlInput(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                        className="w-full sm:flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-[#171E2D] border border-slate-300 dark:border-[#243046] text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={sheetSyncStatus.loading}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-[#CCFF00] dark:hover:bg-[#BAE600] text-white dark:text-slate-950 font-['Outfit'] font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        {sheetSyncStatus.loading ? 'Syncing...' : 'Sync Sheet URL'}
                      </button>
                    </form>

                    {sheetSyncStatus.message && (
                      <div className={`mt-3 p-2.5 rounded-xl text-xs ${
                        sheetSyncStatus.isError
                          ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                          : 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-[#CCFF00]'
                      }`}>
                        {sheetSyncStatus.message}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: GOOGLE FORMS & WEBHOOKS */}
              {activeTab === 'webhooks' && (
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                  {/* Google Forms 1-Click Link to Google Sheets Card */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-[#111724] border border-slate-200 dark:border-[#1E2638]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h4 className="font-['Outfit'] font-black text-base text-slate-950 dark:text-white uppercase tracking-tight">
                        Method 1: Connect Google Form Directly to Connected Google Sheet
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed mb-4">
                      If you already use a Google Form, you can point its responses directly to your auto-connected spreadsheet:
                    </p>

                    <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 mb-4 p-4 rounded-2xl bg-white dark:bg-[#151D2C] border border-slate-200 dark:border-[#243046]">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-[#1E2638] flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                        <span>Open your Google Form and go to the <strong>Responses</strong> tab.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-[#1E2638] flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                        <span>Click <strong>Link to Sheets</strong> (the green sheets icon).</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-[#1E2638] flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
                        <span>Select <strong>"Select existing spreadsheet"</strong> and choose <code className="font-mono text-emerald-700 dark:text-[#CCFF00] font-bold">"{ADMIN_CONFIG.GOOGLE.DEFAULT_SHEET_TITLE}"</code>.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-[#CCFF00] flex items-center justify-center font-bold text-[11px] shrink-0">✓</span>
                        <span>Done! Every Google Form response will immediately write to your Google Sheet and auto-populate this Admin dashboard.</span>
                      </div>
                    </div>
                  </div>

                  {/* Method 2: Google Apps Script Webhook */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-[#111724] border border-slate-200 dark:border-[#1E2638]">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                            <Radio className="w-4 h-4" />
                          </div>
                          <h4 className="font-['Outfit'] font-black text-base text-slate-950 dark:text-white uppercase tracking-tight">
                            Method 2: Real-Time Google Apps Script Webhook
                          </h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                          Whenever a user fills your Google Form, Apps Script fires an immediate HTTP POST to this central dashboard.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleTestWebhook}
                        disabled={testWebhookStatus.loading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-['Outfit'] font-bold cursor-pointer transition shadow-xs whitespace-nowrap"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{testWebhookStatus.loading ? 'Simulating...' : 'Test Webhook'}</span>
                      </button>
                    </div>

                    {testWebhookStatus.message && (
                      <div className="mb-4 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs text-purple-800 dark:text-purple-200">
                        {testWebhookStatus.message}
                      </div>
                    )}

                    {/* Code Box */}
                    <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-slate-100 font-mono text-[11px] p-4 border border-slate-800 mb-3">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(googleAppsScriptCode, setCopiedScript)}
                        className="absolute right-3 top-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-['Outfit'] text-slate-200 transition cursor-pointer"
                      >
                        {copiedScript ? <Check className="w-3.5 h-3.5 text-[#CCFF00]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
                      </button>
                      <pre className="overflow-x-auto whitespace-pre pr-24">
                        {googleAppsScriptCode}
                      </pre>
                    </div>

                    <p className="text-xs text-slate-500">
                      In Google Sheet: <strong>Extensions</strong> → <strong>Apps Script</strong> → Paste code → Set trigger <strong>On form submit</strong>.
                    </p>
                  </div>

                  {/* Universal Webhook for Any Website */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-[#111724] border border-slate-200 dark:border-[#1E2638]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        <Globe className="w-4 h-4" />
                      </div>
                      <h4 className="font-['Outfit'] font-black text-base text-slate-950 dark:text-white uppercase tracking-tight">
                        Universal Webhook for Any External Website (CORS Enabled)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed mb-4">
                      Any external landing page, WordPress form, or custom app can POST athlete submissions directly:
                    </p>

                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#171E2D] border border-slate-200 dark:border-[#243046]">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-[#CCFF00] font-mono text-[10px] font-bold uppercase">
                        POST
                      </span>
                      <code className="text-xs font-mono flex-1 text-slate-800 dark:text-slate-200 truncate">
                        {universalWebhookUrl}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(universalWebhookUrl, setCopiedWebhookUrl)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#20293D] hover:bg-slate-200 text-xs font-['Outfit'] font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                      >
                        {copiedWebhookUrl ? 'Copied!' : 'Copy URL'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Record Details Modal Popover */}
          {selectedRecord && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
              <div className="bg-white dark:bg-[#121724] border border-slate-200 dark:border-[#243046] rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-[#1E2638]">
                  <h4 className="font-['Outfit'] font-bold text-base text-slate-950 dark:text-white">
                    Athlete Interaction Dossier
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-950 dark:hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#171E2D]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Name & Contact</span>
                    <strong className="text-sm text-slate-950 dark:text-white block">{selectedRecord.name}</strong>
                    <span className="text-emerald-700 dark:text-[#CCFF00] font-mono">{selectedRecord.contact || 'No contact provided'}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#171E2D] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Submission Channel:</span>
                    <span className="font-bold text-emerald-700 dark:text-[#CCFF00]">{selectedRecord.source || 'Nourish Pro Web'}</span>
                  </div>

                  {selectedRecord.notes && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#171E2D]">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Goals / Notes</span>
                      <p className="italic text-slate-800 dark:text-slate-200 mt-0.5">{selectedRecord.notes}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#171E2D]">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Demographics</span>
                      <span>{selectedRecord.ageGroup} • {selectedRecord.sex || 'Unspecified'}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#171E2D]">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Body Stats</span>
                      <span>{selectedRecord.height ? `${selectedRecord.height}cm` : 'Ref'} • {selectedRecord.weight ? `${selectedRecord.weight}kg` : 'Ref'}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-[#14221A] border border-emerald-100 dark:border-[#224424] flex items-center justify-between font-mono">
                    <div>
                      <span className="text-[10px] uppercase text-emerald-800 dark:text-[#CCFF00] block">Target Calories</span>
                      <strong className="text-sm text-slate-950 dark:text-white">
                        {selectedRecord.targetCalories ? `${selectedRecord.targetCalories} kcal` : 'N/A'}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-emerald-800 dark:text-[#CCFF00] block">Protein Target</span>
                      <strong className="text-sm text-slate-950 dark:text-white">
                        {selectedRecord.proteinTarget ? `${selectedRecord.proteinTarget}g` : 'N/A'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1E2638] text-xs font-['Outfit'] font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Clear Modal */}
          {isConfirmingClear && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
              <div className="bg-white dark:bg-[#121724] border border-slate-200 dark:border-[#243046] rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/30 text-red-600 flex items-center justify-center mx-auto mb-3">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h4 className="font-['Outfit'] font-bold text-base text-slate-950 dark:text-white mb-1">
                  Clear All Central Records?
                </h4>
                <p className="text-xs text-slate-500 mb-5">
                  This will purge all user interaction logs from the central database. Connected Google Sheets will remain intact.
                </p>
                <div className="flex items-center gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClear(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1E2638] text-xs font-['Outfit'] font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-['Outfit'] font-bold hover:bg-red-700 transition cursor-pointer"
                  >
                    Yes, Clear All
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
