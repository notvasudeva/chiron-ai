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

export const analyzeResume = async (file: File | null, selectedRole: string): Promise<ResumeAnalysis> => {
  if (!file) {
    return {
      atsScore: 0,
      feedback: "CRITICAL: No resume uploaded. ATS systems immediately reject applications without resumes.",
      strengths: [],
      improvements: ["Upload a resume in PDF, DOC, or DOCX format", "Ensure file is under 2MB", "Use standard resume format"]
    };
  }

  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];
  
  // ULTRA STRICT ATS CHECKS - Like real ATS systems

  // 1. File format check - STRICT (5 points max, not 10)
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedTypes.includes(fileExtension)) {
    improvements.push("CRITICAL: File format rejected by ATS - use PDF, DOC, or DOCX only");
    improvements.push("ATS systems auto-reject non-standard formats");
    return { atsScore: 0, feedback: "Resume format incompatible with ATS systems", strengths, improvements };
  } else {
    score += 3; // Reduced from 10
    strengths.push("Acceptable file format");
  }

  // 2. File size - VERY STRICT
  if (file.size > 2000000) {
    improvements.push("CRITICAL: File too large - ATS systems reject files over 2MB");
    return { atsScore: 5, feedback: "Resume file size exceeds ATS limits", strengths, improvements };
  } else if (file.size < 30000) {
    improvements.push("CRITICAL: File too small - likely missing essential content");
    score = Math.max(score - 5, 0);
  } else if (file.size >= 50000 && file.size <= 500000) {
    score += 2;
    strengths.push("Appropriate file size");
  }

  // 3. Filename analysis - STRICT
  const fileName = file.name.toLowerCase();
  if (!fileName.includes('resume') && !fileName.includes('cv')) {
    improvements.push("MAJOR: Filename should contain 'resume' or 'CV' for ATS recognition");
    score = Math.max(score - 3, 0);
  } else {
    score += 2;
    strengths.push("Professional filename");
  }

  // Check for unprofessional naming
  if (fileName.includes('draft') || fileName.includes('temp') || fileName.includes('copy')) {
    improvements.push("CRITICAL: Remove draft/temp/copy from filename - appears unprofessional");
    score = Math.max(score - 5, 0);
  }

  // 4. Try to extract text content for REAL analysis
  let textContent = '';
  try {
    if (fileExtension === '.pdf') {
      // For PDF files, we can't easily extract text in browser, so we'll do enhanced heuristics
      textContent = await extractTextFromFile(file);
    } else {
      // For DOC/DOCX, also limited in browser
      textContent = await extractTextFromFile(file);
    }
  } catch (error) {
    improvements.push("WARNING: Could not parse resume content - ensure file is not corrupted");
  }

  // 5. REAL keyword analysis - ULTRA STRICT
  const roleKeywords: Record<string, { required: string[], preferred: string[], exclusions: string[] }> = {
    'Software Engineer': {
      required: ['software', 'development', 'programming', 'code'],
      preferred: ['javascript', 'python', 'react', 'node', 'git', 'api', 'database', 'frontend', 'backend', 'html', 'css'],
      exclusions: ['microsoft word', 'data entry', 'customer service']
    },
    'Product Manager': {
      required: ['product', 'management', 'strategy'],
      preferred: ['roadmap', 'stakeholder', 'agile', 'analytics', 'user', 'market', 'launch', 'metrics'],
      exclusions: ['coding', 'programming', 'technical implementation']
    },
    'Data Scientist': {
      required: ['data', 'analysis', 'statistics'],
      preferred: ['python', 'machine learning', 'sql', 'modeling', 'visualization', 'pandas', 'numpy', 'scikit'],
      exclusions: ['basic excel', 'data entry', 'administrative']
    },
    'UX Designer': {
      required: ['design', 'user', 'experience'],
      preferred: ['wireframe', 'prototype', 'usability', 'research', 'figma', 'sketch', 'adobe', 'user-centered'],
      exclusions: ['graphic design only', 'print design', 'marketing design']
    },
    'Sales Representative': {
      required: ['sales', 'revenue', 'client'],
      preferred: ['relationship', 'target', 'crm', 'negotiation', 'quota', 'pipeline', 'prospecting'],
      exclusions: ['cashier', 'retail associate', 'customer service only']
    },
    'Marketing Manager': {
      required: ['marketing', 'campaign', 'brand'],
      preferred: ['digital', 'analytics', 'roi', 'content', 'social media', 'seo', 'conversion'],
      exclusions: ['sales only', 'administrative assistant', 'data entry']
    },
    'Business Analyst': {
      required: ['business', 'analysis', 'requirements'],
      preferred: ['process', 'stakeholder', 'documentation', 'workflow', 'improvement', 'metrics'],
      exclusions: ['basic admin', 'data entry', 'customer service']
    },
    'DevOps Engineer': {
      required: ['devops', 'infrastructure', 'deployment'],
      preferred: ['aws', 'docker', 'kubernetes', 'ci/cd', 'automation', 'monitoring', 'cloud', 'linux'],
      exclusions: ['basic IT support', 'help desk', 'desktop support']
    }
  };

  const roleData = roleKeywords[selectedRole] || { required: [], preferred: [], exclusions: [] };
  
  // Check required keywords - MUST HAVE
  let requiredFound = 0;
  roleData.required.forEach(keyword => {
    if (textContent.toLowerCase().includes(keyword) || fileName.includes(keyword)) {
      requiredFound++;
    }
  });

  if (requiredFound === 0) {
    improvements.push(`CRITICAL: Missing ALL required keywords for ${selectedRole}`);
    score = 0; // Zero score if no required keywords
  } else if (requiredFound < roleData.required.length) {
    improvements.push(`MAJOR: Missing ${roleData.required.length - requiredFound} required keywords`);
    score = Math.max(score - 15, 0);
  } else {
    score += 10;
    strengths.push("Contains required role keywords");
  }

  // Check preferred keywords
  let preferredFound = 0;
  roleData.preferred.forEach(keyword => {
    if (textContent.toLowerCase().includes(keyword) || fileName.includes(keyword)) {
      preferredFound++;
    }
  });

  const preferredPercentage = preferredFound / roleData.preferred.length;
  if (preferredPercentage >= 0.7) {
    score += 15;
    strengths.push("Excellent keyword optimization");
  } else if (preferredPercentage >= 0.5) {
    score += 10;
    strengths.push("Good keyword presence");
  } else if (preferredPercentage >= 0.3) {
    score += 5;
    improvements.push("Add more role-specific keywords");
  } else {
    improvements.push("MAJOR: Severely lacking role-specific keywords");
    score = Math.max(score - 10, 0);
  }

  // Check for exclusion keywords (negative signals)
  let exclusionsFound = 0;
  roleData.exclusions.forEach(keyword => {
    if (textContent.toLowerCase().includes(keyword) || fileName.includes(keyword)) {
      exclusionsFound++;
    }
  });

  if (exclusionsFound > 0) {
    improvements.push(`WARNING: Contains ${exclusionsFound} irrelevant/negative keywords`);
    score = Math.max(score - exclusionsFound * 5, 0);
  }

  // 6. Essential sections check - STRICT
  const essentialSections = ['experience', 'education', 'skills', 'contact'];
  let sectionsFound = 0;
  essentialSections.forEach(section => {
    if (textContent.toLowerCase().includes(section) || 
        textContent.toLowerCase().includes(section + 's') ||
        fileName.includes(section)) {
      sectionsFound++;
    }
  });

  if (sectionsFound < 3) {
    improvements.push("CRITICAL: Missing essential resume sections (Experience, Education, Skills, Contact)");
    score = Math.max(score - 20, 0);
  } else {
    score += 5;
    strengths.push("Contains essential resume sections");
  }

  // 7. Length analysis - VERY STRICT
  const estimatedWords = Math.floor(file.size / 6); // Rough estimation
  if (estimatedWords < 200) {
    improvements.push("CRITICAL: Resume appears too brief - ATS expects 300-600 words minimum");
    score = Math.max(score - 15, 0);
  } else if (estimatedWords > 1200) {
    improvements.push("MAJOR: Resume appears too lengthy - ATS prefers concise 1-2 pages");
    score = Math.max(score - 10, 0);
  } else if (estimatedWords >= 300 && estimatedWords <= 800) {
    score += 8;
    strengths.push("Appropriate resume length");
  }

  // 8. Contact information check (basic)
  const hasEmail = textContent.includes('@') || fileName.includes('email');
  const hasPhone = /\d{3}[-.]?\d{3}[-.]?\d{4}/.test(textContent) || fileName.includes('phone');
  
  if (!hasEmail && !hasPhone) {
    improvements.push("CRITICAL: No contact information detected");
    score = Math.max(score - 10, 0);
  } else if (!hasEmail || !hasPhone) {
    improvements.push("MAJOR: Missing email or phone number");
    score = Math.max(score - 5, 0);
  } else {
    score += 3;
    strengths.push("Contains contact information");
  }

  // ULTRA STRICT FINAL SCORING - No inflation
  score = Math.min(score, 85); // Cap at 85, not 100

  let feedback = "";
  if (score === 0) {
    feedback = "REJECTED: Resume fails basic ATS requirements. Cannot proceed to human review.";
  } else if (score < 20) {
    feedback = `CRITICAL FAILURE (${score}%): Resume would be auto-rejected by ATS systems. Major restructuring required.`;
  } else if (score < 40) {
    feedback = `POOR (${score}%): Resume unlikely to pass ATS screening. Significant improvements needed in keywords, format, and content.`;
  } else if (score < 60) {
    feedback = `BELOW AVERAGE (${score}%): Resume has basic requirements but lacks optimization. May pass simple ATS but will rank low.`;
  } else if (score < 75) {
    feedback = `AVERAGE (${score}%): Resume meets most ATS requirements but needs refinement to stand out among candidates.`;
  } else {
    feedback = `GOOD (${score}%): Resume well-optimized for ATS systems. Should pass most screening filters and reach human reviewers.`;
  }

  return {
    atsScore: score,
    feedback,
    strengths,
    improvements
  };
};

// Helper function to extract text from files (limited browser capability)
const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // For demo purposes, we'll extract basic text patterns
      // In a real implementation, you'd use PDF.js or similar libraries
      resolve(result || '');
    };
    reader.readAsText(file);
  });
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
    responses?: string[]; // Actual interview responses for analysis
  }
): InterviewAnalysis => {
  const { questionsAnswered, totalQuestions, timeSpentPerQuestion, cameraUsed, microphoneUsed, interviewCompleted, interviewDuration, responses = [] } = interviewData;

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

  // RESPONSE CONTENT ANALYSIS - Analyze actual responses
  const responseAnalysis = analyzeResponseContent(responses, interviewData.selectedRole);
  
  // ULTRA STRICT SCORING - No participation = ZERO scores

  // Body Language Score (0-100) - ZERO tolerance for no camera
  if (!cameraUsed) {
    bodyLanguageScore = 0;
    improvements.push("CRITICAL: Camera disabled - cannot assess professional presence");
    improvements.push("Modern interviews require video presence");
  } else {
    // Camera enabled but need actual engagement
    if (questionsAnswered === 0) {
      bodyLanguageScore = 0;
      improvements.push("CRITICAL: No responses despite camera - shows complete disengagement");
    } else if (completionRate < 0.3) {
      bodyLanguageScore = 2;
      improvements.push("SEVERE: Answered <30% questions - appears uninterested or unprepared");
    } else if (completionRate < 0.5) {
      bodyLanguageScore = 5;
      improvements.push("POOR: <50% completion suggests nervousness or lack of preparation");
    } else if (completionRate < 0.7) {
      bodyLanguageScore = 12;
      improvements.push("BELOW AVERAGE: Complete at least 70% to show engagement");
    } else if (completionRate < 0.8) {
      bodyLanguageScore = 25;
      improvements.push("AVERAGE: Aim for 80%+ completion for professional impression");
    } else if (completionRate < 0.95) {
      bodyLanguageScore = 45;
      strengths.push("Good visual engagement");
    } else {
      bodyLanguageScore = 60; // Max 60 without response quality
      strengths.push("Excellent visual participation");
    }

    // STRICT response timing analysis
    const rushResponses = timeSpentPerQuestion.filter(time => time < 8).length;
    const shortResponses = timeSpentPerQuestion.filter(time => time < 15).length;
    
    if (rushResponses > questionsAnswered * 0.4) {
      bodyLanguageScore = Math.max(bodyLanguageScore - 25, 0);
      improvements.push("MAJOR: Too many rushed responses (<8s) - shows panic or disinterest");
    } else if (shortResponses > questionsAnswered * 0.6) {
      bodyLanguageScore = Math.max(bodyLanguageScore - 15, 0);
      improvements.push("WARNING: Many brief responses - provide more thoughtful answers");
    }

    // Response quality bonus
    if (responseAnalysis.qualityScore > 7) {
      bodyLanguageScore = Math.min(bodyLanguageScore + 15, 100);
      strengths.push("Confident delivery with quality content");
    } else if (responseAnalysis.qualityScore > 5) {
      bodyLanguageScore = Math.min(bodyLanguageScore + 8, 85);
    }
  }

  // Grammar & Speech Score (0-100) - ANALYZE ACTUAL SPEECH QUALITY
  if (!microphoneUsed) {
    grammarScore = 0;
    improvements.push("CRITICAL: Microphone disabled - cannot assess communication");
    improvements.push("Professional roles require verbal communication skills");
  } else {
    // Base score from response quality
    grammarScore = Math.floor(responseAnalysis.communicationScore * 10); // 0-100
    
    if (questionsAnswered === 0) {
      grammarScore = 0;
      improvements.push("CRITICAL: No verbal responses detected");
    } else {
      // Analyze speech patterns from responses
      const grammarIssues = analyzeGrammarAndSpeech(responses);
      
      if (grammarIssues.fillerWords > responses.length * 2) {
        grammarScore = Math.max(grammarScore - 20, 0);
        improvements.push("MAJOR: Excessive filler words (um, uh, like) - practice fluency");
      }
      
      if (grammarIssues.incompleteThoughts > responses.length * 0.3) {
        grammarScore = Math.max(grammarScore - 15, 0);
        improvements.push("WARNING: Many incomplete thoughts - practice structured responses");
      }
      
      if (grammarIssues.grammarErrors > responses.length * 0.2) {
        grammarScore = Math.max(grammarScore - 10, 0);
        improvements.push("NOTE: Grammar issues detected - review professional communication");
      }
      
      // Length appropriateness
      if (avgTimePerQuestion < 10) {
        grammarScore = Math.max(grammarScore - 25, 0);
        improvements.push("SEVERE: Responses too brief to demonstrate communication skills");
      } else if (avgTimePerQuestion < 20) {
        grammarScore = Math.max(grammarScore - 15, 0);
        improvements.push("POOR: Very brief responses - elaborate with examples");
      } else if (avgTimePerQuestion > 120) {
        grammarScore = Math.max(grammarScore - 10, 0);
        improvements.push("WARNING: Responses too lengthy - practice conciseness");
      }
      
      // Completion consistency penalty
      if (completionRate < 0.5) {
        grammarScore = Math.max(grammarScore * 0.3, 0);
        improvements.push("CRITICAL: Low completion severely limits communication assessment");
      } else if (completionRate < 0.7) {
        grammarScore = Math.max(grammarScore * 0.6, 0);
        improvements.push("MAJOR: Inconsistent participation affects communication evaluation");
      }
      
      // Quality bonuses
      if (responseAnalysis.clarity > 8) {
        strengths.push("Excellent clarity and articulation");
      } else if (responseAnalysis.clarity > 6) {
        strengths.push("Good communication clarity");
      } else {
        improvements.push("IMPROVE: Work on clearer articulation and structure");
      }
    }
  }

  // Skills Score (0-100) - ANALYZE ACTUAL TECHNICAL/ROLE COMPETENCY
  skillsScore = Math.floor(responseAnalysis.skillsRelevance * 10); // Base from content analysis
  
  if (questionsAnswered === 0) {
    skillsScore = 0;
    improvements.push("CRITICAL: Cannot assess skills without responses");
    improvements.push("Complete interview to demonstrate competencies");
  } else {
    // STRICT competency evaluation
    const skillsDemonstration = analyzeSkillsDemonstration(responses, interviewData.selectedRole);
    
    if (skillsDemonstration.technicalAccuracy < 3) {
      skillsScore = Math.max(skillsScore - 30, 0);
      improvements.push("MAJOR: Lacks technical accuracy for role requirements");
    }
    
    if (skillsDemonstration.industryKnowledge < 4) {
      skillsScore = Math.max(skillsScore - 20, 0);
      improvements.push("WARNING: Limited industry knowledge demonstrated");
    }
    
    if (skillsDemonstration.problemSolving < 3) {
      skillsScore = Math.max(skillsScore - 25, 0);
      improvements.push("CRITICAL: Poor problem-solving approach shown");
    }
    
    if (skillsDemonstration.specificExamples < 2) {
      skillsScore = Math.max(skillsScore - 15, 0);
      improvements.push("MAJOR: Provide specific examples to demonstrate experience");
    }
    
    // Completion-based penalties
    if (completionRate < 0.4) {
      skillsScore = Math.max(skillsScore * 0.2, 0);
      improvements.push("SEVERE: Insufficient responses to evaluate competency");
    } else if (completionRate < 0.6) {
      skillsScore = Math.max(skillsScore * 0.5, 0);
      improvements.push("POOR: Need more responses to showcase abilities");
    } else if (completionRate < 0.8) {
      skillsScore = Math.max(skillsScore * 0.7, 0);
      improvements.push("AVERAGE: Complete more to fully demonstrate skills");
    }
    
    // Response depth penalty
    if (avgTimePerQuestion < 20) {
      skillsScore = Math.max(skillsScore - 20, 0);
      improvements.push("MAJOR: Responses too brief to show expertise depth");
    } else if (avgTimePerQuestion < 30) {
      skillsScore = Math.max(skillsScore - 10, 0);
      improvements.push("WARNING: Provide more detailed technical examples");
    }
    
    // Quality bonuses
    if (skillsDemonstration.overallCompetency > 8) {
      strengths.push(`Excellent ${interviewData.selectedRole} expertise demonstrated`);
    } else if (skillsDemonstration.overallCompetency > 6) {
      strengths.push("Good role-specific knowledge shown");
    } else {
      improvements.push("IMPROVE: Strengthen role-specific competencies");
    }
  }

  // Confidence Score (0-100) - STRICT assessment based on delivery and content
  if (!cameraUsed || !microphoneUsed) {
    confidenceScore = 0;
    improvements.push("CRITICAL: Cannot assess confidence without full A/V setup");
  } else if (questionsAnswered === 0) {
    confidenceScore = 0;
    improvements.push("CRITICAL: No engagement indicates lack of confidence");
  } else {
    // Base confidence from response analysis
    confidenceScore = Math.floor(responseAnalysis.confidence * 10);
    
    // Severe penalties for poor participation
    if (completionRate < 0.3) {
      confidenceScore = Math.max(confidenceScore * 0.1, 0);
      improvements.push("SEVERE: Very low completion suggests extreme nervousness");
    } else if (completionRate < 0.5) {
      confidenceScore = Math.max(confidenceScore * 0.3, 0);
      improvements.push("POOR: Low completion indicates confidence issues");
    } else if (completionRate < 0.7) {
      confidenceScore = Math.max(confidenceScore * 0.6, 0);
      improvements.push("BELOW AVERAGE: Build confidence through better preparation");
    }
    
    // Response quality impact
    if (avgTimePerQuestion < 8) {
      confidenceScore = Math.max(confidenceScore - 30, 0);
      improvements.push("MAJOR: Rushed responses suggest panic or lack of preparation");
    } else if (avgTimePerQuestion < 15) {
      confidenceScore = Math.max(confidenceScore - 15, 0);
      improvements.push("WARNING: Brief responses may indicate nervousness");
    } else if (avgTimePerQuestion >= 30 && responseAnalysis.clarity > 6) {
      confidenceScore = Math.min(confidenceScore + 10, 100);
      strengths.push("Confident, well-structured responses");
    }
    
    // Consistency bonus
    if (interviewCompleted && completionRate >= 0.9) {
      confidenceScore = Math.min(confidenceScore + 15, 100);
      strengths.push("Excellent confidence through complete participation");
    }
  }

  // Calculate overall score - STRICT
  const overallScore = Math.round((bodyLanguageScore + grammarScore + skillsScore + confidenceScore) / 4);

  // ENHANCED detailed feedback
  let feedback = "";
  if (overallScore === 0) {
    feedback = "INTERVIEW FAILURE: Complete lack of professional interview readiness. Cannot recommend for any position without fundamental improvements in setup, preparation, and engagement.";
  } else if (overallScore < 15) {
    feedback = `SEVERE DEFICIENCY (${overallScore}%): Performance indicates fundamental lack of interview skills and professional readiness. Completed ${(completionRate * 100).toFixed(1)}% with ${avgTimePerQuestion.toFixed(1)}s avg response time. Requires comprehensive interview training, technical setup review, and extensive practice before attempting real interviews.`;
  } else if (overallScore < 30) {
    feedback = `POOR PERFORMANCE (${overallScore}%): Interview demonstrates significant preparation and communication deficiencies. ${(completionRate * 100).toFixed(1)}% completion rate with ${avgTimePerQuestion.toFixed(1)}s responses indicates either technical difficulties or inadequate preparation. Must address: ${!cameraUsed ? 'video setup,' : ''} ${!microphoneUsed ? 'audio setup,' : ''} response quality, and professional communication standards.`;
  } else if (overallScore < 50) {
    feedback = `BELOW STANDARD (${overallScore}%): Basic interview participation detected but falls short of professional expectations. ${(completionRate * 100).toFixed(1)}% completion with ${avgTimePerQuestion.toFixed(1)}s avg responses. While technical setup appears functional, content quality, communication skills, and confidence need substantial improvement. Focus on STAR method, industry knowledge, and structured responses.`;
  } else if (overallScore < 65) {
    feedback = `AVERAGE PERFORMANCE (${overallScore}%): Demonstrates adequate interview skills with ${(completionRate * 100).toFixed(1)}% completion and ${avgTimePerQuestion.toFixed(1)}s response times. Shows basic professional communication and role understanding. To excel: add specific quantifiable examples, demonstrate deeper technical expertise, improve response structure, and show greater enthusiasm for the role.`;
  } else if (overallScore < 80) {
    feedback = `GOOD PERFORMANCE (${overallScore}%): Strong interview showing with ${(completionRate * 100).toFixed(1)}% completion rate and ${avgTimePerQuestion.toFixed(1)}s thoughtful responses. Demonstrates professional communication, role competency, and good interview presence. Minor improvements: more specific metrics in examples, stronger technical depth, and enhanced storytelling to differentiate from other candidates.`;
  } else {
    feedback = `EXCELLENT PERFORMANCE (${overallScore}%): Outstanding interview demonstration with ${(completionRate * 100).toFixed(1)}% completion and ${avgTimePerQuestion.toFixed(1)}s well-structured responses. Shows exceptional professional presence, clear communication, strong role expertise, and interview confidence. Performance indicates strong candidacy for ${interviewData.selectedRole} positions. Continue leveraging these strengths in real interviews.`;
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

// REAL RESPONSE ANALYSIS FUNCTIONS

interface ResponseAnalysis {
  qualityScore: number; // 0-10
  communicationScore: number; // 0-10
  skillsRelevance: number; // 0-10
  clarity: number; // 0-10
  confidence: number; // 0-10
}

const analyzeResponseContent = (responses: string[], role: string): ResponseAnalysis => {
  if (responses.length === 0) {
    return { qualityScore: 0, communicationScore: 0, skillsRelevance: 0, clarity: 0, confidence: 0 };
  }

  let qualityScore = 5; // Start with baseline
  let communicationScore = 5;
  let skillsRelevance = 5;
  let clarity = 5;
  let confidence = 5;

  responses.forEach(response => {
    const words = response.toLowerCase().split(' ').filter(word => word.length > 0);
    
    // Quality based on length and depth
    if (words.length < 10) {
      qualityScore = Math.max(qualityScore - 2, 0);
    } else if (words.length > 50) {
      qualityScore = Math.min(qualityScore + 1, 10);
    }
    
    // Look for specific examples and metrics
    if (response.includes('example') || response.includes('specifically') || /\d+%|\$\d+|\d+ years/.test(response)) {
      qualityScore = Math.min(qualityScore + 1.5, 10);
      skillsRelevance = Math.min(skillsRelevance + 1, 10);
    }
    
    // Communication clarity
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 2) {
      communicationScore = Math.min(communicationScore + 0.5, 10);
      clarity = Math.min(clarity + 0.5, 10);
    }
    
    // Confidence indicators
    if (response.includes('I successfully') || response.includes('I achieved') || response.includes('I led')) {
      confidence = Math.min(confidence + 1, 10);
    }
    
    // Role-specific keywords
    const roleKeywords = getRoleKeywords(role);
    const keywordMatches = roleKeywords.filter(keyword => 
      response.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    if (keywordMatches > 0) {
      skillsRelevance = Math.min(skillsRelevance + keywordMatches * 0.5, 10);
    }
  });

  return {
    qualityScore: Math.round(qualityScore * 10) / 10,
    communicationScore: Math.round(communicationScore * 10) / 10,
    skillsRelevance: Math.round(skillsRelevance * 10) / 10,
    clarity: Math.round(clarity * 10) / 10,
    confidence: Math.round(confidence * 10) / 10
  };
};

const analyzeGrammarAndSpeech = (responses: string[]) => {
  let fillerWords = 0;
  let incompleteThoughts = 0;
  let grammarErrors = 0;

  responses.forEach(response => {
    // Count filler words
    const fillerPatterns = ['um', 'uh', 'like', 'you know', 'actually', 'basically'];
    fillerPatterns.forEach(filler => {
      const matches = response.toLowerCase().split(filler).length - 1;
      fillerWords += matches;
    });
    
    // Detect incomplete thoughts (sentences without proper ending)
    const sentences = response.split(/[.!?]+/);
    sentences.forEach(sentence => {
      if (sentence.trim().length > 10 && !sentence.trim().match(/[.!?]$/)) {
        incompleteThoughts++;
      }
    });
    
    // Basic grammar error detection
    if (response.includes('was were') || response.includes('is are') || 
        response.match(/\bi is\b|\byou was\b|\bthey was\b/)) {
      grammarErrors++;
    }
  });

  return { fillerWords, incompleteThoughts, grammarErrors };
};

const analyzeSkillsDemonstration = (responses: string[], role: string) => {
  let technicalAccuracy = 3; // Start at 3/10
  let industryKnowledge = 3;
  let problemSolving = 3;
  let specificExamples = 0;

  responses.forEach(response => {
    // Look for technical terms and accuracy
    const roleKeywords = getRoleKeywords(role);
    const technicalTerms = roleKeywords.filter(term => 
      response.toLowerCase().includes(term.toLowerCase())
    ).length;
    
    if (technicalTerms > 0) {
      technicalAccuracy = Math.min(technicalAccuracy + technicalTerms * 0.5, 10);
      industryKnowledge = Math.min(industryKnowledge + technicalTerms * 0.3, 10);
    }
    
    // Problem-solving indicators
    if (response.includes('problem') || response.includes('challenge') || 
        response.includes('solution') || response.includes('approach')) {
      problemSolving = Math.min(problemSolving + 1, 10);
    }
    
    // Specific examples with metrics
    if (/\d+%|\$\d+|\d+ years|\d+ people|\d+ projects/.test(response)) {
      specificExamples++;
    }
  });

  const overallCompetency = (technicalAccuracy + industryKnowledge + problemSolving) / 3;

  return {
    technicalAccuracy: Math.round(technicalAccuracy * 10) / 10,
    industryKnowledge: Math.round(industryKnowledge * 10) / 10,
    problemSolving: Math.round(problemSolving * 10) / 10,
    specificExamples,
    overallCompetency: Math.round(overallCompetency * 10) / 10
  };
};

const getRoleKeywords = (role: string): string[] => {
  const roleKeywordsMap: Record<string, string[]> = {
    'Software Engineer': ['javascript', 'python', 'react', 'api', 'database', 'algorithm', 'framework', 'debugging'],
    'Product Manager': ['roadmap', 'stakeholder', 'metrics', 'user research', 'agile', 'sprint', 'feature'],
    'Data Scientist': ['python', 'machine learning', 'statistics', 'modeling', 'data analysis', 'visualization'],
    'UX Designer': ['user experience', 'wireframe', 'prototype', 'usability', 'user research', 'design thinking'],
    'Sales Representative': ['revenue', 'pipeline', 'prospecting', 'closing', 'relationship', 'quota', 'crm'],
    'Marketing Manager': ['campaign', 'roi', 'conversion', 'analytics', 'brand', 'digital marketing'],
    'Business Analyst': ['requirements', 'process improvement', 'stakeholder', 'documentation', 'analysis'],
    'DevOps Engineer': ['aws', 'docker', 'kubernetes', 'ci/cd', 'infrastructure', 'automation', 'monitoring']
  };
  
  return roleKeywordsMap[role] || [];
};