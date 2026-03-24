import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Link as LinkIcon, Calendar, Building } from 'lucide-react';

export default function ProfilePreview({ profileData }) {
  const formatExperience = (years) => {
    if (years === 0) return 'Entry Level';
    if (years === 1) return '1 year';
    return `${years} years`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6">Profile Preview</h3>

      {/* Profile Header */}
      <div className="flex items-start space-x-4 mb-6">
        <div className="relative">
          {profileData.profilePhoto ? (
            <img
              src={profileData.profilePhoto}
              alt={profileData.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
              {profileData.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xl font-bold text-white truncate">
            {profileData.name || 'Your Name'}
          </h4>
          <p className="text-gray-300 text-sm">
            {profileData.jobRole || 'Job Role'} {profileData.company && `at ${profileData.company}`}
          </p>
          <div className="flex items-center text-gray-400 text-xs mt-1">
            <Calendar size={12} className="mr-1" />
            {formatExperience(profileData.experienceYears)} experience
            {profileData.location && (
              <>
                <span className="mx-2">•</span>
                <MapPin size={12} className="mr-1" />
                {profileData.location}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {profileData.bio && (
        <div className="mb-6">
          <p className="text-gray-300 text-sm leading-relaxed">
            {profileData.bio}
          </p>
        </div>
      )}

      {/* Skills */}
      {profileData.skills && profileData.skills.length > 0 && (
        <div className="mb-6">
          <h5 className="text-sm font-medium text-gray-300 mb-3">Skills</h5>
          <div className="flex flex-wrap gap-2">
            {profileData.skills.slice(0, 6).map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
              >
                {skill}
              </span>
            ))}
            {profileData.skills.length > 6 && (
              <span className="px-3 py-1 bg-gray-700 text-gray-400 text-xs rounded-full">
                +{profileData.skills.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Experience */}
      {profileData.experiences && profileData.experiences.length > 0 && (
        <div className="mb-6">
          <h5 className="text-sm font-medium text-gray-300 mb-3">Recent Experience</h5>
          <div className="space-y-3">
            {profileData.experiences.slice(0, 2).map((exp, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <Building size={16} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {exp.role}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    {exp.company}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {exp.duration}
                  </p>
                </div>
              </div>
            ))}
            {profileData.experiences.length > 2 && (
              <p className="text-gray-500 text-xs">
                +{profileData.experiences.length - 2} more experiences
              </p>
            )}
          </div>
        </div>
      )}

      {/* Social Links */}
      {(profileData.linkedin || profileData.portfolio) && (
        <div>
          <h5 className="text-sm font-medium text-gray-300 mb-3">Links</h5>
          <div className="space-y-2">
            {profileData.linkedin && (
              <a
                href={profileData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                <LinkIcon size={14} className="mr-2" />
                LinkedIn Profile
              </a>
            )}
            {profileData.portfolio && (
              <a
                href={profileData.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                <LinkIcon size={14} className="mr-2" />
                Portfolio
              </a>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!profileData.bio && (!profileData.skills || profileData.skills.length === 0) &&
       (!profileData.experiences || profileData.experiences.length === 0) && (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-3">
            <Building size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-400 text-sm">Complete your profile to see how it looks to students</p>
        </div>
      )}
    </motion.div>
  );
}