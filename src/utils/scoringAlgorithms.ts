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

  // File format check (10 points)
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (allowedTypes.includes(fileExtension)) {
    score += 10;
    strengths.push("Resume is in an ATS-friendly format");
  } else {
    improvements.push("Use PDF, DOC, or DOCX format for better ATS compatibility");
  }

  // File size check (5 points)
  if (file.size > 50000 && file.size < 2000000) { // Between 50KB and 2MB
    score += 5;
    strengths.push("File size is appropriate");
  } else if (file.size <= 50000) {
    improvements.push("Resume file seems too small - may lack content");
  } else {
    improvements.push("Resume file is quite large - consider optimizing");
  }

  // Filename analysis (10 points)
  const fileName = file.name.toLowerCase();
  if (fileName.includes('resume') || fileName.includes('cv')) {
    score += 5;
    strengths.push("File has a professional name");
  } else {
    improvements.push("Consider naming your file with 'resume' or 'CV'");
  }

  // Role-specific keyword simulation (25 points)
  const roleKeywords: Record<string, string[]> = {
    'Software Engineer': ['javascript', 'python', 'react', 'node', 'git', 'api', 'database', 'frontend', 'backend'],
    'Product Manager': ['product', 'strategy', 'roadmap', 'stakeholder', 'agile', 'analytics', 'user', 'market'],
    'Data Scientist': ['python', 'machine learning', 'statistics', 'sql', 'data', 'analysis', 'modeling', 'visualization'],
    'UX Designer': ['user experience', 'wireframe', 'prototype', 'usability', 'research', 'figma', 'design'],
    'Sales Representative': ['sales', 'client', 'relationship', 'revenue', 'target', 'crm', 'negotiation'],
    'Marketing Manager': ['marketing', 'campaign', 'brand', 'digital', 'analytics', 'roi', 'content'],
    'Business Analyst': ['business', 'requirements', 'analysis', 'process', 'stakeholder', 'documentation'],
    'DevOps Engineer': ['aws', 'docker', 'kubernetes', 'ci/cd', 'infrastructure', 'automation', 'monitoring']
  };

  const relevantKeywords = roleKeywords[selectedRole] || [];
  // Simulate finding keywords in filename (basic check)
  let keywordMatches = 0;
  relevantKeywords.forEach(keyword => {
    if (fileName.includes(keyword.toLowerCase())) {
      keywordMatches++;
    }
  });

  if (keywordMatches > 0) {
    score += Math.min(keywordMatches * 3, 15);
    strengths.push(`Resume appears to contain ${keywordMatches} relevant keywords`);
  } else {
    improvements.push(`Include relevant ${selectedRole} keywords in your resume`);
  }

  // Length estimation based on file size (15 points)
  if (file.size > 100000) {
    score += 15;
    strengths.push("Resume appears to have substantial content");
  } else if (file.size > 50000) {
    score += 10;
    strengths.push("Resume has adequate content length");
  } else {
    improvements.push("Resume may be too brief - consider adding more details");
  }

  // Recent upload bonus (5 points)
  score += 5;
  strengths.push("Recently updated resume");

  // Additional scoring factors
  if (score >= 60) {
    strengths.push("Strong ATS optimization potential");
  } else if (score >= 40) {
    improvements.push("Consider optimizing resume for ATS systems");
  } else {
    improvements.push("Resume needs significant improvement for ATS compatibility");
  }

  let feedback = "";
  if (score >= 80) {
    feedback = "Excellent! Your resume is well-optimized for ATS systems with strong keyword matching and proper formatting.";
  } else if (score >= 60) {
    feedback = "Good resume structure with room for improvement in keyword optimization and formatting.";
  } else if (score >= 40) {
    feedback = "Your resume needs optimization for ATS systems. Focus on relevant keywords and proper formatting.";
  } else {
    feedback = "Resume requires significant improvement for ATS compatibility. Consider professional formatting and relevant content.";
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
  }
): InterviewAnalysis => {
  const { questionsAnswered, totalQuestions, timeSpentPerQuestion, cameraUsed, microphoneUsed, interviewCompleted } = interviewData;

  let bodyLanguageScore = 0;
  let grammarScore = 0;
  let skillsScore = 0;
  let confidenceScore = 0;

  const strengths: string[] = [];
  const improvements: string[] = [];

  // Body Language Score (based on camera usage and completion)
  if (cameraUsed) {
    bodyLanguageScore += 40;
    strengths.push("Maintained visual presence during interview");
  } else {
    improvements.push("Enable camera for better engagement assessment");
  }

  if (interviewCompleted) {
    bodyLanguageScore += 30;
    confidenceScore += 20;
    strengths.push("Completed the full interview session");
  } else {
    improvements.push("Try to complete all interview questions");
  }

  if (questionsAnswered >= totalQuestions * 0.8) {
    bodyLanguageScore += 30;
    strengths.push("Engaged with most interview questions");
  } else {
    bodyLanguageScore += Math.round((questionsAnswered / totalQuestions) * 30);
    improvements.push("Answer more questions to demonstrate engagement");
  }

  // Grammar & Speech Score (based on microphone usage and time spent)
  if (microphoneUsed) {
    grammarScore += 50;
    strengths.push("Audio engagement detected");
  } else {
    improvements.push("Enable microphone to assess verbal communication");
  }

  // Time analysis
  const avgTimePerQuestion = timeSpentPerQuestion.length > 0 
    ? timeSpentPerQuestion.reduce((a, b) => a + b, 0) / timeSpentPerQuestion.length 
    : 0;

  if (avgTimePerQuestion >= 30 && avgTimePerQuestion <= 80) {
    grammarScore += 30;
    confidenceScore += 30;
    strengths.push("Good response timing and thoughtfulness");
  } else if (avgTimePerQuestion > 80) {
    grammarScore += 20;
    improvements.push("Try to be more concise in responses");
  } else if (avgTimePerQuestion > 0) {
    grammarScore += 15;
    improvements.push("Take more time to provide detailed responses");
  }

  if (questionsAnswered > 0) {
    grammarScore += 20;
    strengths.push("Provided responses to interview questions");
  } else {
    improvements.push("Provide verbal responses to questions");
  }

  // Skills Score (role-specific performance)
  const completionRate = questionsAnswered / totalQuestions;
  skillsScore = Math.round(completionRate * 60);

  if (completionRate >= 0.8) {
    skillsScore += 20;
    strengths.push("Demonstrated thorough engagement with role-specific questions");
  } else if (completionRate >= 0.5) {
    skillsScore += 10;
    improvements.push("Answer more role-specific questions to showcase expertise");
  } else {
    improvements.push("Focus on completing more interview questions");
  }

  // Role-specific bonus
  if (interviewCompleted && cameraUsed && microphoneUsed) {
    skillsScore += 20;
    strengths.push(`Strong preparation for ${interviewData.selectedRole} position`);
  }

  // Confidence Score
  if (cameraUsed && microphoneUsed) {
    confidenceScore += 40;
    strengths.push("Confident use of technology and video interaction");
  }

  if (questionsAnswered === totalQuestions) {
    confidenceScore += 30;
    strengths.push("Consistent engagement throughout interview");
  } else {
    confidenceScore += Math.round((questionsAnswered / totalQuestions) * 30);
  }

  if (avgTimePerQuestion >= 20) {
    confidenceScore += 10;
    strengths.push("Thoughtful response approach");
  }

  // Overall score calculation
  const overallScore = Math.round((bodyLanguageScore + grammarScore + skillsScore + confidenceScore) / 4);

  // Generate feedback
  let feedback = "";
  if (overallScore >= 80) {
    feedback = "Excellent interview performance! Strong engagement, communication skills, and technical competency demonstrated.";
  } else if (overallScore >= 60) {
    feedback = "Good interview performance with solid communication skills. Some areas for improvement identified.";
  } else if (overallScore >= 40) {
    feedback = "Fair interview performance. Focus on engagement, completion, and using all available tools (camera/microphone).";
  } else {
    feedback = "Interview performance needs improvement. Practice with the full interview setup and complete all questions.";
  }

  return {
    overallScore: Math.min(overallScore, 100),
    bodyLanguageScore: Math.min(bodyLanguageScore, 100),
    grammarScore: Math.min(grammarScore, 100),
    skillsScore: Math.min(skillsScore, 100),
    confidenceScore: Math.min(confidenceScore, 100),
    feedback,
    strengths,
    improvements
  };
};