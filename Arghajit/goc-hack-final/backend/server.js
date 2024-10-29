// server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connDB = require('./config/DB');
const Test = require('./models/Test');
const TestResult = require('./models/testresult');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connDB();

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to generate unique test code
const generateTestCode = () => {
  // Generate a 6-character alphanumeric code
  return crypto.randomBytes(3)
    .toString('hex')
    .toUpperCase();
};

// Helper function to validate test code format
const isValidTestCode = (code) => {
  return /^[A-F0-9]{6}$/.test(code);
};

// Create test with code
app.post('/api/tests', async (req, res) => {
  try {
    // Generate a unique test code
    let testCode;
    let isUnique = false;
    
    while (!isUnique) {
      testCode = generateTestCode();
      // Check if code already exists
      const existingTest = await Test.findOne({ testCode });
      if (!existingTest) {
        isUnique = true;
      }
    }

    // Add the test code to the test data
    const testData = {
      ...req.body,
      testCode,
      createdAt: new Date()
    };

    const newTest = new Test(testData);
    const savedTest = await newTest.save();
    
    // Generate both long URL and short code
    const testLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/attempt-test/${savedTest._id}`;
    
    res.status(201).json({ 
      message: 'Test created successfully', 
      test: savedTest, 
      link: testLink,
      code: testCode
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating test', error });
  }
});

// Get test by code
app.get('/api/tests/code/:code', async (req, res) => {
  try {
    const { code } = req.params;

    // Validate code format
    if (!isValidTestCode(code)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid test code format' 
      });
    }

    // Find test by code
    const test = await Test.findOne({ testCode: code });
    
    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: 'Test not found' 
      });
    }

    // Redirect format - return the test ID for frontend routing
    res.json({ 
      success: true,
      testId: test._id,
      link: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/attempt-test/${test._id}`
    });

  } catch (error) {
    console.error('Error finding test by code:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get test details (existing route with minor updates)
// Get test details with an option to include correct answers
app.get('/api/tests/:testId', async (req, res) => {
  try {
    const includeAnswers = req.query.includeAnswers === 'true';
    const test = await Test.findById(req.params.testId)
      .populate({
        path: 'questions',
        select: includeAnswers ? '' : '-CorrectAnswer' // Include correct answers based on query parameter
      })
      .select('testName Duration Subject Description totalMarks testCode');

    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: 'Test not found' 
      });
    }

    const totalMarks = test.questions.reduce((sum, question) => sum + question.Marks, 0);

    const formattedTest = {
      test: {
        _id: test._id,
        testName: test.testName,
        Duration: test.Duration,
        Subject: test.Subject,
        Description: test.Description,
        testCode: test.testCode,
        totalMarks,
        questions: test.questions.map(q => ({
          _id: q._id,
          QuestionText: q.QuestionText,
          OptionA: q.OptionA,
          OptionB: q.OptionB,
          OptionC: q.OptionC,
          OptionD: q.OptionD,
          Marks: q.Marks,
          ...(includeAnswers && { CorrectAnswer: q.CorrectAnswer }) // Include correct answers if requested
        }))
      }
    };

    res.json(formattedTest);

  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching test details',
      error: error.message 
    });
  }
});


// Submit test (existing route remains the same)
// app.post('/api/tests/:testId/submit', async (req, res) => {
//   const { answers, userId } = req.body;

//   try {
//     const test = await Test.findById(req.params.testId);
//     if (!test) return res.status(404).json({ message: 'Test not found' });

//     let score = 0;
//     const correctAnswers = [];

//     test.questions.forEach((question, index) => {
//       const submittedAnswer = answers[index];
//       const correctAnswer = question.CorrectAnswer.replace('Option', '');

//       if (submittedAnswer === correctAnswer) {
//         score += question.Marks;
//       }

//       correctAnswers.push({
//         questionId: question._id,
//         selectedAnswer: submittedAnswer,
//       });
//     });

//     const testResult = new TestResult({
//       testId: req.params.testId,
//       score: score,
//       answers: correctAnswers,
//       userId: req.params.userId
//     });

//     await testResult.save();

//     res.json({
//       message: 'Test submitted successfully',
//       score: score,
//       resultId: testResult._id,
//     });
//   } catch (error) {
//     console.error('Error submitting test:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });
app.post('/api/tests/:testId/submit', async (req, res) => {
    const { answers, userId } = req.body;
  
    try {
      const test = await Test.findById(req.params.testId);
      if (!test) return res.status(404).json({ message: 'Test not found' });
  
      let score = 0;
      const correctAnswers = [];
  
      test.questions.forEach((question, index) => {
        const submittedAnswer = answers[index];
        const correctAnswer = question.CorrectAnswer.replace('Option', '');
  
        if (submittedAnswer === correctAnswer) {
          score += question.Marks;
        }
  
        correctAnswers.push({
          questionId: question._id,
          selectedAnswer: submittedAnswer,
        });
      });
  
      // Save the result in the database
      const testResult = new TestResult({
        testId: req.params.testId,
        score: score,
        answers: correctAnswers,
        userId: userId, // directly from req.body
      });
  
      await testResult.save();
  
      res.json({
        message: 'Test submitted successfully',
        score: score,
        resultId: testResult._id,
      });
    } catch (error) {
      console.error('Error submitting test:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
// Get test results (existing route remains the same)
app.get('/api/tests/:testId/results', async (req, res) => {
  try {
    const result = await TestResult.findOne({
      testId: req.params.testId,
    }).populate('testId', 'testName Duration Subject testCode'); // Added testCode to populated fields

    if (!result) return res.status(404).json({ message: 'Test result not found' });

    res.json({
      test: result.testId,
      score: result.score,
      answers: result.answers,
      submittedAt: result.submittedAt,
    });
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send(`Server is running on port ${PORT}`);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});