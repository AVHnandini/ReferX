import User from '../models/User.js';

const SKILL_KEYWORDS = ['javascript', 'python', 'react', 'node', 'sql', 'java', 'typescript', 'aws', 'docker', 'kubernetes', 'machine learning', 'data science', 'figma', 'ui/ux', 'css', 'html', 'mongodb', 'postgresql', 'git', 'rest api', 'graphql', 'vue', 'angular', 'swift', 'flutter', 'go', 'rust', 'c++', 'c#', 'php', 'ruby', 'scala'];

export const analyzeResume = async (req, res) => {
  try {
    const { resumeText } = req.body;
    const lower = resumeText.toLowerCase();
    
    const extractedSkills = SKILL_KEYWORDS.filter(k => lower.includes(k));
    
    let score = 0;
    const suggestions = [];

    if (lower.includes('@') && lower.includes('.')) { score += 15; } else { suggestions.push('Add contact email'); }
    if (lower.match(/\b(experience|work|intern|employment)\b/)) { score += 20; } else { suggestions.push('Add work experience section'); }
    if (lower.match(/\b(education|university|college|degree|bachelor|master)\b/)) { score += 15; } else { suggestions.push('Add education section'); }
    if (extractedSkills.length >= 5) { score += 25; } else { suggestions.push(`Add more technical skills (found: ${extractedSkills.length})`); score += extractedSkills.length * 3; }
    if (lower.match(/\b(project|built|developed|created|designed)\b/)) { score += 15; } else { suggestions.push('Add projects section'); }
    if (lower.match(/\b(github|linkedin|portfolio)\b/)) { score += 10; } else { suggestions.push('Add GitHub/LinkedIn links'); }

    score = Math.min(score, 100);

    await User.findByIdAndUpdate(req.user.id, { skills: extractedSkills });

    res.json({ score, extractedSkills, suggestions, wordCount: resumeText.split(/\s+/).length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
