DROP DATABASE IF EXISTS coursera_golden;
CREATE DATABASE coursera_golden;
USE coursera_golden;
/* (Deje las tablas de silver por si acaso pero si no sirven solo borren el comentario)
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
    level TEXT,
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
*/

-- Tabla: category 
CREATE TABLE category (
	id INT AUTO_INCREMENT PRIMARY KEY,
    category_name TEXT, 
    description TEXT
);

-- Tabla: platform_metrics 
CREATE TABLE platform_metrics (
	id INT AUTO_INCREMENT PRIMARY KEY,
    platform_name TEXT, 
    total_courses INT,
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
    level TEXT,
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

-- category_metrics depende de category
CREATE TABLE category_metrics (
	id INT AUTO_INCREMENT PRIMARY KEY,
    id_category INT, 
    total_enrollment INT,
    total_courses INT,
    average_completion DOUBLE,
    average_rating DOUBLE, 
    average_price DOUBLE,
    FOREIGN KEY (id_category) REFERENCES category(id)
);
