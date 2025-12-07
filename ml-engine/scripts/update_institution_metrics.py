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

def calculate_and_update_metrics():
    """
    Calcula las métricas agregadas (total de cursos, total de reseñas, calificación promedio)
    para cada institución y actualiza la tabla 'institution'.
    """
    conn = None
    try:
        print("Conectando a la base de datos MySQL...")
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # --- PASO 1: Calcular las métricas para cada institución ---
        print("Paso 1: Calculando métricas agregadas (esto puede tardar)...")
        
        # Unión de las tres tablas para realizar los cá
        # Usamos LEFT JOIN para incluir instituciones incluso si no tienen cursos o reseñas.
        query_metrics = """
            SELECT
                i.id AS institution_id,
                i.institution AS institution_name,
                COUNT(c.id) AS total_courses,
                SUM(c.number_reviews) AS total_reviews,
                ROUND(SUM(c.rating * c.number_reviews) / NULLIF(SUM(c.number_reviews), 0), 1) AS average_rating
            FROM
                institution i
            LEFT JOIN
                course c ON i.id = c.id_institution
            GROUP BY
                i.id, i.institution;
        """
        cursor.execute(query_metrics)
        metrics_data = cursor.fetchall()
        print(f"  - Se calcularon métricas para {len(metrics_data)} instituciones.")

        # --- PASO 2: Actualizar la tabla 'institution' en lote ---
        print("\nPaso 2: Actualizando la tabla 'institution' con las nuevas métricas...")
        
        # Preparamos los datos para una actualización masiva (executemany)
        # (total_courses, total_reviews, average_rating, institution_id)
        update_params = [
            (total_courses, total_reviews, avg_rating if avg_rating is not None else 0, inst_id)
            for inst_id, name, total_courses, total_reviews, avg_rating in metrics_data
        ]

        update_query = """
            UPDATE institution 
            SET total_courses = %s, total_reviews = %s, average_rating = %s 
            WHERE id = %s;
        """
        cursor.executemany(update_query, update_params)
        conn.commit()
        print(f"  - Se actualizaron {cursor.rowcount} registros en la tabla 'institution'.")

        # --- PASO 3: Guardar resultados en CSV para el Dashboard ---
        print(f"\nGuardando resultados en la carpeta: {OUTPUT_PATH}")
        df_metrics = pd.DataFrame(metrics_data, columns=['institution_id', 'institution_name', 'total_courses', 'total_reviews', 'average_rating'])
        df_metrics.to_csv(f"{OUTPUT_PATH}/institution_metrics.csv", index=False)
        print(" - institution_metrics.csv guardado.")

        print("\n¡Proceso completado con éxito!")

    except Error as e:
        print(f"\nError durante el proceso: {e}")

    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
            print("Conexión a la base de datos cerrada.")

if __name__ == '__main__':
    calculate_and_update_metrics()