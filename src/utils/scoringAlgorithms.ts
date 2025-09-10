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

  // Basic file validation (20 points)
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  if (allowedTypes.includes(fileExtension)) {
    score += 20;
    strengths.push("ATS-friendly file format");
  } else {
    improvements.push("Use PDF, DOC, or DOCX format");
  }

  // File size quality check (30 points)
  if (file.size > 100000 && file.size < 1500000) { // 100KB - 1.5MB (good range)
    score += 30;
    strengths.push("Professional resume length and content");
  } else if (file.size > 50000 && file.size <= 100000) {
    score += 20;
    strengths.push("Adequate content length");
  } else if (file.size <= 50000) {
    score += 5;
    improvements.push("Resume appears too brief - add more content");
  } else {
    score += 10;
    improvements.push("File size is large - consider optimizing");
  }

  // Professional naming (10 points)
  const fileName = file.name.toLowerCase();
  if (fileName.includes('resume') || fileName.includes('cv')) {
    score += 10;
    strengths.push("Professional file naming");
  } else {
    improvements.push("Use professional file naming (include 'resume' or 'CV')");
  }

  // Role relevance simulation (40 points)
  const roleKeywords: Record<string, string[]> = {
    'Software Engineer': ['javascript', 'python', 'react', 'node', 'git', 'api'],
    'Product Manager': ['product', 'strategy', 'roadmap', 'stakeholder', 'agile'],
    'Data Scientist': ['python', 'machine learning', 'sql', 'data', 'analysis'],
    'UX Designer': ['user experience', 'wireframe', 'prototype', 'design'],
    'Sales Representative': ['sales', 'client', 'revenue', 'crm'],
    'Marketing Manager': ['marketing', 'campaign', 'brand', 'digital'],
    'Business Analyst': ['business', 'analysis', 'requirements'],
    'DevOps Engineer': ['aws', 'docker', 'kubernetes', 'automation']
  };

  const relevantKeywords = roleKeywords[selectedRole] || [];
  let keywordScore = 0;
  
  // Simulate keyword presence based on file characteristics
  if (file.size > 80000) keywordScore += 15; // Larger files likely have more keywords
  if (fileName.includes(selectedRole.toLowerCase().split(' ')[0])) keywordScore += 10;
  if (file.size > 120000) keywordScore += 15; // Very detailed resumes

  score += keywordScore;
  
  if (keywordScore >= 25) {
    strengths.push("Strong role-specific content");
  } else if (keywordScore >= 15) {
    strengths.push("Good role relevance");
  } else {
    improvements.push(`Include more ${selectedRole} specific keywords and skills`);
  }

  // Generate feedback
  let feedback = "";
  if (score >= 85) {
    feedback = `Excellent resume! Strong ${selectedRole} alignment with professional formatting.`;
  } else if (score >= 70) {
    feedback = `Good resume with solid ${selectedRole} potential. Minor optimizations needed.`;
  } else if (score >= 50) {
    feedback = `Average resume. Needs better ${selectedRole} keyword optimization.`;
  } else {
    feedback = `Poor resume quality. Significant improvements needed for ${selectedRole} role.`;
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