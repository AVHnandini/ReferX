import React from "react";
import { motion } from "framer-motion";
import { MapPin, Building, DollarSign, Clock, Star } from "lucide-react";

export default function JobCard({ job, onViewDetails, onRequestReferral, onSaveJob, delay = 0 }) {
  const matchPercentage = job.match_percentage || Math.floor(Math.random() * 40) + 60; // Mock data

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-lg">
              {job.company?.[0]?.toUpperCase() || "C"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                {job.title}
              </h3>
              <p className="text-gray-400">{job.company}</p>
            </div>
          </div>

          {matchPercentage > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-yellow-400">{matchPercentage}% match</span>
              </div>
            </div>
          )}
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-white">{job.salary || "₹8-12 LPA"}</p>
          <p className="text-sm text-gray-400">per year</p>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
        {job.description || "We are looking for a talented professional to join our team and contribute to exciting projects."}
      </p>

      <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <MapPin size={14} />
          <span>{job.location || "Remote"}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{job.type || "Full-time"}</span>
        </div>
      </div>

      {job.required_skills && job.required_skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {job.required_skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs"
            >
              {skill}
            </span>
          ))}
          {job.required_skills.length > 4 && (
            <span className="px-3 py-1 rounded-full bg-white/10 text-gray-400 text-xs">
              +{job.required_skills.length - 4} more
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2 items-center">
        <button
          onClick={() => onViewDetails(job)}
          className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => onRequestReferral(job)}
          className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
        >
          Request Referral
        </button>
        <button
          onClick={() => onSaveJob(job)}
          className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
        >
          Save Job
        </button>
      </div>
      <div className="mt-3 text-xs text-brand-300 hover:text-brand-200 cursor-pointer" onClick={() => window.location.href = '/student/alumni'}>
        View Alumni
      </div>
    </motion.div>
  );
}
