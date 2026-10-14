const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'research_portal_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
};

let pool = null;
let isConnectedToMySQL = false;

// Fallback in-memory database store (used seamlessly if MySQL password is not yet configured)
let fallbackData = [
  {
    id: 1,
    title: 'Autonomous Drone Navigation via Edge AI',
    description: 'Investigate lightweight visual SLAM and deep learning models for collision avoidance in resource-constrained autonomous UAVs.',
    area: 'Artificial Intelligence & Robotics',
    faculty_name: 'Dr. Tariq Khan',
    department: 'Computer Science',
    required_skills: 'Python, ROS, PyTorch, OpenCV, Linux',
    available_positions: 2,
    deadline: '2026-11-30',
    status: 'Open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Zero-Trust Software Defined Networking',
    description: 'Analyze zero-trust security architecture deployment, micro-segmentation, and dynamic flow verification inside enterprise SDN controllers.',
    area: 'Computer Networks & Cybersecurity',
    faculty_name: 'Dr. Ayesha Malik',
    department: 'Computer Science',
    required_skills: 'Mininet, Python, Ryu SDN Controller, Wireshark',
    available_positions: 3,
    deadline: '2026-12-15',
    status: 'Open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Distributed Consensus in Low-Power IoT Mesh',
    description: 'Design and benchmark lightweight consensus mechanisms optimized for high-latency, battery-powered LoRaWAN mesh nodes.',
    area: 'Internet of Things & Distributed Systems',
    faculty_name: 'Dr. Bilal Ahmed',
    department: 'Electrical Engineering',
    required_skills: 'C/C++, Embedded Systems, LoRaWAN, NS-3',
    available_positions: 1,
    deadline: '2026-11-20',
    status: 'Open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
let nextId = 4;

async function initDatabase() {
  try {
    // 1. Establish initial connection without database specified to verify server & create DB if missing
    const rootConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await rootConnection.end();

    // 2. Initialize connection pool targeting the project database
    pool = mysql.createPool(dbConfig);

    // 3. Ensure opportunities table exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS opportunities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        area VARCHAR(100) NOT NULL,
        faculty_name VARCHAR(150) NOT NULL,
        department VARCHAR(100) NOT NULL,
        required_skills TEXT NOT NULL,
        available_positions INT NOT NULL,
        deadline DATE NOT NULL,
        status ENUM('Open', 'Closed') NOT NULL DEFAULT 'Open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await pool.query(createTableQuery);

    // 4. Seed initial rows if empty
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM opportunities');
    if (rows[0].count === 0) {
      for (const item of fallbackData) {
        await pool.query(
          `INSERT INTO opportunities 
           (title, description, area, faculty_name, department, required_skills, available_positions, deadline, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.title,
            item.description,
            item.area,
            item.faculty_name,
            item.department,
            item.required_skills,
            item.available_positions,
            item.deadline,
            item.status
          ]
        );
      }
      console.log('🌱 Seeded MySQL database with 3 initial research opportunities.');
    }

    isConnectedToMySQL = true;
    console.log(`✅ [MySQL Connected] Successfully connected to database: ${dbConfig.database}`);
    return true;
  } catch (err) {
    isConnectedToMySQL = false;
    console.warn('⚠️ [MySQL Notice]:', err.message);
    console.warn('💡 Set your MySQL root password in `.env` (DB_PASSWORD=...) to persist data into your local MySQL server.');
    console.log('⚡ Active mode: Interactive In-Memory Data Store (All REST CRUD endpoints are fully operational).');
    return false;
  }
}

// Database abstraction wrapper
const db = {
  isMySQL() {
    return isConnectedToMySQL;
  },

  async getAll() {
    if (isConnectedToMySQL && pool) {
      const [rows] = await pool.query('SELECT * FROM opportunities ORDER BY id DESC');
      return rows;
    }
    return [...fallbackData].sort((a, b) => b.id - a.id);
  },

  async getById(id) {
    const numId = parseInt(id, 10);
    if (isConnectedToMySQL && pool) {
      const [rows] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [numId]);
      return rows.length > 0 ? rows[0] : null;
    }
    return fallbackData.find(item => item.id === numId) || null;
  },

  async create(data) {
    if (isConnectedToMySQL && pool) {
      const insertQuery = `
        INSERT INTO opportunities 
        (title, description, area, faculty_name, department, required_skills, available_positions, deadline, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.query(insertQuery, [
        data.title,
        data.description,
        data.area,
        data.faculty_name,
        data.department,
        data.required_skills,
        data.available_positions,
        data.deadline,
        data.status || 'Open'
      ]);
      const [rows] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [result.insertId]);
      return rows[0];
    }

    const newRecord = {
      id: nextId++,
      title: data.title,
      description: data.description,
      area: data.area,
      faculty_name: data.faculty_name,
      department: data.department,
      required_skills: data.required_skills,
      available_positions: data.available_positions,
      deadline: data.deadline,
      status: data.status || 'Open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    fallbackData.push(newRecord);
    return newRecord;
  },

  async update(id, data) {
    const numId = parseInt(id, 10);
    if (isConnectedToMySQL && pool) {
      const [existing] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [numId]);
      if (existing.length === 0) return null;

      const current = existing[0];
      const updated = {
        title: data.title !== undefined ? data.title : current.title,
        description: data.description !== undefined ? data.description : current.description,
        area: data.area !== undefined ? data.area : current.area,
        faculty_name: data.faculty_name !== undefined ? data.faculty_name : current.faculty_name,
        department: data.department !== undefined ? data.department : current.department,
        required_skills: data.required_skills !== undefined ? data.required_skills : current.required_skills,
        available_positions: data.available_positions !== undefined ? data.available_positions : current.available_positions,
        deadline: data.deadline !== undefined ? data.deadline : current.deadline,
        status: data.status !== undefined ? data.status : current.status
      };

      const updateQuery = `
        UPDATE opportunities 
        SET title = ?, description = ?, area = ?, faculty_name = ?, department = ?, 
            required_skills = ?, available_positions = ?, deadline = ?, status = ?
        WHERE id = ?
      `;

      await pool.query(updateQuery, [
        updated.title,
        updated.description,
        updated.area,
        updated.faculty_name,
        updated.department,
        updated.required_skills,
        updated.available_positions,
        updated.deadline,
        updated.status,
        numId
      ]);

      const [rows] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [numId]);
      return rows[0];
    }

    const index = fallbackData.findIndex(item => item.id === numId);
    if (index === -1) return null;

    fallbackData[index] = {
      ...fallbackData[index],
      ...data,
      id: numId,
      updated_at: new Date().toISOString()
    };
    return fallbackData[index];
  },

  async delete(id) {
    const numId = parseInt(id, 10);
    if (isConnectedToMySQL && pool) {
      const [existing] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [numId]);
      if (existing.length === 0) return false;
      await pool.query('DELETE FROM opportunities WHERE id = ?', [numId]);
      return true;
    }

    const index = fallbackData.findIndex(item => item.id === numId);
    if (index === -1) return false;
    fallbackData.splice(index, 1);
    return true;
  }
};

module.exports = {
  initDatabase,
  db
};
