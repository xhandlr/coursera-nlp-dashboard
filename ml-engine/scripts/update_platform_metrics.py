import mysql.connector
from mysql.connector import Error
import os
import pandas as pd
from dotenv import load_dotenv

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

def populate_and_update_platform_metrics():
    """
    Inserta las plataformas y luego calcula y actualiza sus métricas
    en la tabla 'platform_metrics'.
    """
    conn = None
    try:
        print("Conectando a la base de datos MySQL...")
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # --- PASO 1: Insertar las plataformas si no existen ---
        print("Paso 1: Asegurando que las plataformas existan en la tabla 'platform_metrics'...")
        platforms = [
            (1, 'Coursera'),
            (2, 'edX'),
            (3, 'Udemy'),
            (4, 'LinkedIn Learning')
        ]
        
        # Usar INSERT IGNORE para evitar errores si las plataformas ya existen
        insert_platform_query = "INSERT IGNORE INTO platform_metrics (id, platform_name) VALUES (%s, %s)"
        cursor.executemany(insert_platform_query, platforms)
        conn.commit()
        print(f"  - Se han insertado/verificado {cursor.rowcount} plataformas.")

        # --- PASO 2: Calcular las métricas para cada plataforma ---
        print("\nPaso 2: Calculando métricas desde 'platform_detail_courses'...")
        
        query_metrics = """
            SELECT
                COALESCE(id_platform, 4) AS platform_id,
                COUNT(id) AS total_courses,
                SUM(enrollment_students) AS total_enrollment,
                ROUND(AVG(completion_rate), 2) AS average_completion,
                ROUND(AVG(rating), 2) AS average_rating,
                ROUND(AVG(price), 1) AS average_price
            FROM
                platform_detail_courses 
            GROUP BY
                platform_id;
        """
        cursor.execute(query_metrics)
        metrics_data = cursor.fetchall()
        print(f"  - Se calcularon métricas para {len(metrics_data)} plataformas.")

        # --- PASO 3: Actualizar la tabla 'platform_metrics' ---
        print("\nPaso 3: Actualizando la tabla 'platform_metrics' con las nuevas métricas...")
        
        # Preparar los datos para una actualización masiva
        update_params = [
            (total_courses, total_enrollment, avg_completion, avg_rating, avg_price, platform_id)
            for platform_id, total_courses, total_enrollment, avg_completion, avg_rating, avg_price in metrics_data
        ]

        update_query = """
            UPDATE platform_metrics 
            SET 
                total_courses = %s, 
                total_enrollment = %s,
                average_completion = %s, 
                average_rating = %s, 
                average_price = %s
            WHERE id = %s
        """
        cursor.executemany(update_query, update_params)
        conn.commit()
        print(f"  - Se actualizaron {cursor.rowcount} registros en la tabla 'platform_metrics'.")

        # --- PASO 4: Guardar resultados en CSV para el Dashboard ---
        print(f"\nGuardando resultados en la carpeta: {OUTPUT_PATH}")
        df_metrics = pd.DataFrame(metrics_data, columns=['platform_id', 'total_courses', 'total_enrollment', 'average_completion', 'average_rating', 'average_price'])
        
        # Añadir los nombres de las plataformas al DataFrame
        platform_names_map = {pid: name for pid, name in platforms}
        df_metrics['platform_name'] = df_metrics['platform_id'].map(platform_names_map)
        
        # Reordenar columnas y guardar
        df_metrics = df_metrics[['platform_id', 'platform_name', 'total_courses', 'total_enrollment', 'average_completion', 'average_rating', 'average_price']]
        df_metrics.to_csv(f"{OUTPUT_PATH}/platform_metrics.csv", index=False)
        print(" - platform_metrics.csv guardado.")

        print("\n¡Proceso completado con éxito!")

    except Error as e:
        print(f"\nError durante el proceso: {e}")

    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
            print("Conexión a la base de datos cerrada.")

if __name__ == '__main__':
    populate_and_update_platform_metrics()
