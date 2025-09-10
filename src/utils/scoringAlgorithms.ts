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

  // BODY LANGUAGE SCORE (0-100)
  let bodyLanguageScore = 0;
  if (!cameraUsed) {
    bodyLanguageScore = 0;
    improvements.push("Enable camera for body language assessment");
  } else {
    if (completionRate >= 0.9) {
      bodyLanguageScore = 85;
      strengths.push("Excellent visual presence throughout interview");
    } else if (completionRate >= 0.7) {
      bodyLanguageScore = 70;
      strengths.push("Good visual engagement");
    } else if (completionRate >= 0.5) {
      bodyLanguageScore = 50;
      improvements.push("Complete more questions to show better engagement");
    } else {
      bodyLanguageScore = 25;
      improvements.push("Poor visual engagement - answer more questions");
    }

    // Time quality bonus
    if (avgTimePerQuestion >= 25 && avgTimePerQuestion <= 60) {
      bodyLanguageScore += 10;
      strengths.push("Good response timing shows composure");
    }
  }

  // GRAMMAR & COMMUNICATION SCORE (0-100)
  let grammarScore = 0;
  if (!microphoneUsed) {
    grammarScore = 0;
    improvements.push("Enable microphone for communication assessment");
  } else {
    if (avgTimePerQuestion >= 45) {
      grammarScore = 85;
      strengths.push("Detailed, articulate responses");
    } else if (avgTimePerQuestion >= 30) {
      grammarScore = 70;
      strengths.push("Good communication depth");
    } else if (avgTimePerQuestion >= 15) {
      grammarScore = 55;
      improvements.push("Provide more detailed responses");
    } else if (avgTimePerQuestion >= 5) {
      grammarScore = 30;
      improvements.push("Responses too brief - elaborate more");
    } else {
      grammarScore = 10;
      improvements.push("Extremely brief responses suggest poor preparation");
    }

    // Completion penalty for inconsistent communication
    if (completionRate < 0.7) {
      grammarScore = Math.round(grammarScore * 0.6);
      improvements.push("Inconsistent participation affects communication score");
    }
  }

  // SKILLS DEMONSTRATION SCORE (0-100)
  let skillsScore = 0;
  if (questionsAnswered === 0) {
    skillsScore = 0;
    improvements.push("Answer questions to demonstrate your skills");
  } else {
    // Base score from completion
    if (completionRate >= 0.9) {
      skillsScore = 80;
      strengths.push(`Strong ${interviewData.selectedRole} skill demonstration`);
    } else if (completionRate >= 0.7) {
      skillsScore = 65;
      strengths.push("Good role-specific competency shown");
    } else if (completionRate >= 0.5) {
      skillsScore = 45;
      improvements.push("Demonstrate more expertise by answering more questions");
    } else {
      skillsScore = 25;
      improvements.push("Limited skill demonstration - complete more questions");
    }

    // Quality bonus for thoughtful responses
    if (avgTimePerQuestion >= 35) {
      skillsScore += 15;
      strengths.push("Thoughtful, detailed skill explanations");
    } else if (avgTimePerQuestion < 15) {
      skillsScore -= 20;
      improvements.push("Rushed responses don't showcase expertise properly");
    }

    skillsScore = Math.max(0, Math.min(100, skillsScore));
  }

  // CONFIDENCE SCORE (0-100)
  let confidenceScore = 0;
  if (!cameraUsed || !microphoneUsed) {
    confidenceScore = 20;
    improvements.push("Use both camera and microphone to show full confidence");
  } else {
    // Base confidence from participation
    if (completionRate >= 0.9 && avgTimePerQuestion >= 25) {
      confidenceScore = 90;
      strengths.push("High confidence demonstrated through complete engagement");
    } else if (completionRate >= 0.8) {
      confidenceScore = 75;
      strengths.push("Good confidence level shown");
    } else if (completionRate >= 0.6) {
      confidenceScore = 60;
      improvements.push("Build confidence by completing more questions");
    } else if (completionRate >= 0.4) {
      confidenceScore = 40;
      improvements.push("Low completion suggests confidence issues");
    } else {
      confidenceScore = 20;
      improvements.push("Very low engagement indicates lack of confidence");
    }

    // Response quality impact
    if (avgTimePerQuestion >= 40) {
      confidenceScore += 10;
      strengths.push("Confident, detailed responses");
    } else if (avgTimePerQuestion < 10) {
      confidenceScore -= 15;
      improvements.push("Very brief responses suggest nervousness");
    }

    confidenceScore = Math.max(0, Math.min(100, confidenceScore));
  }

  // OVERALL SCORE
  const overallScore = Math.round((bodyLanguageScore + grammarScore + skillsScore + confidenceScore) / 4);

  // DETAILED FEEDBACK
  let feedback = "";
  if (overallScore >= 85) {
    feedback = `Outstanding interview performance (${overallScore}%)! You completed ${questionsAnswered}/${totalQuestions} questions with ${avgTimePerQuestion.toFixed(1)}s average response time. Excellent professional presence, communication skills, and ${interviewData.selectedRole} expertise demonstrated.`;
  } else if (overallScore >= 70) {
    feedback = `Strong interview performance (${overallScore}%). Good engagement with ${questionsAnswered}/${totalQuestions} questions answered (${avgTimePerQuestion.toFixed(1)}s avg). Professional communication and solid role competency shown. Minor improvements could enhance your performance further.`;
  } else if (overallScore >= 55) {
    feedback = `Average performance (${overallScore}%). You answered ${questionsAnswered}/${totalQuestions} questions averaging ${avgTimePerQuestion.toFixed(1)}s each. Shows basic competency but needs more depth, confidence, and complete participation to stand out.`;
  } else if (overallScore >= 35) {
    feedback = `Below average performance (${overallScore}%). Limited engagement with ${questionsAnswered}/${totalQuestions} questions (${avgTimePerQuestion.toFixed(1)}s avg). Significant improvement needed in preparation, confidence, and interview skills.`;
  } else {
    feedback = `Poor performance (${overallScore}%). Critical issues with participation (${questionsAnswered}/${totalQuestions} questions), preparation, and professional presence. Focus on technical setup, interview preparation, and building confidence.`;
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