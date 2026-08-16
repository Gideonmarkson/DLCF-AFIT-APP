'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  User,
  Camera,
  Upload,
  Trash2,
  CheckCircle2,
  Mail,
  Phone,
  GraduationCap,
  Building,
  ShieldCheck,
  Save,
  Check,
  Plus,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useRole } from '@/context/RoleContext';
import { AFIT_DEPARTMENTS, FELLOWSHIP_UNITS, DLCF_EXCO_PORTFOLIOS, ASSOCIATE_COORDINATOR_ROLES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { userRole, profile } = useRole();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [fullName, setFullName] = useState(profile.fullName);
  const [email] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [matricNo, setMatricNo] = useState(profile.matricNumber ?? '');
  const [department, setDepartment] = useState(profile.department ?? AFIT_DEPARTMENTS[0]?.name ?? '');
  const [level, setLevel] = useState(profile.currentLevel ?? '300');
  const [cgpa, setCgpa] = useState(String(profile.cgpa ?? 0));
  const [error, setError] = useState('');

  // Role-upgrade state (General Students only)
  const [upgradeType, setUpgradeType] = useState<'exco' | 'coordinator'>('exco');
  const [excoOffice, setExcoOffice] = useState(profile.executiveOffice ?? 'General Coordinator');
  const [coordinatorRoleTitle, setCoordinatorRoleTitle] = useState(ASSOCIATE_COORDINATOR_ROLES[0]);
  const [tenureSession, setTenureSession] = useState(profile.tenureSession ?? '2025/2026');
  const [upgradePasscode, setUpgradePasscode] = useState('');
  const [upgradeError, setUpgradeError] = useState('');
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  
  // Multi-select state for Fellowship Units
  const [selectedUnits, setSelectedUnits] = useState<string[]>(profile.fellowshipUnits ?? []);
  
  const [residence, setResidence] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
  let cancelled = false;

  const loadResidence = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('residence')
      .eq('id', user.id)
      .single();

    if (!cancelled && !error) {
      setResidence(data?.residence ?? '');
    }
  };

  loadResidence();

  return () => {
    cancelled = true;
  };
}, []);


  const isStaff = userRole === 'ASSOCIATE_COORDINATOR';
  const isExco = userRole === 'STUDENT_EXECUTIVE';
  const isAdmin = userRole === 'SYSTEM_ADMINISTRATOR';

  const toggleUnit = (unitName: string) => {
    if (selectedUnits.includes(unitName)) {
      setSelectedUnits(selectedUnits.filter((u) => u !== unitName));
    } else {
      setSelectedUnits([...selectedUnits, unitName]);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setError('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Your session expired — please sign in again.');
      setAvatarUploading(false);
      return;
    }

    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setAvatarUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path);
    // Cache-bust so the new photo shows immediately instead of a stale cached version
    const freshUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: freshUrl })
      .eq('id', user.id);

    setAvatarUploading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setAvatarPreview(freshUrl);
    router.refresh();
  };

  const handleRemoveAvatar = async () => {
    setError('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.storage.from('avatars').remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.jpeg`, `${user.id}/avatar.png`, `${user.id}/avatar.webp`]);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setAvatarPreview(null);
    router.refresh();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Your session expired — please sign in again.');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone_number: phone,
        department,
        current_level: level,
        matric_number: matricNo || null,
        cgpa: Number(cgpa) || 0,
        fellowship_units: selectedUnits,
        residence: residence.trim() || null,
      })
      .eq('id', user.id);

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSaveSuccess(true);
    router.refresh();
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleUpgradeRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpgradeError('');
    setUpgradeLoading(true);
    try {
      const res = await fetch('/api/account/upgrade-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upgradeType,
          passcode: upgradePasscode,
          excoOffice: upgradeType === 'exco' ? excoOffice : undefined,
          tenureSession: upgradeType === 'exco' ? tenureSession : undefined,
          coordinatorRoleTitle: upgradeType === 'coordinator' ? coordinatorRoleTitle : undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Upgrade failed');
      router.refresh();
    } catch (err) {
      setUpgradeError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleChangeOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpgradeError('');
    setUpgradeLoading(true);
    try {
      const res = await fetch('/api/account/upgrade-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upgradeType: 'change-office', excoOffice, tenureSession }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Could not update office');
      router.refresh();
    } catch (err) {
      setUpgradeError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setUpgradeLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#EFF6FF] to-white border border-[#E2E8F0] shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center font-extrabold shadow-sm shrink-0">
              <User className="w-6 h-6 stroke-[1.75px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">
                  User Profile Setup &amp; Account Settings
                </h1>
                <Badge variant="blue">Profile Management</Badge>
              </div>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                Upload your profile picture, update personal details, academic department, level, and fellowship unit affiliations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Avatar Photo Upload Card (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <Card className="border-[#E2E8F0] bg-white p-6 space-y-5 shadow-xs text-center">
            <div>
              <h2 className="text-base font-extrabold text-[#1F2937]">Profile Picture</h2>
              <p className="text-xs text-[#6B7280]">Upload a clear photo of yourself for fellowship identification.</p>
            </div>

            {/* Avatar Preview Box */}
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-[#1D4ED8]/20 bg-[#EFF6FF] mx-auto shadow-md flex items-center justify-center group">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Profile Avatar Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="text-4xl font-extrabold text-[#1D4ED8]">
                  {isAdmin ? 'SA' : isStaff ? 'SO' : isExco ? 'BA' : 'DA'}
                </div>
              )}

              {/* Hover overlay button */}
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-bold gap-1">
                <Camera className="w-5 h-5" /> Change
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Avatar Action Buttons */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1D4ED8] text-white text-xs font-bold cursor-pointer hover:bg-[#1E40AF] transition-colors shadow-2xs">
                <Upload className="w-3.5 h-3.5" /> Upload Photo
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>

              {avatarPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 gap-1 rounded-xl"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </Button>
              )}
            </div>

            <div className="text-[10px] text-[#6B7280] pt-2 border-t border-[#E2E8F0]">
              Supports PNG, JPG, or WEBP (Max 5MB).
            </div>
          </Card>

          {/* Current Role Badge Card */}
          <Card className="border-[#E2E8F0] bg-white p-4 space-y-2 shadow-xs">
            <div className="text-xs font-extrabold text-[#1F2937] flex items-center justify-between">
              <span>Account Role:</span>
              <Badge variant={isAdmin ? 'blue' : isStaff ? 'blue' : isExco ? 'role' : 'slate'}>
                {isAdmin ? 'System Administrator' : isStaff ? 'Associate Coordinator' : isExco ? 'Student Exco' : 'General Student'}
              </Badge>
            </div>
            <p className="text-[11px] text-[#6B7280] font-medium">
              Role permissions dictate access controls across counseling, course registration, and directorate queues.
            </p>
          </Card>
        </div>

        {/* Right Column: Profile Form Details (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          <Card className="border-[#E2E8F0] bg-white p-6 space-y-4 shadow-xs">
            <div>
              <h2 className="text-base font-extrabold text-[#1F2937]">Personal &amp; Academic Details</h2>
              <p className="text-xs text-[#6B7280]">Update your name, contact information, and AFIT academic record.</p>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#1F2937]">Full Name &amp; Title</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-9 text-xs font-bold"
                  required
                />
              </div>
            </div>

            {/* Email Address & WhatsApp Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                  <Input
                    type="email"
                    value={email}
                    disabled
                    className="pl-9 text-xs bg-[#F8FAFC] text-[#6B7280] cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-[#9CA3AF]">Your sign-in email can&apos;t be changed here yet.</p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">WhatsApp / Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            {!isStaff && (
              <>
                {/* Department & Level Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-8 space-y-1">
                    <label className="block text-xs font-extrabold text-[#1F2937]">AFIT Department</label>
                    <Select value={department} onChange={(e) => setDepartment(e.target.value)} className="text-xs">
                      {AFIT_DEPARTMENTS.map((dept) => (
                        <option key={dept.name} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="sm:col-span-4 space-y-1">
                    <label className="block text-xs font-extrabold text-[#1F2937]">Level</label>
                    <Select value={level} onChange={(e) => setLevel(e.target.value)} className="text-xs font-bold">
                      <option value="Remedial">Remedial</option>
                      <option value="IJMB">IJMB</option>
                      <option value="100">100L</option>
                      <option value="200">200L</option>
                      <option value="300">300L</option>
                      <option value="400">400L</option>
                      <option value="500">500L</option>
                      <option value="ND1">ND 1</option>
                      <option value="ND2">ND 2</option>
                      <option value="HND1">HND 1</option>
                      <option value="HND2">HND 2</option>
                    </Select>
                  </div>
                </div>

                {/* Matric / Reg No */}
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-[#1F2937]">AFIT Matriculation / Reg No</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                    <Input
                      value={matricNo}
                      onChange={(e) => setMatricNo(e.target.value)}
                      className="pl-9 text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                {/* CGPA — self-editable so it can be corrected or updated each semester */}
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-[#1F2937]">Current CGPA</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="5"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      className="pl-9 text-xs font-bold"
                    />
                  </div>
                </div>
              </>
            )}

            {isStaff && (
              <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#1D4ED8]/20 text-xs text-[#1D4ED8] font-bold">
                Looking for student CGPA and contact info? That&apos;s now under Coordinator Governance in the sidebar — this page just covers your own contact details above.
              </div>
            )}

            {/* MULTI-SELECT FELLOWSHIP UNITS & RESIDENCE */}
            <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-[#1F2937]">
                    Fellowship Unit(s) <span className="text-[#1D4ED8] font-normal">(Select all that apply)</span>
                  </label>
                  <span className="text-[10px] font-bold text-[#6B7280]">
                    {selectedUnits.length} Unit{selectedUnits.length === 1 ? '' : 's'} Selected
                  </span>
                </div>

                {/* Interactive Multi-Select Chip Selector */}
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  {FELLOWSHIP_UNITS.map((unit) => {
                    const isSelected = selectedUnits.includes(unit);
                    return (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => toggleUnit(unit)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer select-none',
                          isSelected
                            ? 'bg-[#1D4ED8] text-white shadow-xs ring-2 ring-[#1D4ED8]/30'
                            : 'bg-white border border-[#CBD5E1] text-[#4B5563] hover:border-[#1D4ED8] hover:text-[#1D4ED8]'
                        )}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3px]" /> : <Plus className="w-3.5 h-3.5 text-[#9CA3AF]" />}
                        <span>{unit} Unit</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Campus Residence / Hostel</label>
                <Input
                  value={residence}
                  onChange={(e) => setResidence(e.target.value)}
                  className="text-xs"
                />
              </div>
              <p className="text-[10px] text-[#9CA3AF]">
                Your Campus residence / hostel is saved with your profile and can be updated at any time.
              </p>
            </div>

            {error && <p className="text-xs text-red-600 font-bold text-center">{error}</p>}

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Profile picture and multi-unit affiliations updated successfully!
              </div>
            )}

            <Button type="submit" variant="primary" disabled={loading} className="w-full text-xs font-bold gap-2 rounded-xl py-2.5">
              <Save className="w-4 h-4" />
              {loading ? 'Saving Profile Changes...' : 'Save & Update Profile Settings'}
            </Button>
          </Card>
        </div>

      </form>

      {/* Apply for an Executive or Associate Coordinator role — General Students only */}
      {userRole === 'GENERAL_STUDENT' && (
        <Card className="border-[#E2E8F0] bg-white p-6 space-y-4 shadow-xs">
          <div>
            <h2 className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1D4ED8]" /> Apply for Executive / Associate Coordinator Access
            </h2>
            <p className="text-xs text-[#6B7280]">
              Already accredited by the fellowship? Enter the passcode you were given — this upgrades your existing
              account, it does not create a new one.
            </p>
          </div>

          <form onSubmit={handleUpgradeRole} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#1F2937]">Applying As</label>
              <Select value={upgradeType} onChange={(e) => setUpgradeType(e.target.value as 'exco' | 'coordinator')} className="text-xs">
                <option value="exco">Student Executive</option>
                <option value="coordinator">Associate Coordinator</option>
              </Select>
            </div>

            {upgradeType === 'exco' && (
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Executive Office</label>
                <Select value={excoOffice} onChange={(e) => setExcoOffice(e.target.value)} className="text-xs">
                  {DLCF_EXCO_PORTFOLIOS.map((office: string) => (
                    <option key={office} value={office}>{office}</option>
                  ))}
                </Select>
              </div>
            )}

            {upgradeType === 'coordinator' && (
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Coordinator Category</label>
                <Select value={coordinatorRoleTitle} onChange={(e) => setCoordinatorRoleTitle(e.target.value)} className="text-xs">
                  {ASSOCIATE_COORDINATOR_ROLES.map((role: string) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </Select>
              </div>
            )}

            {upgradeType === 'exco' && (
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Tenure (Academic Session)</label>
                <Input
                  value={tenureSession}
                  onChange={(e) => setTenureSession(e.target.value)}
                  placeholder="e.g. 2025/2026"
                  className="text-xs"
                />
              </div>
            )}

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-extrabold text-[#1F2937]">Accreditation Passcode</label>
              <Input
                type="password"
                value={upgradePasscode}
                onChange={(e) => setUpgradePasscode(e.target.value)}
                placeholder="Given to you by the fellowship leadership"
                className="text-xs"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                required
              />
            </div>

            {upgradeError && <p className="text-xs text-red-600 font-bold sm:col-span-2">{upgradeError}</p>}

            <Button type="submit" variant="primary" disabled={upgradeLoading} className="sm:col-span-2 text-xs font-bold gap-2 rounded-xl py-2.5">
              {upgradeLoading ? 'Verifying...' : 'Upgrade My Account'}
            </Button>
          </form>
        </Card>
      )}

      {isExco && (
        <Card className="border-[#E2E8F0] bg-white p-6 space-y-4 shadow-xs">
          <div>
            <h2 className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1D4ED8]" /> Change My Executive Office
            </h2>
            <p className="text-xs text-[#6B7280]">
              Reassigned to a different portfolio? Update it here — this doesn&apos;t need the passcode again since
              you&apos;re already accredited.
            </p>
          </div>

          <form onSubmit={handleChangeOffice} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-extrabold text-[#1F2937]">New Executive Office</label>
              <Select value={excoOffice} onChange={(e) => setExcoOffice(e.target.value)} className="text-xs">
                {DLCF_EXCO_PORTFOLIOS.map((office: string) => (
                  <option key={office} value={office}>{office}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-extrabold text-[#1F2937]">Tenure (Academic Session)</label>
              <Input
                value={tenureSession}
                onChange={(e) => setTenureSession(e.target.value)}
                placeholder="e.g. 2025/2026"
                className="text-xs"
              />
            </div>

            {upgradeError && <p className="text-xs text-red-600 font-bold sm:col-span-2">{upgradeError}</p>}

            <Button type="submit" variant="primary" disabled={upgradeLoading} className="sm:col-span-2 text-xs font-bold gap-2 rounded-xl py-2.5">
              {upgradeLoading ? 'Updating...' : 'Update My Office'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
