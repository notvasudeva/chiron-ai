import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Play, Camera, Mic, BarChart3, FileText, Target, Brain, MessageSquare, Trophy } from 'lucide-react';

type Step = 'welcome' | 'upload' | 'role' | 'interview' | 'analysis' | 'results';

const InterviewWizard = () => {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isInterviewActive, setIsInterviewActive] = useState(false);

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

  const mockQuestions = [
    "Tell me about yourself and your background",
    "What interests you about this position?",
    "Describe a challenging project you've worked on",
    "How do you handle tight deadlines?",
    "What are your greatest strengths?",
    "How do you stay updated with industry trends?",
    "Describe a time you solved a complex problem"
  ];

  const analysisMetrics = [
    { label: 'Body Language', score: 85, icon: <Camera className="w-5 h-5" /> },
    { label: 'Grammar & Speech', score: 92, icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Role-Specific Skills', score: 78, icon: <Target className="w-5 h-5" /> },
    { label: 'Confidence Level', score: 88, icon: <Brain className="w-5 h-5" /> }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const startInterview = () => {
    setIsInterviewActive(true);
    setTimeout(() => {
      setIsInterviewActive(false);
      setCurrentStep('analysis');
    }, 5000);
  };

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
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
            <Camera className="w-16 h-16 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-center space-x-4">
            <Button variant="outline" size="sm">
              <Camera className="w-4 h-4 mr-2" />
              Camera
            </Button>
            <Button variant="outline" size="sm">
              <Mic className="w-4 h-4 mr-2" />
              Microphone
            </Button>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Current Question:</h3>
          <div className="bg-muted rounded-lg p-4 mb-6">
            <p className="text-lg">
              {mockQuestions[0]}
            </p>
          </div>
          
          {!isInterviewActive ? (
            <Button onClick={startInterview} variant="success" className="w-full">
              Start Interview
            </Button>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Recording your response...</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );

  const renderAnalysisScreen = () => (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-4">Analyzing Your Performance</h2>
        <p className="text-muted-foreground">
          Our AI is evaluating your interview responses across multiple dimensions.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {analysisMetrics.map((metric, index) => (
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
      
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-success border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processing complete analysis...</p>
        <Button 
          onClick={() => setCurrentStep('results')} 
          variant="outline" 
          className="mt-4"
        >
          View Results
        </Button>
      </div>
    </div>
  );

  const renderResultsScreen = () => (
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
            <div className="text-4xl font-bold text-success mb-2">87%</div>
            <p className="text-muted-foreground">ATS Compatibility</p>
            <div className="mt-4 p-4 bg-success/10 rounded-lg">
              <p className="text-sm">
                Your resume is well-optimized for applicant tracking systems with strong keyword matching.
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Interview Performance</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">85%</div>
            <p className="text-muted-foreground">Overall Score</p>
            <div className="mt-4 p-4 bg-primary/10 rounded-lg">
              <p className="text-sm">
                Strong performance with excellent communication skills and relevant experience demonstration.
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      <Card className="p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Detailed Feedback</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
            <p><strong>Strengths:</strong> Clear articulation, confident body language, and relevant examples.</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
            <p><strong>Areas for Improvement:</strong> Consider providing more specific metrics in your examples.</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <p><strong>Recommendations:</strong> Practice the STAR method for behavioral questions.</p>
          </div>
        </div>
      </Card>
      
      <div className="text-center">
        <Button onClick={() => setCurrentStep('welcome')} variant="primary" size="lg">
          Start New Practice Session
        </Button>
      </div>
    </div>
  );

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