import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
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
  UserPlus,
  ShieldCheck,
  Sparkles,
  Building2,
  Truck
} from 'lucide-react';

interface LoginPageProps {
  initialMode?: 'LOGIN' | 'REGISTER';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode = 'LOGIN' }) => {
  const { login, registerUser, setActiveTab, intendedRegistrationRole } = useApp();
  const { startPostRegistrationOnboarding } = useLanguage();

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
  const [loginRole, setLoginRole] = useState<UserRole>('FARMER');

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
      const res = await apiService.login(loginRole, cleanId, cleanPass);
      setIsSubmitting(false);
      // login() internally executes navigateToTab(getAuthorizedDashboardTab(role), false, role)
      login(res.user);
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
        startPostRegistrationOnboarding();
      }, 800);

    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 relative">
      {/* Soft ambient decorative glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-[#ccd5ae]/20 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#e9edc9]/25 blur-3xl pointer-events-none -z-10" />

      <div className="bg-white max-w-lg w-full rounded-[36px] border border-[#ccd5ae]/60 shadow-forest overflow-hidden p-7 sm:p-10 space-y-6">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#01472e] flex items-center justify-center text-[#fefae0] font-bold shadow-md">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight text-[#01472e]">
                  Uzhavan Connect
                </span>
                <span className="text-[10px] font-bold bg-[#eaf4ec] text-[#01472e] px-2 py-0.5 rounded-full border border-[#a3b18a]/40">
                  SIH26033
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Ministry of Consumer Affairs, Food & Public Distribution
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs: Sign In | Create Account */}
          <div className="flex items-center bg-[#faf9f5] p-1.5 rounded-2xl mb-6 border border-[#ccd5ae]/40 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('LOGIN'); setRegSuccess(false); setErrorMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
                mode === 'LOGIN'
                  ? 'bg-[#01472e] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#01472e]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('REGISTER'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
                mode === 'REGISTER'
                  ? 'bg-[#01472e] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#01472e]'
              }`}
            >
              Create Account
            </button>
          </div>

          {regSuccess && (
            <div className="p-4 bg-[#eaf4ec] border border-[#a3b18a]/60 rounded-2xl mb-4 flex items-center gap-3 text-xs text-[#01472e] animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-[#01472e] shrink-0" />
              <div>
                <p className="font-bold text-[#01472e]">Account Created Successfully!</p>
                <p className="text-slate-600 font-normal">Connecting to Uzhavan Connect network and redirecting to console...</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl mb-4 text-xs font-medium animate-in fade-in duration-200">
              {errorMsg}
            </div>
          )}

          {mode === 'LOGIN' ? (
            <div>
              <div className="space-y-1 mb-5">
                <h2 className="text-xl font-bold tracking-tight text-[#01472e]">
                  Operational Access Portal
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  "Don't wait for the market. Let the market tell the farmer what to grow."
                </p>
              </div>

              {/* Standard Login Form */}
              <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">

                    Select Role
                  </label>
                  <select
                    value={loginRole}
                    onChange={(e) => setLoginRole(e.target.value as UserRole)}
                    className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#01472e] focus:bg-white transition"
                  >
                    <option value="FARMER">Farmer (Producer)</option>
                    <option value="RETAIL_BUYER">Retail Buyer</option>
                    <option value="BULK_BUYER">Bulk Buyer</option>
                    <option value="FPO_AGGREGATOR">FPO Aggregator</option>
                    <option value="LOGISTICS">Logistics Carrier</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Mobile Number / Registered Email
                  </label>

                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#01472e] focus:bg-white transition"
                      placeholder="Enter phone or email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700">Account Password</label>
                    <span className="text-[#01472e] hover:underline text-[11px] font-semibold cursor-pointer">
                      Forgot Password?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#01472e] focus:bg-white transition"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#01472e] hover:bg-[#025a3b] text-white font-semibold rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-xs cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span>{isSubmitting ? 'Authenticating...' : 'Login to Uzhavan Connect'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* SIH Evaluator One-Click Credential Fills */}
              <div className="mt-6 pt-5 border-t border-[#ccd5ae]/40">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    SIH Demo Quick-Logins (One-Click)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => { setIdentifier('vikram.procurement@metroagri.in'); setPassword('BulkBuyer@2026'); }}
                    className="p-2.5 rounded-2xl bg-[#faf9f5] hover:bg-[#eaf4ec] text-[#01472e] border border-[#ccd5ae]/60 font-semibold transition text-center cursor-pointer flex flex-col items-center group shadow-2xs"
                    title="Procure bulk commodities and track 14-stage logistics"
                  >
                    <span className="text-base group-hover:scale-110 transition">🏭</span>
                    <span className="font-bold text-[10px] mt-1">Bulk Buyer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIdentifier('rajesh.kumar@uzhavanconnect.gov.in'); setPassword('Farmer@2026'); }}
                    className="p-2.5 rounded-2xl bg-[#faf9f5] hover:bg-[#eaf4ec] text-[#01472e] border border-[#ccd5ae]/60 font-semibold transition text-center cursor-pointer flex flex-col items-center group shadow-2xs"
                  >
                    <span className="text-base group-hover:scale-110 transition">👨‍🌾</span>
                    <span className="font-bold text-[10px] mt-1">Farmer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIdentifier('anita.procurement@abcretail.in'); setPassword('Buyer@2026'); }}
                    className="p-2.5 rounded-2xl bg-[#faf9f5] hover:bg-[#eaf4ec] text-[#01472e] border border-[#ccd5ae]/60 font-semibold transition text-center cursor-pointer flex flex-col items-center group shadow-2xs"
                  >
                    <span className="text-base group-hover:scale-110 transition">🏬</span>
                    <span className="font-bold text-[10px] mt-1">Retail Buyer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIdentifier('ravi.fpo@uzhavanconnect.gov.in'); setPassword('Fpo@2026'); }}
                    className="p-2.5 rounded-2xl bg-[#faf9f5] hover:bg-[#eaf4ec] text-[#01472e] border border-[#ccd5ae]/60 font-semibold transition text-center cursor-pointer flex flex-col items-center group shadow-2xs"
                  >
                    <span className="text-base group-hover:scale-110 transition">🌾</span>
                    <span className="font-bold text-[10px] mt-1">FPO Hub</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIdentifier('dispatch@sundartrans.in'); setPassword('Logistics@2026'); }}
                    className="p-2.5 rounded-2xl bg-[#faf9f5] hover:bg-[#eaf4ec] text-[#01472e] border border-[#ccd5ae]/60 font-semibold transition text-center cursor-pointer flex flex-col items-center group shadow-2xs"
                  >
                    <span className="text-base group-hover:scale-110 transition">🚚</span>
                    <span className="font-bold text-[10px] mt-1">Logistics</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIdentifier('admin@uzhavanconnect.gov.in'); setPassword('Admin@2026'); }}
                    className="p-2.5 rounded-2xl bg-[#faf9f5] hover:bg-[#eaf4ec] text-[#01472e] border border-[#ccd5ae]/60 font-semibold transition text-center cursor-pointer flex flex-col items-center group shadow-2xs"
                  >
                    <span className="text-base group-hover:scale-110 transition">🛡️</span>
                    <span className="font-bold text-[10px] mt-1">Admin</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Create Account Form */
            <div>
              <div className="space-y-1 mb-4">
                <h2 className="text-xl font-bold tracking-tight text-[#01472e]">
                  Create Verified Account
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Join India's demand-first agricultural supply chain ecosystem.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Select Role (Public Registration)
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#01472e]"
                  >
                    <option value="FARMER">Farmer (Producer)</option>
                    <option value="RETAIL_BUYER">Retail Buyer</option>
                    <option value="BULK_BUYER">Bulk Buyer (Wholesaler / Processor / Institutional)</option>
                    <option value="FPO_AGGREGATOR">FPO Aggregator</option>
                    <option value="LOGISTICS">Logistics Carrier Transport</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    * Apex Administrator accounts are provisioned by Ministry Platform Admin.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Shivani Sharma"
                      required
                      className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#01472e]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mobile Number</label>
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
                        className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl pl-8 pr-2.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#01472e]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">State</label>
                    <select
                      value={regState}
                      onChange={(e) => {
                        setRegState(e.target.value);
                        setRegDistrict('');
                      }}
                      required
                      className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#01472e]"
                    >
                      <option value="" disabled>Select State</option>
                      {indianStatesData.states.map((s: any) => (
                        <option key={s.state} value={s.state}>{s.state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">District</label>
                    <select
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      required
                      disabled={!regState}
                      className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#01472e] disabled:opacity-50"
                    >
                      <option value="" disabled>Select District</option>
                      {regState && indianStatesData.states.find((s: any) => s.state === regState)?.districts.map((d: string) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="user@example.com"
                        required
                        className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl pl-8 pr-2.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#01472e]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        required
                        minLength={6}
                        className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl pl-8 pr-2.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#01472e]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#01472e] hover:bg-[#025a3b] text-white font-semibold rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-xs cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isSubmitting ? 'Creating Profile...' : 'Complete Registration'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#ccd5ae]/40 flex items-center justify-between text-xs text-slate-500 font-medium">
          {mode === 'LOGIN' ? (
            <>
              <span>New to Uzhavan Connect?</span>
              <button
                onClick={() => setMode('REGISTER')}
                className="text-[#01472e] font-bold hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              <span>Already registered?</span>
              <button
                onClick={() => setMode('LOGIN')}
                className="text-[#01472e] font-bold hover:underline cursor-pointer"
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

