const questions = [
    { question: 'How often do you feel unusually tired, even after a good night’s sleep?', options: ['Rarely', 'A few times a week', 'Almost daily'] },
    { question: 'When was the last time you checked your blood pressure or sugar levels?', options: ['Within 3 months', 'Over 6 months ago', 'Never / Don’t remember'] },
    { question: 'How would you describe your eating habits?', options: ['I eat mostly whole foods', 'I mix healthy with fast food', 'I eat out or snack often'] },
    { question: 'Do you notice swelling in your legs or puffiness in your face?', options: ['Yes, often', 'Sometimes', 'No'] },
    { question: 'How active are you weekly?', options: ['I work out 3+ times a week', 'I take walks or do light activity', 'I rarely exercise'] },
    { question: 'How would you describe your weight status?', options: ['Within healthy range', 'Slightly above my ideal', 'I think I might be overweight'] },
    { question: 'Anyone in your family diagnosed with diabetes, high cholesterol, or kidney disease?', options: ['Yes', 'No', 'Not sure'] }
  ];
  
  const summaries = {
    preventive: "Thank you for completing the survey. Many health issues like diabetes, fatty liver, or kidney stress can begin silently...",
    educational: "Your responses help highlight areas that may impact your health. Fatigue, diet, and body weight can offer early clues...",
    wellness: "This survey aims to spark awareness about subtle signs the body gives like fatigue or weight changes...",
    data: "Small indicators like fatigue or BMI shifts can be early signals of larger health challenges..."
  };
  
  let currentQuestion = 0;
  const answers = Array(questions.length).fill(null);
  
  const questionText = document.getElementById('question-text');
  const optionsContainer = document.getElementById('options');
  const progressText = document.getElementById('progress');
  const backBtn = document.getElementById('back-btn');
  const nextBtn = document.getElementById('next-btn');
  const survey = document.getElementById('survey');
  const summary = document.getElementById('summary');
  const summaryText = document.getElementById('summary-text');
  
  function renderQuestion() {
    const q = questions[currentQuestion];
    questionText.textContent = `${currentQuestion + 1}. ${q.question}`;
    progressText.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
    optionsContainer.innerHTML = '';
  
    q.options.forEach((option, i) => {
      const label = document.createElement('label');
      label.className = 'wellness-option';
  
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `q${currentQuestion}`;
      input.value = option;
      input.checked = answers[currentQuestion] === option;
      input.addEventListener('change', () => answers[currentQuestion] = option);
  
      label.appendChild(input);
      label.appendChild(document.createTextNode(option));
      optionsContainer.appendChild(label);
    });
  }
  
  function getSummary(answers) {
    const lowerAnswers = answers.map(a => a?.toLowerCase() ?? "");
    const hasFatigue = lowerAnswers[0]?.includes("few") || lowerAnswers[0]?.includes("almost");
    const poorDiet = lowerAnswers[2]?.includes("snack") || lowerAnswers[2]?.includes("fast");
    const lowActivity = lowerAnswers[4]?.includes("rarely");
    const familyHistory = lowerAnswers[6]?.includes("yes");
  
    if (hasFatigue && poorDiet && lowActivity) return summaries.preventive;
    if (hasFatigue || poorDiet) return summaries.educational;
    if (lowActivity || familyHistory) return summaries.wellness;
    return summaries.data;
  }
  
  backBtn.addEventListener('click', () => {
    if (currentQuestion > 0) {
      currentQuestion--;
      renderQuestion();
    }
  });
  
  nextBtn.addEventListener('click', () => {
    if (!answers[currentQuestion]) {
      alert('Please select an option before continuing.');
      return;
    }
    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      renderQuestion();
    } else {
      const summaryResult = getSummary(answers);
      survey.style.display = 'none';
      summary.style.display = 'block';
      summaryText.textContent = summaryResult;
    }
  });
  
  renderQuestion();
  