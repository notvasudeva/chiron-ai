import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Play, Camera, Mic, BarChart3, FileText, Target, Brain, MessageSquare, Trophy, MicOff, CameraOff, Pause } from 'lucide-react';
import { analyzeResume, analyzeInterviewPerformance, type ResumeAnalysis, type InterviewAnalysis } from '@/utils/scoringAlgorithms';

type Step = 'welcome' | 'upload' | 'role' | 'interview' | 'analysis' | 'results';

const InterviewWizard = () => {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [interviewStartTime, setInterviewStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState(90); // 90 seconds per question
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState<number[]>([]);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [interviewAnalysis, setInterviewAnalysis] = useState<InterviewAnalysis | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const questionTimer = useRef<NodeJS.Timeout>();
  const countdownTimer = useRef<NodeJS.Timeout>();


  const steps: Record<Step, number> = {
    welcome: 0,
    upload: 1,
    role: 2,
    interview: 3,
    analysis: 4,
    results: 5
  };

  const progress = (steps[currentStep] / 5) * 100;

  const roles = [
    'Software Engineer',
    'Product Manager',
    'Data Scientist',
    'UX Designer',
    'Sales Representative',
    'Marketing Manager',
    'Business Analyst',
    'DevOps Engineer'
  ];

  const personalQuestions = [
    "Tell me about yourself and your background",
    "What interests you about this position?",
    "Why are you looking for a new opportunity?",
    "What motivates you in your work?",
    "Describe your ideal work environment",
    "What are your career goals for the next 5 years?",
    "How do you handle stress and pressure?",
    "What's your greatest professional achievement?"
  ];

  const roleSpecificQuestions: Record<string, string[]> = {
    'Software Engineer': [
      "Describe your experience with debugging complex software issues",
      "How do you approach code reviews and collaboration?",
      "Explain a challenging technical problem you solved recently",
      "How do you stay updated with new programming languages and frameworks?",
      "Describe your experience with system design and architecture",
      "What's your approach to writing maintainable code?",
      "How do you handle technical debt in projects?",
      "Describe a time you optimized application performance",
      "How do you ensure code quality in your projects?",
      "What's your experience with automated testing?",
      "How do you approach learning new technologies?",
      "Describe your experience with version control and deployment"
    ],
    'Product Manager': [
      "How do you prioritize features in a product roadmap?",
      "Describe a time you had to make a difficult product decision",
      "How do you gather and analyze user feedback?",
      "Explain your approach to working with engineering teams",
      "How do you measure product success?",
      "Describe a product launch you managed from start to finish",
      "How do you balance stakeholder requirements with user needs?",
      "What's your approach to competitive analysis?",
      "How do you handle conflicting priorities from different teams?",
      "Describe your experience with A/B testing",
      "How do you communicate product vision to various audiences?",
      "What metrics do you use to track product performance?"
    ],
    'Data Scientist': [
      "Describe your experience with machine learning algorithms",
      "How do you handle missing or dirty data?",
      "Explain a complex data analysis project you worked on",
      "How do you communicate technical findings to non-technical stakeholders?",
      "Describe your experience with statistical modeling",
      "What's your approach to feature engineering?",
      "How do you validate your machine learning models?",
      "Describe a time you found unexpected insights in data",
      "How do you handle imbalanced datasets?",
      "What tools do you prefer for data visualization?",
      "How do you ensure your models are production-ready?",
      "Describe your experience with big data technologies"
    ],
    'UX Designer': [
      "Walk me through your design process from concept to completion",
      "How do you conduct user research and usability testing?",
      "Describe a time you had to advocate for the user experience",
      "How do you collaborate with developers and product managers?",
      "Explain how you measure the success of your designs",
      "Describe a challenging design problem and how you solved it",
      "How do you incorporate accessibility into your designs?",
      "What's your approach to creating design systems?",
      "How do you handle conflicting feedback from stakeholders?",
      "Describe your experience with prototyping tools",
      "How do you stay updated with design trends and best practices?",
      "Explain a time you had to redesign an existing product"
    ],
    'Sales Representative': [
      "Describe your approach to building relationships with new clients",
      "How do you handle objections during the sales process?",
      "Tell me about a challenging deal you closed",
      "How do you research prospects before making contact?",
      "Describe your experience with CRM systems and sales tools",
      "How do you maintain long-term client relationships?",
      "What's your strategy for meeting sales targets?",
      "Describe a time you lost a deal and what you learned",
      "How do you handle rejection and maintain motivation?",
      "What's your approach to qualifying leads?",
      "How do you negotiate contract terms with clients?",
      "Describe your experience with consultative selling"
    ],
    'Marketing Manager': [
      "How do you develop and execute marketing campaigns?",
      "Describe your experience with digital marketing channels",
      "How do you measure marketing ROI and campaign effectiveness?",
      "Tell me about a successful brand awareness campaign you led",
      "How do you stay current with marketing trends and technologies?",
      "Describe your approach to content marketing strategy",
      "How do you segment and target different customer groups?",
      "What's your experience with marketing automation tools?",
      "How do you collaborate with sales teams on lead generation?",
      "Describe a marketing campaign that didn't meet expectations",
      "How do you optimize campaigns based on performance data?",
      "What's your approach to influencer and partnership marketing?"
    ],
    'Business Analyst': [
      "Describe your process for gathering and documenting requirements",
      "How do you identify and analyze business processes for improvement?",
      "Explain your experience with data analysis and reporting",
      "How do you facilitate communication between stakeholders?",
      "Describe a time you identified a significant business opportunity",
      "What tools do you use for process mapping and documentation?",
      "How do you handle changing requirements during a project?",
      "Describe your experience with stakeholder management",
      "How do you validate that solutions meet business needs?",
      "What's your approach to cost-benefit analysis?",
      "How do you present findings and recommendations to leadership?",
      "Describe your experience with project management methodologies"
    ],
    'DevOps Engineer': [
      "Describe your experience with CI/CD pipelines",
      "How do you approach infrastructure automation and monitoring?",
      "Explain a time you improved system reliability or performance",
      "How do you handle incident response and troubleshooting?",
      "Describe your experience with cloud platforms and containerization",
      "What's your approach to infrastructure as code?",
      "How do you ensure security in deployment pipelines?",
      "Describe a complex infrastructure problem you solved",
      "How do you monitor and optimize system performance?",
      "What's your experience with configuration management tools?",
      "How do you handle capacity planning and scaling?",
      "Describe your approach to disaster recovery and backup strategies"
    ]
  };

  // Function to get randomized questions
  const getRandomizedQuestions = () => {
    const roleQuestions = roleSpecificQuestions[selectedRole] || [];
    
    // Shuffle personal questions and take 2
    const shuffledPersonal = [...personalQuestions].sort(() => Math.random() - 0.5).slice(0, 2);
    
    // Shuffle role-specific questions and take 5
    const shuffledRole = [...roleQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
    
    return [...shuffledPersonal, ...shuffledRole];
  };

  
  // Generate questions when role is selected
  useEffect(() => {
    if (selectedRole) {
      setCurrentQuestions(getRandomizedQuestions());
    }
  }, [selectedRole]);

  const mockQuestions = currentQuestions;

  // Camera and microphone functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setCameraStream(stream);
      setIsCameraOn(true);
      setIsMicOn(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please allow camera permissions and try again.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setIsCameraOn(false);
      setIsMicOn(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const toggleMicrophone = () => {
    if (cameraStream) {
      const audioTracks = cameraStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
        setIsMicOn(track.enabled);
      });
    }
  };

  // Interview management functions
  const startCountdown = () => {
    setTimeRemaining(90);
    countdownTimer.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          nextQuestion();
          return 90;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const nextQuestion = () => {
    // Record time spent on current question
    const timeSpent = 90 - timeRemaining;
    setTimeSpentPerQuestion(prev => [...prev, timeSpent]);
    setQuestionsAnswered(prev => prev + 1);
    
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeRemaining(90);
      speakQuestion(mockQuestions[currentQuestionIndex + 1]);
    } else {
      endInterview();
    }
  };

  const speakQuestion = (question: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const endInterview = () => {
    setIsInterviewActive(false);
    setInterviewCompleted(currentQuestionIndex === mockQuestions.length - 1);
    
    // Record final question time if interview ended early
    if (currentQuestionIndex < mockQuestions.length) {
      const timeSpent = 90 - timeRemaining;
      setTimeSpentPerQuestion(prev => [...prev, timeSpent]);
      if (timeSpent > 10) { // Only count as answered if they spent more than 10 seconds
        setQuestionsAnswered(prev => prev + 1);
      }
    }
    
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    if (questionTimer.current) clearTimeout(questionTimer.current);
    stopCamera();
    
    // Analyze performance and resume
    const resumeResult = analyzeResume(resumeFile, selectedRole);
    setResumeAnalysis(resumeResult);
    
    const interviewResult = analyzeInterviewPerformance({
      questionsAnswered,
      totalQuestions: mockQuestions.length,
      timeSpentPerQuestion,
      cameraUsed: isCameraOn,
      microphoneUsed: isMicOn,
      interviewCompleted: currentQuestionIndex >= mockQuestions.length - 1,
      selectedRole,
      interviewDuration: interviewStartTime > 0 ? Date.now() - interviewStartTime : 0
    });
    setInterviewAnalysis(interviewResult);
    
    setTimeout(() => {
      setCurrentStep('analysis');
    }, 1000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const startInterview = async () => {
    await startCamera();
    
    // Generate fresh questions for this interview
    const newQuestions = getRandomizedQuestions();
    setCurrentQuestions(newQuestions);
    
    setIsInterviewActive(true);
    setCurrentQuestionIndex(0);
    setInterviewStartTime(Date.now());
    setQuestionStartTime(Date.now());
    
    // Start with first question after a brief delay
    setTimeout(() => {
      speakQuestion(newQuestions[0]);
      startCountdown();
    }, 2000);
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (countdownTimer.current) clearInterval(countdownTimer.current);
      if (questionTimer.current) clearTimeout(questionTimer.current);
    };
  }, [cameraStream]);

  const renderWelcomeScreen = () => (
    <div className="text-center animate-fade-in">
      <div className="mb-8">
        <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-elegant">
          <Trophy className="w-12 h-12 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
          AI Interview Coach
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Practice your interview skills with AI-powered feedback. Upload your resume, select your target role, and get personalized coaching.
        </p>
      </div>
      <Button 
        variant="hero" 
        size="lg" 
        onClick={() => setCurrentStep('upload')}
        className="shadow-elegant hover:shadow-success transition-all duration-300"
      >
        Start Your Practice Session
      </Button>
    </div>
  );

  const renderUploadScreen = () => (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-4">Upload Your Resume</h2>
        <p className="text-muted-foreground">
          Upload your resume so we can analyze it and create personalized interview questions.
        </p>
      </div>
      
      <Card className="p-8 border-2 border-dashed border-border hover:border-primary transition-colors">
        <div className="text-center">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <div className="mb-4">
            <label htmlFor="resume-upload" className="cursor-pointer">
              <span className="text-lg font-medium text-primary hover:text-primary-glow">
                Click to upload your resume
              </span>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          {resumeFile && (
            <div className="text-sm text-success font-medium mb-4">
              ✓ {resumeFile.name} uploaded successfully
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Supports PDF, DOC, and DOCX files
          </p>
        </div>
      </Card>
      
      {resumeFile && (
        <div className="text-center mt-6">
          <Button onClick={() => setCurrentStep('role')} variant="primary">
            Continue to Role Selection
          </Button>
        </div>
      )}
    </div>
  );

  const renderRoleScreen = () => (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <Target className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-4">Select Your Target Role</h2>
        <p className="text-muted-foreground">
          Choose the position you're interviewing for to get role-specific questions.
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {roles.map((role) => (
          <Card 
            key={role}
            className={`p-4 cursor-pointer transition-all hover:shadow-card ${
              selectedRole === role 
                ? 'border-primary bg-primary/5 shadow-elegant' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedRole(role)}
          >
            <div className="text-center">
              <div className="font-medium">{role}</div>
            </div>
          </Card>
        ))}
      </div>
      
      {selectedRole && (
        <div className="text-center">
          <Button onClick={() => setCurrentStep('interview')} variant="primary">
            Start Mock Interview
          </Button>
        </div>
      )}
    </div>
  );

  const renderInterviewScreen = () => (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <Play className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-4">Mock Interview Session</h2>
        <p className="text-muted-foreground">
          Answer the questions naturally. We'll analyze your responses and provide feedback.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
            {isCameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Camera className="w-16 h-16 text-muted-foreground" />
            )}
            
            {isInterviewActive && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                ● REC
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <Button 
              variant={isCameraOn ? "default" : "outline"} 
              size="sm"
              onClick={isCameraOn ? stopCamera : startCamera}
            >
              {isCameraOn ? <Camera className="w-4 h-4 mr-2" /> : <CameraOff className="w-4 h-4 mr-2" />}
              {isCameraOn ? 'Stop Camera' : 'Start Camera'}
            </Button>
            <Button 
              variant={isMicOn ? "default" : "outline"} 
              size="sm"
              onClick={toggleMicrophone}
              disabled={!isCameraOn}
            >
              {isMicOn ? <Mic className="w-4 h-4 mr-2" /> : <MicOff className="w-4 h-4 mr-2" />}
              {isMicOn ? 'Mute' : 'Unmute'}
            </Button>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Question {currentQuestionIndex + 1} of {mockQuestions.length}:</h3>
            {isInterviewActive && (
              <div className="text-sm text-muted-foreground">
                Time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
          
          <div className="bg-muted rounded-lg p-4 mb-6">
            <p className="text-lg">
              {mockQuestions[currentQuestionIndex] || "Loading question..."}
            </p>
          </div>
          
          {isInterviewActive && (
            <div className="mb-4">
              <Progress value={(90 - timeRemaining) / 90 * 100} className="h-2" />
            </div>
          )}
          
          {!isInterviewActive ? (
            <div className="space-y-4">
              <Button 
                onClick={startInterview} 
                variant="success" 
                className="w-full"
                disabled={!isCameraOn}
              >
                Start Interview
              </Button>
              {!isCameraOn && (
                <p className="text-sm text-muted-foreground text-center">
                  Please enable your camera first
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-success border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-success font-medium">Recording your response...</p>
                <p className="text-sm text-muted-foreground">Speak naturally and maintain eye contact</p>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={nextQuestion} variant="outline" className="flex-1">
                  Next Question
                </Button>
                <Button onClick={endInterview} variant="destructive" className="flex-1">
                  End Interview
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );

  const renderAnalysisScreen = () => {
    const analysisMetrics = interviewAnalysis ? [
      { label: 'Body Language', score: interviewAnalysis.bodyLanguageScore, icon: <Camera className="w-5 h-5" /> },
      { label: 'Grammar & Speech', score: interviewAnalysis.grammarScore, icon: <MessageSquare className="w-5 h-5" /> },
      { label: 'Role-Specific Skills', score: interviewAnalysis.skillsScore, icon: <Target className="w-5 h-5" /> },
      { label: 'Confidence Level', score: interviewAnalysis.confidenceScore, icon: <Brain className="w-5 h-5" /> }
    ] : [];

    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Analyzing Your Performance</h2>
          <p className="text-muted-foreground">
            Our AI is evaluating your interview responses across multiple dimensions.
          </p>
        </div>
        
        {interviewAnalysis ? (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {analysisMetrics.map((metric) => (
              <Card key={metric.label} className="p-6">
                <div className="flex items-center mb-4">
                  {metric.icon}
                  <h3 className="text-lg font-semibold ml-3">{metric.label}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Score</span>
                    <span>{metric.score}%</span>
                  </div>
                  <Progress value={metric.score} className="h-2" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-success border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Processing performance analysis...</p>
          </div>
        )}
        
        <div className="text-center">
          <Button 
            onClick={() => setCurrentStep('results')} 
            variant="outline" 
            className="mt-4"
            disabled={!interviewAnalysis}
          >
            View Results
          </Button>
        </div>
      </div>
    );
  };

  const renderResultsScreen = () => {
    const atsScore = resumeAnalysis?.atsScore || 0;
    const interviewScore = interviewAnalysis?.overallScore || 0;
    
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-success mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Your Interview Results</h2>
          <p className="text-muted-foreground">
            Here's your comprehensive performance analysis and recommendations.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Resume ATS Score</h3>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${
                atsScore >= 80 ? 'text-success' : 
                atsScore >= 60 ? 'text-accent' : 'text-destructive'
              }`}>
                {atsScore}%
              </div>
              <p className="text-muted-foreground">ATS Compatibility</p>
              <div className={`mt-4 p-4 rounded-lg ${
                atsScore >= 80 ? 'bg-success/10' : 
                atsScore >= 60 ? 'bg-accent/10' : 'bg-destructive/10'
              }`}>
                <p className="text-sm">
                  {resumeAnalysis?.feedback || "No resume uploaded for analysis."}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Interview Performance</h3>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${
                interviewScore >= 80 ? 'text-success' : 
                interviewScore >= 60 ? 'text-primary' : 'text-destructive'
              }`}>
                {interviewScore}%
              </div>
              <p className="text-muted-foreground">Overall Score</p>
              <div className={`mt-4 p-4 rounded-lg ${
                interviewScore >= 80 ? 'bg-success/10' : 
                interviewScore >= 60 ? 'bg-primary/10' : 'bg-destructive/10'
              }`}>
                <p className="text-sm">
                  {interviewAnalysis?.feedback || "Interview not completed."}
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Detailed Feedback</h3>
          <div className="space-y-4">
            {(resumeAnalysis?.strengths.length || 0) > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-success">Resume Strengths:</h4>
                {resumeAnalysis?.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                    <p className="text-sm">{strength}</p>
                  </div>
                ))}
              </div>
            )}
            
            {(interviewAnalysis?.strengths.length || 0) > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-primary">Interview Strengths:</h4>
                {interviewAnalysis?.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p className="text-sm">{strength}</p>
                  </div>
                ))}
              </div>
            )}
            
            {(resumeAnalysis?.improvements.length || 0) > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-accent">Resume Recommendations:</h4>
                {resumeAnalysis?.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                    <p className="text-sm">{improvement}</p>
                  </div>
                ))}
              </div>
            )}
            
            {(interviewAnalysis?.improvements.length || 0) > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-accent">Interview Recommendations:</h4>
                {interviewAnalysis?.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                    <p className="text-sm">{improvement}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
        
        <div className="text-center">
          <Button onClick={() => {
            // Reset all state for new session
            setCurrentStep('welcome');
            setResumeFile(null);
            setSelectedRole('');
            setCurrentQuestionIndex(0);
            setQuestionsAnswered(0);
            setTimeSpentPerQuestion([]);
            setInterviewCompleted(false);
            setResumeAnalysis(null);
            setInterviewAnalysis(null);
            setIsInterviewActive(false);
          }} variant="primary" size="lg">
            Start New Practice Session
          </Button>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcomeScreen();
      case 'upload':
        return renderUploadScreen();
      case 'role':
        return renderRoleScreen();
      case 'interview':
        return renderInterviewScreen();
      case 'analysis':
        return renderAnalysisScreen();
      case 'results':
        return renderResultsScreen();
      default:
        return renderWelcomeScreen();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {currentStep !== 'welcome' && (
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Progress</h3>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </Card>
          </div>
        )}
        
        <div className="max-w-6xl mx-auto">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default InterviewWizard;