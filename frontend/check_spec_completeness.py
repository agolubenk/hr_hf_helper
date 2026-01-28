#!/usr/bin/env python3
"""
Скрипт для проверки полноты покрытия моковых данных API эндпоинтами.
Анализирует каждую спецификацию и выявляет недостающие эндпоинты.
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Any, Set, Tuple

def analyze_mock_data(mock_data: Dict[str, Any]) -> Set[str]:
    """Анализирует моковые данные и извлекает ключевые сущности."""
    entities = set()
    
    for name, data in mock_data.items():
        description = (data.get('description') or '').lower()
        
        # Извлекаем названия моковых данных
        if 'mock' in name.lower():
            entity_name = name.replace('mock', '').replace('Data_', '').replace('_', '').lower()
            if entity_name and len(entity_name) > 1:
                entities.add(entity_name)
        
        if not description:
            continue
        
        # Ищем упоминания типов данных
        try:
            type_match = re.search(r'тип[:\s]+(?:array<|массив\s+)?(\w+)', description, re.IGNORECASE)
            if type_match:
                entity_name = type_match.group(1).lower()
                if entity_name and len(entity_name) > 1:
                    entities.add(entity_name)
        except (AttributeError, TypeError):
            pass
        
        # Ищем упоминания интерфейсов
        try:
            interface_match = re.search(r'interface\s+(\w+)', description, re.IGNORECASE)
            if interface_match:
                entity_name = interface_match.group(1).lower()
                if entity_name and len(entity_name) > 1:
                    entities.add(entity_name)
        except (AttributeError, TypeError):
            pass
    
    return entities

def analyze_endpoints(endpoints: List[Dict[str, Any]]) -> Dict[str, Set[str]]:
    """Анализирует эндпоинты и группирует по сущностям."""
    entity_endpoints = {}
    
    for endpoint in endpoints:
        endpoint_path = endpoint.get('endpoint') or ''
        method = endpoint.get('method') or ''
        description = (endpoint.get('description') or '').lower()
        
        if not endpoint_path:
            continue
        
        # Извлекаем сущность из пути
        try:
            path_parts = endpoint_path.split('/')
            for i, part in enumerate(path_parts):
                if part and part not in ['api', 'v1', 'v2', '']:
                    entity = part.rstrip('s')  # Убираем множественное число
                    if entity and len(entity) > 1:  # Игнорируем слишком короткие
                        if entity not in entity_endpoints:
                            entity_endpoints[entity] = set()
                        entity_endpoints[entity].add(f"{method} {endpoint_path}")
                        break
        except (AttributeError, TypeError):
            pass
        
        # Также ищем упоминания в описании
        if description:
            try:
                desc_entity_match = re.search(r'(?:загрузка|получение|создание|обновление|удаление)\s+(\w+)', description)
                if desc_entity_match:
                    entity = desc_entity_match.group(1).lower()
                    if entity and len(entity) > 1:
                        if entity not in entity_endpoints:
                            entity_endpoints[entity] = set()
                        entity_endpoints[entity].add(f"{method} {endpoint_path}")
            except (AttributeError, TypeError):
                pass
    
    return entity_endpoints

def check_completeness(spec: Dict[str, Any]) -> Dict[str, Any]:
    """Проверяет полноту покрытия моковых данных API эндпоинтами."""
    mock_data = spec.get('mock_data', {})
    endpoints = spec.get('api_endpoints', [])
    interfaces = spec.get('interfaces', [])
    
    # Анализируем моковые данные
    mock_entities = analyze_mock_data(mock_data)
    
    # Анализируем эндпоинты
    endpoint_entities = analyze_endpoints(endpoints)
    
    # Проверяем покрытие
    missing_endpoints = []
    coverage_issues = []
    
    # Для каждой моковой сущности проверяем наличие CRUD операций
    for entity in mock_entities:
        entity_endpoints = endpoint_entities.get(entity, set())
        
        # Проверяем наличие основных операций
        has_get = any('GET' in ep for ep in entity_endpoints)
        has_post = any('POST' in ep for ep in entity_endpoints)
        has_put = any('PUT' in ep or 'PATCH' in ep for ep in entity_endpoints)
        has_delete = any('DELETE' in ep for ep in entity_endpoints)
        
        issues = []
        if not has_get:
            issues.append(f"Отсутствует GET для {entity}")
        if not has_post:
            issues.append(f"Отсутствует POST для {entity}")
        if not has_put:
            issues.append(f"Отсутствует PUT/PATCH для {entity}")
        if not has_delete and entity not in ['settings', 'config', 'account']:  # Некоторые сущности не удаляются
            issues.append(f"Отсутствует DELETE для {entity}")
        
        if issues:
            coverage_issues.extend(issues)
            missing_endpoints.append({
                "entity": entity,
                "missing_operations": issues,
                "existing_endpoints": list(entity_endpoints)
            })
    
    # Проверяем интерфейсы
    interface_names = {i['name'].lower() for i in interfaces if i.get('name')}
    
    # Ищем интерфейсы без соответствующих эндпоинтов
    for interface in interfaces:
        interface_name = (interface.get('name') or '').lower()
        if not interface_name or interface_name in ['props', 'modalprops']:
            continue
            
        if interface_name not in endpoint_entities:
            # Проверяем, есть ли упоминание в эндпоинтах
            mentioned = False
            for ep in endpoints:
                desc = (ep.get('description') or '').lower()
                returns = (ep.get('returns') or '').lower()
                if interface_name in desc or interface_name in returns:
                    mentioned = True
                    break
            if not mentioned:
                coverage_issues.append(f"Интерфейс {interface.get('name', 'unknown')} не имеет соответствующих эндпоинтов")
    
    return {
        "mock_entities": list(mock_entities),
        "endpoint_entities": {k: list(v) for k, v in endpoint_entities.items()},
        "missing_endpoints": missing_endpoints,
        "coverage_issues": coverage_issues,
        "coverage_score": calculate_coverage_score(mock_entities, endpoint_entities)
    }

def calculate_coverage_score(mock_entities: Set[str], endpoint_entities: Dict[str, Set[str]]) -> float:
    """Вычисляет процент покрытия."""
    if not mock_entities:
        return 100.0
    
    covered = sum(1 for entity in mock_entities if entity in endpoint_entities)
    return (covered / len(mock_entities)) * 100 if mock_entities else 0

def suggest_missing_endpoints(spec: Dict[str, Any], analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Предлагает недостающие эндпоинты на основе анализа."""
    suggestions = []
    mock_entities = analysis.get('mock_entities', [])
    endpoint_entities = analysis.get('endpoint_entities', {})
    
    for entity in mock_entities:
        entity_endpoints = endpoint_entities.get(entity, set())
        
        # Определяем базовый путь
        base_path = f"/api/{entity}s/" if entity else None
        if not base_path:
            continue
        
        # Проверяем GET
        has_get = any('GET' in ep for ep in entity_endpoints)
        if not has_get:
            suggestions.append({
                "method": "GET",
                "endpoint": base_path,
                "description": f"Получение списка {entity}",
                "parameters": "page, page_size, search (опционально)",
                "returns": f"Массив объектов {entity}",
                "priority": "high"
            })
        
        # Проверяем POST
        has_post = any('POST' in ep for ep in entity_endpoints)
        if not has_post:
            suggestions.append({
                "method": "POST",
                "endpoint": base_path,
                "description": f"Создание нового {entity}",
                "parameters": f"Все поля интерфейса {entity}",
                "returns": f"Созданный объект {entity}",
                "priority": "high"
            })
        
        # Проверяем PUT/PATCH
        has_put = any('PUT' in ep or 'PATCH' in ep for ep in entity_endpoints)
        if not has_put:
            suggestions.append({
                "method": "PUT",
                "endpoint": f"{base_path}{{id}}/",
                "description": f"Обновление {entity}",
                "parameters": f"Измененные поля {entity}",
                "returns": f"Обновленный объект {entity}",
                "priority": "high"
            })
        
        # Проверяем DELETE (не для всех сущностей)
        if entity not in ['settings', 'config', 'account', 'profile']:
            has_delete = any('DELETE' in ep for ep in entity_endpoints)
            if not has_delete:
                suggestions.append({
                    "method": "DELETE",
                    "endpoint": f"{base_path}{{id}}/",
                    "description": f"Удаление {entity}",
                    "parameters": "id",
                    "returns": "Статус удаления",
                    "priority": "medium"
                })
    
    return suggestions

def main():
    """Основная функция для проверки всех спецификаций."""
    frontend_dir = Path(__file__).parent
    results = []
    
    # Находим все спецификации
    spec_files = list(frontend_dir.rglob("pre-specification.json"))
    
    print(f"🔍 Проверка {len(spec_files)} спецификаций...\n")
    
    for spec_file in spec_files:
        try:
            with open(spec_file, 'r', encoding='utf-8') as f:
                spec = json.load(f)
            
            # Анализируем спецификацию
            analysis = check_completeness(spec)
            
            # Предлагаем недостающие эндпоинты
            suggestions = suggest_missing_endpoints(spec, analysis)
            
            # Сохраняем результаты
            result = {
                "file": str(spec_file.relative_to(frontend_dir)),
                "name": spec.get('name', 'unknown'),
                "type": spec.get('type', 'unknown'),
                "coverage_score": analysis['coverage_score'],
                "mock_entities_count": len(analysis['mock_entities']),
                "endpoints_count": len(spec.get('api_endpoints', [])),
                "missing_endpoints_count": len(analysis['missing_endpoints']),
                "coverage_issues": analysis['coverage_issues'],
                "suggestions": suggestions
            }
            
            results.append(result)
            
        except Exception as e:
            print(f"❌ Ошибка при обработке {spec_file}: {e}")
    
    # Сортируем по проценту покрытия
    results.sort(key=lambda x: x['coverage_score'])
    
    # Выводим результаты
    print("=" * 80)
    print("📊 РЕЗУЛЬТАТЫ ПРОВЕРКИ ПОЛНОТЫ ПОКРЫТИЯ")
    print("=" * 80)
    
    low_coverage = [r for r in results if r['coverage_score'] < 50]
    medium_coverage = [r for r in results if 50 <= r['coverage_score'] < 80]
    high_coverage = [r for r in results if r['coverage_score'] >= 80]
    
    print(f"\n🔴 Низкое покрытие (<50%): {len(low_coverage)}")
    print(f"🟡 Среднее покрытие (50-80%): {len(medium_coverage)}")
    print(f"🟢 Высокое покрытие (≥80%): {len(high_coverage)}")
    
    # Показываем проблемные спецификации
    if low_coverage:
        print("\n" + "=" * 80)
        print("🔴 СПЕЦИФИКАЦИИ С НИЗКИМ ПОКРЫТИЕМ:")
        print("=" * 80)
        for result in low_coverage[:10]:  # Показываем первые 10
            print(f"\n📄 {result['file']}")
            print(f"   Название: {result['name']}")
            print(f"   Покрытие: {result['coverage_score']:.1f}%")
            print(f"   Моковых сущностей: {result['mock_entities_count']}")
            print(f"   Эндпоинтов: {result['endpoints_count']}")
            print(f"   Недостающих: {result['missing_endpoints_count']}")
            if result['suggestions']:
                print(f"   💡 Предложений: {len(result['suggestions'])}")
    
    # Сохраняем детальный отчет
    report_file = frontend_dir / "api_coverage_report.json"
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump({
            "summary": {
                "total_specs": len(results),
                "low_coverage": len(low_coverage),
                "medium_coverage": len(medium_coverage),
                "high_coverage": len(high_coverage),
                "average_coverage": sum(r['coverage_score'] for r in results) / len(results) if results else 0
            },
            "results": results
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Детальный отчет сохранен в: {report_file.relative_to(frontend_dir)}")
    
    return results

if __name__ == "__main__":
    main()
