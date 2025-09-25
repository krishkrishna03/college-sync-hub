const pdf = require('pdf-parse');
const fs = require('fs');

class PDFExtractor {
  static async extractMCQs(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      const text = data.text;
      
      // Parse MCQs from text
      const questions = this.parseMCQText(text);
      
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      
      return questions;
    } catch (error) {
      // Clean up file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new Error('Failed to extract questions from PDF: ' + error.message);
    }
  }

  static parseMCQText(text) {
    const questions = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentQuestion = null;
    let questionCounter = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if line starts with a number (question)
      const questionMatch = line.match(/^(\d+)\.?\s*(.+)/);
      if (questionMatch) {
        // Save previous question if exists
        if (currentQuestion && this.isValidQuestion(currentQuestion)) {
          questions.push(currentQuestion);
        }
        
        // Start new question
        questionCounter++;
        currentQuestion = {
          questionText: questionMatch[2],
          options: {},
          correctAnswer: null
        };
        continue;
      }
      
      // Check for options (A), (B), (C), (D) or A), B), C), D)
      const optionMatch = line.match(/^[(\[]?([ABCD])[)\]]?\s*(.+)/i);
      if (optionMatch && currentQuestion) {
        const optionLetter = optionMatch[1].toUpperCase();
        const optionText = optionMatch[2];
        currentQuestion.options[optionLetter] = optionText;
        continue;
      }
      
      // Check for answer indication
      const answerMatch = line.match(/^(?:Answer|Ans|Correct)?:?\s*[(\[]?([ABCD])[)\]]?/i);
      if (answerMatch && currentQuestion) {
        currentQuestion.correctAnswer = answerMatch[1].toUpperCase();
        continue;
      }
      
      // If we have a current question and this line doesn't match patterns, 
      // it might be continuation of question text
      if (currentQuestion && !currentQuestion.options.A) {
        currentQuestion.questionText += ' ' + line;
      }
    }
    
    // Add the last question
    if (currentQuestion && this.isValidQuestion(currentQuestion)) {
      questions.push(currentQuestion);
    }
    
    return questions;
  }

  static isValidQuestion(question) {
    return question.questionText &&
           question.options.A &&
           question.options.B &&
           question.options.C &&
           question.options.D &&
           question.correctAnswer &&
           ['A', 'B', 'C', 'D'].includes(question.correctAnswer);
  }

  static generateSampleQuestions(count = 5, subject = 'General') {
    const sampleQuestions = {
      'Verbal': [
        {
          questionText: "Choose the word that is most similar in meaning to 'Abundant':",
          options: {
            A: "Scarce",
            B: "Plentiful", 
            C: "Limited",
            D: "Rare"
          },
          correctAnswer: "B"
        },
        {
          questionText: "Complete the sentence: 'The weather was so _____ that we decided to stay indoors.'",
          options: {
            A: "pleasant",
            B: "mild",
            C: "severe",
            D: "calm"
          },
          correctAnswer: "C"
        }
      ],
      'Reasoning': [
        {
          questionText: "If all roses are flowers and some flowers are red, which conclusion is correct?",
          options: {
            A: "All roses are red",
            B: "Some roses may be red",
            C: "No roses are red", 
            D: "All red things are roses"
          },
          correctAnswer: "B"
        },
        {
          questionText: "What comes next in the sequence: 2, 6, 12, 20, ?",
          options: {
            A: "28",
            B: "30",
            C: "32",
            D: "24"
          },
          correctAnswer: "B"
        }
      ],
      'Technical': [
        {
          questionText: "Which of the following is not a programming language?",
          options: {
            A: "Python",
            B: "Java",
            C: "HTML",
            D: "C++"
          },
          correctAnswer: "C"
        },
        {
          questionText: "What does CPU stand for?",
          options: {
            A: "Central Processing Unit",
            B: "Computer Processing Unit",
            C: "Central Program Unit",
            D: "Computer Program Unit"
          },
          correctAnswer: "A"
        }
      ],
      'Arithmetic': [
        {
          questionText: "What is 15% of 200?",
          options: {
            A: "25",
            B: "30",
            C: "35",
            D: "40"
          },
          correctAnswer: "B"
        },
        {
          questionText: "If a train travels 120 km in 2 hours, what is its speed?",
          options: {
            A: "50 km/h",
            B: "60 km/h",
            C: "70 km/h",
            D: "80 km/h"
          },
          correctAnswer: "B"
        }
      ],
      'Communication': [
        {
          questionText: "Which is the most effective way to start a presentation?",
          options: {
            A: "With a joke",
            B: "With statistics",
            C: "With a relevant question or story",
            D: "With an apology"
          },
          correctAnswer: "C"
        },
        {
          questionText: "Active listening involves:",
          options: {
            A: "Waiting for your turn to speak",
            B: "Giving full attention and providing feedback",
            C: "Thinking about your response",
            D: "Looking at your phone"
          },
          correctAnswer: "B"
        }
      ]
    };

    const questions = sampleQuestions[subject] || sampleQuestions['Technical'];
    return questions.slice(0, count);
  }
}

module.exports = PDFExtractor;