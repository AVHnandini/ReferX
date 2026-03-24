import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Save, User, Briefcase, MapPin, Link as LinkIcon, Award, TrendingUp, Users, Eye } from 'lucide-react';
import ProfileForm from '../../components/alumni/ProfileForm';
import ProfilePreview from '../../components/alumni/ProfilePreview';

export default function ProfileSettings() {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    profilePhoto: '',
    company: '',
    jobRole: '',
    experienceYears: 0,
    location: '',
    linkedin: '',
    portfolio: '',
    skills: [],
    experiences: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userService.getProfile();
      const userData = response.data;
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
        bio: userData.bio || '',
        profilePhoto: userData.profilePhoto || '',
        company: userData.company || '',
        jobRole: userData.jobRole || '',
        experienceYears: userData.experienceYears || 0,
        location: userData.location || '',
        linkedin: userData.linkedin || '',
        portfolio: userData.portfolio || '',
        skills: userData.skills || [],
        experiences: userData.experiences || [],
      });
    } catch (error) {
      addToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await userService.updateProfile(profileData);
      setUser(response.data);
      addToast('Profile updated successfully!', 'success');
    } catch (error) {
      addToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const calculateProfileCompletion = () => {
    let score = 10; // Base score
    if (profileData.name) score += 10;
    if (profileData.bio) score += 15;
    if (profileData.profilePhoto) score += 10;
    if (profileData.company) score += 10;
    if (profileData.jobRole) score += 5;
    if (profileData.experienceYears > 0) score += 5;
    if (profileData.location) score += 5;
    if (profileData.skills.length > 0) score += 15;
    if (profileData.experiences.length > 0) score += 15;
    if (profileData.linkedin) score += 10;
    if (profileData.portfolio) score += 5;
    return Math.min(score, 100);
  };

  const getCompletionSuggestions = () => {
    const suggestions = [];
    if (!profileData.bio) suggestions.push('Add a bio to tell students about yourself');
    if (!profileData.profilePhoto) suggestions.push('Upload a profile photo');
    if (profileData.skills.length === 0) suggestions.push('Add your skills');
    if (profileData.experiences.length === 0) suggestions.push('Add your work experience');
    return suggestions;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'experience', label: 'Experience', icon: Award },
    { id: 'social', label: 'Social Links', icon: LinkIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-gray-400">Manage your professional profile and help students discover you</p>
      </div>

      {/* Profile Completion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Profile Completion</h2>
          <span className="text-2xl font-bold text-blue-400">{calculateProfileCompletion()}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${calculateProfileCompletion()}%` }}
            transition={{ duration: 1 }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
          />
        </div>
        {getCompletionSuggestions().length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Suggestions to improve your profile:</p>
            {getCompletionSuggestions().map((suggestion, index) => (
              <div key={index} className="flex items-center text-sm text-gray-300">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3"></div>
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6"
          >
            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={16} className="mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <ProfileForm
              profileData={profileData}
              setProfileData={setProfileData}
              activeTab={activeTab}
            />

            {/* Save Button */}
            <div className="flex justify-end mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                <Save size={18} className="mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-6"
          >
            <ProfilePreview profileData={profileData} />

            {/* Advanced Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 mt-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Activity Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-300">
                    <Users size={16} className="mr-2" />
                    Referrals Given
                  </div>
                  <span className="text-white font-semibold">{user?.referralsGiven || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-300">
                    <TrendingUp size={16} className="mr-2" />
                    Success Rate
                  </div>
                  <span className="text-white font-semibold">{user?.referralSuccessRate || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-300">
                    <Briefcase size={16} className="mr-2" />
                    Jobs Posted
                  </div>
                  <span className="text-white font-semibold">{user?.jobsPosted || 0}</span>
                </div>
              </div>

              <button className="w-full mt-6 flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors">
                <Eye size={16} className="mr-2" />
                Preview Public Profile
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}