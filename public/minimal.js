// Interview Application State
let state = {
    currentStep: 'welcome',
    resumeFile: null,
    selectedRole: '',
    currentQuestion: 0,
    questionsAnswered: 0,
    timeSpentPerQuestion: [],
    cameraUsed: false,
    microphoneUsed: false,
    stream: null,
    timer: null,
    timeLeft: 30,
    startTime: null,
    questions: []
};

// Interview Questions
const personalQuestions = [
    "Tell me about yourself and your background.",
    "What are your greatest strengths?",
    "Where do you see yourself in 5 years?",
    "Why are you interested in this position?",
    "Describe a challenge you overcame."
];

const roleQuestions = {
    'Software Engineer': [
        "Explain the difference between REST and GraphQL APIs.",
        "How do you handle error handling in your code?",
        "Describe your experience with version control systems.",
        "What testing strategies do you use?",
        "How do you optimize application performance?"
    ],
    'Product Manager': [
        "How do you prioritize features in a product roadmap?",
        "Describe your experience with user research.",
        "How do you handle conflicting stakeholder requirements?",
        "What metrics do you use to measure product success?",
        "How do you work with engineering teams?"
    ],
    'Data Scientist': [
        "Explain the difference between supervised and unsupervised learning.",
        "How do you handle missing data in datasets?",
        "Describe your experience with statistical modeling.",
        "What tools do you use for data visualization?",
        "How do you validate model performance?"
    ],
    'UX Designer': [
        "Walk me through your design process.",
        "How do you conduct user research?",
        "Describe a time you had to advocate for users.",
        "How do you measure design success?",
        "What's your experience with accessibility design?"
    ],
    'Sales Representative': [
        "How do you handle objections from potential clients?",
        "Describe your sales process from lead to close.",
        "How do you build relationships with clients?",
        "What CRM tools have you used?",
        "How do you handle rejection?"
    ],
    'Marketing Manager': [
        "How do you develop a marketing strategy?",
        "Describe your experience with digital marketing.",
        "How do you measure campaign effectiveness?",
        "What's your approach to brand management?",
        "How do you work with cross-functional teams?"
    ]
};

// Navigation Functions
function goToStep(step) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(step).classList.add('active');
    state.currentStep = step;
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        state.resumeFile = file;
        document.getElementById('upload-text').textContent = `File uploaded: ${file.name}`;
        document.getElementById('next-role').disabled = false;
    }
}

function selectRole(role) {
    state.selectedRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
    document.getElementById('start-interview').disabled = false;
}

function generateQuestions() {
    const personal = personalQuestions.sort(() => 0.5 - Math.random()).slice(0, 2);
    const roleSpecific = (roleQuestions[state.selectedRole] || []).sort(() => 0.5 - Math.random()).slice(0, 3);
    state.questions = [...personal, ...roleSpecific];
}

async function startInterview() {
    generateQuestions();
    goToStep('interview');
    updateQuestionDisplay();
    await requestCamera();
    startQuestionTimer();
}

async function requestCamera() {
    try {
        state.stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
        });
        document.getElementById('video').srcObject = state.stream;
        state.cameraUsed = true;
        state.microphoneUsed = true;
        updateControlButtons();
    } catch (err) {
        console.log('Camera/microphone access denied');
    }
}

function toggleCamera() {
    if (state.stream) {
        const videoTrack = state.stream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            state.cameraUsed = videoTrack.enabled;
            updateControlButtons();
        }
    }
}

function toggleMic() {
    if (state.stream) {
        const audioTrack = state.stream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            state.microphoneUsed = audioTrack.enabled;
            updateControlButtons();
        }
    }
}

function updateControlButtons() {
    const cameraBtn = document.getElementById('camera-btn');
    const micBtn = document.getElementById('mic-btn');
    
    cameraBtn.style.opacity = state.cameraUsed ? '1' : '0.5';
    micBtn.style.opacity = state.microphoneUsed ? '1' : '0.5';
}

function updateQuestionDisplay() {
    document.getElementById('question-number').textContent = 
        `Question ${state.currentQuestion + 1} of ${state.questions.length}`;
    document.getElementById('current-question').textContent = 
        state.questions[state.currentQuestion] || 'Interview completed!';
}

function startQuestionTimer() {
    state.timeLeft = 30;
    state.startTime = Date.now();
    updateTimerDisplay();
    
    state.timer = setInterval(() => {
        state.timeLeft--;
        updateTimerDisplay();
        
        if (state.timeLeft <= 0) {
            nextQuestion();
        }
    }, 1000);
}

function updateTimerDisplay() {
    document.getElementById('timer').textContent = `${state.timeLeft}s`;
}

function nextQuestion() {
    if (state.timer) {
        clearInterval(state.timer);
    }
    
    // Record time spent on this question
    if (state.startTime) {
        const timeSpent = (Date.now() - state.startTime) / 1000;
        state.timeSpentPerQuestion.push(timeSpent);
        state.questionsAnswered++;
    }
    
    state.currentQuestion++;
    
    if (state.currentQuestion >= state.questions.length) {
        endInterview();
        return;
    }
    
    updateQuestionDisplay();
    startQuestionTimer();
}

function endInterview() {
    if (state.timer) {
        clearInterval(state.timer);
    }
    
    if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
    }
    
    goToStep('results');
    calculateResults();
}

function calculateResults() {
    const analysis = analyzePerformance();
    
    document.getElementById('overall-score').textContent = `${analysis.overallScore}%`;
    document.getElementById('body-score').textContent = `${analysis.bodyLanguageScore}%`;
    document.getElementById('comm-score').textContent = `${analysis.grammarScore}%`;
    document.getElementById('skills-score').textContent = `${analysis.skillsScore}%`;
    document.getElementById('confidence-score').textContent = `${analysis.confidenceScore}%`;
    document.getElementById('feedback-text').textContent = analysis.feedback;
    
    const strengthsList = document.getElementById('strengths-list');
    const improvementsList = document.getElementById('improvements-list');
    
    strengthsList.innerHTML = '';
    improvementsList.innerHTML = '';
    
    analysis.strengths.forEach(strength => {
        const li = document.createElement('li');
        li.textContent = strength;
        strengthsList.appendChild(li);
    });
    
    analysis.improvements.forEach(improvement => {
        const li = document.createElement('li');
        li.textContent = improvement;
        improvementsList.appendChild(li);
    });
}

function analyzePerformance() {
    const totalQuestions = state.questions.length;
    const completionRate = state.questionsAnswered / totalQuestions;
    const avgTimePerQuestion = state.timeSpentPerQuestion.length > 0 
        ? state.timeSpentPerQuestion.reduce((a, b) => a + b, 0) / state.timeSpentPerQuestion.length 
        : 0;

    let bodyLanguageScore = 0;
    let grammarScore = 0;
    let skillsScore = 0;
    let confidenceScore = 0;
    
    const strengths = [];
    const improvements = [];

    // Ultra strict scoring
    if (!state.cameraUsed) {
        bodyLanguageScore = 0;
        improvements.push("Camera was not enabled - body language assessment impossible");
    } else if (state.questionsAnswered === 0) {
        bodyLanguageScore = 0;
        improvements.push("No questions answered despite camera being on");
    } else if (completionRate < 0.5) {
        bodyLanguageScore = 5;
        improvements.push("Very poor engagement - answered less than 50% of questions");
    } else if (completionRate < 0.8) {
        bodyLanguageScore = 25;
        improvements.push("Poor engagement - complete more questions");
    } else {
        bodyLanguageScore = 60;
        strengths.push("Good visual engagement");
    }

    if (!state.microphoneUsed) {
        grammarScore = 0;
        improvements.push("Microphone was not enabled - speech assessment impossible");
    } else if (state.questionsAnswered === 0) {
        grammarScore = 0;
        improvements.push("No verbal responses detected");
    } else if (avgTimePerQuestion < 15) {
        grammarScore = 10;
        improvements.push("Responses too brief");
    } else {
        grammarScore = 45;
        strengths.push("Adequate response length");
    }

    if (state.questionsAnswered === 0) {
        skillsScore = 0;
        improvements.push("Cannot assess skills - no questions answered");
    } else if (completionRate < 0.7) {
        skillsScore = 15;
        improvements.push("Limited skill demonstration");
    } else {
        skillsScore = 50;
        strengths.push("Moderate skill demonstration");
    }

    if (!state.cameraUsed || !state.microphoneUsed) {
        confidenceScore = 5;
        improvements.push("Unable to assess confidence without full setup");
    } else if (completionRate < 0.5) {
        confidenceScore = 10;
        improvements.push("Low completion suggests confidence issues");
    } else {
        confidenceScore = 40;
        strengths.push("Adequate confidence level");
    }

    const overallScore = Math.round((bodyLanguageScore + grammarScore + skillsScore + confidenceScore) / 4);

    let feedback = "";
    if (overallScore === 0) {
        feedback = "No interview participation detected. Please restart with camera and microphone enabled.";
    } else if (overallScore < 15) {
        feedback = "Extremely poor performance. Major improvements needed.";
    } else if (overallScore < 30) {
        feedback = "Very poor interview performance. Focus on preparation and engagement.";
    } else if (overallScore < 60) {
        feedback = "Below average performance with significant room for improvement.";
    } else {
        feedback = "Good performance! Continue practicing to improve further.";
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
}

function restart() {
    state = {
        currentStep: 'welcome',
        resumeFile: null,
        selectedRole: '',
        currentQuestion: 0,
        questionsAnswered: 0,
        timeSpentPerQuestion: [],
        cameraUsed: false,
        microphoneUsed: false,
        stream: null,
        timer: null,
        timeLeft: 30,
        startTime: null,
        questions: []
    };
    
    document.getElementById('upload-text').textContent = 'Click to upload resume (PDF, DOC, DOCX)';
    document.getElementById('next-role').disabled = true;
    document.getElementById('start-interview').disabled = true;
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('selected'));
    
    goToStep('welcome');
}