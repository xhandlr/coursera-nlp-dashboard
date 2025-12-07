import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from sklearn.cluster import AgglomerativeClustering
import numpy as np
import pandas as pd

# Cargar las variables de entorno desde el archivo .env
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

def map_and_update_categories():
    """
    Utiliza un modelo de IA para agrupar categorías semánticamente similares,
    puebla la tabla 'category' y actualiza las tablas 'course' y 'platform_detail_courses'.
    """
    conn = None
    try:
        print("Conectando a la base de datos MySQL...")
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # --- PASO 1: Extraer todas las categorías únicas de ambas tablas ---
        print("Paso 1: Extrayendo nombres de categorías únicas...")
        cursor.execute("SELECT DISTINCT keywords FROM course WHERE keywords IS NOT NULL AND keywords != ''")
        course_categories = {row[0] for row in cursor.fetchall()}
        cursor.execute("SELECT DISTINCT CAST(id_category AS CHAR) FROM platform_detail_courses WHERE id_category IS NOT NULL")
        platform_categories = {row[0] for row in cursor.fetchall()}
        
        all_raw_categories = sorted(list(course_categories.union(platform_categories)))
        print(f"  - Total de {len(all_raw_categories)} categorías únicas encontradas.")

        # --- PASO 2: Usar IA para agrupar categorías (Embeddings + Clustering) ---
        print("\nPaso 2: Usando modelo de IA para encontrar similitudes semánticas...")
        # Cargar un modelo pre-entrenado. La primera vez descargará el modelo.
        model = SentenceTransformer('all-MiniLM-L6-v2')
        embeddings = model.encode(all_raw_categories, show_progress_bar=True)

        # Usar clustering aglomerativo para agrupar las categorías.
        # 'distance_threshold' controla qué tan "similares" deben ser las categorías para agruparse.
        clustering = AgglomerativeClustering(n_clusters=None, distance_threshold=1.2).fit(embeddings)
        cluster_labels = clustering.labels_

        # Crear un mapa de 'categoría original' -> 'ID de cluster'
        raw_to_cluster_id = {name: label for name, label in zip(all_raw_categories, cluster_labels)}

        # --- PASO 3: Nombrar los clusters ---
        print("\nPaso 3: Agrupando y nombrando los clusters encontrados...")
        clusters = {}
        for name, label in raw_to_cluster_id.items():
            if label not in clusters:
                clusters[label] = []
            clusters[label].append(name)
            
        # Nombre de los grupos encontrados
        master_category_names = {}
        print("\n--- GRUPOS DE CATEGORÍAS ENCONTRADOS POR LA IA ---")
        for cluster_id, members in clusters.items():
            # Por ahora, nombramos el cluster con el miembro más corto del grupo.
            master_name = min(members, key=len) 
            master_category_names[cluster_id] = master_name
            print(f"Grupo '{master_name}': {members}")
        
        master_categories_final = sorted(list(set(master_category_names.values())))

        # --- PASO 4: Poblar la tabla 'category' con los nombres maestros ---
        print("\nPaso 4: Poblando la tabla 'category' con categorías maestras...")
        
        # Verificar qué categorías ya existen para no duplicarlas
        cursor.execute("SELECT category_name FROM category")
        existing_categories = {row[0] for row in cursor.fetchall()}
        
        new_categories = [name for name in master_categories_final if name not in existing_categories]
        
        if new_categories:
            category_data = [(name,) for name in new_categories]
            insert_category_query = "INSERT INTO category (category_name) VALUES (%s)"
            cursor.executemany(insert_category_query, category_data)
            conn.commit()
            print(f"  - Se insertaron {len(new_categories)} nuevas categorías.")
        else:
            print("  - No hay nuevas categorías para insertar.")

        # --- PASO 5: Crear un mapa final de 'nombre de categoría maestra' -> 'ID de BD' ---
        print("\nPaso 5: Creando mapa final de categorías para la actualización...")
        cursor.execute("SELECT id, category_name FROM category")
        final_category_map = {name: cat_id for cat_id, name in cursor.fetchall()}
        print("  - Mapa creado con éxito.")

        # --- PASO 6: Actualizar la tabla 'course' ---
        print("\nPaso 6: Actualizando la columna 'id_category' en la tabla 'course'...")
        course_update_params = [
            (final_category_map.get(master_category_names.get(raw_to_cluster_id.get(raw_name))), raw_name)
            for raw_name in course_categories
        ]
        
        update_course_query = "UPDATE course SET id_category = %s WHERE keywords = %s"
        cursor.executemany(update_course_query, course_update_params)
        conn.commit()
        print(f"  - Filas afectadas en 'course': {cursor.rowcount}.")

        # --- PASO 7: Actualizar la tabla 'platform_detail_courses' ---
        print("\nPaso 7: Actualizando la columna 'id_category' en 'platform_detail_courses'...")
        platform_update_params = [
            (final_category_map.get(master_category_names.get(raw_to_cluster_id.get(raw_name))), raw_name)
            for raw_name in platform_categories
        ]
        
        update_platform_query = "UPDATE platform_detail_courses SET id_category = %s WHERE CAST(id_category AS CHAR) = %s"
        cursor.executemany(update_platform_query, platform_update_params)
        conn.commit()
        print(f"  - Filas afectadas en 'platform_detail_courses': {cursor.rowcount}.")

        # --- PASO 8: Guardar el mapeo en un archivo CSV ---
        print("\nPaso 8: Guardando el mapeo de categorías en un archivo CSV...")
        mapping_data = []
        for raw_name in all_raw_categories:
            cluster_id = raw_to_cluster_id.get(raw_name)
            master_name = master_category_names.get(cluster_id)
            master_id = final_category_map.get(master_name)
            mapping_data.append({
                'original_category': raw_name,
                'master_category': master_name,
                'master_category_id': master_id
            })
        df_mappings = pd.DataFrame(mapping_data)
        df_mappings.to_csv(f"{OUTPUT_PATH}/category_mappings.csv", index=False)
        print(f" - Mapeo guardado en {OUTPUT_PATH}/category_mappings.csv")

        # --- PASO 9: Restaurar el tipo de dato de la columna a INT ---
        print("\nPaso 9: Restaurando el tipo de columna 'id_category' a INT...")
        cursor.execute("ALTER TABLE platform_detail_courses MODIFY COLUMN id_category INT")
        print("  - Tipo de columna restaurado con éxito.")

        print("\n¡Proceso de mapeo de categorías completado con éxito!")

    except Error as e:
        print(f"\nError durante el proceso: {e}")

    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
            print("Conexión a la base de datos cerrada.")

if __name__ == '__main__':
    map_and_update_categories()
