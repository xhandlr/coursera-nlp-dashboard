import pandas as pd
import mysql.connector
from dotenv import load_dotenv
import os
import json

load_dotenv()

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "../../coursera-dashboard/src/data")
os.makedirs(OUTPUT_PATH, exist_ok=True)

def load_category_metrics():
    """Carga datos de correlación por categorías desde category_coursera_metrics"""
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        
        query = """
            SELECT 
                ccm.id_category,
                c.category_name,
                ccm.average_level,
                ccm.average_rating,
                ccm.average_duration,
                ccm.total_reviews,
                ccm.total_courses
            FROM category_coursera_metrics ccm
            JOIN category c ON ccm.id_category = c.id
            WHERE ccm.total_courses > 0 
              AND ccm.average_rating > 0
              AND ccm.average_duration > 0
              AND ccm.total_reviews > 0;
        """
        df = pd.read_sql(query, conn)
        print(f"Categorías cargadas: {len(df)}")
        return df
    except Exception as e:
        print(f"Error: {e}")
        return pd.DataFrame()
    finally:
        if 'conn' in locals():
            conn.close()

def load_individual_courses():
    """Carga cursos individuales para duration vs reviews con mejor distribución"""
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        
        query = """
            SELECT duration, number_reviews, rating
            FROM course
            WHERE duration > 0 
              AND number_reviews > 10
              AND rating > 0
              AND duration < 200
              AND number_reviews < 10000
        """
        df = pd.read_sql(query, conn)
        print(f"Cursos individuales cargados: {len(df)}")
        return df
    except Exception as e:
        print(f"Error: {e}")
        return pd.DataFrame()
    finally:
        if 'conn' in locals():
            conn.close()

# Cargar datos
df_categories = load_category_metrics()
df_courses = load_individual_courses()

if df_categories.empty:
    print("No hay datos de categorías")
    exit()

# Calcular correlaciones por categorías
level_vs_rating = round(df_categories['average_level'].corr(df_categories['average_rating']), 3)
duration_vs_rating = round(df_categories['average_duration'].corr(df_categories['average_rating']), 3)

print(f"Nivel promedio vs Rating promedio (por categoría): {level_vs_rating}")
print(f"Duración promedio vs Rating promedio (por categoría): {duration_vs_rating}")

# Preparar datos de categorías para gráficos
category_level_rating = []
category_duration_rating = []

for _, row in df_categories.iterrows():
    category_level_rating.append({
        "x": float(row['average_level']),
        "y": float(row['average_rating']),
        "name": row['category_name']
    })
    category_duration_rating.append({
        "x": float(row['average_duration']),
        "y": float(row['average_rating']),
        "name": row['category_name']
    })

# Preparar datos de duration vs reviews (cursos individuales) - muestra más grande y filtrada
duration_reviews_correlation = 0
duration_reviews_data = []

if not df_courses.empty:
    duration_reviews_correlation = round(df_courses['duration'].corr(df_courses['number_reviews']), 3)
    
    # Tomar muestra de 300 puntos con mejor distribución
    sample_size = min(300, len(df_courses))
    sample_data = df_courses.sample(n=sample_size, random_state=42)
    
    for _, row in sample_data.iterrows():
        duration_reviews_data.append([float(row['duration']), float(row['number_reviews'])])

print(f"Duración vs Reviews (cursos individuales): {duration_reviews_correlation}")

output_data = {
    "category_level_vs_rating": {
        "correlation": level_vs_rating,
        "interpretation": "Categorías con nivel promedio más alto tienden a tener mejor rating" if level_vs_rating > 0 else "Categorías básicas tienen mejor rating que las avanzadas",
        "data": category_level_rating,
        "title": "Nivel vs Rating por Categoría",
        "x_label": "Nivel Promedio",
        "y_label": "Rating Promedio"
    },
    "category_duration_vs_rating": {
        "correlation": duration_vs_rating,
        "interpretation": "Cursos más largos tienden a tener mejor rating" if duration_vs_rating > 0 else "Cursos cortos tienden a tener mejor rating",
        "data": category_duration_rating,
        "title": "Duración vs Rating por Categoría", 
        "x_label": "Duración Promedio (hrs)",
        "y_label": "Rating Promedio"
    },
    "duration_vs_reviews": {
        "correlation": duration_reviews_correlation,
        "interpretation": "Cursos más largos tienen mayor participación" if duration_reviews_correlation > 0.1 else "No hay relación clara entre duración y participación",
        "data": duration_reviews_data,
        "title": "Duración vs Participación (Cursos Individuales)",
        "x_label": "Duración (hrs)",
        "y_label": "Número de Reviews"
    },
    "metadata": {
        "categories_analyzed": len(df_categories),
        "individual_courses_sample": len(duration_reviews_data),
        "generated_at": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
    }
}

with open(f"{OUTPUT_PATH}/detailed_correlations.json", 'w', encoding='utf-8') as f:
    json.dump(output_data, f, indent=2, ensure_ascii=False)

print(f"\nJSON guardado: detailed_correlations.json")
print(f"- Correlaciones por categorías: {len(df_categories)} puntos")
print(f"- Duración vs Reviews: {len(duration_reviews_data)} puntos")
print("¡Análisis de correlaciones completado!")