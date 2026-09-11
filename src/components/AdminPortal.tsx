import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserInteraction, ExcelServerStatus } from '../types';
import { ADMIN_CONFIG } from '../config/adminConfig';
import { 
  fetchCentralizedInteractions, 
  deleteInteractionById, 
  clearAllInteractions,
  fetchExcelServerStatus,
  triggerServerExcelPush,
  downloadServerExcelFile
} from '../utils/interactionsStorage';
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
  Server,
  Wifi,
  Copy,
  Check,
  Table,
  SlidersHorizontal,
  Info,
  Download,
  FolderSync,
  HardDrive
} from 'lucide-react';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ isOpen, onClose }) => {
  const [passwordInput, setPasswordInput] = useState<string>('');
  
  // ALWAYS open website in logged-out admin mode
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [isServerConnected, setIsServerConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Local server network information
  const [localIps, setLocalIps] = useState<string[]>([]);
  const [copiedIp, setCopiedIp] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFoodStyle, setSelectedFoodStyle] = useState<string>('all');
  const [selectedEnergyGoal, setSelectedEnergyGoal] = useState<string>('all');

  // Modals & triggers
  const [selectedRecord, setSelectedRecord] = useState<UserInteraction | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Central Server Excel state
  const [excelStatus, setExcelStatus] = useState<ExcelServerStatus | null>(null);
  const [isPushingExcel, setIsPushingExcel] = useState<boolean>(false);
  const [pushExcelMessage, setPushExcelMessage] = useState<string | null>(null);

  // Fetch data from local server and Excel status
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [interactionsResult, excelResult] = await Promise.all([
        fetchCentralizedInteractions(),
        fetchExcelServerStatus(),
      ]);
      setInteractions(interactionsResult.interactions);
      setIsServerConnected(interactionsResult.isServerConnected);
      if (excelResult) {
        setExcelStatus(excelResult);
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch local server network IP info
  useEffect(() => {
    fetch('/api/server-info')
      .then((res) => res.json())
      .then((data) => {
        if (data.localIps && Array.isArray(data.localIps)) {
          setLocalIps(data.localIps);
        }
      })
      .catch(() => {
        // Fallback to window host if API fails
        if (typeof window !== 'undefined') {
          setLocalIps([window.location.hostname]);
        }
      });
  }, []);

  // When modal closes or unmounts, ALWAYS reset admin authentication to logged-out
  const handleClose = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    setAuthError(null);
    onClose();
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      refreshData();
      const timer = setInterval(refreshData, 10000);
      return () => clearInterval(timer);
    }
  }, [isOpen, isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_CONFIG.ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError(null);
      setPasswordInput('');
      refreshData();
    } else {
      setAuthError('Incorrect admin password. (Configured in src/config/adminConfig.ts)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    setAuthError(null);
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

  const handleDownloadServerExcel = () => {
    downloadServerExcelFile();
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handlePushCentralExcel = async () => {
    setIsPushingExcel(true);
    setPushExcelMessage(null);
    try {
      const res = await triggerServerExcelPush(interactions);
      if (res.success) {
        setPushExcelMessage(`Pushed ${res.totalRecords} records directly to athlete_nutrition_data.xlsx in project root`);
        const status = await fetchExcelServerStatus();
        if (status) setExcelStatus(status);
      } else {
        setPushExcelMessage('Server push encountered an issue');
      }
    } catch {
      setPushExcelMessage('Failed to push to server Excel');
    } finally {
      setIsPushingExcel(false);
      setTimeout(() => setPushExcelMessage(null), 4000);
    }
  };

  const copyLocalAddress = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIp(true);
      setTimeout(() => setCopiedIp(false), 2000);
    }
  };

  // Filtered interactions
  const filteredInteractions = useMemo(() => {
    return interactions.filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.contact && item.contact.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.mainGoal.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDiet = selectedFoodStyle === 'all' || item.foodStyle === selectedFoodStyle;
      const matchGoal = selectedEnergyGoal === 'all' || item.energyGoal === selectedEnergyGoal;

      return matchSearch && matchDiet && matchGoal;
    });
  }, [interactions, searchQuery, selectedFoodStyle, selectedEnergyGoal]);

  // Analytics
  const metrics = useMemo(() => {
    const total = interactions.length;
    if (total === 0) {
      return { total: 0, topGoal: 'N/A', topDiet: 'N/A', avgCalories: 0 };
    }

    const goalCounts: Record<string, number> = {};
    const dietCounts: Record<string, number> = {};
    let totalCals = 0;
    let calCount = 0;

    interactions.forEach((i) => {
      goalCounts[i.mainGoal] = (goalCounts[i.mainGoal] || 0) + 1;
      dietCounts[i.foodStyle] = (dietCounts[i.foodStyle] || 0) + 1;
      if (i.targetCalories) {
        totalCals += i.targetCalories;
        calCount += 1;
      }
    });

    const topGoal = Object.entries(goalCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const topDiet = Object.entries(dietCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const avgCalories = calCount > 0 ? Math.round(totalCals / calCount) : 0;

    return { total, topGoal, topDiet, avgCalories };
  }, [interactions]);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
  const displayLocalIp = localIps.length > 0 ? localIps[0] : '127.0.0.1';
  const localNetworkUrl = `http://${displayLocalIp}:${ADMIN_CONFIG.SERVER_PORT || 3000}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-[#0E131E] border border-slate-200 dark:border-[#20293D] rounded-3xl w-full max-w-6xl shadow-2xl relative z-10 max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-white"
        >
          {/* Header Bar */}
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-[#1E2638] flex items-center justify-between bg-slate-50/90 dark:bg-[#121724]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 dark:bg-[#CCFF00]/15 text-emerald-700 dark:text-[#CCFF00] flex items-center justify-center border border-emerald-500/20 dark:border-[#CCFF00]/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Outfit'] font-black text-base sm:text-lg text-slate-950 dark:text-white uppercase tracking-tight">
                    {ADMIN_CONFIG.PORTAL_NAME}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 bg-emerald-100 dark:bg-[#CCFF00]/20 text-emerald-800 dark:text-[#CCFF00] border border-emerald-300 dark:border-[#CCFF00]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#CCFF00] animate-pulse" />
                    Local Server Active • Port {ADMIN_CONFIG.SERVER_PORT || 3000}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  Local Database Storage • Zero External Cloud Dependencies
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
                onClick={handleClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1C2436] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {!isAuthenticated ? (
            /* ALWAYS START WITH LOGOUT ADMIN MODE (PASSWORD LOGIN FORM) */
            <div className="p-8 sm:p-12 flex flex-col items-center justify-center max-w-md mx-auto text-center w-full my-auto">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-[#151D2C] text-emerald-600 dark:text-[#CCFF00] flex items-center justify-center mb-5 border border-slate-200 dark:border-[#243046]">
                <Lock className="w-8 h-8" />
              </div>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#161F2E] border border-slate-200 dark:border-[#24334A] text-[11px] font-mono font-semibold text-slate-600 dark:text-[#94A3B8] mb-3">
                <Lock className="w-3 h-3 text-amber-500" />
                <span>Admin Mode Logged Out</span>
              </div>

              <h4 className="font-['Outfit'] font-black text-2xl text-slate-950 dark:text-white uppercase tracking-tight mb-2">
                Local Admin Access
              </h4>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed mb-6">
                Enter the administrator password to view local athlete submissions, monitor local IP network activity, and export reports to Excel.
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
                  Unlock Local Admin Panel
                </button>
              </form>

              <div className="mt-8 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-[#121824] border border-slate-200 dark:border-[#1E2638] text-[11px] text-slate-500 dark:text-[#64748B] w-full text-left space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Default Password:</span>
                  <code className="text-slate-950 dark:text-white font-bold font-mono px-2 py-0.5 rounded bg-white dark:bg-[#182133] border border-slate-200 dark:border-[#283650]">
                    {ADMIN_CONFIG.ADMIN_PASSWORD}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Password file:</span>
                  <code className="text-emerald-700 dark:text-[#CCFF00] font-mono text-[10px]">
                    src/config/adminConfig.ts
                  </code>
                </div>
              </div>
            </div>
          ) : (
            /* AUTHENTICATED LOCAL ADMIN DASHBOARD */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Local IP Network Address Banner */}
              <div className="px-5 py-2.5 bg-slate-100/90 dark:bg-[#121826] border-b border-slate-200 dark:border-[#1E2638] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-600 dark:text-[#CCFF00]" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Local Network IP:{' '}
                    <strong className="font-mono text-slate-950 dark:text-white">
                      {localNetworkUrl}
                    </strong>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                    (Any phone/laptop on same Wi-Fi can open this link)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyLocalAddress(localNetworkUrl)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1A2335] border border-slate-300 dark:border-[#293650] text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition cursor-pointer"
                  >
                    {copiedIp ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    <span>{copiedIp ? 'Copied IP' : 'Copy Local IP'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={refreshData}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1A2335] border border-slate-300 dark:border-[#293650] text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition cursor-pointer"
                    title="Reload from local storage"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Top Stats Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-slate-50/40 dark:bg-[#101522] border-b border-slate-200 dark:border-[#1E2638]">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141A28] border border-slate-200 dark:border-[#20293D]">
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-[#94A3B8] uppercase block">
                    Local Submissions
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
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search athlete name, phone, email..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#151D2C] border border-slate-200 dark:border-[#243046] text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

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

                {/* Excel Export & Clear Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-[#CCFF00] dark:hover:bg-[#BAE600] text-white dark:text-slate-950 font-['Outfit'] font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
                    title="Export local interactions to Microsoft Excel (.xlsx)"
                  >
                    {exportSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Downloaded Excel!</span>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Export Excel (.xlsx)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsConfirmingClear(true)}
                    className="p-1.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 transition cursor-pointer"
                    title="Clear all local entries"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Central Server Excel File Synchronization Banner */}
              <div className="mx-4 sm:mx-5 mt-4 p-4 rounded-2xl bg-emerald-500/5 dark:bg-[#CCFF00]/5 border border-emerald-500/20 dark:border-[#CCFF00]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-[#CCFF00]/10 text-emerald-600 dark:text-[#CCFF00] flex items-center justify-center shrink-0 border border-emerald-500/20 dark:border-[#CCFF00]/30 mt-0.5">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-['Outfit'] font-black text-sm text-slate-950 dark:text-white uppercase tracking-tight">
                        Central Server Excel File
                      </span>
                      <code className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white dark:bg-[#151D2C] border border-slate-200 dark:border-[#24334A] text-emerald-700 dark:text-[#CCFF00]">
                        ./athlete_nutrition_data.xlsx
                      </code>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-[#CCFF00]/15 text-emerald-800 dark:text-[#CCFF00]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#CCFF00] animate-ping" />
                        Live Push Enabled
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1 leading-relaxed">
                      All athlete submissions from the website and external webhooks automatically append directly to the Excel spreadsheet in your main project directory.
                    </p>
                    {pushExcelMessage && (
                      <p className="text-xs font-bold text-emerald-700 dark:text-[#CCFF00] mt-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {pushExcelMessage}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={handlePushCentralExcel}
                    disabled={isPushingExcel}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#161F2E] border border-slate-300 dark:border-[#28374E] text-xs font-['Outfit'] font-bold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:border-slate-400 transition cursor-pointer"
                    title="Force refresh the Excel file in the main code directory"
                  >
                    <FolderSync className={`w-3.5 h-3.5 text-emerald-600 dark:text-[#CCFF00] ${isPushingExcel ? 'animate-spin' : ''}`} />
                    <span>{isPushingExcel ? 'Pushing...' : 'Force Sync Workbook'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadServerExcel}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-[#CCFF00] dark:hover:bg-[#BAE600] text-white dark:text-slate-950 font-['Outfit'] font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
                    title="Download the actual athlete_nutrition_data.xlsx file generated by the server"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Server Excel</span>
                  </button>
                </div>
              </div>

              {/* Submissions Table View */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {filteredInteractions.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="font-['Outfit'] font-bold text-sm text-slate-700 dark:text-slate-300">
                      No matching athlete submissions found.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Submissions made on this device or through local IP ({localNetworkUrl}) will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-[#1E2638] rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 dark:bg-[#141A28] border-b border-slate-200 dark:border-[#1E2638] text-slate-600 dark:text-[#94A3B8] font-mono text-[10px] uppercase tracking-wider">
                            <th className="py-3 px-4">Date / Time</th>
                            <th className="py-3 px-4">Athlete Info</th>
                            <th className="py-3 px-4">Demographics</th>
                            <th className="py-3 px-4">Diet & Strategy</th>
                            <th className="py-3 px-4">Target Energy / Protein</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-[#192234]">
                          {filteredInteractions.map((item) => (
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
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-emerald-100 dark:bg-[#CCFF00]/15 text-emerald-900 dark:text-[#CCFF00] border border-emerald-300 dark:border-[#CCFF00]/30">
                                    <span>{item.source || 'Local Web'}</span>
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-['Outfit'] font-bold text-sm text-slate-950 dark:text-white">
                                    {item.name}
                                  </span>
                                  {item.excelRow ? (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-[#1B2436] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-[#27354E]">
                                      Row #{item.excelRow}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50 dark:bg-[#CCFF00]/10 text-emerald-800 dark:text-[#CCFF00]">
                                      Excel Mapped
                                    </span>
                                  )}
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
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Record Details Modal */}
          {selectedRecord && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
              <div className="bg-white dark:bg-[#111724] border border-slate-200 dark:border-[#20293D] rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1E2638] mb-4">
                  <div>
                    <h4 className="font-['Outfit'] font-black text-xl text-slate-950 dark:text-white">
                      {selectedRecord.name}
                    </h4>
                    <span className="text-xs font-mono text-slate-400">
                      ID: {selectedRecord.id} • {selectedRecord.timestamp}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1C2436] transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#151D2C] border border-slate-200 dark:border-[#222E42]">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Contact</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRecord.contact || 'None Provided'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#151D2C] border border-slate-200 dark:border-[#222E42]">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Diet Style</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRecord.foodStyle}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#151D2C] border border-slate-200 dark:border-[#222E42]">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Age</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRecord.exactAge || selectedRecord.ageGroup}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#151D2C] border border-slate-200 dark:border-[#222E42]">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Height/Weight</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRecord.height || '--'}cm / {selectedRecord.weight || '--'}kg</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#151D2C] border border-slate-200 dark:border-[#222E42]">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Activity</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRecord.activity}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#151D2C] border border-slate-200 dark:border-[#222E42]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Strategy & Target</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                      {selectedRecord.mainGoal} ({selectedRecord.energyGoal})
                    </div>
                    <div className="font-mono text-emerald-600 dark:text-[#CCFF00] font-bold mt-1">
                      {selectedRecord.targetCalories ? `${selectedRecord.targetCalories.toLocaleString()} kcal` : ''} 
                      {selectedRecord.proteinTarget ? ` • ~${selectedRecord.proteinTarget}g Protein` : ''} 
                      {selectedRecord.budget ? ` • ${selectedRecord.budget}` : ''}
                    </div>
                  </div>

                  {selectedRecord.notes && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#151D2C] border border-slate-200 dark:border-[#222E42]">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Personal Notes / Needs</span>
                      <p className="text-slate-700 dark:text-slate-300 italic mt-0.5 whitespace-pre-wrap">
                        "{selectedRecord.notes}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(null)}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-[#1C2536] text-slate-800 dark:text-white font-['Outfit'] font-bold text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Clear All Modal */}
          {isConfirmingClear && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
              <div className="bg-white dark:bg-[#111724] border border-slate-200 dark:border-[#20293D] rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center">
                <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <h4 className="font-['Outfit'] font-black text-lg text-slate-950 dark:text-white uppercase mb-1">
                  Clear All Submissions?
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] mb-5">
                  This will permanently delete all {interactions.length} locally saved athlete records. This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClear(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-[#263348] text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-['Outfit'] font-bold text-xs uppercase cursor-pointer"
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
