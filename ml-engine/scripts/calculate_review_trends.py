import pandas as pd
import mysql.connector
from dotenv import load_dotenv
import os
import json

# Cargar las variables de entorno desde el archivo .env
load_dotenv()

# --- Configuración de Salida ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "../../coursera-dashboard/src/data")
os.makedirs(OUTPUT_PATH, exist_ok=True)

def load_all_reviews_from_db():
    """
    Carga todas las reseñas con fecha desde la base de datos MySQL.
    """
    try:
        print("Conectando a la base de datos para cargar todas las reseñas...")
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        # Consulta para traer ratings y fechas de todas las reseñas
        query = """
            SELECT rating, date_review
            FROM review
            WHERE date_review IS NOT NULL
        """
        df = pd.read_sql(query, conn)
        print(f"Se cargaron {len(df)} reseñas con fecha desde la base de datos.")
        return df
    except mysql.connector.Error as err:
        print(f"Error de base de datos: {err}")
        return pd.DataFrame(columns=['rating', 'date_review'])
    finally:
        if 'conn' in locals() and conn.is_connected():
            conn.close()

# --- PASO 1: Cargar y procesar datos ---
df_reviews = load_all_reviews_from_db()

if df_reviews.empty:
    print("No se encontraron reseñas para analizar. Terminando el script.")
    exit()

# Convertir date_review a formato datetime y extraer año y mes
df_reviews['date_review'] = pd.to_datetime(df_reviews['date_review'])
df_reviews['year'] = df_reviews['date_review'].dt.year
df_reviews['month'] = df_reviews['date_review'].dt.month

# --- PASO 2: Calcular tendencias anuales ---
print("\nCalculando tendencias anuales...")

# Definir sentimiento
df_reviews['sentiment'] = 'neutral'
df_reviews.loc[df_reviews['rating'] > 3, 'sentiment'] = 'positive'
df_reviews.loc[df_reviews['rating'] <= 2, 'sentiment'] = 'negative'

# Agrupar por año y sentimiento
yearly_summary = df_reviews.groupby('year')['sentiment'].value_counts().unstack(fill_value=0)
yearly_summary['total_reviews'] = yearly_summary.sum(axis=1)

# Reordenar columnas para mayor claridad
if 'positive' not in yearly_summary: yearly_summary['positive'] = 0
if 'negative' not in yearly_summary: yearly_summary['negative'] = 0
if 'neutral' not in yearly_summary: yearly_summary['neutral'] = 0
yearly_summary = yearly_summary[['total_reviews', 'positive', 'negative', 'neutral']]

print(yearly_summary)

# --- PASO 3: Calcular evolución mensual de reseñas negativas ---
print("\nCalculando evolución mensual de reseñas negativas...")
negative_reviews = df_reviews[df_reviews['sentiment'] == 'negative']
monthly_negative_evolution = negative_reviews.groupby(['year', 'month']).size().reset_index(name='total_negative_reviews')

print(monthly_negative_evolution.head())

# --- PASO 4: Calcular tasa de crecimiento de reseñas ---
print("\nCalculando tasa de crecimiento de reseñas año a año...")

# Ordenar por año para calcular el crecimiento
yearly_reviews_sorted = yearly_summary.sort_index()

# Calcular la tasa de crecimiento: ((Actual - Anterior) / Anterior) × 100
review_growth = []
years = list(yearly_reviews_sorted.index)

for i in range(len(years)):
    year = years[i]
    current_reviews = yearly_reviews_sorted.loc[year, 'total_reviews']

    if i == 0:
        # Primer año no tiene crecimiento
        growth_rate = None
        previous_reviews = None
    else:
        previous_year = years[i - 1]
        previous_reviews = yearly_reviews_sorted.loc[previous_year, 'total_reviews']

        if previous_reviews > 0:
            growth_rate = ((current_reviews - previous_reviews) / previous_reviews) * 100
        else:
            growth_rate = None

    review_growth.append({
        'year': int(year),
        'total_reviews': int(current_reviews),
        'previous_year_reviews': int(previous_reviews) if previous_reviews is not None else None,
        'growth_rate': round(growth_rate, 2) if growth_rate is not None else None
    })

print("Tasa de crecimiento de reseñas:")
for item in review_growth:
    if item['growth_rate'] is not None:
        print(f"Año {item['year']}: {item['growth_rate']}% ({item['total_reviews']} vs {item['previous_year_reviews']})")
    else:
        print(f"Año {item['year']}: Sin datos previos ({item['total_reviews']} reseñas)")

# --- PASO 5: Estructurar y guardar en JSON ---
output_data = {
    "metadata": {
        "title": "Análisis de Tendencias de Reseñas",
        "generated_at": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S"),
        "data_source": "Coursera Golden Database"
    },
    "yearly_summary": yearly_summary.reset_index().to_dict(orient='records'),
    "monthly_negative_evolution": monthly_negative_evolution.to_dict(orient='records'),
    "review_growth": review_growth
}

output_filename = os.path.join(OUTPUT_PATH, "review_trends.json")
with open(output_filename, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, indent=4, ensure_ascii=False)

print(f"\nResultados guardados en: {output_filename}")
print("\n¡Análisis de tendencias completado!")
