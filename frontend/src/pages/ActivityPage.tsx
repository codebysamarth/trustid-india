import React, { useState, useEffect } from 'react';
import {
  Activity,
  Box,
  Layers,
  FileCheck,
  Trash2,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Search,
  Cpu,
  Info,
} from 'lucide-react';
import { fetchBlockchainActivity, fetchBlockchainStatus } from '../services/api';
import { BlockchainEventLog } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const ActivityPage: React.FC = () => {
  const [events, setEvents] = useState<BlockchainEventLog[]>([]);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    setIsLoading(true);
    try {
      const [actRes, netRes] = await Promise.all([
        fetchBlockchainActivity(100),
        fetchBlockchainStatus(),
      ]);

      if (actRes.success) {
        setEvents(actRes.events || []);
      }
      if (netRes.success) {
        setNetworkInfo(netRes.blockchain);
      }
    } catch (err) {
      console.warn('Error loading activity:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    if (filterType === 'ALL') return true;
    return e.eventName === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <Activity className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-700">
              Audit Transparency
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Blockchain Activity Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time event stream queried directly from IssuerRegistry and CredentialStatusRegistry smart contracts.
          </p>
        </div>

        <button
          onClick={loadActivity}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Ledger Events
        </button>
      </div>

      {/* Network Stats Cards */}
      {networkInfo && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Node Status</span>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  networkInfo.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="text-sm font-bold text-slate-900">
                {networkInfo.connected ? 'Connected to EVM' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Current Block</span>
            <div className="text-base font-extrabold font-mono text-emerald-700">
              #{networkInfo.currentBlock ?? '0'}
            </div>
          </div>

          <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Network ID</span>
            <div className="text-base font-extrabold font-mono text-slate-800">
              Chain {networkInfo.chainId || 31337}
            </div>
          </div>

          <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Recorded Events</span>
            <div className="text-base font-extrabold font-mono text-slate-800">
              {events.length} Events
            </div>
          </div>
        </div>
      )}

      {/* Events Table Container */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'CredentialRegistered', 'CredentialRevoked', 'IssuerRegistered'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterType === t
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {t === 'ALL'
                  ? 'All Events'
                  : t === 'CredentialRegistered'
                  ? 'Credentials Issued'
                  : t === 'CredentialRevoked'
                  ? 'Revocations'
                  : 'University Accreditations'}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500">
            Showing {filteredEvents.length} transactions
          </span>
        </div>

        {/* Table */}
        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No events found matching filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Block</th>
                  <th className="p-3">Transaction Hash</th>
                  <th className="p-3">Contract Address</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((evt, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="p-3">
                      <span
                        className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          evt.eventName === 'CredentialRegistered'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : evt.eventName === 'CredentialRevoked'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-teal-50 text-teal-800 border border-teal-200'
                        }`}
                      >
                        {evt.eventName}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">
                      #{evt.blockNumber}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-emerald-700">
                      {evt.transactionHash?.substring(0, 14)}...
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">
                      {evt.contractAddress?.substring(0, 10)}...
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
