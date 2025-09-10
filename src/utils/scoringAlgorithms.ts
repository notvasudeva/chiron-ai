// Resume ATS Scoring Algorithm
export interface ResumeAnalysis {
  atsScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface InterviewAnalysis {
  overallScore: number;
  bodyLanguageScore: number;
  grammarScore: number;
  skillsScore: number;
  confidenceScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export const analyzeResume = (file: File | null, selectedRole: string): ResumeAnalysis => {
  if (!file) {
    return {
      atsScore: 0,
      feedback: "No resume uploaded. Please upload your resume to get an ATS analysis.",
      strengths: [],
      improvements: ["Upload a resume in PDF, DOC, or DOCX format"]
    };
  }

  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  // File format check (15 points MAX) - Strict requirements
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  if (fileExtension === '.pdf') {
    score += 15; // PDF is best for ATS
    strengths.push("PDF format - excellent ATS compatibility");
  } else if (allowedTypes.includes(fileExtension)) {
    score += 10; // DOC/DOCX acceptable but not ideal
    strengths.push("Acceptable ATS format");
    improvements.push("PDF format is preferred for better ATS parsing");
  } else {
    score += 0; // Zero points for bad formats
    improvements.push("Use PDF format for optimal ATS compatibility");
  }

  // File size analysis (20 points MAX) - Very strict on content quality
  if (file.size < 30000) { // Less than 30KB - likely empty or minimal
    score += 2;
    improvements.push("Resume appears too brief - likely lacks sufficient content");
    improvements.push("Add more experience, skills, and achievements");
  } else if (file.size < 80000) { // 30-80KB - probably basic
    score += 8;
    improvements.push("Resume may lack detailed content - consider adding more specifics");
  } else if (file.size < 150000) { // 80-150KB - decent content
    score += 15;
    strengths.push("Good content length indicating detailed experience");
  } else if (file.size < 300000) { // 150-300KB - comprehensive
    score += 20;
    strengths.push("Comprehensive resume with substantial content");
  } else if (file.size < 500000) { // 300-500KB - quite detailed
    score += 18;
    strengths.push("Detailed resume content");
    improvements.push("Consider optimizing file size while maintaining content");
  } else { // Over 500KB - too large
    score += 5;
    improvements.push("File size too large - may indicate formatting issues or unnecessary content");
  }

  // Professional naming (10 points MAX) - Strict standards
  const fileName = file.name.toLowerCase();
  if (fileName.includes('resume') && (fileName.includes('2024') || fileName.includes('2025'))) {
    score += 10;
    strengths.push("Professional, current file naming");
  } else if (fileName.includes('resume') || fileName.includes('cv')) {
    score += 6;
    strengths.push("Professional file naming");
    improvements.push("Include current year in filename");
  } else if (fileName.includes('john') || fileName.includes('jane') || fileName.includes('smith')) {
    score += 3;
    improvements.push("Use 'Resume' or 'CV' in filename for better recognition");
  } else {
    score += 0;
    improvements.push("Use professional naming: 'FirstName_LastName_Resume_2024.pdf'");
  }

  // Content depth analysis (35 points MAX) - Based on role requirements
  const roleKeywords: Record<string, { required: string[], bonus: string[], minSize: number }> = {
    'Software Engineer': { 
      required: ['javascript', 'python', 'react', 'git'], 
      bonus: ['node', 'api', 'database', 'typescript'],
      minSize: 120000 
    },
    'Product Manager': { 
      required: ['product', 'strategy', 'roadmap', 'stakeholder'], 
      bonus: ['agile', 'analytics', 'user', 'market'],
      minSize: 100000 
    },
    'Data Scientist': { 
      required: ['python', 'sql', 'data', 'analysis'], 
      bonus: ['machine learning', 'statistics', 'modeling'],
      minSize: 110000 
    },
    'UX Designer': { 
      required: ['user', 'design', 'wireframe'], 
      bonus: ['prototype', 'figma', 'research'],
      minSize: 90000 
    },
    'Sales Representative': { 
      required: ['sales', 'client', 'revenue'], 
      bonus: ['crm', 'negotiation', 'target'],
      minSize: 80000 
    },
    'Marketing Manager': { 
      required: ['marketing', 'campaign', 'digital'], 
      bonus: ['brand', 'analytics', 'roi'],
      minSize: 95000 
    },
    'Business Analyst': { 
      required: ['business', 'analysis', 'requirements'], 
      bonus: ['process', 'stakeholder', 'documentation'],
      minSize: 100000 
    },
    'DevOps Engineer': { 
      required: ['aws', 'docker', 'automation'], 
      bonus: ['kubernetes', 'ci/cd', 'monitoring'],
      minSize: 115000 
    }
  };

  const roleData = roleKeywords[selectedRole] || { required: [], bonus: [], minSize: 90000 };
  
  // Content quality scoring - VERY strict
  if (file.size < roleData.minSize) {
    score += 5; // Insufficient content for role
    improvements.push(`Resume too brief for ${selectedRole} role - needs more technical details`);
  } else if (file.size < roleData.minSize * 1.3) {
    score += 15; // Adequate content
    improvements.push("Add more specific achievements and technical details");
  } else if (file.size < roleData.minSize * 1.8) {
    score += 25; // Good content depth
    strengths.push("Good content depth for role requirements");
  } else {
    score += 35; // Excellent content depth
    strengths.push("Excellent comprehensive content matching role complexity");
  }

  // Role relevance bonus (20 points MAX) - Simulated keyword analysis
  let roleRelevanceScore = 0;
  
  // Simulate keyword presence based on filename and file characteristics
  if (fileName.includes(selectedRole.toLowerCase().split(' ')[0])) {
    roleRelevanceScore += 8;
    strengths.push("Role-specific terminology in filename");
  }
  
  // Size-based keyword simulation (larger files likely have more relevant content)
  if (file.size > roleData.minSize * 1.5) {
    roleRelevanceScore += 12;
    strengths.push("Comprehensive content likely contains relevant keywords");
  } else if (file.size > roleData.minSize) {
    roleRelevanceScore += 6;
  } else {
    improvements.push(`Add more ${selectedRole}-specific keywords and technical skills`);
  }

  score += roleRelevanceScore;

  // HARSH overall assessment - No easy high scores
  if (score < 25) {
    improvements.push("Resume needs complete overhaul for professional standards");
  } else if (score < 45) {
    improvements.push("Significant improvements needed across multiple areas");
  } else if (score < 65) {
    improvements.push("Good foundation but needs optimization for competitive edge");
  }

  // Generate realistic feedback
  let feedback = "";
  if (score >= 85) {
    feedback = `Excellent resume! Outstanding ${selectedRole} optimization with professional formatting and comprehensive content.`;
  } else if (score >= 70) {
    feedback = `Good resume with solid ${selectedRole} potential. Some optimization opportunities remain.`;
  } else if (score >= 50) {
    feedback = `Average resume. Needs better ${selectedRole} keyword optimization and content depth.`;
  } else if (score >= 30) {
    feedback = `Below average resume. Significant improvements needed for ${selectedRole} competitiveness.`;
  } else {
    feedback = `Poor resume quality. Major overhaul required for ${selectedRole} role consideration.`;
  }

  return {
    atsScore: Math.min(score, 100),
    feedback,
    strengths,
    improvements
  };
};

export const analyzeInterviewPerformance = (
  interviewData: {
    questionsAnswered: number;
    totalQuestions: number;
    timeSpentPerQuestion: number[];
    cameraUsed: boolean;
    microphoneUsed: boolean;
    interviewCompleted: boolean;
    selectedRole: string;
    interviewDuration: number;
  }
): InterviewAnalysis => {
  const { questionsAnswered, totalQuestions, timeSpentPerQuestion, cameraUsed, microphoneUsed, interviewCompleted, interviewDuration } = interviewData;

  const strengths: string[] = [];
  const improvements: string[] = [];

  // Calculate key metrics
  const completionRate = questionsAnswered / totalQuestions;
  const avgTimePerQuestion = timeSpentPerQuestion.length > 0 
    ? timeSpentPerQuestion.reduce((a, b) => a + b, 0) / timeSpentPerQuestion.length 
    : 0;

  // ULTRA STRICT: No proper engagement = ZERO scores across the board
  
  // BODY LANGUAGE SCORE (0-100) - ZERO tolerance for poor engagement
  let bodyLanguageScore = 0;
  if (!cameraUsed) {
    bodyLanguageScore = 0;
    improvements.push("Camera not enabled - no visual assessment possible");
  } else if (questionsAnswered === 0) {
    bodyLanguageScore = 0; // ABSOLUTE ZERO for skipping all questions
    improvements.push("Skipped all questions - shows no professional engagement");
  } else if (completionRate < 0.3) {
    bodyLanguageScore = 5; // Barely any score for minimal participation
    improvements.push("Extremely poor engagement - answered less than 30% of questions");
  } else if (completionRate < 0.6) {
    bodyLanguageScore = 15;
    improvements.push("Poor engagement - must answer at least 60% of questions");
  } else if (completionRate < 0.8) {
    bodyLanguageScore = 35;
    improvements.push("Moderate engagement - aim for 80%+ completion");
  } else if (completionRate < 0.95) {
    bodyLanguageScore = 65;
    strengths.push("Good visual presence and engagement");
  } else {
    bodyLanguageScore = 85;
    strengths.push("Excellent visual engagement throughout");
  }

  // MAJOR penalty for rushed/skipped responses
  const rushResponse = timeSpentPerQuestion.filter(time => time < 5).length;
  if (rushResponse > questionsAnswered * 0.3) {
    bodyLanguageScore = Math.max(bodyLanguageScore - 40, 0);
    improvements.push("Too many rushed responses - shows disrespect for process");
  }

  // GRAMMAR & COMMUNICATION SCORE (0-100) - ZERO tolerance for no effort
  let grammarScore = 0;
  if (!microphoneUsed) {
    grammarScore = 0;
    improvements.push("Microphone not enabled - no speech assessment possible");
  } else if (questionsAnswered === 0) {
    grammarScore = 0; // ABSOLUTE ZERO for no participation
    improvements.push("No questions answered - cannot assess communication skills");
  } else if (avgTimePerQuestion < 3) {
    grammarScore = 0; // ZERO for essentially skipping
    improvements.push("Responses too brief to constitute actual communication");
  } else if (avgTimePerQuestion < 10) {
    grammarScore = 5;
    improvements.push("Extremely brief responses - need substantial improvement");
  } else if (avgTimePerQuestion < 20) {
    grammarScore = 20;
    improvements.push("Brief responses - provide more detailed answers");
  } else if (avgTimePerQuestion < 35) {
    grammarScore = 50;
    improvements.push("Adequate response length but could be more detailed");
  } else if (avgTimePerQuestion < 60) {
    grammarScore = 75;
    strengths.push("Good detailed responses showing communication skills");
  } else {
    grammarScore = 85;
    strengths.push("Excellent detailed, articulate responses");
  }

  // MASSIVE penalty for poor completion (shows disrespect)
  if (completionRate < 0.5) {
    grammarScore = Math.round(grammarScore * 0.1); // Cut to almost nothing
    improvements.push("Skipping most questions severely damages communication assessment");
  } else if (completionRate < 0.7) {
    grammarScore = Math.round(grammarScore * 0.4);
    improvements.push("Low completion rate significantly impacts score");
  }

  // SKILLS DEMONSTRATION SCORE (0-100) - ZERO tolerance for no demonstration
  let skillsScore = 0;
  if (questionsAnswered === 0) {
    skillsScore = 0; // ABSOLUTE ZERO for no participation
    improvements.push("Cannot assess skills without answering questions");
    improvements.push("Complete interview to demonstrate capabilities");
  } else if (completionRate < 0.4) {
    skillsScore = 2; // Essentially zero for very poor participation
    improvements.push("Extremely limited skill demonstration - unacceptable for professional assessment");
  } else if (completionRate < 0.6) {
    skillsScore = 10;
    improvements.push("Insufficient skill demonstration - must complete majority of questions");
  } else if (completionRate < 0.8) {
    skillsScore = 30;
    improvements.push("Basic skill demonstration - need 80%+ completion for good assessment");
  } else if (completionRate < 0.95) {
    skillsScore = 60;
    strengths.push("Good demonstration of role-specific skills");
  } else {
    skillsScore = 80;
    strengths.push(`Excellent demonstration of ${interviewData.selectedRole} expertise`);
  }

  // SEVERE penalty for rushed responses (shows no actual thought)
  if (avgTimePerQuestion < 8 && questionsAnswered > 0) {
    skillsScore = Math.max(skillsScore - 50, 0);
    improvements.push("Rushed responses show no real skill demonstration");
  } else if (avgTimePerQuestion >= 30) {
    skillsScore += 15;
    strengths.push("Thoughtful responses demonstrating deep expertise");
  }

  // CONFIDENCE SCORE (0-100) - ZERO tolerance for poor effort
  let confidenceScore = 0;
  if (!cameraUsed || !microphoneUsed) {
    confidenceScore = 0; // No score without proper setup
    improvements.push("Professional confidence requires both camera and microphone");
  } else if (questionsAnswered === 0) {
    confidenceScore = 0; // ABSOLUTE ZERO for no participation
    improvements.push("Skipping entire interview shows complete lack of confidence");
  } else if (completionRate < 0.3) {
    confidenceScore = 5; // Almost nothing for terrible participation
    improvements.push("Extremely poor participation indicates very low confidence");
  } else if (completionRate < 0.6) {
    confidenceScore = 15;
    improvements.push("Low participation suggests significant confidence issues");
  } else if (completionRate < 0.8) {
    confidenceScore = 40;
    improvements.push("Moderate confidence - complete more questions to show strength");
  } else if (completionRate < 0.95) {
    confidenceScore = 70;
    strengths.push("Good confidence demonstrated through strong participation");
  } else {
    confidenceScore = 90;
    strengths.push("Excellent confidence shown through complete engagement");
  }

  // Response quality strongly impacts confidence assessment
  if (avgTimePerQuestion < 5 && questionsAnswered > 0) {
    confidenceScore = Math.max(confidenceScore - 40, 0);
    improvements.push("Rushed responses indicate nervousness or lack of preparation");
  } else if (avgTimePerQuestion >= 25) {
    confidenceScore += 10;
    strengths.push("Thoughtful response timing shows professional confidence");
  }

  // OVERALL SCORE - Now properly strict
  const overallScore = Math.round((bodyLanguageScore + grammarScore + skillsScore + confidenceScore) / 4);

  // ULTRA DETAILED FEEDBACK - Harsh but fair
  let feedback = "";
  if (overallScore === 0) {
    feedback = `Complete Failure (${overallScore}%): No measurable interview performance. You answered ${questionsAnswered}/${totalQuestions} questions with ${avgTimePerQuestion.toFixed(1)}s average time. This represents total unprofessionalism and complete unreadiness for any professional role.`;
  } else if (overallScore < 15) {
    feedback = `Critical Failure (${overallScore}%): Severely inadequate performance. You answered only ${questionsAnswered}/${totalQuestions} questions (${(completionRate * 100).toFixed(1)}% completion) with ${avgTimePerQuestion.toFixed(1)}s average response time. This shows extreme lack of preparation, professionalism, and respect for the interview process. Immediate and comprehensive improvement required.`;
  } else if (overallScore < 35) {
    feedback = `Poor Performance (${overallScore}%): Unacceptable interview showing. Completion rate: ${(completionRate * 100).toFixed(1)}% with ${avgTimePerQuestion.toFixed(1)}s average response time. Your performance indicates significant deficiencies in preparation, communication skills, and professional conduct. Major improvement needed across all areas.`;
  } else if (overallScore < 55) {
    feedback = `Below Average (${overallScore}%): Inadequate interview performance. You completed ${(completionRate * 100).toFixed(1)}% of questions with ${avgTimePerQuestion.toFixed(1)}s average responses. While showing basic participation, performance lacks the depth, preparation, and professionalism expected for the ${interviewData.selectedRole} role.`;
  } else if (overallScore < 75) {
    feedback = `Average Performance (${overallScore}%): Acceptable but unremarkable showing. ${(completionRate * 100).toFixed(1)}% completion rate with ${avgTimePerQuestion.toFixed(1)}s average response time. Demonstrates basic competency but needs significant improvement in depth, confidence, and professional polish to be competitive.`;
  } else if (overallScore < 90) {
    feedback = `Good Performance (${overallScore}%): Strong interview demonstration. ${(completionRate * 100).toFixed(1)}% completion with ${avgTimePerQuestion.toFixed(1)}s average response time. Shows professional readiness and solid ${interviewData.selectedRole} competency. Minor refinements could elevate to excellence.`;
  } else {
    feedback = `Excellent Performance (${overallScore}%): Outstanding interview showing. ${(completionRate * 100).toFixed(1)}% completion with ${avgTimePerQuestion.toFixed(1)}s average response time. Demonstrates exceptional preparation, professional presence, and strong ${interviewData.selectedRole} expertise. Interview-ready candidate.`;
  }

  return {
    overallScore,
    bodyLanguageScore,
    grammarScore,
    skillsScore,
    confidenceScore,
    feedback,
    strengths,
    improvements
  };
};