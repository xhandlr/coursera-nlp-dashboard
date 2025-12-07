import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
import json
from datetime import datetime

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
    Calcula las métricas agregadas para cada institución y genera Top 10 por prestigio.
    El prestigio se mide por rating promedio, con mínimo de 100 reseñas para ser significativo.
    """
    conn = None
    try:
        print("Conectando a la base de datos MySQL...")
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # --- PASO 1: Calcular métricas para cada institución ---
        print("Paso 1: Calculando métricas agregadas...")
        
        query_metrics = """
            SELECT
                i.id AS institution_id,
                i.institution AS institution_name,
                COUNT(c.id) AS total_courses,
                COALESCE(SUM(c.number_reviews), 0) AS total_reviews,
                ROUND(COALESCE(SUM(c.rating * c.number_reviews) / NULLIF(SUM(c.number_reviews), 0), 0), 2) AS average_rating
            FROM
                institution i
            LEFT JOIN
                course c ON i.id = c.id_institution
            GROUP BY
                i.id, i.institution
            HAVING
                COUNT(c.id) > 0
            ORDER BY
                average_rating DESC,
                total_reviews DESC;
        """
        cursor.execute(query_metrics)
        metrics_data = cursor.fetchall()
        print(f"  - Se calcularon métricas para {len(metrics_data)} instituciones con cursos.")

        # --- PASO 2: Preparar datos y seleccionar Top 10 por prestigio ---
        print("\nPaso 2: Seleccionando Top 10 instituciones por prestigio...")
        
        all_institutions = []
        qualified_institutions = []  # Instituciones con suficiente reseñas para ranking
        update_params = []
        
        for row in metrics_data:
            inst_id, name, total_courses, total_reviews, avg_rating = row
            
            institution_info = {
                'institution_id': int(inst_id),
                'institution_name': str(name),
                'total_courses': int(total_courses or 0),
                'total_reviews': int(total_reviews or 0),
                'average_rating': float(avg_rating or 0.0),
                'reviews_per_course': round(int(total_reviews or 0) / max(int(total_courses or 1), 1), 1)
            }
            all_institutions.append(institution_info)
            
            # Para ranking de prestigio: mínimo 100 reseñas para ser significativo
            if total_reviews >= 100:
                qualified_institutions.append(institution_info)
            
            # Datos para actualización en BD
            update_params.append((
                int(total_courses or 0),
                int(total_reviews or 0),
                float(avg_rating or 0.0),
                int(inst_id)
            ))

        # Seleccionar Top 10 por prestigio (rating + volumen de reseñas)
        def prestige_score(institution):
            """Calcula puntaje de prestigio: rating * log(reseñas)"""
            rating = institution['average_rating']
            reviews = institution['total_reviews']
            # Usamos log para no dar demasiado peso al volumen absoluto
            return rating * (1 + (min(reviews, 10000) / 10000))  # Factor de volumen limitado

        # Ordenar por puntaje de prestigio
        qualified_institutions.sort(key=lambda x: prestige_score(x), reverse=True)
        top_10_prestige = qualified_institutions[:10]
        
        # También Top 10 por rating puro (mínimo 50 reseñas)
        top_10_rating = sorted(
            [inst for inst in all_institutions if inst['total_reviews'] >= 50],
            key=lambda x: x['average_rating'],
            reverse=True
        )[:10]
        
        # Top 10 por volumen de cursos
        top_10_courses = sorted(all_institutions, key=lambda x: x['total_courses'], reverse=True)[:10]
        
        # Top 10 por volumen de reseñas
        top_10_reviews = sorted(all_institutions, key=lambda x: x['total_reviews'], reverse=True)[:10]

        print(f"  - Instituciones calificadas para ranking (≥100 reseñas): {len(qualified_institutions)}")
        print(f"  - Top 10 seleccionado por prestigio")

        # --- PASO 3: Actualizar la tabla 'institution' ---
        print("\nPaso 3: Actualizando tabla 'institution'...")
        
        update_query = """
            UPDATE institution 
            SET total_courses = %s, total_reviews = %s, average_rating = %s 
            WHERE id = %s;
        """
        cursor.executemany(update_query, update_params)
        conn.commit()
        print(f"  - Se actualizaron {len(update_params)} registros.")

        # --- PASO 4: Calcular estadísticas generales ---
        print("\nPaso 4: Calculando estadísticas generales...")
        
        total_institutions = len(all_institutions)
        total_courses_all = sum(item['total_courses'] for item in all_institutions)
        total_reviews_all = sum(item['total_reviews'] for item in all_institutions)
        
        # Rating promedio ponderado por reseñas
        weighted_rating_sum = sum(item['average_rating'] * item['total_reviews'] for item in all_institutions)
        avg_rating_weighted = weighted_rating_sum / total_reviews_all if total_reviews_all > 0 else 0
        
        # Rating promedio simple
        institutions_with_reviews = [item for item in all_institutions if item['total_reviews'] > 0]
        avg_rating_simple = sum(item['average_rating'] for item in institutions_with_reviews) / len(institutions_with_reviews) if institutions_with_reviews else 0

        stats = {
            'summary': {
                'total_institutions': total_institutions,
                'institutions_with_courses': len(all_institutions),
                'institutions_with_reviews': len(institutions_with_reviews),
                'global_totals': {
                    'total_courses': total_courses_all,
                    'total_reviews': total_reviews_all,
                    'average_courses_per_institution': round(total_courses_all / max(total_institutions, 1), 1),
                    'average_reviews_per_institution': round(total_reviews_all / max(total_institutions, 1), 1)
                },
                'global_ratings': {
                    'weighted_average': round(avg_rating_weighted, 2),  # Más representativo
                    'simple_average': round(avg_rating_simple, 2),
                    'rating_distribution': {
                        'excellent_45_50': len([i for i in all_institutions if i['average_rating'] >= 4.5]),
                        'good_40_45': len([i for i in all_institutions if 4.0 <= i['average_rating'] < 4.5]),
                        'average_35_40': len([i for i in all_institutions if 3.5 <= i['average_rating'] < 4.0]),
                        'below_average': len([i for i in all_institutions if i['average_rating'] < 3.5])
                    }
                }
            }
        }

        # --- PASO 5: Guardar Top 10 en JSON ---
        print(f"\nGuardando resultados en: {OUTPUT_PATH}")
        
        # 1. JSON principal con Top 10 por prestigio
        top_10_json = {
            'metadata': {
                'title': 'Top 10 Instituciones por Prestigio - Coursera',
                'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'criteria': 'Prestigio = Rating promedio × Factor de volumen (mínimo 100 reseñas)',
                'data_source': 'Coursera Golden Database'
            },
            'top_10_prestige': [
                {
                    'rank': i + 1,
                    'institution_name': inst['institution_name'],
                    'average_rating': inst['average_rating'],
                    'total_reviews': inst['total_reviews'],
                    'total_courses': inst['total_courses'],
                    'reviews_per_course': inst['reviews_per_course'],
                    'prestige_score': round(prestige_score(inst), 3)
                }
                for i, inst in enumerate(top_10_prestige)
            ],
            'other_top_lists': {
                'by_rating': [
                    {
                        'rank': i + 1,
                        'institution_name': inst['institution_name'],
                        'average_rating': inst['average_rating'],
                        'total_reviews': inst['total_reviews']
                    }
                    for i, inst in enumerate(top_10_rating)
                ],
                'by_courses': [
                    {
                        'rank': i + 1,
                        'institution_name': inst['institution_name'],
                        'total_courses': inst['total_courses'],
                        'average_rating': inst['average_rating']
                    }
                    for i, inst in enumerate(top_10_courses)
                ],
                'by_reviews': [
                    {
                        'rank': i + 1,
                        'institution_name': inst['institution_name'],
                        'total_reviews': inst['total_reviews'],
                        'average_rating': inst['average_rating']
                    }
                    for i, inst in enumerate(top_10_reviews)
                ]
            },
            'statistics': stats
        }
        
        with open(f"{OUTPUT_PATH}/top_10_institution_metrics.json", 'w', encoding='utf-8') as f:
            json.dump(top_10_json, f, indent=2, ensure_ascii=False)
        print(" - top_10_institution_metrics.json guardado")
        
        # 2. JSON con todas las instituciones (para referencia)
        all_institutions_json = {
            'metadata': {
                'total_institutions': total_institutions,
                'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            },
            'institutions': all_institutions
        }
        
        with open(f"{OUTPUT_PATH}/all_institutions_metrics.json", 'w', encoding='utf-8') as f:
            json.dump(all_institutions_json, f, indent=2, ensure_ascii=False)
        print(" - all_institutions_metrics.json guardado (referencia completa)")
        
        # 3. JSON solo con estadísticas
        with open(f"{OUTPUT_PATH}/institution_stats.json", 'w', encoding='utf-8') as f:
            json.dump({'statistics': stats}, f, indent=2, ensure_ascii=False)
        print(" - institution_stats.json guardado")

        # --- PASO 6: Mostrar resumen en consola ---
        print("\n" + "="*50)
        print("TOP 10 INSTITUCIONES POR PRESTIGIO")
        print("="*50)
        for i, inst in enumerate(top_10_prestige, 1):
            print(f"{i:2}. {inst['institution_name'][:40]:40} "
                  f"{inst['average_rating']:.2f} "
                  f"{inst['total_courses']:4} cursos "
                  f"{inst['total_reviews']:6} reseñas "
                  f"{inst['reviews_per_course']:5.1f} reseñas/curso")
        
        print("\n" + "="*50)
        print("ESTADÍSTICAS GENERALES")
        print("="*50)
        print(f"Total instituciones con cursos: {total_institutions}")
        print(f"Total cursos ofrecidos: {total_courses_all}")
        print(f"Total reseñas recibidas: {total_reviews_all}")
        print(f"Rating promedio ponderado: {avg_rating_weighted:.2f}")
        print(f"Instituciones con rating ≥4.5: {stats['summary']['global_ratings']['rating_distribution']['excellent_45_50']}")
        print(f"Instituciones con rating 4.0-4.5: {stats['summary']['global_ratings']['rating_distribution']['good_40_45']}")
        
        print("\n¡Proceso completado con éxito!")

    except Error as e:
        print(f"\nError durante el proceso: {e}")
        import traceback
        traceback.print_exc()

    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
            print("Conexión a la base de datos cerrada.")

if __name__ == '__main__':
    calculate_and_update_metrics()