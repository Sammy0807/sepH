import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './WellnessCheck.css';

/**
 * Wellness check questions array
 */
const questions = [
  { question: 'How often do you feel unusually tired, even after a good night\'s sleep?', options: ['Rarely', 'A few times a week', 'Almost daily'] },
  { question: 'When was the last time you checked your blood pressure or sugar levels?', options: ['Within 3 months', 'Over 6 months ago', 'Never / Don\'t remember'] },
  { question: 'How would you describe your eating habits?', options: ['I eat mostly whole foods', 'I mix healthy with fast food', 'I eat out or snack often'] },
  { question: 'Do you notice swelling in your legs or puffiness in your face?', options: ['Yes, often', 'Sometimes', 'No'] },
  { question: 'How active are you weekly?', options: ['I work out 3+ times a week', 'I take walks or do light activity', 'I rarely exercise'] },
  { question: 'How would you describe your weight status?', options: ['Within healthy range', 'Slightly above my ideal', 'I think I might be overweight'] },
  { question: 'Anyone in your family diagnosed with diabetes, high cholesterol, or kidney disease?', options: ['Yes', 'No', 'Not sure'] }
];

/**
 * Summary texts for different wellness check outcomes
 */
const summaries = {
  preventive: "Thank you for completing the survey. Many health issues like diabetes, fatty liver, or kidney stress can begin silently...",
  educational: "Your responses help highlight areas that may impact your health. Fatigue, diet, and body weight can offer early clues...",
  wellness: "This survey aims to spark awareness about subtle signs the body gives like fatigue or weight changes...",
  data: "Small indicators like fatigue or BMI shifts can be early signals of larger health challenges..."
};

/**
 * WellnessCheck component that displays a health assessment questionnaire
 * @returns {JSX.Element} The wellness check component
 */
function WellnessCheck() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const navigate = useNavigate();

  /**
   * Determines the appropriate summary based on user answers
   * @param {Array} answers - Array of user answers
   * @returns {string} The summary text to display
   */
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

  /**
   * Handles option selection for the current question
   * @param {string} option - The selected option
   */
  const handleOptionChange = (option) => {
    const newAnswers = [...answers];
    newAnswers[current] = option;
    setAnswers(newAnswers);
  };

  /**
   * Handles navigation to the next question or completion
   */
  const handleNext = () => {
    if (!answers[current]) {
      alert('Please select an option before continuing.');
      return;
    }
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      setShowSummary(true);
      setSummaryText(getSummary(answers));
    }
  };

  /**
   * Handles navigation to the previous question
   */
  const handleBack = () => {
    if (current > 0) setCurrent(current - 1);
  };

  return (
    <div className="wellness-wrapper">
      {!showSummary ? (
        <div className="wellness-container">
          <h1 className="wellness-title">🩺 SEP Health 1-Minute Wellness Check</h1>
          <p className="wellness-progress">Question {current + 1} of {questions.length}</p>
          <div className="wellness-question-block">
            <p className="wellness-question">{current + 1}. {questions[current].question}</p>
            <div className="wellness-options">
              {questions[current].options.map((option, i) => (
                <label className="wellness-option" key={i}>
                  <input
                    type="radio"
                    name={`q${current}`}
                    value={option}
                    checked={answers[current] === option}
                    onChange={() => handleOptionChange(option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div className="wellness-buttons spread">
            <button className="wellness-button secondary" onClick={handleBack} disabled={current === 0}>Back</button>
            <button className="wellness-button" onClick={handleNext}>{current === questions.length - 1 ? 'Finish' : 'Next'}</button>
          </div>
        </div>
      ) : (
        <div className="wellness-container">
          <h2 className="wellness-header">✅ Thanks for completing your wellness check!</h2>
          <p className="wellness-text">{summaryText}</p>
          <p className="wellness-highlight">
            Download our application to start receiving useful prompt that supports a healthier lifestyle.
          </p>
          <button className="wellness-button" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      )}
    </div>
  );
}

// PropTypes for type checking (currently no props, but good practice for future extensibility)
WellnessCheck.propTypes = {};

export default WellnessCheck; 