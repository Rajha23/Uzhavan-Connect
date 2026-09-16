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
  Truck,
  ShoppingBag,
  Users
} from 'lucide-react';

interface LoginPageProps {
  initialMode?: 'LOGIN' | 'REGISTER';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode = 'LOGIN' }) => {
  const { login, registerUser, setActiveTab, intendedRegistrationRole } = useApp();
  const { startPostRegistrationOnboarding, t } = useLanguage();

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
  
  // Extra role-specific registration fields
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regFpoCert, setRegFpoCert] = useState('');
  const [regPan, setRegPan] = useState('');
  const [regGst, setRegGst] = useState('');
  const [regBusinessProof, setRegBusinessProof] = useState('');
  const [regDrivingLicence, setRegDrivingLicence] = useState('');
  const [regVehicleRc, setRegVehicleRc] = useState('');

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
    if (regRole === 'FARMER' && !regAadhaar.trim()) {
      setErrorMsg('Please enter your Aadhaar / Farmer ID.');
      return;
    }
    if (regRole === 'FPO_AGGREGATOR' && (!regFpoCert.trim() || !regPan.trim())) {
      setErrorMsg('Please enter FPO Registration Certificate and PAN.');
      return;
    }
    if ((regRole === 'RETAIL_BUYER' || regRole === 'BULK_BUYER') && (!regPan.trim() && !regGst.trim() || !regBusinessProof.trim())) {
      setErrorMsg('Please enter PAN/GST and Business Proof.');
      return;
    }
    if (regRole === 'LOGISTICS' && (!regDrivingLicence.trim() || !regVehicleRc.trim())) {
      setErrorMsg('Please enter Driving Licence and Vehicle RC.');
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
        state: regState.trim(),
        aadhaar: regAadhaar.trim(),
        fpoCert: regFpoCert.trim(),
        pan: regPan.trim(),
        gst: regGst.trim(),
        businessProof: regBusinessProof.trim(),
        drivingLicence: regDrivingLicence.trim(),
        vehicleRc: regVehicleRc.trim()
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
              </div>
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
              {t('auth.signIn', undefined, 'Sign In')}
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
              {t('auth.createAccount', undefined, 'Create Account')}
            </button>
          </div>

          {regSuccess && (
            <div className="p-4 bg-[#eaf4ec] border border-[#a3b18a]/60 rounded-2xl mb-4 flex items-center gap-3 text-xs text-[#01472e] animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-[#01472e] shrink-0" />
              <div>
                <p className="font-bold text-[#01472e]">{t('common.success', undefined, 'Account Created Successfully!')}</p>
                <p className="text-slate-600 font-normal">{t('auth.connectingNetwork', undefined, 'Connecting to Uzhavan Connect network and redirecting to console...')}</p>
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
                  {t('auth.welcomeTitle', undefined, 'Operational Access Portal')}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  "{t('footer.philosophyQuote', undefined, "Don't wait for the market. Let the market tell the farmer what to grow.")}"
                </p>
              </div>

              {/* Standard Login Form */}
              <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    {t('auth.selectRole', undefined, 'Select Role')}
                  </label>
                  <select
                    value={loginRole}
                    onChange={(e) => setLoginRole(e.target.value as UserRole)}
                    className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#01472e] focus:bg-white transition"
                  >
                    <option value="FARMER">{t('roles.farmer', undefined, 'Farmer (Producer)')}</option>
                    <option value="RETAIL_BUYER">{t('roles.buyer', undefined, 'Retail Buyer')}</option>
                    <option value="BULK_BUYER">{t('roles.bulk_buyer', undefined, 'Bulk Buyer')}</option>
                    <option value="FPO_AGGREGATOR">{t('roles.fpo', undefined, 'FPO Aggregator')}</option>
                    <option value="LOGISTICS">{t('roles.logistics', undefined, 'Logistics Carrier')}</option>
                    <option value="ADMIN">{t('roles.admin', undefined, 'Administrator')}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    {t('auth.mobileOrEmail', undefined, 'Mobile Number / Registered Email')}
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
                    <label className="font-bold text-slate-700">{t('auth.password', undefined, 'Account Password')}</label>
                    <span className="text-[#01472e] hover:underline text-[11px] font-semibold cursor-pointer">
                      {t('auth.forgotPassword', undefined, 'Forgot Password?')}
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
                    <span>{isSubmitting ? t('common.loading', undefined, 'Authenticating...') : t('auth.loginButton', undefined, 'Login to Uzhavan Connect')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* SIH Evaluator One-Click Credential Fills */}
              <div className="mt-6 pt-5 border-t border-[#ccd5ae]/40">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t('auth.quickDemoLogins', undefined, 'Demo Quick-Logins (One-Click)')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => { setIdentifier('vikram.procurement@metroagri.in'); setPassword('BulkBuyer@2026'); }}
                    className="p-2.5 rounded-2xl bg-[#faf9f5] hover:bg-[#eaf4ec] text-[#01472e] border border-[#ccd5ae]/60 font-semibold transition text-center cursor-pointer flex flex-col items-center group shadow-2xs"
                    title="Procure bulk commodities and track 14-stage logistics"
                  >
                    <Building2 className="w-5 h-5 text-[#01472e] group-hover:scale-110 transition" />
                    <span className="font-bold text-[10px] mt-1.5">{t('roles.bulk_buyer', undefined, 'Bulk Buyer')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIdentifier('rajesh.kumar@uzhavanconnect.gov.in'); setPassword('Farmer@2026'); }}
                    className="p-2.5 rounded-2xl bg-[#faf9f5] hover:bg-[#eaf4ec] text-[#01472e] border border-[#ccd5ae]/60 font-semibold transition text-center cursor-pointer flex flex-col items-center group shadow-2xs"
                  >
                    <Sprout className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition" />
                    <span className="font-bold text-[10px] mt-1.5">{t('roles.farmer', undefined, 'Farmer')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIdentifier('anita.procurement@abcretail.in'); setPassword('Buyer@2026'); }}
                    className="p-2.5 rounded-2xl bg-[#faf9f5] hover:bg-[#eaf4ec] text-[#01472e] border border-[#ccd5ae]/60 font-semibold transition text-center cursor-pointer flex flex-col items-center group shadow-2xs"
                  >
                    <ShoppingBag className="w-5 h-5 text-amber-600 group-hover:scale-110 transition" />
                    <span className="font-bold text-[10px] mt-1.5">{t('roles.buyer', undefined, 'Retail Buyer')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIdentifier('ravi.fpo@uzhavanconnect.gov.in'); setPassword('Fpo@2026'); }}
                    className="p-2.5 rounded-2xl bg-[#faf9f5] hover:bg-[#eaf4ec] text-[#01472e] border border-[#ccd5ae]/60 font-semibold transition text-center cursor-pointer flex flex-col items-center group shadow-2xs"
                  >
                    <Users className="w-5 h-5 text-blue-600 group-hover:scale-110 transition" />
                    <span className="font-bold text-[10px] mt-1.5">{t('roles.fpo', undefined, 'FPO Hub')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIdentifier('dispatch@sundartrans.in'); setPassword('Logistics@2026'); }}
                    className="p-2.5 rounded-2xl bg-[#faf9f5] hover:bg-[#eaf4ec] text-[#01472e] border border-[#ccd5ae]/60 font-semibold transition text-center cursor-pointer flex flex-col items-center group shadow-2xs"
                  >
                    <Truck className="w-5 h-5 text-teal-600 group-hover:scale-110 transition" />
                    <span className="font-bold text-[10px] mt-1.5">{t('roles.logistics', undefined, 'Logistics')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIdentifier('admin@uzhavanconnect.gov.in'); setPassword('Admin@2026'); }}
                    className="p-2.5 rounded-2xl bg-[#faf9f5] hover:bg-[#eaf4ec] text-[#01472e] border border-[#ccd5ae]/60 font-semibold transition text-center cursor-pointer flex flex-col items-center group shadow-2xs"
                  >
                    <ShieldCheck className="w-5 h-5 text-[#01472e] group-hover:scale-110 transition" />
                    <span className="font-bold text-[10px] mt-1.5">{t('roles.admin', undefined, 'Admin')}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Create Account Form */
            <div>
              <div className="space-y-1 mb-4">
                <h2 className="text-xl font-bold tracking-tight text-[#01472e]">
                  {t('auth.createAccount', undefined, 'Create Verified Account')}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {t('auth.registerPrompt', undefined, "Join India's demand-first agricultural supply chain ecosystem.")}
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {t('auth.selectOperatingRole', undefined, 'Select Operating Role')}
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#01472e]"
                  >
                    <option value="FARMER">{t('roles.farmer', undefined, 'Farmer (Producer)')}</option>
                    <option value="RETAIL_BUYER">{t('roles.buyer', undefined, 'Retail Buyer')}</option>
                    <option value="BULK_BUYER">{t('roles.bulk_buyer', undefined, 'Bulk Buyer (Wholesaler / Processor / Institutional)')}</option>
                    <option value="FPO_AGGREGATOR">{t('roles.fpo', undefined, 'FPO Aggregator')}</option>
                    <option value="LOGISTICS">{t('roles.logistics', undefined, 'Logistics Carrier Transport')}</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    {t('auth.adminProvisionNote', undefined, '* Apex Administrator accounts are provisioned by Ministry Platform Admin.')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{t('auth.fullName', undefined, 'Full Name')}</label>
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
                    <label className="font-bold text-slate-700 block mb-1">{t('profile.mobileContact', undefined, 'Mobile Number')}</label>
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
                    <label className="font-bold text-slate-700 block mb-1">{t('common.location', undefined, 'State')}</label>
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
                    <label className="font-bold text-slate-700 block mb-1">{t('common.location', undefined, 'District')}</label>
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
                  {regRole === 'FARMER' && (
                    <div className="col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Aadhaar / Farmer ID</label>
                      <input
                        type="text"
                        value={regAadhaar}
                        onChange={(e) => setRegAadhaar(e.target.value)}
                        placeholder="e.g. 1234 5678 9012"
                        required
                        className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#01472e]"
                      />
                    </div>
                  )}

                  {regRole === 'FPO_AGGREGATOR' && (
                    <>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">FPO Registration/Certificate</label>
                        <input
                          type="text"
                          value={regFpoCert}
                          onChange={(e) => setRegFpoCert(e.target.value)}
                          placeholder="Reg No."
                          required
                          className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#01472e]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">PAN</label>
                        <input
                          type="text"
                          value={regPan}
                          onChange={(e) => setRegPan(e.target.value)}
                          placeholder="ABCDE1234F"
                          required
                          className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#01472e]"
                        />
                      </div>
                    </>
                  )}

                  {(regRole === 'RETAIL_BUYER' || regRole === 'BULK_BUYER') && (
                    <>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">PAN / GST</label>
                        <input
                          type="text"
                          value={regPan}
                          onChange={(e) => {
                            setRegPan(e.target.value);
                            setRegGst(e.target.value);
                          }}
                          placeholder="PAN or GSTIN"
                          required
                          className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#01472e]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Business Proof</label>
                        <input
                          type="text"
                          value={regBusinessProof}
                          onChange={(e) => setRegBusinessProof(e.target.value)}
                          placeholder="Licence No / Reg No"
                          required
                          className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#01472e]"
                        />
                      </div>
                    </>
                  )}

                  {regRole === 'LOGISTICS' && (
                    <>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Driving Licence</label>
                        <input
                          type="text"
                          value={regDrivingLicence}
                          onChange={(e) => setRegDrivingLicence(e.target.value)}
                          placeholder="DL Number"
                          required
                          className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#01472e]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Vehicle RC</label>
                        <input
                          type="text"
                          value={regVehicleRc}
                          onChange={(e) => setRegVehicleRc(e.target.value)}
                          placeholder="Registration No"
                          required
                          className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#01472e]"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{t('common.email', undefined, 'Email')}</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. shivani@email.com"
                        required
                        className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl pl-8 pr-2.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#01472e]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{t('auth.password', undefined, 'Password')}</label>
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
                    <span>{isSubmitting ? t('common.loading', undefined, 'Creating Profile...') : t('auth.completeRegistration', undefined, 'Complete Registration')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#ccd5ae]/40 flex items-center justify-between text-xs text-slate-500 font-medium">
          {mode === 'LOGIN' ? (
            <>
              <span>{t('auth.noAccount', undefined, "Don't have an account?")}</span>
              <button
                onClick={() => setMode('REGISTER')}
                className="text-[#01472e] font-bold hover:underline cursor-pointer"
              >
                {t('auth.createAccount', undefined, 'Create Account')}
              </button>
            </>
          ) : (
            <>
              <span>{t('auth.haveAccount', undefined, 'Already have an operational account?')}</span>
              <button
                onClick={() => setMode('LOGIN')}
                className="text-[#01472e] font-bold hover:underline cursor-pointer"
              >
                {t('auth.signIn', undefined, 'Continue to Sign In')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


