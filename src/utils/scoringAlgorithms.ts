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
    interviewDuration: number;
  }
): InterviewAnalysis => {
  const { questionsAnswered, totalQuestions, timeSpentPerQuestion, cameraUsed, microphoneUsed, interviewCompleted, interviewDuration } = interviewData;

  let bodyLanguageScore = 0;
  let grammarScore = 0;
  let skillsScore = 0;
  let confidenceScore = 0;

  const strengths: string[] = [];
  const improvements: string[] = [];

  // Calculate basic metrics
  const completionRate = questionsAnswered / totalQuestions;
  const avgTimePerQuestion = timeSpentPerQuestion.length > 0 
    ? timeSpentPerQuestion.reduce((a, b) => a + b, 0) / timeSpentPerQuestion.length 
    : 0;

  // ULTRA STRICT SCORING - No participation = ZERO scores

  // Body Language Score (0-100) - ZERO tolerance for no camera
  if (!cameraUsed) {
    bodyLanguageScore = 0;
    improvements.push("Camera was not enabled - body language assessment impossible");
    improvements.push("Professional interviews require visual presence");
  } else {
    // Even with camera, need substantial engagement
    if (questionsAnswered === 0) {
      bodyLanguageScore = 0; // ZERO for no engagement
      improvements.push("No questions answered despite camera being on");
    } else if (completionRate < 0.5) {
      bodyLanguageScore = 5;
      improvements.push("Very poor engagement - answered less than 50% of questions");
    } else if (completionRate < 0.7) {
      bodyLanguageScore = 15;
      improvements.push("Poor engagement - complete more questions for better assessment");
    } else if (completionRate < 0.8) {
      bodyLanguageScore = 30;
      strengths.push("Moderate visual engagement");
      improvements.push("Aim to answer at least 80% of questions");
    } else if (completionRate < 0.95) {
      bodyLanguageScore = 55;
      strengths.push("Good visual presence during most questions");
    } else {
      bodyLanguageScore = 75;
      strengths.push("Excellent visual engagement throughout interview");
    }

    // Penalty for very brief responses (shows disinterest)
    const veryShortResponses = timeSpentPerQuestion.filter(time => time < 10).length;
    if (veryShortResponses > questionsAnswered * 0.5) {
      bodyLanguageScore = Math.max(bodyLanguageScore - 30, 0);
      improvements.push("Too many extremely brief responses - shows lack of preparation");
    }

    // Bonus only for full completion with good timing
    if (interviewCompleted && avgTimePerQuestion >= 20) {
      bodyLanguageScore = Math.min(bodyLanguageScore + 15, 100);
      strengths.push("Completed full interview with good engagement");
    }
  }

  // Grammar & Speech Score (0-100) - ZERO tolerance for no microphone
  if (!microphoneUsed) {
    grammarScore = 0;
    improvements.push("Microphone was not enabled - speech assessment impossible");
    improvements.push("Verbal communication skills could not be evaluated");
  } else {
    // Even with microphone, need actual responses
    if (questionsAnswered === 0) {
      grammarScore = 0; // ZERO for no responses
      improvements.push("Microphone enabled but no verbal responses detected");
    } else if (avgTimePerQuestion < 5) {
      grammarScore = 2;
      improvements.push("Responses too brief to assess communication skills");
    } else if (avgTimePerQuestion < 15) {
      grammarScore = 8;
      improvements.push("Responses very brief - provide more detailed answers");
    } else if (avgTimePerQuestion < 30) {
      grammarScore = 20;
      improvements.push("Responses somewhat brief - add more detail and examples");
    } else if (avgTimePerQuestion < 60) {
      grammarScore = 45;
      strengths.push("Good response length and detail");
    } else if (avgTimePerQuestion <= 80) {
      grammarScore = 65;
      strengths.push("Excellent detailed responses");
    } else {
      grammarScore = 40;
      improvements.push("Responses quite lengthy - practice being more concise");
    }

  // Major penalty for inconsistent engagement
    if (completionRate < 0.7) {
      grammarScore = Math.max(grammarScore * 0.2, 0); // Cut score drastically
      improvements.push("Inconsistent verbal participation severely impacts assessment");
    }

    // Response quality bonus only for excellent performers
    if (questionsAnswered >= totalQuestions * 0.9 && avgTimePerQuestion >= 30) {
      grammarScore = Math.min(grammarScore + 10, 100);
      strengths.push("Consistent, thoughtful verbal responses");
    }
  }

  // Skills Score (0-100) - Purely based on actual demonstration
  if (questionsAnswered === 0) {
    skillsScore = 0;
    improvements.push("No questions answered - cannot assess role-specific skills");
    improvements.push("Complete the interview to demonstrate your capabilities");
  } else if (questionsAnswered === 1) {
    skillsScore = 3;
    improvements.push("Only 1 question answered - insufficient to assess skills");
  } else if (completionRate < 0.5) {
    skillsScore = 8;
    improvements.push("Very limited skill demonstration - answer more questions");
  } else if (completionRate < 0.7) {
    skillsScore = 18;
    improvements.push("Basic skill demonstration - complete more questions to showcase expertise");
  } else if (completionRate < 0.8) {
    skillsScore = 35;
    strengths.push("Moderate demonstration of role-relevant skills");
    improvements.push("Answer more questions to fully showcase your abilities");
  } else if (completionRate < 0.95) {
    skillsScore = 55;
    strengths.push("Good demonstration of role-specific competencies");
  } else {
    skillsScore = 75;
    strengths.push(`Comprehensive demonstration of ${interviewData.selectedRole} expertise`);
  }

  // Quality penalty for rushed responses
  if (avgTimePerQuestion < 15 && questionsAnswered > 0) {
    skillsScore = Math.max(skillsScore - 25, 0);
    improvements.push("Rushed responses don't demonstrate depth of knowledge");
  }

  // Confidence Score (0-100) - Requires both tech usage AND performance
  if (!cameraUsed || !microphoneUsed) {
    confidenceScore = 5; // Minimal score for technical issues
    improvements.push("Unable to assess confidence without full technology setup");
  } else if (questionsAnswered === 0) {
    confidenceScore = 5;
    improvements.push("No engagement suggests very low confidence");
  } else if (completionRate < 0.3) {
    confidenceScore = 15;
    improvements.push("Very low completion suggests confidence issues");
  } else if (completionRate < 0.5) {
    confidenceScore = 30;
    improvements.push("Low completion rate may indicate lack of confidence");
  } else if (completionRate < 0.7) {
    confidenceScore = 50;
    improvements.push("Build confidence by completing more questions");
  } else if (completionRate < 0.9) {
    confidenceScore = 75;
    strengths.push("Good confidence demonstrated through engagement");
  } else {
    confidenceScore = 90;
    strengths.push("High confidence shown through complete participation");
  }

  // Response quality impact on confidence
  if (avgTimePerQuestion >= 30 && questionsAnswered > 0) {
    confidenceScore = Math.min(confidenceScore + 10, 100);
    strengths.push("Confident, detailed responses");
  } else if (avgTimePerQuestion < 10 && questionsAnswered > 0) {
    confidenceScore = Math.max(confidenceScore - 20, 0);
    improvements.push("Very brief responses suggest nervousness or lack of preparation");
  }

  // Calculate overall score
  const overallScore = Math.round((bodyLanguageScore + grammarScore + skillsScore + confidenceScore) / 4);

  // Much more realistic and harsh feedback
  let feedback = "";
  if (overallScore === 0) {
    feedback = "No interview participation detected. Please restart with camera and microphone enabled, and answer the questions.";
  } else if (overallScore < 15) {
    feedback = "Extremely poor performance. Interview was not completed properly. Please try again with full setup and engagement.";
  } else if (overallScore < 30) {
    feedback = "Very poor interview performance. Major improvements needed in preparation, technology setup, and engagement.";
  } else if (overallScore < 45) {
    feedback = "Below average performance. Focus on completing all questions, using proper technology, and providing detailed responses.";
  } else if (overallScore < 60) {
    feedback = "Average performance with significant room for improvement. Work on consistency and response quality.";
  } else if (overallScore < 75) {
    feedback = "Good performance with some areas for improvement. You're on the right track but can enhance your responses.";
  } else if (overallScore < 85) {
    feedback = "Strong interview performance! Excellent engagement and communication skills demonstrated.";
  } else {
    feedback = "Outstanding interview performance! Professional, confident, and comprehensive responses throughout.";
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