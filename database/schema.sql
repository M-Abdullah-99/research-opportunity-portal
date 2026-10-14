-- Database Schema for University Research Opportunity Portal
-- Course: Computer Networks (CN) Assignment 01

CREATE DATABASE IF NOT EXISTS research_portal_db;
USE research_portal_db;

DROP TABLE IF EXISTS opportunities;

CREATE TABLE opportunities (
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
);

-- Seed Initial Research Opportunities
INSERT INTO opportunities (title, description, area, faculty_name, department, required_skills, available_positions, deadline, status)
VALUES
('Autonomous Drone Navigation via Edge AI', 'Investigate lightweight visual SLAM and deep learning models for collision avoidance in resource-constrained autonomous UAVs.', 'Artificial Intelligence & Robotics', 'Dr. Tariq Khan', 'Computer Science', 'Python, ROS, PyTorch, OpenCV, Linux', 2, '2026-11-30', 'Open'),
('Zero-Trust Software Defined Networking', 'Analyze zero-trust security architecture deployment, micro-segmentation, and dynamic flow verification inside enterprise SDN controllers.', 'Computer Networks & Cybersecurity', 'Dr. Ayesha Malik', 'Computer Science', 'Mininet, Python, Ryu SDN Controller, Wireshark', 3, '2026-12-15', 'Open'),
('Distributed Consensus in Low-Power IoT Mesh', 'Design and benchmark lightweight consensus mechanisms optimized for high-latency, battery-powered LoRaWAN mesh nodes.', 'Internet of Things & Distributed Systems', 'Dr. Bilal Ahmed', 'Electrical Engineering', 'C/C++, Embedded Systems, LoRaWAN, NS-3', 1, '2026-11-20', 'Open');
