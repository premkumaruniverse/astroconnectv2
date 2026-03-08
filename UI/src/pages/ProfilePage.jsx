import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    UserCircleIcon,
    MapPinIcon,
    CalendarDaysIcon,
    ClockIcon,
    PhoneIcon,
    EnvelopeIcon,
    BriefcaseIcon,
    HeartIcon,
    ArrowLeftIcon,
    EyeIcon,
    EyeSlashIcon,
    DevicePhoneMobileIcon,
    UserIcon,
    SparklesIcon,
    StarIcon,
    CameraIcon
} from '@heroicons/react/24/solid';
import { users, astrologer, API_URL } from '../services/api';
import Navbar from '../components/Navbar';
import { LanguageContext } from '../context/LanguageContext';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { t } = useContext(LanguageContext);
    const role = localStorage.getItem('role');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        gender: '',
        date_of_birth: '',
        time_of_birth: '',
        place_of_birth: '',
        occupation: '',
        marital_status: '',
        // Astrologer specific
        specialties: [],
        experience: 0,
        bio: '',
        languages: []
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = role === 'astrologer'
                ? await astrologer.getProfile()
                : await users.getProfile();

            setProfile({
                ...profile,
                ...response.data
            });

            if (response.data.name) {
                localStorage.setItem('user_name', response.data.name);
            }
            if (response.data.profile_image) {
                localStorage.setItem('profile_image', response.data.profile_image);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            if (role === 'astrologer') {
                await astrologer.updateProfile(profile);
            } else {
                await users.updateProfile(profile);
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            localStorage.setItem('user_name', profile.name);
            fetchProfile(); // Refresh for stats

            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <Navbar />

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(role === 'astrologer' ? '/astro-dashboard' : '/dashboard')}
                        className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:text-amber-500 transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Your Profile</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{role === 'astrologer' ? 'Manage your professional presence' : 'Manage your personal and celestial information'}</p>
                    </div>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-2xl font-bold text-sm uppercase tracking-widest animate-in fade-in slide-in-from-top-4 ${message.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-600 border border-red-500/20'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Static Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center">
                            <div className="relative group cursor-pointer" onClick={() => document.getElementById('photo-upload').click()}>
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-amber-500/30 mb-4 border-4 border-white dark:border-slate-700 overflow-hidden">
                                    {profile.profile_image ? (
                                        <img src={`${API_URL}${profile.profile_image}`} alt="Profile" className="w-full h-full object-cover" />
                                    ) : profile.name ? (
                                        profile.name[0].toUpperCase()
                                    ) : (
                                        <UserCircleIcon className="w-16 h-16" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <CameraIcon className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <input
                                    id="photo-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            try {
                                                setSaving(true);
                                                const res = await users.updatePhoto(formData);
                                                setProfile({ ...profile, profile_image: res.data.image_url });
                                                localStorage.setItem('profile_image', res.data.image_url);
                                                setMessage({ type: 'success', text: 'Photo updated!' });
                                            } catch (err) {
                                                setMessage({ type: 'error', text: 'Upload failed' });
                                            } finally {
                                                setSaving(false);
                                            }
                                        }
                                    }}
                                />
                                {role === 'astrologer' && profile.is_live && (
                                    <span className="absolute bottom-4 right-0 block h-4 w-4 rounded-full bg-red-500 border-2 border-white ring-2 ring-red-400 animate-pulse"></span>
                                )}
                            </div>

                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{profile.name || 'Spiritual Seeker'}</h2>
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-6">{profile.email}</p>

                            <div className="w-full h-px bg-gray-100 dark:bg-slate-700 my-4"></div>

                            <div className="flex flex-col gap-4 w-full">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-500">
                                        <CalendarDaysIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">{role === 'astrologer' ? 'Experience' : 'Member Since'}</p>
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{role === 'astrologer' ? `${profile.experience} Years` : 'March 2026'}</p>
                                    </div>
                                </div>
                                {role === 'astrologer' && (
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-500">
                                            <StarIcon className="h-4 w-4 text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase">Rating</p>
                                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{profile.rating?.toFixed(1)} / 5.0</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-500">
                                        <HeartIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Status</p>
                                        <p className="text-xs font-bold text-emerald-500 uppercase">{role === 'astrologer' ? (profile.verification_status === 'approved' ? 'Verified Expert' : 'Pending Rev.') : 'Verified Soul'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden group ${role === 'astrologer' ? 'bg-purple-600 shadow-purple-500/20' : 'bg-amber-500 shadow-amber-500/20'}`}>
                            <SparklesIcon className="absolute -top-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-lg font-black uppercase tracking-tighter mb-2">{role === 'astrologer' ? 'Expert Tip' : 'Vedic Pro Tip'}</h3>
                            <p className="text-sm font-medium leading-relaxed opacity-90">
                                {role === 'astrologer'
                                    ? 'A detailed bio and profile photo increase consultation rates by up to 40%.'
                                    : 'Accurate birth time and place are essential for the most precise astrological insights.'}
                            </p>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleUpdate} className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-100 dark:border-slate-700">
                            <div className="space-y-8">
                                {/* Personal Section */}
                                <section>
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className={`w-1 h-6 rounded-full ${role === 'astrologer' ? 'bg-purple-500' : 'bg-amber-500'}`}></span>
                                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">General Info</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <div className="relative group">
                                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    value={profile.name}
                                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-transparent focus:border-amber-500 rounded-2xl outline-none text-sm font-black text-gray-700 dark:text-white transition-all shadow-inner"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                            <div className="relative group">
                                                <DevicePhoneMobileIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                                                <input
                                                    type="tel"
                                                    value={profile.phone}
                                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-transparent focus:border-amber-500 rounded-2xl outline-none text-sm font-black text-gray-700 dark:text-white transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        {role === 'astrologer' && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Years of Experience</label>
                                                <div className="relative group">
                                                    <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                                    <input
                                                        type="number"
                                                        value={profile.experience}
                                                        onChange={(e) => setProfile({ ...profile, experience: parseInt(e.target.value) })}
                                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-transparent focus:border-purple-500 rounded-2xl outline-none text-sm font-black text-gray-700 dark:text-white transition-all shadow-inner"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <div className="h-px bg-gray-100 dark:bg-slate-700"></div>

                                {role === 'astrologer' ? (
                                    /* Astrologer Specific Fields */
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Expertise & Bio</h3>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bio / Journey</label>
                                            <textarea
                                                value={profile.bio}
                                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                                rows={4}
                                                className="w-full p-6 bg-gray-50 dark:bg-slate-900 border border-transparent focus:border-purple-500 rounded-2xl outline-none text-sm font-bold text-gray-700 dark:text-white transition-all shadow-inner"
                                                placeholder="Tell your spiritual journey..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Specialties (Comma Separated)</label>
                                                <input
                                                    type="text"
                                                    value={profile.specialties?.join(', ')}
                                                    onChange={(e) => setProfile({ ...profile, specialties: e.target.value.split(',').map(s => s.trim()) })}
                                                    className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-transparent focus:border-purple-500 rounded-2xl outline-none text-sm font-black text-gray-700 dark:text-white shadow-inner"
                                                    placeholder="Vedic, Tarot, Numerology"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Languages (Comma Separated)</label>
                                                <input
                                                    type="text"
                                                    value={profile.languages?.join(', ')}
                                                    onChange={(e) => setProfile({ ...profile, languages: e.target.value.split(',').map(s => s.trim()) })}
                                                    className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-transparent focus:border-purple-500 rounded-2xl outline-none text-sm font-black text-gray-700 dark:text-white shadow-inner"
                                                    placeholder="Hindi, English, Sanskrit"
                                                />
                                            </div>
                                        </div>
                                    </section>
                                ) : (
                                    /* User Specific Fields: Astrology Section */
                                    <section>
                                        <div className="flex items-center gap-2 mb-6">
                                            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Astro Birth Details</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                                <div className="relative group">
                                                    <CalendarDaysIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                                    <input
                                                        type="date"
                                                        value={profile.date_of_birth}
                                                        onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-transparent focus:border-purple-500 rounded-2xl outline-none text-sm font-black text-gray-700 dark:text-white transition-all shadow-inner"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Time of Birth</label>
                                                <div className="relative group">
                                                    <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                                    <input
                                                        type="time"
                                                        value={profile.time_of_birth}
                                                        onChange={(e) => setProfile({ ...profile, time_of_birth: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-transparent focus:border-purple-500 rounded-2xl outline-none text-sm font-black text-gray-700 dark:text-white transition-all shadow-inner"
                                                    />
                                                </div>
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Place of Birth</label>
                                                <div className="relative group">
                                                    <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                                    <input
                                                        type="text"
                                                        value={profile.place_of_birth}
                                                        onChange={(e) => setProfile({ ...profile, place_of_birth: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-transparent focus:border-purple-500 rounded-2xl outline-none text-sm font-black text-gray-700 dark:text-white transition-all shadow-inner"
                                                        placeholder="City, State, Country"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                                                <select
                                                    value={profile.gender}
                                                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                                    className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-900 border border-transparent focus:border-purple-500 rounded-2xl outline-none text-sm font-black text-gray-700 dark:text-white transition-all shadow-inner"
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Marital Status</label>
                                                <select
                                                    value={profile.marital_status}
                                                    onChange={(e) => setProfile({ ...profile, marital_status: e.target.value })}
                                                    className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-900 border border-transparent focus:border-purple-500 rounded-2xl outline-none text-sm font-black text-gray-700 dark:text-white transition-all shadow-inner"
                                                >
                                                    <option value="">Select Status</option>
                                                    <option value="single">Single</option>
                                                    <option value="married">Married</option>
                                                    <option value="divorced">Divorced</option>
                                                    <option value="widowed">Widowed</option>
                                                </select>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {role !== 'astrologer' && (
                                    <>
                                        <div className="h-px bg-gray-100 dark:bg-slate-700"></div>
                                        <section>
                                            <div className="flex items-center gap-2 mb-6">
                                                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Other Insights</h3>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Occupation</label>
                                                <div className="relative group">
                                                    <BriefcaseIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                                    <input
                                                        type="text"
                                                        value={profile.occupation}
                                                        onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-transparent focus:border-emerald-500 rounded-2xl outline-none text-sm font-black text-gray-700 dark:text-white transition-all shadow-inner"
                                                        placeholder="e.g. Software Engineer"
                                                    />
                                                </div>
                                            </div>
                                        </section>
                                    </>
                                )}

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`w-full py-4 text-white font-black rounded-2xl transition-all shadow-xl active:scale-95 uppercase tracking-widest disabled:opacity-50 ${role === 'astrologer' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-900 dark:bg-amber-500 hover:bg-black dark:hover:bg-amber-600'}`}
                                >
                                    {saving ? 'Updating Records...' : 'Save Profile Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
