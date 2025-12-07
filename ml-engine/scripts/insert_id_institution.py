import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Carga las variables de entorno desde el archivo .env
load_dotenv()

# --- CONFIGURACIÓN DE LA BASE DE DATOS ---
# Las credenciales se leen desde las variables de entorno.
DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

def update_institution_ids():
    """
    Conecta a la base de datos y actualiza la columna id_institution
    en la tabla 'course' para usar los IDs correctos de la tabla 'institution'.
    """
    conn = None
    try:
        print("Conectando a la base de datos MySQL...")
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # --- PASO 1: Preparar la tabla 'course' ---
        print("Paso 1: Modificando temporalmente la tabla 'course'...")
        # Eliminamos la FK si existe para poder cambiar el tipo de columna
        try:
            cursor.execute("ALTER TABLE course DROP FOREIGN KEY course_ibfk_1;")
            print("  - Clave foránea 'course_ibfk_1' eliminada.")
        except Error as e:
            # Es normal si la FK no existe, por ejemplo, si la carga inicial falló.
            print(f"  - No se pudo eliminar la clave foránea (puede que no exista): {e}")

        # Cambiamos la columna a VARCHAR para poder leer los nombres
        cursor.execute("ALTER TABLE course MODIFY id_institution VARCHAR(255);")
        print("  - Columna 'id_institution' modificada a VARCHAR(255).")
        conn.commit()


        # --- PASO 2: Obtener el mapa de instituciones ---
        print("\nPaso 2: Obteniendo el mapa de ID de instituciones...")
        cursor.execute("SELECT id, institution FROM institution;")
        # Usamos un diccionario para un mapeo rápido: {nombre_institucion: id}
        # Limpiamos los nombres para mejorar las coincidencias
        institution_map = {str(name).strip(): int(id) for id, name in cursor.fetchall()}
        print(f"  - Se encontraron {len(institution_map)} instituciones.")


        # --- PASO 3: Actualizar la tabla 'course' ---
        print("\nPaso 3: Actualizando los cursos con el ID de institución correcto...")
        cursor.execute("SELECT id, id_institution FROM course;")
        courses_to_process = cursor.fetchall()
        total_courses = len(courses_to_process)
        
        update_params = []
        not_found_institutions = set()

        print(f"  - Procesando {total_courses} cursos para actualizar...")
        for i, (course_id, inst_name) in enumerate(courses_to_process):
            # Limpiamos el nombre de la institución del curso para que coincida con el mapa
            # Maneja el caso de que inst_name sea None
            clean_inst_name = str(inst_name).strip() if inst_name else ''
            institution_id = institution_map.get(clean_inst_name)

            if institution_id:
                # Si encontramos el ID, lo añadimos a la lista para la actualización en lote
                update_params.append((institution_id, course_id))
            else:
                # Si no se encuentra, lo guardamos para informarlo al final
                not_found_institutions.add(inst_name)
            
            # Imprimir barra de progreso
            progress = (i + 1) / total_courses
            bar_length = 50
            filled_length = int(bar_length * progress)
            bar = '█' * filled_length + '-' * (bar_length - filled_length)
            print(f'\r  Progreso: |{bar}| {progress:.1%} Completo', end='', flush=True)

        print("\n  - Enviando actualizaciones a la base de datos (esto puede tardar un momento)...")
        update_query = "UPDATE course SET id_institution = %s WHERE id = %s;"
        cursor.executemany(update_query, update_params)
        conn.commit()
        print(f"  - Se actualizaron {cursor.rowcount} de {total_courses} cursos.")
        if not_found_institutions:
            print("\n  - ADVERTENCIA: No se encontró un ID para las siguientes instituciones:")
            for name in sorted(list(not_found_institutions)):
                print(f"    - '{name}'")


        # --- PASO 4: Restaurar la estructura de la tabla 'course' ---
        print("\nPaso 4: Restaurando la estructura de la tabla 'course'...")
        # Cambiamos la columna de vuelta a INT
        cursor.execute("ALTER TABLE course MODIFY id_institution INT;")
        print("  - Columna 'id_institution' modificada de vuelta a INT.")
        
        # Volvemos a añadir la clave foránea
        cursor.execute("""
            ALTER TABLE course 
            ADD CONSTRAINT course_ibfk_1 
            FOREIGN KEY (id_institution) REFERENCES institution(id);
        """)
        print("  - Clave foránea restaurada.")
        conn.commit()

        print("\n¡Proceso completado con éxito!")

    except Error as e:
        print(f"\nError durante el proceso: {e}")

    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
            print("Conexión a la base de datos cerrada.")

if __name__ == '__main__':
    update_institution_ids()
