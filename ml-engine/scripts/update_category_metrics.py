import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
import pandas as pd

# Carga las variables de entorno desde el archivo .env
load_dotenv()

# --- Configuración de Salida ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.normpath(os.path.join(SCRIPT_DIR, '..', '..', 'coursera-dashboard', 'src', 'data'))

# --- CONFIGURACIÓN DE LA BASE DE DATOS ---
DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

def update_category_metrics():
    """
    Calcula las métricas para la tabla 'category_metrics' utilizando ÚNICAMENTE
    la tabla 'platform_detail_courses'.
    
    Campos a calcuzlar:
    - total_enrollment
    - total_courses
    - total_completed_students (calculado como enrollment * completion_rate / 100)
    - average_completion
    - average_rating
    - average_price
    """
    conn = None
    try:
        print("Conectando a la base de datos MySQL...")
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # --- PASO 1: Obtener métricas de la tabla 'platform_detail_courses' ---
        print("Paso 1: Calculando métricas desde 'platform_detail_courses'...")
        
        # Asumimos que completion_rate está en escala 0-100 (basado en CSVs previos).
        # total_completed_students = enrollment_students * (completion_rate / 100)
        # Hacemos JOIN con category para obtener el nombre para el CSV
        query_metrics = """
            SELECT
                pdc.id_category,
                c.category_name,
                COALESCE(SUM(pdc.enrollment_students), 0) AS total_enrollment,
                COUNT(*) AS total_courses,
                COALESCE(SUM(pdc.enrollment_students * (pdc.completion_rate / 100)), 0) AS total_completed_students,
                ROUND(AVG(pdc.completion_rate), 2) AS average_completion,
                ROUND(AVG(pdc.rating), 2) AS average_rating,
                ROUND(AVG(pdc.price), 2) AS average_price
            FROM
                platform_detail_courses pdc
            LEFT JOIN
                category c ON pdc.id_category = c.id
            WHERE
                pdc.id_category IS NOT NULL
            GROUP BY
                pdc.id_category, c.category_name;
        """
        
        cursor.execute(query_metrics)
        metrics_data = cursor.fetchall()
        print(f"  - Se calcularon métricas para {len(metrics_data)} categorías.")

        # --- PASO 2: Insertar/Actualizar tabla 'category_metrics' ---
        print("\nPaso 2: Actualizando tabla 'category_metrics'...")
        
        upsert_query = """
            INSERT INTO category_metrics 
            (id_category, total_enrollment, total_courses, total_completed_students, average_completion, average_rating, average_price)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            total_enrollment = VALUES(total_enrollment),
            total_courses = VALUES(total_courses),
            total_completed_students = VALUES(total_completed_students),
            average_completion = VALUES(average_completion),
            average_rating = VALUES(average_rating),
            average_price = VALUES(average_price);
        """
        
        upsert_params = []
        csv_data = []

        for row in metrics_data:
            id_category, category_name, total_enrollment, total_courses, total_completed, avg_completion, avg_rating, avg_price = row
            
            # Datos para BD
            upsert_params.append((
                id_category,
                int(total_enrollment),
                int(total_courses),
                int(total_completed), # Convertir a entero
                float(avg_completion) if avg_completion is not None else 0.0,
                float(avg_rating) if avg_rating is not None else 0.0,
                float(avg_price) if avg_price is not None else 0.0
            ))

            # Datos para CSV
            csv_data.append({
                'category_id': id_category,
                'category_name': category_name,
                'total_enrollment': int(total_enrollment),
                'total_courses': int(total_courses),
                'total_completed_students': int(total_completed),
                'average_completion': float(avg_completion) if avg_completion is not None else 0.0,
                'average_rating': float(avg_rating) if avg_rating is not None else 0.0,
                'average_price': float(avg_price) if avg_price is not None else 0.0
            })

        if upsert_params:
            cursor.executemany(upsert_query, upsert_params)
            conn.commit()
            print(f"  - Se procesaron {len(upsert_params)} registros en 'category_metrics'.")
        else:
            print("  - No hay datos para actualizar.")

        # --- PASO 3: Guardar resultados en CSV para el Dashboard ---
        print(f"\nGuardando resultados en la carpeta: {OUTPUT_PATH}")
        if csv_data:
            df_metrics = pd.DataFrame(csv_data)
            df_metrics.to_csv(f"{OUTPUT_PATH}/category_metrics.csv", index=False)
            print(" - category_metrics.csv guardado.")
        else:
            print(" - No hay datos para guardar en CSV.")

        print("\n¡Proceso completado con éxito!")

    except Error as e:
        print(f"\nError durante el proceso: {e}")

    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
            print("Conexión a la base de datos cerrada.")

if __name__ == '__main__':
    update_category_metrics()
