import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Cpu,
  Layers,
  Server,
  Database,
  Radio,
  FileCode2,
  CheckCircle2,
  GitBranch,
  ShieldCheck,
  Terminal,
  Activity
} from 'lucide-react';

export const ArchitectureModal: React.FC = () => {
  const { isArchitectureModalOpen, setArchitectureModalOpen } = useApp();
  const [activeTab, setActiveTab] = useState<'SERVICES' | 'KAFKA' | 'REST_APIS' | 'DATA_MODEL'>('SERVICES');

  if (!isArchitectureModalOpen) return null;

  const services = [
    { name: 'User Service', stack: 'Java 21, Spring Boot, Spring Security, JWT, PostgreSQL', responsibility: 'Identity, role-based RBAC authorization (Farmer, FPO, Buyer, Logistics, Admin)' },
    { name: 'Marketplace Service', stack: 'Java 21, Spring Boot, Spring Data JPA, PostgreSQL', responsibility: 'Produce listings, quality grades, availability calendars, farm coordinates' },
    { name: 'Demand Intelligence', stack: 'Python FastAPI, XGBoost, Scikit-learn, Pandas, Redis', responsibility: 'Near-term 7-14 day demand forecasting, seasonality, festive signals, MAE/MAPE validation' },
    { name: 'Matching & Pricing', stack: 'Java 21, Spring Boot, Custom Weighted Match Algorithm', responsibility: 'Multi-factor allocation (price, distance, quality, reliability, capacity) & landed cost' },
    { name: 'Logistics Service', stack: 'Java 21, Spring Boot, Google OR-Tools VRP Solver', responsibility: 'Dynamic micro-hub centroid selection, capacity-aware route optimization, dispatch' },
    { name: 'Traceability Service', stack: 'Java 21, Spring Boot, PostgreSQL, QR Generator', responsibility: 'Produce passport, immutable custody logs, NABL lab test results, batch QR' },
    { name: 'Settlement Service', stack: 'Java 21, Spring Boot, PostgreSQL, Escrow Ledger', responsibility: 'Instant multi-party payment split (Farmer 85.9%, Logistics, Platform), UTR audits' },
    { name: 'Notification Service', stack: 'Java 21, Spring Boot, Apache Kafka, WebSockets / SMS', responsibility: 'Event-driven real-time alerts across farmer, buyer, and carrier roles' }
  ];

  const kafkaTopics = [
    { topic: 'demand.created', producer: 'Demand Service', consumers: 'Demand Intelligence, Matching', description: 'Emitted when a buyer publishes a forward procurement demand' },
    { topic: 'demand.pooled', producer: 'Demand Service', consumers: 'Matching, Notification', description: 'Emitted when fragmented demands aggregate into a bulk pool' },
    { topic: 'forecast.generated', producer: 'Demand Intelligence', consumers: 'Demand, Matching, Notification', description: 'Emitted when AI model generates new 7-day predicted demand signals' },
    { topic: 'supply.listed', producer: 'Marketplace', consumers: 'Matching, Demand Intelligence', description: 'Emitted when farmers or FPOs list available harvest produce' },
    { topic: 'match.created', producer: 'Matching', consumers: 'Marketplace, Logistics, Notification', description: 'Emitted when a supply-demand pair is allocated' },
    { topic: 'shipment.created', producer: 'Logistics', consumers: 'Traceability, Notification', description: 'Emitted when micro-hub aggregation initiates a shipment' },
    { topic: 'route.optimized', producer: 'Logistics (OR-Tools)', consumers: 'Notification, Analytics', description: 'Emitted when optimal VRP route and stops are calculated' },
    { topic: 'batch.created', producer: 'Traceability', consumers: 'Marketplace, Notification', description: 'Emitted when a batch produce passport & QR are minted' },
    { topic: 'delivery.completed', producer: 'Logistics', consumers: 'Settlement, Analytics', description: 'Emitted upon digital proof-of-delivery signoff' },
    { topic: 'settlement.completed', producer: 'Settlement', consumers: 'Notification, Analytics', description: 'Emitted when escrow transfers net realization to farmer bank' }
  ];

  const restEndpoints = [
    { method: 'POST', path: '/api/v1/users/register', purpose: 'Create farmer/buyer/consumer account with RBAC profile' },
    { method: 'POST', path: '/api/v1/auth/login', purpose: 'Authenticate and issue signed JWT token' },
    { method: 'POST', path: '/api/v1/produce', purpose: 'Create farmer produce listing with harvest date & grade' },
    { method: 'GET', path: '/api/v1/produce', purpose: 'Search and query available verified produce' },
    { method: 'POST', path: '/api/v1/demands', purpose: 'Create institutional buyer forward demand requirement' },
    { method: 'GET', path: '/api/v1/demands/pools', purpose: 'Query active pooled demand opportunities' },
    { method: 'GET', path: '/api/v1/demand-signals', purpose: 'Retrieve ML-predicted regional demand and supply gap' },
    { method: 'POST', path: '/api/v1/matches/run', purpose: 'Execute weighted multi-factor matching and allocation' },
    { method: 'POST', path: '/api/v1/pricing/quote', purpose: 'Calculate transparent landed cost and farmer net realization' },
    { method: 'POST', path: '/api/v1/shipments', purpose: 'Create consolidated aggregation shipment at micro-hub' },
    { method: 'POST', path: '/api/v1/routes/optimize', purpose: 'Invoke Google OR-Tools VRP solver to generate stops' },
    { method: 'GET', path: '/api/v1/batches/{id}', purpose: 'Retrieve digital produce passport and verified timeline' },
    { method: 'GET', path: '/api/v1/settlements/{id}', purpose: 'Retrieve immutable escrow settlement breakdown & UTR' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-agri-950 via-agri-900 to-agri-800 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold border border-emerald-400/30">
                   ARCHITECTURE
                </span>
                <span className="text-xs text-slate-300">Production-Ready Enterprise Blueprint</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white mt-0.5">
                Microservices, Kafka Events & REST API Contracts
              </h3>
            </div>
          </div>

          <button
            onClick={() => setArchitectureModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('SERVICES')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'SERVICES'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>8 Microservices</span>
          </button>

          <button
            onClick={() => setActiveTab('KAFKA')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'KAFKA'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Kafka Event Backbone (10 Topics)</span>
          </button>

          <button
            onClick={() => setActiveTab('REST_APIS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'REST_APIS'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>13 REST Endpoints</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'SERVICES' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Spring Cloud Gateway routes incoming requests to isolated Spring Boot 3.x domain microservices and Python ML inference workers.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map((srv, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition shadow-2xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{srv.name}</span>
                      </h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-medium">
                        Spring Boot 3.x
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{srv.responsibility}</p>
                    <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500">
                      Stack: {srv.stack}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'KAFKA' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Apache Kafka decouples services, ensuring eventual consistency, reliable auditing, and asynchronous processing across demand signals and logistics.
              </p>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                {kafkaTopics.map((top, idx) => (
                  <div key={idx} className="p-3 hover:bg-slate-50 transition text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Radio className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {top.topic}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Producer: <strong className="text-slate-700">{top.producer}</strong>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 mt-1.5 pl-6 text-[11px]">
                      <span>{top.description}</span>
                      <span className="text-slate-400 font-mono">
                        Consumers: {top.consumers}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'REST_APIS' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Standard REST API contracts sketched in Section 10 of the  solution architecture specification.
              </p>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                {restEndpoints.map((ep, idx) => (
                  <div key={idx} className="p-2.5 hover:bg-slate-50 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="font-mono font-semibold text-slate-900">{ep.path}</span>
                    </div>
                    <span className="text-xs text-slate-500">{ep.purpose}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Complies with  Technical Requirements
          </span>
          <button
            onClick={() => setArchitectureModalOpen(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
