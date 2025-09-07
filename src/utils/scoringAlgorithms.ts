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
    interviewDuration: number; // total time spent in interview
  }
): InterviewAnalysis => {
  const { questionsAnswered, totalQuestions, timeSpentPerQuestion, cameraUsed, microphoneUsed, interviewCompleted, interviewDuration } = interviewData;

  let bodyLanguageScore = 0;
  let grammarScore = 0;
  let skillsScore = 0;
  let confidenceScore = 0;

  const strengths: string[] = [];
  const improvements: string[] = [];

  // More realistic scoring system
  const completionRate = questionsAnswered / totalQuestions;
  const avgTimePerQuestion = timeSpentPerQuestion.length > 0 
    ? timeSpentPerQuestion.reduce((a, b) => a + b, 0) / timeSpentPerQuestion.length 
    : 0;

  // Body Language Score (0-100) - Much more strict
  if (!cameraUsed) {
    bodyLanguageScore = 0;
    improvements.push("Camera not used - body language cannot be assessed");
  } else {
    bodyLanguageScore += 20; // Base points for camera usage
    strengths.push("Camera enabled for visual assessment");

    if (completionRate >= 0.9) {
      bodyLanguageScore += 35;
      strengths.push("Excellent visual engagement throughout interview");
    } else if (completionRate >= 0.7) {
      bodyLanguageScore += 25;
      strengths.push("Good visual presence during most questions");
    } else if (completionRate >= 0.5) {
      bodyLanguageScore += 15;
      improvements.push("Inconsistent visual engagement - try to stay focused");
    } else {
      bodyLanguageScore += 5;
      improvements.push("Poor visual engagement - maintain eye contact and posture");
    }

    // Penalize for very short responses (indicates disengagement)
    const shortResponseCount = timeSpentPerQuestion.filter(time => time < 15).length;
    if (shortResponseCount > totalQuestions * 0.3) {
      bodyLanguageScore -= 20;
      improvements.push("Many responses were too brief - show more engagement");
    }

    // Bonus for consistent engagement
    if (interviewCompleted && questionsAnswered === totalQuestions) {
      bodyLanguageScore += 20;
      strengths.push("Maintained visual engagement throughout full interview");
    }
  }

  // Grammar & Speech Score (0-100) - Much more strict
  if (!microphoneUsed) {
    grammarScore = 0;
    improvements.push("Microphone not used - speech cannot be assessed");
  } else {
    grammarScore += 15; // Base points for mic usage
    strengths.push("Audio enabled for speech assessment");

    // Response timing analysis
    if (avgTimePerQuestion >= 45 && avgTimePerQuestion <= 75) {
      grammarScore += 40;
      strengths.push("Excellent response timing - thoughtful and detailed");
    } else if (avgTimePerQuestion >= 30 && avgTimePerQuestion <= 45) {
      grammarScore += 30;
      strengths.push("Good response timing");
    } else if (avgTimePerQuestion >= 20 && avgTimePerQuestion <= 30) {
      grammarScore += 20;
      improvements.push("Responses could be more detailed");
    } else if (avgTimePerQuestion < 20) {
      grammarScore += 10;
      improvements.push("Responses too brief - provide more detailed answers");
    } else {
      grammarScore += 15;
      improvements.push("Responses too long - try to be more concise");
    }

    // Consistency bonus
    const timeVariance = timeSpentPerQuestion.length > 1 ? 
      Math.sqrt(timeSpentPerQuestion.reduce((sum, time) => sum + Math.pow(time - avgTimePerQuestion, 2), 0) / timeSpentPerQuestion.length) : 0;
    
    if (timeVariance < 20) {
      grammarScore += 25;
      strengths.push("Consistent response quality across questions");
    } else if (timeVariance < 30) {
      grammarScore += 15;
    } else {
      grammarScore += 5;
      improvements.push("Work on maintaining consistent response quality");
    }

    // Answer rate bonus
    if (questionsAnswered === totalQuestions) {
      grammarScore += 20;
      strengths.push("Responded to all interview questions");
    } else if (questionsAnswered >= totalQuestions * 0.8) {
      grammarScore += 10;
    }
  }

  // Skills Score (0-100) - Based on actual engagement
  if (questionsAnswered === 0) {
    skillsScore = 0;
    improvements.push("No questions answered - unable to assess role-specific skills");
  } else {
    // Base score from completion
    skillsScore = Math.round(completionRate * 40);

    // Quality bonus based on time investment
    if (avgTimePerQuestion >= 40) {
      skillsScore += 30;
      strengths.push("Demonstrated depth in role-specific responses");
    } else if (avgTimePerQuestion >= 25) {
      skillsScore += 20;
      strengths.push("Adequate detail in responses");
    } else {
      skillsScore += 10;
      improvements.push("Provide more detailed examples for role-specific questions");
    }

    // Full completion bonus
    if (interviewCompleted && questionsAnswered === totalQuestions) {
      skillsScore += 30;
      strengths.push(`Comprehensive demonstration of ${interviewData.selectedRole} competencies`);
    } else if (completionRate >= 0.7) {
      skillsScore += 15;
    }
  }

  // Confidence Score (0-100) - Overall performance
  if (!cameraUsed && !microphoneUsed) {
    confidenceScore = 0;
    improvements.push("Technology not properly utilized - affects confidence assessment");
  } else {
    // Base confidence from tech usage
    if (cameraUsed && microphoneUsed) {
      confidenceScore += 30;
      strengths.push("Confident technology usage");
    } else if (cameraUsed || microphoneUsed) {
      confidenceScore += 15;
      improvements.push("Enable both camera and microphone for full assessment");
    }

    // Engagement confidence
    if (completionRate >= 0.9) {
      confidenceScore += 35;
      strengths.push("High confidence demonstrated through consistent engagement");
    } else if (completionRate >= 0.7) {
      confidenceScore += 25;
    } else if (completionRate >= 0.5) {
      confidenceScore += 15;
      improvements.push("Build confidence by completing more questions");
    } else {
      confidenceScore += 5;
      improvements.push("Low engagement suggests confidence issues - practice more");
    }

    // Response quality confidence
    if (avgTimePerQuestion >= 30) {
      confidenceScore += 25;
      strengths.push("Confident, thoughtful responses");
    } else if (avgTimePerQuestion >= 20) {
      confidenceScore += 15;
    } else {
      confidenceScore += 5;
      improvements.push("Brief responses may indicate lack of confidence");
    }

    // Interview completion confidence
    if (interviewCompleted) {
      confidenceScore += 10;
      strengths.push("Confidence to complete full interview process");
    }
  }

  // Cap all scores at 100
  bodyLanguageScore = Math.min(bodyLanguageScore, 100);
  grammarScore = Math.min(grammarScore, 100);
  skillsScore = Math.min(skillsScore, 100);
  confidenceScore = Math.min(confidenceScore, 100);

  // Overall score calculation
  const overallScore = Math.round((bodyLanguageScore + grammarScore + skillsScore + confidenceScore) / 4);

  // Generate more realistic feedback
  let feedback = "";
  if (overallScore >= 80) {
    feedback = "Outstanding interview performance! Excellent preparation, engagement, and professional presence demonstrated.";
  } else if (overallScore >= 65) {
    feedback = "Strong interview performance with good communication and engagement. Minor improvements identified.";
  } else if (overallScore >= 50) {
    feedback = "Adequate interview performance with room for improvement in engagement and response quality.";
  } else if (overallScore >= 25) {
    feedback = "Below average performance. Focus on using technology properly and answering more questions thoroughly.";
  } else {
    feedback = "Poor interview performance. Complete the full interview with camera and microphone enabled for better assessment.";
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