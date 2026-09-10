import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { apiService } from '../services/apiService';
import { indianStatesData } from '../data/indianStates';
import {
  Sprout,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  UserPlus
} from 'lucide-react';

interface LoginPageProps {
  initialMode?: 'LOGIN' | 'REGISTER';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode = 'LOGIN' }) => {
  const { login, registerUser, setActiveTab, intendedRegistrationRole } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);

  // Update mode if prop changes
  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Sync intended role from Home Join buttons if set
  React.useEffect(() => {
    if (intendedRegistrationRole) {
      setRegRole(intendedRegistrationRole);
    }
  }, [intendedRegistrationRole]);

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>(intendedRegistrationRole || 'FARMER');
  const [regDistrict, setRegDistrict] = useState('');
  const [regState, setRegState] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiService.login(cleanId, cleanPass);
      setIsSubmitting(false);
      login(res.user);
      setActiveTab('dashboard');
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Invalid email or password. Please check your credentials and try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim();
    const cleanMobile = regMobile.replace(/\D/g, '').trim();
    const cleanPassword = regPassword.trim();

    if (!cleanName) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMsg('Mobile number must be exactly 10 digits.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const registered = await apiService.register({
        name: cleanName,
        email: cleanEmail,
        mobile: cleanMobile,
        password: cleanPassword,
        role: regRole,
        district: regDistrict.trim(),
        state: regState.trim()
      });
      setRegSuccess(true);
      setTimeout(() => {
        registerUser(registered);
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 relative">
      <div className="bg-white/95 backdrop-blur-xs max-w-lg w-full rounded-3xl border border-emerald-900/10 shadow-forest-lg overflow-hidden p-6 sm:p-10 space-y-6">
        <div>
          {/* Uzhavan Connect Brand Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-medium shadow-md shadow-emerald-900/10">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-medium tracking-tight text-slate-900 block">
                Uzhavan Connect
              </span>
              <span className="text-[10px] text-emerald-700 font-medium uppercase tracking-wider block">
                Ministry of Consumer Affairs • 
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs: Sign In | Create Account */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl mb-5 text-xs font-medium">
            <button
              type="button"
              onClick={() => { setMode('LOGIN'); setRegSuccess(false); setErrorMsg(''); }}
              className={`flex-1 py-2.5 rounded-lg transition ${
                mode === 'LOGIN'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('REGISTER'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 rounded-lg transition ${
                mode === 'REGISTER'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {regSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl mb-4 flex items-center gap-3 text-xs text-emerald-900 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-emerald-800">Account Created Successfully!</p>
                <p className="text-emerald-700">Connecting to Uzhavan Connect network and redirecting...</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl mb-4 text-xs font-medium animate-fadeIn">
              {errorMsg}
            </div>
          )}

          {mode === 'LOGIN' ? (
            <div>
              <div className="space-y-1 mb-5">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Welcome to Uzhavan Connect
                </h2>
                <p className="text-xs text-slate-500">
                  "Don't wait for the market. Let the market tell the farmer what to grow."
                </p>
              </div>

              {/* Standard Login Form */}
              <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Mobile Number / Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                      placeholder="Enter phone or email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Password</label>
                    <span className="text-emerald-700 hover:underline text-[11px] font-medium cursor-pointer">
                      Forgot Password?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
                  >
                    <span>{isSubmitting ? 'Authenticating...' : 'Login to Uzhavan Connect'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* SIH Evaluator One-Click Credential Fills */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    SIH Quick Demo Logins
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => { setIdentifier('vikram.procurement@metroagri.in'); setPassword('BulkBuyer@2026'); }}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-medium transition text-center cursor-pointer flex flex-col items-center"
                    title="Procure bulk commodities and track 14-stage logistics"
                  >
                    <span className="text-sm">🏭</span>
                    <span className="font-semibold text-[10px] mt-0.5">Bulk Buyer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIdentifier('rajesh.kumar@uzhavanconnect.gov.in'); setPassword('Farmer@2026'); }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-medium transition text-center cursor-pointer flex flex-col items-center"
                  >
                    <span className="text-sm">👨‍🌾</span>
                    <span className="font-semibold text-[10px] mt-0.5">Farmer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIdentifier('anita.procurement@abcretail.in'); setPassword('Buyer@2026'); }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-medium transition text-center cursor-pointer flex flex-col items-center"
                  >
                    <span className="text-sm">🏬</span>
                    <span className="font-semibold text-[10px] mt-0.5">Retail Buyer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIdentifier('ravi.fpo@uzhavanconnect.gov.in'); setPassword('Fpo@2026'); }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-medium transition text-center cursor-pointer flex flex-col items-center"
                  >
                    <span className="text-sm">🌾</span>
                    <span className="font-semibold text-[10px] mt-0.5">FPO</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIdentifier('dispatch@sundartrans.in'); setPassword('Logistics@2026'); }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-medium transition text-center cursor-pointer flex flex-col items-center"
                  >
                    <span className="text-sm">🚚</span>
                    <span className="font-semibold text-[10px] mt-0.5">Logistics</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIdentifier('admin@uzhavanconnect.gov.in'); setPassword('Admin@2026'); }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-medium transition text-center cursor-pointer flex flex-col items-center"
                  >
                    <span className="text-sm">🛡️</span>
                    <span className="font-semibold text-[10px] mt-0.5">Admin</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Create Account Form */
            <div>
              <div className="space-y-1 mb-4">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  Create Your Account
                </h2>
                <p className="text-xs text-slate-500">
                  Join India's demand-first agricultural supply chain ecosystem.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Select Role (Public Registration)
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="FARMER">Farmer (Producer)</option>
                    <option value="RETAIL_BUYER">Retail Buyer</option>
                    <option value="BULK_BUYER">Bulk Buyer (Wholesaler / Processor / Institutional)</option>
                    <option value="FPO_AGGREGATOR">FPO Aggregator</option>
                    <option value="LOGISTICS">Logistics Carrier Transport</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    * Operations/Admin accounts are provisioned by the platform administrator.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Shivani Sharma"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Mobile Number</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        maxLength={10}
                        minLength={10}
                        pattern="[0-9]{10}"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-2 py-2 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">State</label>
                    <select
                      value={regState}
                      onChange={(e) => {
                        setRegState(e.target.value);
                        setRegDistrict('');
                      }}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
                    >
                      <option value="" disabled>Select State</option>
                      {indianStatesData.states.map((s: any) => (
                        <option key={s.state} value={s.state}>{s.state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">District</label>
                    <select
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      required
                      disabled={!regState}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs disabled:opacity-50"
                    >
                      <option value="" disabled>Select District</option>
                      {regState && indianStatesData.states.find((s: any) => s.state === regState)?.districts.map((d: string) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="user@example.com"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-2 py-2 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        required
                        minLength={6}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-2 py-2 text-xs"
                      />
                    </div>
                  </div>
                </div>



                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isSubmitting ? 'Creating Profile...' : 'Complete Registration'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {mode === 'LOGIN' ? (
            <>
              <span>New to Uzhavan Connect?</span>
              <button
                onClick={() => setMode('REGISTER')}
                className="text-emerald-700 font-medium hover:underline"
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              <span>Already registered?</span>
              <button
                onClick={() => setMode('LOGIN')}
                className="text-emerald-700 font-medium hover:underline"
              >
                Continue to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
