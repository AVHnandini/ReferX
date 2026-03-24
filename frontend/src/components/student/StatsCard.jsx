import React from "react";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, icon: Icon, color = "blue", delay = 0 }) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-green-500/10 text-green-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
    red: "bg-red-500/10 text-red-400",
    purple: "bg-purple-500/10 text-purple-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon size={20} />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-300">{title}</h3>
    </motion.div>
  );
}
