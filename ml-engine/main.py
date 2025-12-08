#!/usr/bin/env python3
"""
Orquestador principal para la pipeline de procesamiento de datos de Coursera.
Ejecuta todos los scripts en el orden correcto para mantener las dependencias.

Orden de ejecución:
1. insert_id_institution.py - Inserta IDs de instituciones
2. update_institution_metrics.py - Actualiza métricas de instituciones  
3. update_category_mappings.py - Mapea y actualiza categorías con IA
4. update_category_global_metrics.py - Actualiza métricas globales por categoría
5. update_category_coursera_metrics.py - Actualiza métricas específicas de Coursera
6. update_platform_metrics.py - Actualiza métricas de plataformas
7. sentiment_analysis.py - Análisis de sentimientos de reviews
8. calculate_correlation_global_metrics.py - Calcula correlaciones globales
9. calculate_review_trends.py - Calcula tendencias de reseñas


Uso:
    python main.py [--skip SCRIPT1,SCRIPT2] [--only SCRIPT]
"""

import os
import sys
import subprocess
import time
import argparse
from pathlib import Path

# Configurar el directorio de scripts
SCRIPT_DIR = Path(__file__).parent / "scripts"
os.chdir(SCRIPT_DIR)

# Pipeline de scripts en orden de dependencias
PIPELINE = [
    {
        'name': 'insert_id_institution',
        'file': 'insert_id_institution.py',
        'description': 'Insertar IDs de instituciones',
        'dependencies': []
    },
    {
        'name': 'update_institution_metrics', 
        'file': 'update_institution_metrics.py',
        'description': 'Actualizar métricas de instituciones',
        'dependencies': ['insert_id_institution']
    },
    {
        'name': 'update_category_mappings',
        'file': 'update_category_mappings.py', 
        'description': 'Mapear categorías con IA y actualizar BD',
        'dependencies': ['insert_id_institution']
    },
    {
        'name': 'update_category_metrics',
        'file': 'update_category_global_metrics.py',
        'description': 'Actualizar métricas globales por categoría',
        'dependencies': ['update_category_mappings']
    },
    {
        'name': 'update_category_coursera_metrics',
        'file': 'update_category_coursera_metrics.py',
        'description': 'Actualizar métricas específicas de Coursera por categoría',
        'dependencies': ['update_category_mappings']
    },
    {
        'name': 'update_platform_metrics',
        'file': 'update_platform_metrics.py',
        'description': 'Actualizar métricas de plataformas',
        'dependencies': ['update_institution_metrics', 'update_category_metrics', 'update_category_coursera_metrics']
    },
    {
        'name': 'sentiment_analysis',
        'file': 'sentiment_analysis.py',
        'description': 'Análisis de sentimientos de reviews',
        'dependencies': ['update_category_mappings']
    },
    {
        'name': 'calculate_correlation_global_metrics',
        'file': 'calculate_correlation_global_metrics.py',
        'description': 'Calcular correlaciones globales',
        'dependencies': ['update_category_metrics', 'update_platform_metrics']
    },
    {
        'name': 'calculate_review_trends',
        'file': 'calculate_review_trends.py',
        'description': 'Calcular tendencias de reseñas',
        'dependencies': ['sentiment_analysis']
    }
]

def print_banner():
    """Imprime el banner del orquestador."""
    print("=" * 70)
    print(" COURSERA DATA PIPELINE ORCHESTRATOR")
    print("=" * 70)
    print()

def print_step(step_num, total_steps, script_name, description):
    """Imprime información del paso actual."""
    print(f"\n[STEP {step_num}/{total_steps}] {script_name}")
    print(f"   {description}")
    print(f"   Time: {time.strftime('%H:%M:%S')}")
    print("-" * 50)

def run_script(script_file):
    """Ejecuta un script de Python y maneja errores."""
    try:
        print(f"[RUNNING] {script_file}")
        result = subprocess.run(
            [sys.executable, script_file],
            capture_output=True,
            text=True,
            cwd=SCRIPT_DIR
        )
        
        if result.returncode == 0:
            print("[SUCCESS] Completed successfully")
            if result.stdout.strip():
                print("Output:")
                print(result.stdout.strip())
            return True
        else:
            print("[ERROR] Execution failed")
            print("Error Output:")
            print(result.stderr.strip())
            if result.stdout.strip():
                print("Standard Output:")
                print(result.stdout.strip())
            return False
            
    except FileNotFoundError:
        print(f"[ERROR] Script not found: {script_file}")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        return False

def check_dependencies(script, completed_scripts):
    """Verifica si las dependencias de un script están completadas."""
    for dep in script['dependencies']:
        if dep not in completed_scripts:
            return False
    return True

def main():
    """Función principal del orquestador."""
    parser = argparse.ArgumentParser(description='Orquestador de pipeline de datos de Coursera')
    parser.add_argument('--skip', type=str, help='Scripts a saltar, separados por comas')
    parser.add_argument('--only', type=str, help='Ejecutar solo este script')
    parser.add_argument('--list', action='store_true', help='Listar todos los scripts disponibles')
    
    args = parser.parse_args()
    
    # Listar scripts disponibles
    if args.list:
        print("Available scripts in the pipeline:")
        for i, script in enumerate(PIPELINE, 1):
            deps = ', '.join(script['dependencies']) if script['dependencies'] else 'None'
            print(f"  {i}. {script['name']} - {script['description']}")
            print(f"     Dependencies: {deps}")
        return
    
    print_banner()
    
    # Filtrar scripts según argumentos
    scripts_to_run = PIPELINE.copy()
    
    if args.only:
        scripts_to_run = [s for s in PIPELINE if s['name'] == args.only]
        if not scripts_to_run:
            print(f"[ERROR] Script '{args.only}' not found")
            return
    
    if args.skip:
        skip_list = [s.strip() for s in args.skip.split(',')]
        scripts_to_run = [s for s in scripts_to_run if s['name'] not in skip_list]
        print(f"[INFO] Skipping scripts: {', '.join(skip_list)}")
    
    print(f"[INFO] Executing {len(scripts_to_run)} scripts")
    print(f"[INFO] Working directory: {SCRIPT_DIR}")
    
    # Variables de control
    completed_scripts = set()
    failed_scripts = set()
    start_time = time.time()
    
    # Ejecutar scripts
    for i, script in enumerate(scripts_to_run, 1):
        print_step(i, len(scripts_to_run), script['name'], script['description'])
        
        # Verificar dependencias
        if not check_dependencies(script, completed_scripts):
            missing_deps = [dep for dep in script['dependencies'] if dep not in completed_scripts]
            print(f"[SKIP] Skipping {script['name']} - missing dependencies: {', '.join(missing_deps)}")
            continue
        
        # Verificar que el archivo existe
        script_path = SCRIPT_DIR / script['file']
        if not script_path.exists():
            print(f"[ERROR] File not found: {script['file']}")
            failed_scripts.add(script['name'])
            continue
        
        # Ejecutar script
        success = run_script(script['file'])
        
        if success:
            completed_scripts.add(script['name'])
            print(f"[SUCCESS] {script['name']} completed")
        else:
            failed_scripts.add(script['name'])
            print(f"[FAILED] {script['name']} failed")
            
            # Preguntar si continuar
            if i < len(scripts_to_run):
                response = input("\n[PROMPT] Continue with next script? (y/n): ")
                if response.lower() != 'y':
                    break
    
    # Resumen final
    end_time = time.time()
    duration = end_time - start_time
    
    print("\n" + "=" * 70)
    print(" EXECUTION SUMMARY")
    print("=" * 70)
    print(f"Total time: {duration:.1f} seconds")
    print(f"Scripts completed: {len(completed_scripts)}")
    print(f"Scripts failed: {len(failed_scripts)}")
    
    if completed_scripts:
        print(f"\nSuccessfully completed:")
        for script in completed_scripts:
            print(f"   [OK] {script}")
    
    if failed_scripts:
        print(f"\nFailed scripts:")
        for script in failed_scripts:
            print(f"   [FAIL] {script}")
        print("\nCheck errors above for more details")
    
    if len(completed_scripts) == len(scripts_to_run) and not failed_scripts:
        print("\n[SUCCESS] Pipeline completed successfully!")
    else:
        print("\n[WARNING] Pipeline completed with errors")

if __name__ == '__main__':
    main()