import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, GraduationCap, Building, MapPin, Calendar, Edit3 } from "lucide-react";

export default function ProfileCard({ user, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);

  const profileStrength = calculateProfileStrength(user);

  function calculateProfileStrength(user) {
    let score = 0;
    if (user?.name) score += 20;
    if (user?.email) score += 15;
    if (user?.skills?.length > 0) score += 25;
    if (user?.college) score += 15;
    if (user?.course) score += 10;
    if (user?.resume) score += 15;
    return Math.min(score, 100);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Profile Overview</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
        >
          <Edit3 size={14} />
          <span className="text-sm">Edit</span>
        </button>
      </div>

      {/* Profile Strength */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Profile Strength</span>
          <span className="text-sm font-bold text-white">{profileStrength}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${profileStrength}%` }}
            transition={{ duration: 1 }}
            className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
          />
        </div>
      </div>

      {/* Profile Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <User size={16} className="text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Name</p>
            <p className="text-white font-medium">{user?.name || "Not set"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <Mail size={16} className="text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Email</p>
            <p className="text-white font-medium">{user?.email}</p>
          </div>
        </div>

        {user?.role === "student" && (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <GraduationCap size={16} className="text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">College</p>
                <p className="text-white font-medium">{user?.college || "Not set"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Building size={16} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Course</p>
                <p className="text-white font-medium">{user?.course || "Not set"}</p>
              </div>
            </div>
          </>
        )}

        {user?.role === "alumni" && (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Building size={16} className="text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Company</p>
                <p className="text-white font-medium">{user?.company || "Not set"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Briefcase size={16} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Job Role</p>
                <p className="text-white font-medium">{user?.jobRole || "Not set"}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Skills */}
      {user?.skills?.length > 0 && (
        <div className="mt-6">
          <p className="text-sm text-gray-400 mb-2">Skills</p>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
