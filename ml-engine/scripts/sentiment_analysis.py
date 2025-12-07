import pandas as pd
import gensim
from nltk.stem import WordNetLemmatizer, SnowballStemmer
from nltk.stem.porter import *
import nltk
import mysql.connector
from dotenv import load_dotenv
from langdetect import detect, LangDetectException
import os 

# Cargar las variables de entorno desde el archivo .env
load_dotenv()

# --- Configuración de Salida ---
OUTPUT_PATH = "../../coursera-dashboard/src/data"

# --- Descarga de recursos de NLTK ---
# El script necesita el recurso 'wordnet' para la lematización.
# Intenta la descarga automática de este recurso
try:
    nltk.data.find('corpora/wordnet.zip')
except LookupError:
    print("Recurso 'wordnet' de NLTK no encontrado. Descargando...")
    nltk.download('wordnet')

# --- PASO 1: Carga y Filtrado de Datos ---

def load_reviews_from_db():
    """
    Carga las reseñas negativas desde la base de datos MySQL.
    Utiliza variables de entorno para las credenciales de la BD.
    """
    try:
        print("Conectando a la base de datos para cargar reseñas...")
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        # Consulta SQL para traer solo reseñas negativas
        query = f"""
            SELECT rating, review as review_text, review_year as year
            FROM review
            WHERE rating <= 2 AND review_year IS NOT NULL
        """
        # Se utiliza pandas para leer directamente de la consulta SQL
        df = pd.read_sql(query, conn)
        print(f"Se cargaron {len(df)} reseñas desde la base de datos.")
        return df
    except mysql.connector.Error as err:
        print(f"Error de base de datos: {err}")
        # Se devuelve un DataFrame vacío si ocurre un error durante la ejecución
        return pd.DataFrame(columns=['rating', 'review_text', 'year'])
    finally:
        if 'conn' in locals() and conn.is_connected():
            conn.close()

# Cargar las reseñas negativas desde la base de datos
df_negative = load_reviews_from_db()

# --- Detención del script por seguridad ante errores de carga en el DataFrame ---
if df_negative.empty:
    print("No se encontraron reseñas para analizar. Terminando el script.")
    exit()
    
# Eliminar filas donde el texto de la reseña o el año estén vacíos (NULL en la BD)
df_negative.dropna(subset=['review_text', 'year'], inplace=True)

print(f"Se analizarán {len(df_negative)} reseñas negativas.")

# --- PASO 2: Preprocesamiento del Texto ---

# Funciones de preprocesamiento específicas para cada idioma
lemmatizer_en = WordNetLemmatizer()
stemmer_en = SnowballStemmer("english")
stemmer_es = SnowballStemmer("spanish")

def preprocess_en(text):
    """Preprocesamiento para texto en inglés."""
    result = []
    for token in gensim.utils.simple_preprocess(text):
        if token not in gensim.parsing.preprocessing.STOPWORDS and len(token) > 3:
            lemma = lemmatizer_en.lemmatize(token, pos='v')
            result.append(stemmer_en.stem(lemma))
    return result

def preprocess_es(text):
    """Preprocesamiento para texto en español."""
    result = []

    for token in gensim.utils.simple_preprocess(text):
        if len(token) > 3: 
            result.append(stemmer_es.stem(token))
    return result

def detect_language_and_preprocess_tokens(text):
    """Detecta el idioma real y aplica el preprocesamiento adecuado."""
    try:
        lang = detect(text)
        if lang == 'es':
            tokens = preprocess_es(text)
            return lang, tokens
        else:
            # Para cualquier otro idioma (en, zh-cn, ru, etc.), se usará el preprocesador de inglés como una opción por default
            tokens = preprocess_en(text)
            return lang, tokens
    except LangDetectException:
        # Si no se puede detectar, se marca como 'unknown' y se usa el preprocesador de inglés
        return 'unknown', preprocess_en(text)

# Aplicar el preprocesamiento a la columna de reseñas
print("\nIniciando preprocesamiento de texto (puede tardar un momento)...")
# Se aplica la función y se crean dos nuevas columnas: 'lang' y 'processed_text'
results = df_negative['review_text'].map(detect_language_and_preprocess_tokens)
df_negative[['lang', 'processed_text']] = pd.DataFrame(results.tolist(), index=df_negative.index)
processed_docs = df_negative['processed_text']
print("Preprocesamiento completado.")


# --- PASO 3: Modelado de Tópicos con LDA ---
# Crear un diccionario a partir de los documentos procesados
dictionary = gensim.corpora.Dictionary(processed_docs)

# Filtrar extremos ignorando palabras que aparecen en menos de 5 documentos o en más del 50%
dictionary.filter_extremes(no_below=1, no_above=0.5, keep_n=100000)

# Crear el corpus
bow_corpus = [dictionary.doc2bow(doc) for doc in processed_docs]

# Entrenar el modelo LDA
# num_topics es el número de temas que queremos extraer
num_topics = 3

# Se añade 'random_state=100' para asegurar que los resultados sean reproducibles.
# Cada vez que se ejecute el script con los mismos datos, los tópicos serán los mismos.
lda_model = gensim.models.LdaMulticore(
    bow_corpus,
    num_topics=num_topics,
    id2word=dictionary,
    passes=10,
    workers=2,
    random_state=100)

# Mostrar los tópicos encontrados
print("\nTópicos encontrados por el modelo LDA:")
topics_data = []
for idx, topic in lda_model.print_topics(-1):
    print(f"Tópico: {idx}\nPalabras: {topic}\n")
    topics_data.append({'topic_id': idx, 'keywords': topic})


# --- PASO 4: Asignar Tópicos a las Reseñas y Analizar Evolución ---
def assign_topic(review_bow):
    # Obtiene la distribución de tópicos para una reseña
    topic_dist = lda_model.get_document_topics(review_bow)
    # Devuelve el tópico con la mayor probabilidad
    if not topic_dist:
        return None
    return sorted(topic_dist, key=lambda x: x[1], reverse=True)[0][0]

# Asignar el tópico principal a cada reseña en el DataFrame
df_negative['topic'] = [assign_topic(bow) for bow in bow_corpus]

# Mapear los índices de los tópicos a nombres interpretables
# Ajustar los nombres para que coincidan con los resultados del modelo LDA.

topic_names = {
    0: "Valor y Calidad del Contenido", # Keywords: certif, work, data, content
    1: "Estructura y Logística del Curso",
    2: "Contenido Básico o Decepcionante" # Keywords: basic, curs, explic
}
df_negative['topic_name'] = df_negative['topic'].map(topic_names)

# Analizar la evolución temporal
print("\nAnálisis de la evolución de los tópicos a lo largo del tiempo:")
# Agrupar por año y tópico, y contar el número de reseñas
evolution = df_negative.groupby(['year', 'topic_name']).size().unstack(fill_value=0)

print(evolution)

# --- PASO 5: Guardar resultados en CSV para el Dashboard ---
print(f"\nGuardando resultados en la carpeta: {OUTPUT_PATH}")

# 1. Resumen de Tópicos
df_topics_summary = pd.DataFrame(topics_data)
df_topics_summary['topic_name'] = df_topics_summary['topic_id'].map(topic_names)
df_topics_summary.to_csv(f"{OUTPUT_PATH}/topics_summary.csv", index=False)
print(" - topics_summary.csv guardado.")

# 2. Evolución de Tópicos
evolution.to_csv(f"{OUTPUT_PATH}/topics_evolution.csv")
print(" - topics_evolution.csv guardado.")

# 3. Muestra de reseñas con su tópico asignado
df_negative['year'] = df_negative['year'].astype(int) # Asegura que el año sea entero
df_negative_sample = df_negative.sample(n=min(len(df_negative), 1000), random_state=42)
df_negative_sample[['review_text', 'year', 'lang', 'topic_name']].to_csv(f"{OUTPUT_PATH}/reviews_with_topics.csv", index=False)
print(" - reviews_with_topics.csv (muestra) guardado.")

# 4. Nueva métrica: Distribución de idiomas
language_distribution = df_negative['lang'].value_counts().reset_index()
language_distribution.columns = ['language', 'total_reviews']
language_distribution.to_csv(f"{OUTPUT_PATH}/language_distribution.csv", index=False)
print(" - language_distribution.csv guardado.")

print("\n¡Análisis y guardado de resultados completado!")
