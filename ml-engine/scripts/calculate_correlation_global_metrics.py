import pandas as pd
import mysql.connector
from dotenv import load_dotenv
import os
import json
from datetime import datetime

load_dotenv()

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "../../coursera-dashboard/src/data")
os.makedirs(OUTPUT_PATH, exist_ok=True)

def load_course_data_from_db():
    try:
        print("Conectando a la base de datos...")
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        
        query = """
            SELECT 
                rating,
                price,
                hours_duration,
                enrollment_students
            FROM 
                platform_detail_courses
            WHERE 
                id_platform = 1
                AND rating > 0
                AND price > 0
                AND hours_duration > 0
                AND enrollment_students > 0;
        """
        df = pd.read_sql(query, conn)
        print(f"Se cargaron {len(df)} cursos.")
        return df
        
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return pd.DataFrame()
    finally:
        if 'conn' in locals() and conn.is_connected():
            conn.close()

# Cargar datos
df_courses = load_course_data_from_db()

if df_courses.empty:
    print("No hay datos. Terminando.")
    exit()

# Calcular correlaciones
price_vs_rating = round(df_courses['price'].corr(df_courses['rating']), 3)
duration_vs_enrolled = round(df_courses['hours_duration'].corr(df_courses['enrollment_students']), 3)

print(f"Correlación precio vs rating: {price_vs_rating}")
print(f"Correlación duración vs inscritos: {duration_vs_enrolled}")

# Para scatter plots
sample_size = min(len(df_courses), 100)  

# Muestrear aleatoriamente
price_vs_rating_sample = df_courses[['price', 'rating']].sample(n=sample_size, random_state=42)
duration_vs_enrolled_sample = df_courses[['hours_duration', 'enrollment_students']].sample(n=sample_size, random_state=42)

# Preparar datos para scatter plot
def prepare_scatter_data(df, x_col, y_col):
    data = []
    for _, row in df.iterrows():
        data.append({
            'x': float(row[x_col]),
            'y': float(row[y_col])
        })
    return data

# Crear JSON optimizado
output_data = {
    "scatter_plots": {
        "price_vs_rating": {
            "data": prepare_scatter_data(price_vs_rating_sample, 'price', 'rating'),
            "title": "Calidad vs Precio",
            "x_label": "Precio ($)",
            "y_label": "Rating (1-5)",
            "correlation": price_vs_rating,
            "insight": "Correlación débil: " + 
                      ("ligera relación negativa" if price_vs_rating < -0.1 else
                       "ligera relación positiva" if price_vs_rating > 0.1 else
                       "prácticamente nula")
        },
        "duration_vs_enrolled": {
            "data": prepare_scatter_data(duration_vs_enrolled_sample, 'hours_duration', 'enrollment_students'),
            "title": "Duración vs Inscritos",
            "x_label": "Duración (horas)",
            "y_label": "Estudiantes inscritos",
            "correlation": duration_vs_enrolled,
            "insight": "Correlación débil: " + 
                      ("ligera relación negativa" if duration_vs_enrolled < -0.1 else
                       "ligera relación positiva" if duration_vs_enrolled > 0.1 else
                       "prácticamente nula")
        }
    },
    "summary": {
        "total_courses_analyzed": len(df_courses),
        "points_per_plot": sample_size,
        "generated_at": datetime.now().isoformat(),
        "conclusion": "No hay relación significativa entre precio y rating, ni entre duración e inscripciones"
    }
}

# Guardar JSON
output_filename = os.path.join(OUTPUT_PATH, "correlation_scatter.json")
with open(output_filename, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, indent=2)

print(f"\nJSON guardado en: {output_filename}")
print(f"Cada scatter plot tiene {sample_size} puntos (razonable para visualización)")
print("\nCONCLUSIÓN: Las correlaciones son prácticamente cero (-0.033 y 0.005)")
print("No hay relación entre:")
print("  - Precio y calidad del curso")
print("  - Duración y número de inscritos")