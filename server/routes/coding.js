const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.get('/questions', authenticateToken, async (req, res) => {
  try {
    const { data: questions, error } = await supabase
      .from('coding_questions')
      .select(`
        id,
        title,
        difficulty,
        tags,
        created_at,
        coding_test_cases(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedQuestions = questions.map(q => ({
      ...q,
      test_cases_count: q.coding_test_cases?.[0]?.count || 0
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error('Error fetching coding questions:', error);
    res.status(500).json({ error: 'Failed to fetch coding questions' });
  }
});

router.get('/questions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: question, error: questionError } = await supabase
      .from('coding_questions')
      .select('*')
      .eq('id', id)
      .single();

    if (questionError) throw questionError;

    const { data: testCases, error: testCasesError } = await supabase
      .from('coding_test_cases')
      .select('*')
      .eq('question_id', id)
      .order('is_sample', { ascending: false });

    if (testCasesError) throw testCasesError;

    res.json({
      ...question,
      testCases
    });
  } catch (error) {
    console.error('Error fetching coding question:', error);
    res.status(500).json({ error: 'Failed to fetch coding question' });
  }
});

router.post('/questions', authenticateToken, async (req, res) => {
  try {
    const { testCases, ...questionData } = req.body;

    const { data: question, error: questionError } = await supabase
      .from('coding_questions')
      .insert({
        ...questionData,
        created_by: req.user.id
      })
      .select()
      .single();

    if (questionError) throw questionError;

    if (testCases && testCases.length > 0) {
      const testCasesData = testCases.map(tc => ({
        question_id: question.id,
        input: tc.input,
        expected_output: tc.expected_output,
        is_sample: tc.is_sample,
        weight: tc.weight
      }));

      const { error: testCasesError } = await supabase
        .from('coding_test_cases')
        .insert(testCasesData);

      if (testCasesError) throw testCasesError;
    }

    res.json(question);
  } catch (error) {
    console.error('Error creating coding question:', error);
    res.status(500).json({ error: 'Failed to create coding question' });
  }
});

router.put('/questions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { testCases, ...questionData } = req.body;

    const { data: question, error: questionError } = await supabase
      .from('coding_questions')
      .update({
        ...questionData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (questionError) throw questionError;

    if (testCases) {
      await supabase
        .from('coding_test_cases')
        .delete()
        .eq('question_id', id);

      if (testCases.length > 0) {
        const testCasesData = testCases.map(tc => ({
          question_id: id,
          input: tc.input,
          expected_output: tc.expected_output,
          is_sample: tc.is_sample,
          weight: tc.weight
        }));

        const { error: testCasesError } = await supabase
          .from('coding_test_cases')
          .insert(testCasesData);

        if (testCasesError) throw testCasesError;
      }
    }

    res.json(question);
  } catch (error) {
    console.error('Error updating coding question:', error);
    res.status(500).json({ error: 'Failed to update coding question' });
  }
});

router.delete('/questions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('coding_questions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting coding question:', error);
    res.status(500).json({ error: 'Failed to delete coding question' });
  }
});

router.post('/run', authenticateToken, async (req, res) => {
  try {
    const { questionId, code, language } = req.body;

    const { data: testCases, error } = await supabase
      .from('coding_test_cases')
      .select('*')
      .eq('question_id', questionId)
      .eq('is_sample', true);

    if (error) throw error;

    const results = await executeCode(code, language, testCases);

    res.json({
      output: results.output,
      testResults: results.testResults
    });
  } catch (error) {
    console.error('Error running code:', error);
    res.status(500).json({ error: error.message || 'Failed to run code' });
  }
});

router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { questionId, testAttemptId, code, language, isPractice } = req.body;

    const { data: testCases, error: testCasesError } = await supabase
      .from('coding_test_cases')
      .select('*')
      .eq('question_id', questionId);

    if (testCasesError) throw testCasesError;

    const results = await executeCode(code, language, testCases);

    const testCasesPassed = results.testResults.filter(r => r.passed).length;
    const totalTestCases = testCases.length;
    const totalWeight = testCases.reduce((sum, tc) => sum + tc.weight, 0);
    const earnedWeight = results.testResults
      .filter(r => r.passed)
      .reduce((sum, r) => {
        const tc = testCases[r.test_case_number - 1];
        return sum + (tc?.weight || 0);
      }, 0);
    const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

    let status = 'wrong_answer';
    if (testCasesPassed === totalTestCases) {
      status = 'accepted';
    } else if (results.hasRuntimeError) {
      status = 'runtime_error';
    } else if (results.hasTimeLimit) {
      status = 'time_limit_exceeded';
    }

    const { data: submission, error: submissionError } = await supabase
      .from('coding_submissions')
      .insert({
        student_id: req.user.id,
        question_id: questionId,
        test_attempt_id: testAttemptId || null,
        language,
        code,
        status,
        test_cases_passed: testCasesPassed,
        total_test_cases: totalTestCases,
        score,
        execution_time: results.avgExecutionTime,
        test_results: results.testResults
      })
      .select()
      .single();

    if (submissionError) throw submissionError;

    if (isPractice) {
      const progressStatus = status === 'accepted' ? 'solved' : 'attempted';

      const { data: existing } = await supabase
        .from('practice_coding_progress')
        .select('*')
        .eq('student_id', req.user.id)
        .eq('question_id', questionId)
        .single();

      if (existing) {
        const updates = {
          status: status === 'accepted' ? 'solved' : existing.status,
          best_score: Math.max(score, existing.best_score || 0),
          attempts: (existing.attempts || 0) + 1,
          last_attempted_at: new Date().toISOString()
        };

        if (status === 'accepted' && existing.status !== 'solved') {
          updates.solved_at = new Date().toISOString();
        }

        await supabase
          .from('practice_coding_progress')
          .update(updates)
          .eq('id', existing.id);
      } else {
        await supabase
          .from('practice_coding_progress')
          .insert({
            student_id: req.user.id,
            question_id: questionId,
            status: progressStatus,
            best_score: score,
            attempts: 1,
            last_attempted_at: new Date().toISOString(),
            solved_at: status === 'accepted' ? new Date().toISOString() : null
          });
      }
    }

    res.json({
      submissionId: submission.id,
      status,
      testCasesPassed,
      totalTestCases,
      score,
      testResults: results.testResults.map(r => ({
        ...r,
        input: testCases[r.test_case_number - 1]?.is_sample ? r.input : '[Hidden]',
        expected_output: testCases[r.test_case_number - 1]?.is_sample ? r.expected_output : '[Hidden]'
      }))
    });
  } catch (error) {
    console.error('Error submitting code:', error);
    res.status(500).json({ error: error.message || 'Failed to submit code' });
  }
});

router.get('/practice/questions', authenticateToken, async (req, res) => {
  try {
    const { data: questions, error: questionsError } = await supabase
      .from('coding_questions')
      .select('id, title, difficulty, tags');

    if (questionsError) throw questionsError;

    const { data: progress, error: progressError } = await supabase
      .from('practice_coding_progress')
      .select('*')
      .eq('student_id', req.user.id);

    if (progressError) throw progressError;

    const progressMap = new Map(progress.map(p => [p.question_id, p]));

    const questionsWithProgress = questions.map(q => {
      const prog = progressMap.get(q.id);
      return {
        ...q,
        status: prog?.status || 'not_attempted',
        best_score: prog?.best_score,
        attempts: prog?.attempts
      };
    });

    const stats = {
      total: questions.length,
      solved: progress.filter(p => p.status === 'solved').length,
      attempted: progress.filter(p => p.status === 'attempted').length,
      easy: questions.filter(q => q.difficulty === 'easy').length,
      medium: questions.filter(q => q.difficulty === 'medium').length,
      hard: questions.filter(q => q.difficulty === 'hard').length
    };

    res.json({
      questions: questionsWithProgress,
      stats
    });
  } catch (error) {
    console.error('Error fetching practice questions:', error);
    res.status(500).json({ error: 'Failed to fetch practice questions' });
  }
});

async function executeCode(code, language, testCases) {
  const results = {
    output: '',
    testResults: [],
    avgExecutionTime: 0,
    hasRuntimeError: false,
    hasTimeLimit: false
  };

  try {
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const startTime = Date.now();

      try {
        const output = await runCodeInSandbox(code, language, testCase.input);
        const executionTime = Date.now() - startTime;

        const passed = output.trim() === testCase.expected_output.trim();

        results.testResults.push({
          test_case_number: i + 1,
          passed,
          input: testCase.input,
          expected_output: testCase.expected_output,
          actual_output: output,
          execution_time: executionTime
        });

        results.avgExecutionTime += executionTime;
      } catch (error) {
        results.hasRuntimeError = true;
        results.testResults.push({
          test_case_number: i + 1,
          passed: false,
          input: testCase.input,
          expected_output: testCase.expected_output,
          error: error.message
        });
      }
    }

    results.avgExecutionTime = Math.round(results.avgExecutionTime / testCases.length);

    if (results.testResults.length > 0 && results.testResults[0].passed) {
      results.output = 'All sample test cases passed!';
    } else {
      results.output = 'Some test cases failed. Check the results below.';
    }
  } catch (error) {
    results.output = `Error: ${error.message}`;
    results.hasRuntimeError = true;
  }

  return results;
}

async function runCodeInSandbox(code, language, input) {
  return new Promise((resolve, reject) => {
    try {
      let output = '';

      if (language === 'javascript') {
        const originalLog = console.log;
        const logs = [];
        console.log = (...args) => logs.push(args.join(' '));

        try {
          const func = new Function('input', `
            ${code}
            return solution ? solution(input) : '';
          `);
          const result = func(input);
          output = logs.length > 0 ? logs.join('\n') : String(result);
        } finally {
          console.log = originalLog;
        }
      } else if (language === 'python') {
        output = `Python execution not implemented in demo. Expected output based on input: ${input}`;
      } else {
        output = `${language} execution not implemented in demo.`;
      }

      resolve(output);
    } catch (error) {
      reject(new Error(`Runtime Error: ${error.message}`));
    }
  });
}

module.exports = router;
