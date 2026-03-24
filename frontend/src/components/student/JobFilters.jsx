import React from 'react';

export default function JobFilters({ companies = [], skills = [], selectedCompany, selectedSkills = [], onCompanyChange, onToggleSkill }) {
  return (
    <div className="glass rounded-2xl p-4">
      <h4 className="text-sm font-semibold text-white mb-3">Filters</h4>
      <div className="mb-3">
        <label className="block text-xs text-white/70 mb-1">Company</label>
        <select value={selectedCompany} onChange={e => onCompanyChange(e.target.value)} className="w-full py-2 px-3 rounded-xl border border-white/10 bg-transparent text-white text-sm">
          <option value="">All companies</option>
          {companies.map(company => (<option key={company} value={company}>{company}</option>))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-white/70 mb-1">Skills</label>
        <div className="flex flex-wrap gap-2">
          {skills.map(skill => (
            <button key={skill} onClick={() => onToggleSkill(skill)} className={`text-xs px-2 py-1 rounded-full transition ${selectedSkills.includes(skill) ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/80'}`}>
              {skill}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
