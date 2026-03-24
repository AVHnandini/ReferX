import React from 'react';

export default function JobFilters({ companies, skills, selectedCompany, selectedSkill, onCompanyChange, onSkillChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <select value={selectedCompany} onChange={onCompanyChange}
        className="input bg-white/10 border-white/15 text-white">
        <option value="">All companies</option>
        {companies.map((company) => <option key={company} value={company}>{company}</option>)}
      </select>
      <select value={selectedSkill} onChange={onSkillChange}
        className="input bg-white/10 border-white/15 text-white">
        <option value="">All skills</option>
        {skills.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
      </select>
    </div>
  );
}
