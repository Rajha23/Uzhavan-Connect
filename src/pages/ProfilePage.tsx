import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  MapPin,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
  Building2,
  Sprout,
  Truck,
  Award,
  ArrowRight,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Lock,
  Save,
  X,
  Sparkles,
  Check,
  Briefcase
} from 'lucide-react';
import { LanguageSettingsCard } from '../components/LanguageSettingsCard';
import { NotificationPreferencesCard } from '../components/NotificationPreferencesCard';

export const ProfilePage: React.FC = () => {
  const { currentUser, currentRole, updateCurrentUserProfile } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form edit states initialized from currentUser
  const [editName, setEditName] = useState(currentUser.name || '');
  const [editPhone, setEditPhone] = useState(currentUser.phone || '');
  const [editOrganization, setEditOrganization] = useState(currentUser.organization || '');
  const [editLocation, setEditLocation] = useState(currentUser.location || '');
  const [editVillage, setEditVillage] = useState(currentUser.village || '');
  const [editDistrict, setEditDistrict] = useState(currentUser.district || '');
  const [editState, setEditState] = useState(currentUser.state || 'Tamil Nadu');
  const [editFarmSize, setEditFarmSize] = useState<number | string>(currentUser.farmSizeAcres || '');
  const [editMainCrops, setEditMainCrops] = useState<string>(
    currentUser.mainCrops ? currentUser.mainCrops.join(', ') : ''
  );
  const [editFpoName, setEditFpoName] = useState(currentUser.fpoName || '');

  // Reset form to active currentUser values
  const handleStartEditing = () => {
    setEditName(currentUser.name || '');
    setEditPhone(currentUser.phone || '');
    setEditOrganization(currentUser.organization || '');
    setEditLocation(currentUser.location || '');
    setEditVillage(currentUser.village || '');
    setEditDistrict(currentUser.district || '');
    setEditState(currentUser.state || 'Tamil Nadu');
    setEditFarmSize(currentUser.farmSizeAcres || '');
    setEditMainCrops(currentUser.mainCrops ? currentUser.mainCrops.join(', ') : '');
    setEditFpoName(currentUser.fpoName || '');
    setSuccessMessage('');
    setErrorMessage('');
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setErrorMessage('');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!editName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const cropsArray = editMainCrops
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const computedLocation =
        editLocation.trim() ||
        (editDistrict ? `${editDistrict}, ${editState}` : currentUser.location);

      const permittedUpdates = {
        name: editName.trim(),
        phone: editPhone.trim(),
        organization: editOrganization.trim(),
        location: computedLocation,
        village: editVillage.trim() || undefined,
        district: editDistrict.trim() || undefined,
        state: editState.trim() || undefined,
        farmSizeAcres: editFarmSize ? Number(editFarmSize) : undefined,
        mainCrops: cropsArray.length > 0 ? cropsArray : undefined,
        fpoName: editFpoName.trim() || undefined
      };

      const success = await updateCurrentUserProfile(permittedUpdates);
      if (success) {
        setSuccessMessage('Profile updated successfully. Changes have been securely persisted.');
        setIsEditing(false);
        setTimeout(() => setSuccessMessage(''), 4500);
      } else {
        setErrorMessage('Failed to update profile. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while updating profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleIcon = () => {
    switch (currentRole) {
      case 'FARMER':
        return <Sprout className="w-5 h-5 text-[#fefae0]" />;
      case 'FPO_AGGREGATOR':
        return <Building2 className="w-5 h-5 text-[#fefae0]" />;
      case 'BULK_BUYER':
      case 'RETAIL_BUYER':
        return <Building2 className="w-5 h-5 text-[#fefae0]" />;
      case 'LOGISTICS':
        return <Truck className="w-5 h-5 text-[#fefae0]" />;
      case 'ADMIN':
        return <ShieldCheck className="w-5 h-5 text-[#fefae0]" />;
      default:
        return <User className="w-5 h-5 text-[#fefae0]" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-[#eaf4ec] border border-[#a3b18a]/60 rounded-2xl flex items-center gap-3 text-xs text-[#01472e] shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#01472e] shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-900 shadow-sm animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Profile Header Hero Card */}
      <div className="relative overflow-hidden rounded-[32px] p-7 sm:p-10 border border-[#01472e]/20 shadow-forest bg-gradient-to-br from-[#01472e] via-[#025a3b] to-[#013824] text-white">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-[#e9edc9]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#013824] border-2 border-[#ccd5ae]/40 text-white flex items-center justify-center text-4xl shadow-xl shrink-0 overflow-hidden">
                {currentUser.avatar ? (
                  <span className="text-4xl">{currentUser.avatar}</span>
                ) : (
                  <span className="text-3xl">
                    {currentRole === 'BULK_BUYER' ? '🏭' : currentRole === 'ADMIN' ? '⚙️' : currentRole === 'LOGISTICS' ? '🚛' : currentRole === 'FPO_AGGREGATOR' ? '🏛️' : '👨‍🌾'}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 bg-[#ccd5ae] text-[#01472e] p-1.5 rounded-xl shadow-md border border-white">
                <ShieldCheck className="w-4 h-4 text-[#01472e]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {currentUser.name || 'Member'}
                </h1>
                <span className="inline-flex items-center gap-1.5 bg-[#fefae0]/20 backdrop-blur-md text-[#fefae0] text-xs font-semibold px-3 py-1 rounded-full border border-[#fefae0]/30">
                  {getRoleIcon()}
                  <span>{currentRole.replace('_', ' ')}</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-400/20 text-emerald-200 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  <Check className="w-3 h-3" />
                  <span>Aadhaar / e-KYC Verified</span>
                </span>
              </div>

              <p className="text-sm text-emerald-100/80 font-medium">
                {currentUser.organization || 'Registered Collective Member'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100/70 pt-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#ccd5ae]" />
                  <span>{currentUser.location || 'Tamil Nadu, India'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#ccd5ae]" />
                  <span>{currentUser.phone || 'Not provided'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#ccd5ae]" />
                  <span>{currentUser.email}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            {!isEditing ? (
              <button
                type="button"
                onClick={handleStartEditing}
                className="px-5 py-2.5 bg-[#fefae0] hover:bg-white text-[#01472e] border border-[#fefae0] font-semibold rounded-2xl text-xs flex items-center gap-2 shadow-sm transition hover:scale-[1.02] cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelEditing}
                className="px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 font-semibold rounded-2xl text-xs flex items-center gap-2 transition cursor-pointer backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Edit Form */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-[32px] border border-[#ccd5ae]/60 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#ccd5ae]/40">
            <div>
              <h3 className="text-base font-bold text-[#01472e]">Edit Operational Profile</h3>
              <p className="text-xs text-slate-500 mt-0.5">Update verified operational details. Identity and security role locks remain enforced.</p>
            </div>
            <span className="text-xs font-semibold text-[#01472e] bg-[#eaf4ec] border border-[#a3b18a]/50 px-3 py-1 rounded-full">
              Permitted Field Editor
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#01472e] focus:bg-white transition"
                placeholder="Enter full name"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Mobile / Primary Contact
              </label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#01472e] focus:bg-white transition"
                placeholder="10-digit mobile number"
              />
            </div>

            {/* Organization */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Organization / Farm Collective / Business
              </label>
              <input
                type="text"
                value={editOrganization}
                onChange={(e) => setEditOrganization(e.target.value)}
                className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#01472e] focus:bg-white transition"
                placeholder="e.g. Sunguvarchatram Cluster / Metro Agri Ltd"
              />
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Primary Location / District
              </label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#01472e] focus:bg-white transition"
                placeholder="e.g. Kanchipuram, Tamil Nadu"
              />
            </div>

            {/* Village */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Village / Town
              </label>
              <input
                type="text"
                value={editVillage}
                onChange={(e) => setEditVillage(e.target.value)}
                className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#01472e] focus:bg-white transition"
                placeholder="e.g. Sunguvarchatram"
              />
            </div>

            {/* District */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                District
              </label>
              <input
                type="text"
                value={editDistrict}
                onChange={(e) => setEditDistrict(e.target.value)}
                className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#01472e] focus:bg-white transition"
                placeholder="e.g. Kanchipuram"
              />
            </div>

            {/* Farmer-Specific Operational Fields */}
            {currentRole === 'FARMER' && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Farm Size (Acres)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editFarmSize}
                    onChange={(e) => setEditFarmSize(e.target.value)}
                    className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#01472e] focus:bg-white transition"
                    placeholder="e.g. 3.5"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Registered FPO Node
                  </label>
                  <input
                    type="text"
                    value={editFpoName}
                    onChange={(e) => setEditFpoName(e.target.value)}
                    className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#01472e] focus:bg-white transition"
                    placeholder="e.g. GreenHarvest FPO"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Main Harvest Crops (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editMainCrops}
                    onChange={(e) => setEditMainCrops(e.target.value)}
                    className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#01472e] focus:bg-white transition"
                    placeholder="e.g. Tomato, Brinjal, Chilli, Onion"
                  />
                </div>
              </>
            )}
          </div>

          {/* Security Immutable Fields Display */}
          <div className="p-5 bg-[#faf9f5] border border-[#ccd5ae]/50 rounded-2xl space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#01472e] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#01472e]" />
              Security-Protected Authentication Attributes (Immutable)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Primary Email</span>
                <span className="font-mono text-slate-800 font-medium">{currentUser.email}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Authorized Role</span>
                <span className="font-bold text-[#01472e]">{currentRole}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Account UID</span>
                <span className="font-mono text-[11px] text-slate-600 truncate block" title={currentUser.id}>
                  {currentUser.id}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancelEditing}
              className="px-5 py-2.5 rounded-2xl border border-[#ccd5ae] text-slate-700 hover:bg-[#faf9f5] font-semibold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-2xl bg-[#01472e] hover:bg-[#025a3b] text-white font-semibold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Role-Specific Profile Details & Statistics */}
      {currentRole === 'FARMER' && (
        <div className="space-y-6">
          {/* Farmer Details */}
          <div className="bg-white rounded-[32px] border border-[#ccd5ae]/60 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#eaf4ec] text-[#01472e]">
                  <Sprout className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#01472e] uppercase tracking-wider">
                  Farm & Agrarian Specifications
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#01472e] bg-[#e9edc9]/50 border border-[#ccd5ae]/60 px-3 py-1 rounded-full">
                Primary Producer
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Village</span>
                <strong className="text-slate-900 text-sm font-semibold">{currentUser.village || '-'}</strong>
              </div>
              <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">District & State</span>
                <strong className="text-slate-900 text-sm font-semibold">{currentUser.district || '-'}, {currentUser.state || '-'}</strong>
              </div>
              <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Farm Landholding</span>
                <strong className="text-[#01472e] font-mono text-sm font-bold">{currentUser.farmSizeAcres || 0} Acres</strong>
              </div>
              <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Affiliated FPO Hub</span>
                <strong className="text-slate-900 text-sm font-semibold">{currentUser.fpoName || '-'}</strong>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-600 block mb-2">Main Cultivated Crops:</span>
              <div className="flex flex-wrap gap-2">
                {(currentUser.mainCrops && currentUser.mainCrops.length > 0 ? currentUser.mainCrops : ['None specified']).map((c, i) => (
                  <span key={i} className="bg-[#eaf4ec] text-[#01472e] font-semibold px-3 py-1 rounded-xl text-xs border border-[#a3b18a]/40">
                    🌱 {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Farmer Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-[28px] border border-[#ccd5ae]/60 shadow-sm text-center">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Harvest Listings</span>
              <p className="text-3xl font-bold font-mono text-slate-900 mt-2">{currentUser.totalListings || 0}</p>
              <span className="text-[11px] text-slate-500 mt-1 block">Active on marketplace</span>
            </div>
            <div className="bg-white p-6 rounded-[28px] border border-[#ccd5ae]/60 shadow-sm text-center">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Settled Direct Orders</span>
              <p className="text-3xl font-bold font-mono text-[#01472e] mt-2">{currentUser.completedOrders || 0}</p>
              <span className="text-[11px] text-emerald-700 font-medium mt-1 block">100% automated escrow</span>
            </div>
            <div className="bg-white p-6 rounded-[28px] border border-[#ccd5ae]/60 shadow-sm text-center">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Dispatched Produce</span>
              <p className="text-3xl font-bold font-mono text-[#01472e] mt-2">{(currentUser.quantitySoldKg || 0).toLocaleString()} <span className="text-base font-normal">kg</span></p>
              <span className="text-[11px] text-slate-500 mt-1 block">Via verified cold chain</span>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Buyer Profile */}
      {currentRole === 'BULK_BUYER' && (
        <div className="bg-white rounded-[32px] border border-[#ccd5ae]/60 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#eaf4ec] text-[#01472e]">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#01472e] uppercase tracking-wider">
                Institutional Food Processor Credentials
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#01472e] bg-[#e9edc9]/50 border border-[#ccd5ae]/60 px-3 py-1 rounded-full">
              Verified Enterprise Buyer
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Procurement Entity</span>
              <strong className="text-slate-900 text-sm font-semibold">{currentUser.organization || 'Metro Agri Wholesale'}</strong>
            </div>
            <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Enterprise Tier</span>
              <strong className="text-slate-900 text-sm font-semibold">Food Processor & Wholesaler</strong>
            </div>
            <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Receiving Facility</span>
              <strong className="text-slate-900 text-sm font-semibold">{currentUser.location || 'Ambattur Hub'}</strong>
            </div>
            <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Credit Line / Capacity</span>
              <strong className="text-[#01472e] font-mono text-sm font-bold">50 MT / Cycle</strong>
            </div>
          </div>
        </div>
      )}

      {/* Retail Buyer Profile */}
      {currentRole === 'RETAIL_BUYER' && (
        <div className="bg-white rounded-[32px] border border-[#ccd5ae]/60 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#eaf4ec] text-[#01472e]">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#01472e] uppercase tracking-wider">
                Commercial Retailer Credentials
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#01472e] bg-[#e9edc9]/50 border border-[#ccd5ae]/60 px-3 py-1 rounded-full">
              Direct Supermarket / Mandi Buyer
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Business Name</span>
              <strong className="text-slate-900 text-sm font-semibold">{currentUser.businessName || currentUser.organization || 'ABC Retail Stores'}</strong>
            </div>
            <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Store Category</span>
              <strong className="text-slate-900 text-sm font-semibold">{currentUser.buyerType || 'Supermarket Chain'}</strong>
            </div>
            <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Active Forward Demands</span>
              <strong className="text-[#01472e] font-mono text-sm font-bold">3 Open Demands</strong>
            </div>
            <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Completed Purchases</span>
              <strong className="text-slate-900 font-mono text-sm font-bold">{currentUser.completedOrders || 12} Orders</strong>
            </div>
          </div>
        </div>
      )}

      {/* Logistics Profile */}
      {currentRole === 'LOGISTICS' && (
        <div className="bg-white rounded-[32px] border border-[#ccd5ae]/60 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#eaf4ec] text-[#01472e]">
                <Truck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#01472e] uppercase tracking-wider">
                Fleet Carrier & Cold Chain Credentials
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#01472e] bg-[#e9edc9]/50 border border-[#ccd5ae]/60 px-3 py-1 rounded-full">
              GPS & Telematics Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Transport Operator</span>
              <strong className="text-slate-900 text-sm font-semibold">{currentUser.transportName || currentUser.organization || 'GreenTransit Logistics'}</strong>
            </div>
            <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Vehicle Specification</span>
              <strong className="text-slate-900 text-sm font-semibold">{currentUser.vehicleType || 'Tata Ace EV CoolReefer'}</strong>
            </div>
            <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Corridor Coverage</span>
              <strong className="text-slate-900 text-sm font-semibold">{currentUser.serviceArea || currentUser.location || 'Chennai & Kanchipuram'}</strong>
            </div>
            <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Active Dispatches</span>
              <strong className="text-[#01472e] font-mono text-sm font-bold">4 Loads In-Transit</strong>
            </div>
          </div>
        </div>
      )}

      {/* Admin Profile */}
      {currentRole === 'ADMIN' && (
        <div className="bg-white rounded-[32px] border border-[#ccd5ae]/60 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#eaf4ec] text-[#01472e]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#01472e] uppercase tracking-wider">
                Ministry Platform Administration
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#01472e] bg-[#e9edc9]/50 border border-[#ccd5ae]/60 px-3 py-1 rounded-full">
              Apex Clearance
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Directorate</span>
              <strong className="text-slate-900 text-sm font-semibold">{currentUser.organization || 'Ministry of Consumer Affairs'}</strong>
            </div>
            <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Security Tier</span>
              <strong className="text-[#01472e] font-semibold text-sm">Tier-1 Apex Governance</strong>
            </div>
            <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Network Health</span>
              <strong className="text-emerald-700 font-mono text-sm font-bold">ONLINE (100%)</strong>
            </div>
            <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Managed FPO Hubs</span>
              <strong className="text-slate-900 font-mono text-sm font-bold">14 Micro-Hubs</strong>
            </div>
          </div>
        </div>
      )}

      {/* Operational Notification & Alert Preferences Card */}
      <NotificationPreferencesCard />

      {/* Multilingual Localization Settings Card */}
      <LanguageSettingsCard />
    </div>
  );
};

