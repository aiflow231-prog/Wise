/**
 * DATA MANAGEMENT MODAL
 * Export, import, toggle demo data isolation, and wipe controls.
 * Full user sovereignty over private data.
 */

import React, { useState, useRef } from 'react';
import { useWise } from '../context/WiseContext';
import { Download, Upload, Trash2, ToggleLeft, ToggleRight, Database, Shield, AlertTriangle, X } from 'lucide-react';

export const DataManagementModal: React.FC = () => {
  const {
    isDataModalOpen,
    setIsDataModalOpen,
    state,
    toggleDemoData,
    resetAllData,
    exportDataJSON,
    importDataJSON,
  } = useWise();

  const [confirmWipe, setConfirmWipe] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isDataModalOpen) return null;

  const handleDownload = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wise-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJSON(content);
      if (success) {
        setImportStatus('Backup successfully restored!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Failed to parse JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-slate-100">Private Data Controls</h2>
          </div>
          <button
            onClick={() => {
              setIsDataModalOpen(false);
              setConfirmWipe(false);
            }}
            className="text-slate-400 hover:text-slate-200 p-1"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Demo Data Isolation Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-200">Fictional Demo Dataset</span>
              <p className="text-[11px] text-slate-400">
                {state.isDemo
                  ? 'Showing isolated demo scenarios (Lease dispute, Meridian retainer)'
                  : 'Clean private executive slate active'}
              </p>
            </div>
            <button
              onClick={toggleDemoData}
              className={`p-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-mono font-medium transition-colors ${
                state.isDemo
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {state.isDemo ? <ToggleRight className="w-5 h-5 text-amber-400" /> : <ToggleLeft className="w-5 h-5" />}
              <span>{state.isDemo ? 'DEMO' : 'LIVE'}</span>
            </button>
          </div>

          {/* Export JSON */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-200">Export All Data</span>
              <p className="text-[11px] text-slate-400">Download complete encrypted/plaintext JSON backup</p>
            </div>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-medium flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-200">Import Backup</span>
              <p className="text-[11px] text-slate-400">Restore existing WISE OS JSON file</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>
          </div>

          {importStatus && (
            <p className="text-center font-mono text-[11px] text-emerald-400 animate-fadeIn">
              {importStatus}
            </p>
          )}

          {/* Wipe Local Data */}
          <div className="pt-2 border-t border-slate-800/80">
            {!confirmWipe ? (
              <button
                onClick={() => setConfirmWipe(true)}
                className="w-full py-2 rounded-xl text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Application & Wipe Local Storage</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-600/50 space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Permanently wipe all locally stored executive data?</span>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setConfirmWipe(false)}
                    className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      resetAllData();
                      setIsDataModalOpen(false);
                      setConfirmWipe(false);
                    }}
                    className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Confirm Wipe
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
