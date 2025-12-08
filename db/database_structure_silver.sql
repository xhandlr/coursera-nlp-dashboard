DROP DATABASE IF EXISTS coursera;
CREATE DATABASE coursera;
USE coursera;

-- Tabla: course
CREATE TABLE course (
	id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT,
    institution TEXT,
    course_url TEXT,
	course_id TEXT
);

-- Tabla: completion_category
CREATE TABLE completion_category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(15),
    category TEXT,
    duration INT,
    hours_duration INT,
    enrollment_students INT,
    completion_rate DOUBLE,
    platform TEXT,
    price DOUBLE,
    rating DOUBLE
); 

-- Tabla: course_detail
CREATE TABLE course_detail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_title TEXT,
    rating DOUBLE,
    -- 0:not specified, 1:beginner, 2:intermediate, 3:advanced
	level ENUM('0', '1', '2', '3') NOT NULL,
    duration INT,
    schedule TEXT,
    number_reviews INT,
    topics TEXT,
    skills TEXT,
    modules TEXT,
    instructor TEXT,
    institution TEXT,
    keywords TEXT,
    course_url TEXT
);

-- Tabla: review
CREATE TABLE review (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review TEXT,
    reviewer TEXT,
    date_review DATE,
    rating INT,
    course_id TEXT
);

-- Pruebas
SELECT * FROM completion_category;
SELECT * FROM course_detail;
