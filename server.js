const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { initDatabase, db } = require('./database/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// Helper for input validation
function validateOpportunityInput(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate || data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      errors.push('Title is required and must be non-empty.');
    }
  }

  if (!isUpdate || data.description !== undefined) {
    if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
      errors.push('Description is required and must be non-empty.');
    }
  }

  if (!isUpdate || data.area !== undefined) {
    if (!data.area || typeof data.area !== 'string' || data.area.trim().length === 0) {
      errors.push('Research area is required.');
    }
  }

  if (!isUpdate || data.faculty_name !== undefined) {
    if (!data.faculty_name || typeof data.faculty_name !== 'string' || data.faculty_name.trim().length === 0) {
      errors.push("Faculty member's name is required.");
    }
  }

  if (!isUpdate || data.department !== undefined) {
    if (!data.department || typeof data.department !== 'string' || data.department.trim().length === 0) {
      errors.push('Department is required.');
    }
  }

  if (!isUpdate || data.required_skills !== undefined) {
    if (!data.required_skills || typeof data.required_skills !== 'string' || data.required_skills.trim().length === 0) {
      errors.push('Required skills are required.');
    }
  }

  if (!isUpdate || data.available_positions !== undefined) {
    const pos = parseInt(data.available_positions, 10);
    if (isNaN(pos) || pos <= 0) {
      errors.push('Available positions must be a positive integer greater than 0.');
    }
  }

  if (!isUpdate || data.deadline !== undefined) {
    if (!data.deadline || isNaN(Date.parse(data.deadline))) {
      errors.push('A valid deadline date (YYYY-MM-DD) is required.');
    }
  }

  if (data.status !== undefined) {
    if (!['Open', 'Closed'].includes(data.status)) {
      errors.push("Status must be either 'Open' or 'Closed'.");
    }
  }

  return errors;
}

// ==========================================
// REST API ROUTES
// ==========================================

// 2.2 Retrieve All Research Opportunities
// GET /api/opportunities
app.get('/api/opportunities', async (req, res) => {
  try {
    const rows = await db.getAll();
    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching research opportunities.',
      error: error.message
    });
  }
});

// 2.3 Retrieve One Research Opportunity
// GET /api/opportunities/:id
app.get('/api/opportunities/:id', async (req, res) => {
  const { id } = req.params;
  const numId = parseInt(id, 10);

  if (isNaN(numId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid opportunity ID provided. ID must be a valid number.'
    });
  }

  try {
    const row = await db.getById(numId);

    if (!row) {
      return res.status(404).json({
        success: false,
        message: `Research opportunity with ID ${id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: row
    });
  } catch (error) {
    console.error(`Error fetching opportunity ID ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving research opportunity.',
      error: error.message
    });
  }
});

// 2.1 Create a Research Opportunity
// POST /api/opportunities
app.post('/api/opportunities', async (req, res) => {
  const errors = validateOpportunityInput(req.body, false);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  const {
    title,
    description,
    area,
    faculty_name,
    department,
    required_skills,
    available_positions,
    deadline,
    status = 'Open'
  } = req.body;

  try {
    const created = await db.create({
      title: title.trim(),
      description: description.trim(),
      area: area.trim(),
      faculty_name: faculty_name.trim(),
      department: department.trim(),
      required_skills: required_skills.trim(),
      available_positions: parseInt(available_positions, 10),
      deadline,
      status: status || 'Open'
    });

    return res.status(201).json({
      success: true,
      message: 'Research opportunity created successfully.',
      data: created
    });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating research opportunity.',
      error: error.message
    });
  }
});

// 2.4 Update a Research Opportunity
// PUT /api/opportunities/:id
app.put('/api/opportunities/:id', async (req, res) => {
  const { id } = req.params;
  const numId = parseInt(id, 10);

  if (isNaN(numId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid opportunity ID provided. ID must be a valid number.'
    });
  }

  const errors = validateOpportunityInput(req.body, true);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  try {
    const updated = await db.update(numId, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Research opportunity with ID ${id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Research opportunity updated successfully.',
      data: updated
    });
  } catch (error) {
    console.error(`Error updating opportunity ID ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating research opportunity.',
      error: error.message
    });
  }
});

// 2.5 Delete a Research Opportunity
// DELETE /api/opportunities/:id
app.delete('/api/opportunities/:id', async (req, res) => {
  const { id } = req.params;
  const numId = parseInt(id, 10);

  if (isNaN(numId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid opportunity ID provided. ID must be a valid number.'
    });
  }

  try {
    const success = await db.delete(numId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: `Research opportunity with ID ${id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Research opportunity with ID ${id} deleted successfully.`
    });
  } catch (error) {
    console.error(`Error deleting opportunity ID ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while deleting research opportunity.',
      error: error.message
    });
  }
});

// Fallback route for frontend client-side SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Research Opportunity Portal Server running at:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   API Endpoint: http://localhost:${PORT}/api/opportunities`);
    console.log(`====================================================`);
  });
}

startServer();
