import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
import json

load_dotenv()

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.normpath(os.path.join(SCRIPT_DIR, '..', '..', 'coursera-dashboard', 'src', 'data'))

DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

def update_category_coursera_metrics():
    conn = None
    try:
        print("Conectando a la base de datos MySQL...")
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # 1. Obtener TODAS las categorías
        cursor.execute("SELECT id, category_name FROM category ORDER BY id")
        all_categories = cursor.fetchall()
        
        results = []
        
        for cat_id, cat_name in all_categories:
            print(f"Procesando categoría: {cat_name} (ID: {cat_id})")
            
            # 2. Datos de COURSE (sin global)
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_courses,
                    COALESCE(SUM(number_reviews), 0) as total_reviews,
                    SUM(CASE WHEN LOWER(schedule) LIKE '%flexible%' THEN 1 ELSE 0 END) as total_flexible,
                    SUM(CASE WHEN LOWER(schedule) LIKE '%hands%' THEN 1 ELSE 0 END) as total_hands_on,
                    SUM(CASE WHEN LOWER(level) = 'beginner' THEN 1 ELSE 0 END) as beginner_courses,
                    SUM(CASE WHEN LOWER(level) = 'intermediate' THEN 1 ELSE 0 END) as intermediate_courses,
                    SUM(CASE WHEN LOWER(level) = 'advanced' THEN 1 ELSE 0 END) as advanced_courses,
                    -- Calcular average_level como FLOAT decimal
                    ROUND(
                        (
                            (SUM(CASE WHEN LOWER(level) = 'beginner' THEN 1.0 ELSE 0.0 END) * 1.0) +
                            (SUM(CASE WHEN LOWER(level) = 'intermediate' THEN 1.0 ELSE 0.0 END) * 2.0) +
                            (SUM(CASE WHEN LOWER(level) = 'advanced' THEN 1.0 ELSE 0.0 END) * 3.0)
                        ) / 
                        NULLIF(
                            SUM(CASE WHEN LOWER(level) IN ('beginner', 'intermediate', 'advanced') THEN 1.0 ELSE 0.0 END),
                            0
                        ),
                        2
                    ) as avg_level_decimal,
                    ROUND(AVG(rating), 2) as avg_rating,
                    ROUND(AVG(duration), 2) as avg_duration
                FROM course 
                WHERE id_category = %s
            """, (cat_id,))
            
            course_data = cursor.fetchone()
            
            # 3. Datos de PLATFORM_DETAIL_COURSES (con global) - solo id_platform = 1
            cursor.execute("""
                SELECT 
                    COALESCE(SUM(enrollment_students), 0) as total_global_enrollment,
                    COUNT(*) as total_global_courses,
                    ROUND(AVG(completion_rate), 2) as avg_global_completion,
                    ROUND(AVG(rating), 2) as avg_global_rating,
                    ROUND(AVG(price), 2) as avg_global_price
                FROM platform_detail_courses 
                WHERE id_category = %s AND id_platform = 1
            """, (cat_id,))
            
            global_data = cursor.fetchone()
            
            # Procesar datos
            if course_data:
                total_courses, total_reviews, total_flexible, total_hands_on, \
                beginner_courses, intermediate_courses, advanced_courses, \
                avg_level_decimal, avg_rating, avg_duration = course_data
                
                # average_level ya está como float decimal (1.32, 2.15, etc.)
                average_level = float(avg_level_decimal or 1.0)
            else:
                total_courses = total_reviews = total_flexible = total_hands_on = 0
                beginner_courses = intermediate_courses = advanced_courses = 0
                average_level = avg_rating = avg_duration = 0.0
            
            if global_data:
                total_global_enrollment, total_global_courses, \
                avg_global_completion, avg_global_rating, avg_global_price = global_data
            else:
                total_global_enrollment = total_global_courses = 0
                avg_global_completion = avg_global_rating = avg_global_price = 0.0
            
            # Insertar en la tabla
            cursor.execute("""
                INSERT INTO category_coursera_metrics 
                (id_category, total_flexible, total_hands_on, beginner_courses, 
                 intermediate_courses, advanced_courses, total_reviews, total_courses,
                 average_level, average_rating, average_duration, total_global_enrollment,
                 total_global_courses, average_global_completion, average_global_rating,
                 average_global_price)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    total_flexible = VALUES(total_flexible),
                    total_hands_on = VALUES(total_hands_on),
                    beginner_courses = VALUES(beginner_courses),
                    intermediate_courses = VALUES(intermediate_courses),
                    advanced_courses = VALUES(advanced_courses),
                    total_reviews = VALUES(total_reviews),
                    total_courses = VALUES(total_courses),
                    average_level = VALUES(average_level),
                    average_rating = VALUES(average_rating),
                    average_duration = VALUES(average_duration),
                    total_global_enrollment = VALUES(total_global_enrollment),
                    total_global_courses = VALUES(total_global_courses),
                    average_global_completion = VALUES(average_global_completion),
                    average_global_rating = VALUES(average_global_rating),
                    average_global_price = VALUES(average_global_price)
            """, (
                cat_id,
                int(total_flexible or 0),
                int(total_hands_on or 0),
                int(beginner_courses or 0),
                int(intermediate_courses or 0),
                int(advanced_courses or 0),
                int(total_reviews or 0),
                int(total_courses or 0),
                float(average_level),
                float(avg_rating or 0.0),
                float(avg_duration or 0.0),
                int(total_global_enrollment or 0),
                int(total_global_courses or 0),
                float(avg_global_completion or 0.0),
                float(avg_global_rating or 0.0),
                float(avg_global_price or 0.0)
            ))
            
            # Guardar para JSON
            results.append({
                'category_id': cat_id,
                'category_name': cat_name,
                'course_metrics': {
                    'total_courses': int(total_courses or 0),
                    'total_reviews': int(total_reviews or 0),
                    'total_flexible': int(total_flexible or 0),
                    'total_hands_on': int(total_hands_on or 0),
                    'beginner_courses': int(beginner_courses or 0),
                    'intermediate_courses': int(intermediate_courses or 0),
                    'advanced_courses': int(advanced_courses or 0),
                    'average_level': float(average_level),
                    'average_rating': float(avg_rating or 0.0),
                    'average_duration': float(avg_duration or 0.0)
                },
                'global_metrics': {
                    'total_global_enrollment': int(total_global_enrollment or 0),
                    'total_global_courses': int(total_global_courses or 0),
                    'average_global_completion': float(avg_global_completion or 0.0),
                    'average_global_rating': float(avg_global_rating or 0.0),
                    'average_global_price': float(avg_global_price or 0.0)
                },
                'differences': {
                    'course_vs_global_courses': int((total_courses or 0) - (total_global_courses or 0)),
                    'rating_difference': float((avg_rating or 0.0) - (avg_global_rating or 0.0))
                }
            })
        
        conn.commit()
        print(f"\n✓ Procesadas {len(all_categories)} categorías")
        
        # Guardar JSON
        json_path = f"{OUTPUT_PATH}/category_coursera_metrics.json"
        with open(json_path, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"✓ JSON guardado en: {json_path}")
        
        # Resumen simple
        print("\n=== RESUMEN ===")
        categories_with_course = sum(1 for r in results if r['course_metrics']['total_courses'] > 0)
        categories_with_global = sum(1 for r in results if r['global_metrics']['total_global_courses'] > 0)
        print(f"Categorías con datos en course: {categories_with_course}")
        print(f"Categorías con datos en global: {categories_with_global}")
        
        # Mostrar levels con decimales
        print("\nAverage_level por categoría (con decimales):")
        for r in results:
            if r['course_metrics']['total_courses'] > 0:
                level = r['course_metrics']['average_level']
                print(f"  {r['category_name']}: {level:.2f}")

    except Error as e:
        print(f"\n✗ Error: {e}")

    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
            print("\nConexión cerrada.")

if __name__ == '__main__':
    update_category_coursera_metrics()