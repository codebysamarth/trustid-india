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
  const [selectedEvent, setSelectedEvent] = useState<BlockchainEventLog | null>(null);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
              On-Chain Audit Transparency
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Blockchain Activity Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time event stream queried directly from IssuerRegistry and CredentialStatusRegistry smart contracts on the local EVM blockchain.
          </p>
        </div>

        <button
          onClick={loadActivity}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Activity Logs
        </button>
      </div>

      {/* Network Stats Cards */}
      {networkInfo && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#131F42]/60 border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400">Node Status</span>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  networkInfo.connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span className="text-sm font-bold text-white">
                {networkInfo.connected ? 'Connected to EVM' : 'Offline / Standalone'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Chain ID: {networkInfo.chainId}
            </span>
          </div>

          <div className="bg-[#131F42]/60 border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400">Current Block</span>
            <p className="text-lg font-bold text-cyan-300 font-mono">
              #{networkInfo.currentBlock || 0}
            </p>
            <span className="text-[10px] text-slate-400">Hardhat Localhost</span>
          </div>

          <div className="bg-[#131F42]/60 border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400">IssuerRegistry Contract</span>
            <p className="text-xs font-mono text-slate-300 truncate font-semibold">
              {networkInfo.contracts?.IssuerRegistry?.address
                ? `${networkInfo.contracts.IssuerRegistry.address.substring(0, 10)}...`
                : 'Not Deployed'}
            </p>
            <span className="text-[10px] text-emerald-400">Accreditation Trust Anchor</span>
          </div>

          <div className="bg-[#131F42]/60 border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400">Status Registry Contract</span>
            <p className="text-xs font-mono text-slate-300 truncate font-semibold">
              {networkInfo.contracts?.CredentialStatusRegistry?.address
                ? `${networkInfo.contracts.CredentialStatusRegistry.address.substring(0, 10)}...`
                : 'Not Deployed'}
            </p>
            <span className="text-[10px] text-indigo-400">O(1) Status Verification</span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5">
          {['ALL', 'CredentialRegistered', 'CredentialRevoked', 'IssuerRegistered', 'IssuerAuthorized'].map(
            (t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  filterType === t
                    ? 'bg-cyan-600 text-white font-semibold shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {t === 'ALL' ? 'All On-Chain Events' : t}
              </button>
            )
          )}
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredEvents.length} real blockchain events
        </span>
      </div>

      {/* Event Stream Table */}
      <div className="bg-[#131F42]/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Activity className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">
              No Blockchain Events Found
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Issue a credential or register an issuer to see real events emitted from the smart contracts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0A1024] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Event Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Block #</th>
                  <th className="py-3 px-4">Transaction Hash</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono border ${
                          evt.eventName === 'CredentialRegistered'
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                            : evt.eventName === 'CredentialRevoked'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                        }`}
                      >
                        {evt.eventName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-xs text-slate-200">
                      {evt.description}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-cyan-400">
                      #{evt.blockNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {evt.transactionHash.substring(0, 14)}...
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(evt.timestamp * 1000).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedEvent(evt)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-2xl w-full bg-[#0E172E] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-cyan-400" />
                Decentralized Event Audit Details
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">Event:</span>
                  <span className="font-bold text-cyan-300 font-mono">
                    {selectedEvent.eventName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Block Number:</span>
                  <span className="font-bold text-white font-mono">
                    #{selectedEvent.blockNumber}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">Transaction Hash:</span>
                  <span className="font-mono text-[11px] text-slate-300 break-all">
                    {selectedEvent.transactionHash}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">Contract Address:</span>
                  <span className="font-mono text-[11px] text-slate-300 break-all">
                    {selectedEvent.contractAddress}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Decoded Event Parameters:
                </span>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-200 overflow-x-auto">
                  {JSON.stringify(selectedEvent.args, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
