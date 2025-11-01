const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

/**
 * POST /api/python/run
 * Expects { image: "...", ... } in the request body
 */
router.post('/run', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    // Pass parameters to Python
    const params = { image };

    // Spawn the Python process
    const pythonProcess = spawn('py', ['my_py.py']);

    // Send JSON to Python via stdin
    pythonProcess.stdin.write(JSON.stringify(params) + '\n');
    pythonProcess.stdin.end();

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python error:', errorOutput);
        return res.status(500).json({ error: 'Python script error', details: errorOutput });
      }

      try {
        const parsed = JSON.parse(output);
        res.json(parsed);
      } catch {
        res.json({ output });
      }
    });

  } catch (err) {
    console.error('Error running Python script:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;
