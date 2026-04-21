-- Society Management System — Database Setup
-- Run this against your MySQL/PostgreSQL database

CREATE DATABASE IF NOT EXISTS society_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE society_db;

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('ADMIN','TREASURER','CHAIRMAN','MEMBER','TENANT') DEFAULT 'MEMBER',
  active        BOOLEAN DEFAULT TRUE,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS units (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  unit_number   VARCHAR(20) NOT NULL UNIQUE,
  unit_type     ENUM('FLAT','SHOP') NOT NULL,
  parking_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS members (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT REFERENCES users(id),
  unit_id    INT REFERENCES units(id),
  name       VARCHAR(100) NOT NULL,
  phone      VARCHAR(15),
  email      VARCHAR(100),
  occupancy  ENUM('OWNER','TENANT') DEFAULT 'OWNER',
  active     BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_cycles (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  month        INT NOT NULL,
  year         INT NOT NULL,
  flat_amount  DECIMAL(10,2) NOT NULL,
  shop_amount  DECIMAL(10,2) NOT NULL,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_month_year (month, year)
);

CREATE TABLE IF NOT EXISTS payments (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  member_id      INT REFERENCES members(id),
  maintenance_id INT REFERENCES maintenance_cycles(id),
  amount_paid    DECIMAL(10,2) NOT NULL,
  payment_mode   ENUM('CASH','UPI','BANK') NOT NULL,
  paid_on        DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS notices (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  expiry_date DATE,
  created_by  INT REFERENCES users(id),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  member_id   INT REFERENCES members(id),
  category    VARCHAR(100),
  description TEXT,
  status      ENUM('OPEN','IN_PROGRESS','RESOLVED') DEFAULT 'OPEN',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  entity       VARCHAR(50),
  entity_id    INT,
  action       VARCHAR(50),
  performed_by INT,
  timestamp    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── SEED DATA ────────────────────────────────────────────────────────────────
-- Password for all users: Society@123
-- bcrypt hash of 'Society@123'
INSERT INTO users (username, password_hash, role) VALUES
  ('admin@society.com',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN'),
  ('ramesh@society.com',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MEMBER'),
  ('priya@society.com',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MEMBER');

INSERT INTO units (unit_number, unit_type) VALUES
  ('A-101','FLAT'),('A-102','FLAT'),('A-103','FLAT'),('A-104','FLAT'),
  ('B-101','FLAT'),('B-102','FLAT'),('B-201','FLAT'),('B-203','FLAT'),
  ('C-301','FLAT'),('C-302','FLAT'),('D-101','FLAT'),('D-102','FLAT'),
  ('E-201','FLAT'),('E-202','FLAT'),('F-101','FLAT'),('F-102','FLAT'),
  ('G-301','FLAT'),('G-302','FLAT'),('H-101','FLAT'),
  ('S-01','SHOP'),('S-02','SHOP'),('S-03','SHOP'),('S-04','SHOP'),('S-05','SHOP');

INSERT INTO members (user_id, unit_id, name, phone, email, occupancy) VALUES
  (2, 1,  'Ramesh Kumar',  '9876543210', 'ramesh@test.com',  'OWNER'),
  (3, 2,  'Priya Sharma',  '9876543211', 'priya@test.com',   'OWNER'),
  (1, 3,  'Vikram Nair',   '9876543212', 'vikram@test.com',  'TENANT');

INSERT INTO maintenance_cycles (month, year, flat_amount, shop_amount) VALUES
  (1, 2026, 2000.00, 3200.00),
  (2, 2026, 2000.00, 3200.00),
  (3, 2026, 2000.00, 3200.00),
  (4, 2026, 2000.00, 3200.00);

INSERT INTO payments (member_id, maintenance_id, amount_paid, payment_mode, paid_on) VALUES
  (1, 1, 2000, 'UPI',  '2026-01-18'),
  (1, 2, 2000, 'UPI',  '2026-02-15'),
  (1, 4, 2000, 'CASH', '2026-04-18'),
  (2, 1, 2000, 'BANK', '2026-01-20'),
  (2, 2, 2000, 'UPI',  '2026-02-18'),
  (2, 3, 2000, 'UPI',  '2026-03-17'),
  (2, 4, 2000, 'CASH', '2026-04-17');

INSERT INTO notices (title, description, expiry_date, created_by) VALUES
  ('Annual General Meeting', 'All members attend AGM on May 10 at 6 PM.', '2026-05-10', 1),
  ('Water Supply Interruption', 'Water off Apr 21, 9 AM to 2 PM.', '2026-04-21', 1);
