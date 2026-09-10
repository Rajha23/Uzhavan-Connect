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
  X
} from 'lucide-react';

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-3 text-xs text-rose-900 shadow-sm animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-4xl shadow-md shrink-0">
              {currentUser.avatar || (currentRole === 'BULK_BUYER' ? '🏭' : currentRole === 'ADMIN' ? '⚙️' : '👨‍🌾')}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  {currentUser.name || 'Member'}
                </h2>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2.5 py-0.5 rounded-full border border-emerald-300">
                  {currentRole.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                {currentUser.organization || 'Registered Member'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser.location || 'Tamil Nadu, India'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser.phone || 'Not provided'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser.email}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="sm:self-center shrink-0">
            {!isEditing ? (
              <button
                type="button"
                onClick={handleStartEditing}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelEditing}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-medium rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Edit Form */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Edit Operational Profile</h3>
              <p className="text-xs text-slate-500">Update your verified operational details. Identity and role fields are protected.</p>
            </div>
            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Permitted Field Editor
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                placeholder="Enter full name"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Mobile / Phone
              </label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                placeholder="10-digit mobile number"
              />
            </div>

            {/* Organization */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Organization / Farm Collective / Business
              </label>
              <input
                type="text"
                value={editOrganization}
                onChange={(e) => setEditOrganization(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Sunguvarchatram Cluster / Metro Agri Ltd"
              />
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Primary Location / District
              </label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Kanchipuram, Tamil Nadu"
              />
            </div>

            {/* Village */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Village / Town
              </label>
              <input
                type="text"
                value={editVillage}
                onChange={(e) => setEditVillage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Sunguvarchatram"
              />
            </div>

            {/* District */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                District
              </label>
              <input
                type="text"
                value={editDistrict}
                onChange={(e) => setEditDistrict(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Kanchipuram"
              />
            </div>

            {/* Farmer-Specific Operational Fields */}
            {currentRole === 'FARMER' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Farm Size (Acres)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editFarmSize}
                    onChange={(e) => setEditFarmSize(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. 3.5"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Registered FPO
                  </label>
                  <input
                    type="text"
                    value={editFpoName}
                    onChange={(e) => setEditFpoName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. GreenHarvest FPO"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Main Harvest Crops (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editMainCrops}
                    onChange={(e) => setEditMainCrops(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Tomato, Brinjal, Chilli, Onion"
                  />
                </div>
              </>
            )}
          </div>

          {/* Security Immutable Fields Display */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Security-Protected Authentication Attributes (Immutable)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-400 text-[11px] block">Primary Email</span>
                <span className="font-mono text-slate-700">{currentUser.email}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Authorized Role</span>
                <span className="font-semibold text-emerald-800">{currentRole}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Account UID</span>
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
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
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
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
              Farm & Agrarian Profile
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[11px] block">Village:</span>
                <strong className="text-slate-900">{currentUser.village || '-'}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[11px] block">District & State:</span>
                <strong className="text-slate-900">{currentUser.district || '-'}, {currentUser.state || '-'}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[11px] block">Farm Size:</span>
                <strong className="text-emerald-700 font-mono font-medium">{currentUser.farmSizeAcres || 0} Acres</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[11px] block">Registered FPO:</span>
                <strong className="text-slate-900">{currentUser.fpoName || '-'}</strong>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">Main Harvest Crops:</span>
              <div className="flex flex-wrap gap-2">
                {(currentUser.mainCrops && currentUser.mainCrops.length > 0 ? currentUser.mainCrops : ['None specified']).map((c, i) => (
                  <span key={i} className="bg-emerald-50 text-emerald-800 font-medium px-2.5 py-1 rounded-lg text-xs border border-emerald-200">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Farmer Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center">
              <span className="text-xs text-slate-500 font-medium">Total Listings</span>
              <p className="text-2xl font-semibold font-mono text-slate-900 mt-1">{currentUser.totalListings || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center">
              <span className="text-xs text-slate-500 font-medium">Completed Orders</span>
              <p className="text-2xl font-semibold font-mono text-emerald-700 mt-1">{currentUser.completedOrders || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center">
              <span className="text-xs text-slate-500 font-medium">Quantity Sold</span>
              <p className="text-2xl font-semibold font-mono text-blue-700 mt-1">{(currentUser.quantitySoldKg || 0).toLocaleString()} kg</p>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Buyer Profile */}
      {currentRole === 'BULK_BUYER' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
            Bulk Institutional Buyer Credentials
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Procurement Entity:</span>
              <strong className="text-slate-900">{currentUser.organization || 'Metro Agri Wholesale'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Buyer Category:</span>
              <strong className="text-slate-900">Food Processor & Wholesaler</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Receiving Facility:</span>
              <strong className="text-slate-900">{currentUser.location || 'Ambattur Hub'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Procurement Cap:</span>
              <strong className="text-emerald-700 font-mono font-medium">50 MT / Cycle</strong>
            </div>
          </div>
        </div>
      )}

      {/* Retail Buyer Profile */}
      {currentRole === 'RETAIL_BUYER' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
            Commercial Buyer Credentials
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Business Name:</span>
              <strong className="text-slate-900">{currentUser.businessName || currentUser.organization || 'ABC Retail Stores'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Buyer Category:</span>
              <strong className="text-slate-900">{currentUser.buyerType || 'Supermarket Chain'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Active Demands:</span>
              <strong className="text-emerald-700 font-mono font-medium">3 Lots</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Completed Orders:</span>
              <strong className="text-slate-900 font-mono">{currentUser.completedOrders || 12}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Logistics Profile */}
      {currentRole === 'LOGISTICS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
            Carrier & Fleet Credentials
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Transport Fleet:</span>
              <strong className="text-slate-900">{currentUser.transportName || currentUser.organization || 'GreenTransit Logistics'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Vehicle Type:</span>
              <strong className="text-slate-900">{currentUser.vehicleType || 'Tata Ace EV CoolReefer'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Service Area:</span>
              <strong className="text-slate-900">{currentUser.serviceArea || currentUser.location || 'Chennai & Kanchipuram'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Active Shipments:</span>
              <strong className="text-emerald-700 font-mono font-medium">4 Loads</strong>
            </div>
          </div>
        </div>
      )}

      {/* Admin Profile */}
      {currentRole === 'ADMIN' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
            Platform Administrator Credentials
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Directorate:</span>
              <strong className="text-slate-900">{currentUser.organization || 'Ministry of Consumer Affairs'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Access Tier:</span>
              <strong className="text-emerald-700 font-semibold">Tier-1 Full Authority</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">System State:</span>
              <strong className="text-emerald-700 font-mono">ONLINE / HEALTHY</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Managed Hubs:</span>
              <strong className="text-slate-900 font-mono">14 Centers</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
