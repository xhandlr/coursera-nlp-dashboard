DROP DATABASE IF EXISTS coursera_golden;
CREATE DATABASE coursera_golden;
USE coursera_golden;

-- Tabla: category 
CREATE TABLE category (
	id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) UNIQUE,
    description TEXT
);

-- Tabla: platform_metrics 
CREATE TABLE platform_metrics (
	id INT AUTO_INCREMENT PRIMARY KEY,
    platform_name TEXT, 
    total_courses INT,
    total_enrollment INT,
    average_completion DOUBLE, 
    average_rating DOUBLE, 
    average_price DOUBLE
);

-- Tabla: institution 
CREATE TABLE institution (
	id INT AUTO_INCREMENT PRIMARY KEY,
    institution TEXT, 
    total_reviews INT,
    total_courses INT, 
    average_rating DOUBLE
);

-- Tabla dependiente: platform_detail_courses
CREATE TABLE platform_detail_courses (
	id INT AUTO_INCREMENT PRIMARY KEY,
    id_category INT,
    hours_duration INT,
    enrollment_students INT,
    completion_rate DOUBLE,
    id_platform INT,
    price DOUBLE,
    rating DOUBLE,
    FOREIGN KEY (id_category) REFERENCES category(id),
    FOREIGN KEY (id_platform) REFERENCES platform_metrics(id)
);

-- Tabla dependiente: course
CREATE TABLE course (
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
    id_institution INT,
    keywords TEXT,
    course_url TEXT,
    id_category INT,
    FOREIGN KEY (id_institution) REFERENCES institution(id)
);

-- review no tiene FK
CREATE TABLE review (
	id INT AUTO_INCREMENT PRIMARY KEY,
    review TEXT,
    reviewer TEXT,
    date_review DATE,
    rating INT,
    review_year INT,
    course_url TEXT
);

-- category_global_metrics depende de category
CREATE TABLE category_global_metrics (
	id INT AUTO_INCREMENT PRIMARY KEY,
    id_category INT UNIQUE, 
    total_enrollment INT,
    total_courses INT,
    average_completion DOUBLE,
    average_rating DOUBLE, 
    average_price DOUBLE,
    FOREIGN KEY (id_category) REFERENCES category(id)
);

-- category_coursera_metrics depende de category
CREATE TABLE category_coursera_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_category INT UNIQUE,
    total_flexible INT,
    total_hands_on INT,
    beginner_courses INT,
    intermediate_courses INT,
    advanced_courses INT,
    total_reviews INT,
    total_courses INT,
    average_level DOUBLE,
    average_rating DOUBLE,
    average_duration DOUBLE,
    total_global_enrollment INT,
    total_global_courses INT,
    average_global_completion DOUBLE,
    average_global_rating DOUBLE,
    average_global_price DOUBLE,
    FOREIGN KEY (id_category) REFERENCES category(id)
);

