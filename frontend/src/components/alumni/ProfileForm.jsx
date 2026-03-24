import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { userService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Upload, X, Plus, Trash2 } from 'lucide-react';
import SkillsInput from './SkillsInput';
import ExperienceSection from './ExperienceSection';

export default function ProfileForm({ profileData, setProfileData, activeTab }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const { addToast } = useToast();

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      addToast('File size must be less than 5MB', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const response = await userService.uploadProfilePhoto(formData);
      handleInputChange('profilePhoto', response.data.photoUrl);
      addToast('Profile photo uploaded successfully!', 'success');
    } catch (error) {
      addToast('Failed to upload photo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    handleInputChange('profilePhoto', '');
  };

  const renderBasicInfoTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          value={profileData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email
        </label>
        <input
          type="email"
          value={profileData.email}
          disabled
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Profile Photo
        </label>
        <div className="flex items-center space-x-4">
          <div className="relative">
            {profileData.profilePhoto ? (
              <div className="relative">
                <img
                  src={profileData.profilePhoto}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-600"
                />
                <button
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-700 border-2 border-dashed border-gray-600 flex items-center justify-center">
                <Upload size={24} className="text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
            >
              {uploading ? 'Uploading...' : profileData.profilePhoto ? 'Change Photo' : 'Upload Photo'}
            </button>
            <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG/PNG only</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Bio / About
        </label>
        <textarea
          value={profileData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Tell students about yourself, your expertise, and what you're looking for in referrals..."
        />
        <p className="text-xs text-gray-500 mt-1">{profileData.bio.length}/500 characters</p>
      </div>
    </motion.div>
  );

  const renderProfessionalTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={profileData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Google, Microsoft"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Job Role
          </label>
          <input
            type="text"
            value={profileData.jobRole}
            onChange={(e) => handleInputChange('jobRole', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Software Engineer, Product Manager"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Years of Experience
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={profileData.experienceYears}
            onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Work Location
          </label>
          <input
            type="text"
            value={profileData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. San Francisco, CA"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Skills
        </label>
        <SkillsInput
          skills={profileData.skills}
          onChange={(skills) => handleInputChange('skills', skills)}
        />
      </div>
    </motion.div>
  );

  const renderExperienceTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <ExperienceSection
        experiences={profileData.experiences}
        onChange={(experiences) => handleInputChange('experiences', experiences)}
      />
    </motion.div>
  );

  const renderSocialTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          LinkedIn Profile URL
        </label>
        <input
          type="url"
          value={profileData.linkedin}
          onChange={(e) => handleInputChange('linkedin', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Portfolio / GitHub URL
        </label>
        <input
          type="url"
          value={profileData.portfolio}
          onChange={(e) => handleInputChange('portfolio', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://github.com/yourusername or your portfolio URL"
        />
      </div>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicInfoTab();
      case 'professional':
        return renderProfessionalTab();
      case 'experience':
        return renderExperienceTab();
      case 'social':
        return renderSocialTab();
      default:
        return renderBasicInfoTab();
    }
  };

  return (
    <div className="min-h-[600px]">
      {renderTabContent()}
    </div>
  );
}