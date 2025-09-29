'use client';

import { useState } from 'react';
import Link from 'next/link';
import '../../style.css';

const questions = [
  { 
    question: 'How often do you feel unusually tired, even after a good night\'s sleep?', 
    options: ['Rarely', 'A few times a week', 'Almost daily'] 
  },
  { 
    question: 'When was the last time you checked your blood pressure or sugar levels?', 
    options: ['Within 3 months', 'Over 6 months ago', 'Never / Don\'t remember'] 
  },
  { 
    question: 'How would you describe your eating habits?', 
    options: ['I eat mostly whole foods', 'I mix healthy with fast food', 'I eat out or snack often'] 
  },
  { 
    question: 'Do you notice swelling in your legs or puffiness in your face?', 
    options: ['Yes, often', 'Sometimes', 'No'] 
  },
  { 
    question: 'How active are you weekly?', 
    options: ['I work out 3+ times a week', 'I take walks or do light activity', 'I rarely exercise'] 
  },
  { 
    question: 'How would you describe your weight status?', 
    options: ['Within healthy range', 'Slightly above my ideal', 'I think I might be overweight'] 
  },
  { 
    question: 'Anyone in your family diagnosed with diabetes, high cholesterol, or kidney disease?', 
    options: ['Yes', 'No', 'Not sure'] 
  }
];

const summaries = {
  preventive: "Thank you for completing the survey. Many health issues like diabetes, fatty liver, or kidney stress can begin silently. Your responses suggest you may benefit from proactive health monitoring and lifestyle adjustments.",
  educational: "Your responses help highlight areas that may impact your health. Fatigue, diet, and body weight can offer early clues about metabolic health. Consider discussing these patterns with a healthcare provider.",
  wellness: "This survey aims to spark awareness about subtle signs the body gives like fatigue or weight changes. These can be early indicators worth monitoring as part of your wellness journey.",
  data: "Small indicators like fatigue or BMI shifts can be early signals of larger health challenges. Staying aware of these patterns can help you make informed decisions about your health."
};

export default function WellnessCheck() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(Array(questions.length).fill(null));
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('');

  const handleAnswerChange = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const getSummary = (answers: (string | null)[]) => {
    const lowerAnswers = answers.map(a => a?.toLowerCase() ?? "");
    const hasFatigue = lowerAnswers[0]?.includes("few") || lowerAnswers[0]?.includes("almost");
    const poorDiet = lowerAnswers[2]?.includes("snack") || lowerAnswers[2]?.includes("fast");
    const lowActivity = lowerAnswers[4]?.includes("rarely");
    const familyHistory = lowerAnswers[6]?.includes("yes");

    if (hasFatigue && poorDiet && lowActivity) return summaries.preventive;
    if (hasFatigue || poorDiet) return summaries.educational;
    if (lowActivity || familyHistory) return summaries.wellness;
    return summaries.data;
  };

  const handleNext = async () => {
    if (!answers[currentQuestion]) {
      alert('Please select an option before continuing.');
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const result = getSummary(answers);
      setSummaryText(result);
      setShowSummary(true);

      // Optionally save to database
      try {
        await fetch('/api/wellness', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            responses: answers,
            summary: result,
          }),
        });
      } catch (error) {
        console.log('Could not save assessment:', error);
        // Continue anyway - this is optional
      }
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (showSummary) {
    return (
      <div className="wellness-wrapper">
        <div className="wellness-container">
          <h2 className="wellness-header">✅ Thanks for completing your wellness check!</h2>
          <p className="wellness-text">{summaryText}</p>
          <p className="wellness-highlight">
            Download our application to start receiving useful prompts that support a healthier lifestyle.
          </p>
          <div className="wellness-buttons" style={{ justifyContent: 'center', marginTop: '2rem' }}>
            <Link href="/" className="wellness-button">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="wellness-wrapper">
      <div className="wellness-container">
        <h1 className="wellness-title">🩺 SEP Health 2-Minute Wellness Check</h1>
        <p className="wellness-progress">
          Question {currentQuestion + 1} of {questions.length}
        </p>
        
        <div className="wellness-question-block">
          <p className="wellness-question">
            {currentQuestion + 1}. {currentQ.question}
          </p>
          
          <div className="wellness-options">
            {currentQ.options.map((option, index) => (
              <label key={index} className="wellness-option">
                <input
                  type="radio"
                  name={`q${currentQuestion}`}
                  value={option}
                  checked={answers[currentQuestion] === option}
                  onChange={() => handleAnswerChange(option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div className="wellness-buttons spread">
          <button 
            className="wellness-button secondary" 
            onClick={handleBack}
            disabled={currentQuestion === 0}
            style={{ 
              opacity: currentQuestion === 0 ? 0.5 : 1,
              cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Back
          </button>
          <button className="wellness-button" onClick={handleNext}>
            {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
