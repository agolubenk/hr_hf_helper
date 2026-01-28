#!/usr/bin/env python3
"""
Детальный анализ полноты покрытия моковых данных API эндпоинтами.
Создает подробный отчет для каждой спецификации.
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Any, Set, Tuple

def extract_entity_names_from_mock(mock_data: Dict[str, Any]) -> Dict[str, List[str]]:
    """Извлекает названия сущностей из моковых данных с контекстом."""
    entities = {}
    
    for name, data in mock_data.items():
        description = data.get('description', '') or ''
        
        # Ищем названия в формате "### mockName" или "mockName"
        mock_name_match = re.search(r'###\s*mock(\w+)', description, re.IGNORECASE)
        if mock_name_match:
            entity_name = mock_name_match.group(1)
            if entity_name not in entities:
                entities[entity_name] = []
            entities[entity_name].append(f"Из моковых данных: {name}")
        
        # Ищем типы в формате "Array<Type>" или "массив Type"
        type_patterns = [
            r'тип[:\s]+(?:array<|массив\s+)?(\w+)',
            r'Array<(\w+)>',
            r'массив\s+(\w+)',
        ]
        for pattern in type_patterns:
            matches = re.finditer(pattern, description, re.IGNORECASE)
            for match in matches:
                entity_name = match.group(1)
                if entity_name and len(entity_name) > 2 and entity_name[0].isupper():
                    if entity_name not in entities:
                        entities[entity_name] = []
                    entities[entity_name].append(f"Из типа данных: {name}")
    
    return entities

def extract_entity_names_from_interfaces(interfaces: List[Dict[str, Any]]) -> Set[str]:
    """Извлекает названия сущностей из интерфейсов."""
    entities = set()
    
    for interface in interfaces:
        name = interface.get('name', '')
        if name and not name.endswith('Props') and not name.endswith('Modal'):
            # Убираем суффиксы типа Edit, Create, View
            clean_name = re.sub(r'(Edit|Create|View|Modal|Props)$', '', name)
            if clean_name and len(clean_name) > 2:
                entities.add(clean_name)
    
    return entities

def analyze_endpoints_for_entities(endpoints: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """Группирует эндпоинты по сущностям."""
    entity_endpoints = {}
    
    for endpoint in endpoints:
        endpoint_path = endpoint.get('endpoint') or ''
        method = endpoint.get('method') or ''
        description = endpoint.get('description', '') or ''
        
        if not endpoint_path:
            continue
        
        # Извлекаем сущность из пути
        path_parts = [p for p in endpoint_path.split('/') if p and p not in ['api', 'v1', 'v2']]
        if path_parts:
            # Берем первую значимую часть пути
            entity = path_parts[0].rstrip('s')  # Убираем множественное число
            if entity and len(entity) > 1:
                if entity not in entity_endpoints:
                    entity_endpoints[entity] = []
                entity_endpoints[entity].append({
                    'method': method,
                    'endpoint': endpoint_path,
                    'description': description
                })
        
        # Также ищем упоминания в описании
        desc_entities = re.findall(r'(?:загрузка|получение|создание|обновление|удаление|управление)\s+(\w+)', description.lower())
        for entity in desc_entities:
            if len(entity) > 2:
                if entity not in entity_endpoints:
                    entity_endpoints[entity] = []
                entity_endpoints[entity].append({
                    'method': method,
                    'endpoint': endpoint_path,
                    'description': description
                })
    
    return entity_endpoints

def check_crud_coverage(entity: str, endpoints: List[Dict[str, Any]]) -> Dict[str, bool]:
    """Проверяет наличие CRUD операций для сущности."""
    has_get = any(ep.get('method') == 'GET' for ep in endpoints)
    has_post = any(ep.get('method') == 'POST' for ep in endpoints)
    has_put = any(ep.get('method') in ['PUT', 'PATCH'] for ep in endpoints)
    has_delete = any(ep.get('method') == 'DELETE' for ep in endpoints)
    
    return {
        'GET': has_get,
        'POST': has_post,
        'PUT/PATCH': has_put,
        'DELETE': has_delete
    }

def analyze_specification(spec_file: Path) -> Dict[str, Any]:
    """Анализирует одну спецификацию."""
    try:
        with open(spec_file, 'r', encoding='utf-8') as f:
            spec = json.load(f)
    except Exception as e:
        return {'error': str(e)}
    
    mock_data = spec.get('mock_data', {})
    endpoints = spec.get('api_endpoints', [])
    interfaces = spec.get('interfaces', [])
    
    # Извлекаем сущности
    mock_entities = extract_entity_names_from_mock(mock_data)
    interface_entities = extract_entity_names_from_interfaces(interfaces)
    endpoint_entities = analyze_endpoints_for_entities(endpoints)
    
    # Объединяем все сущности
    all_entities = set(mock_entities.keys()) | interface_entities
    
    # Анализируем покрытие
    coverage_analysis = []
    missing_operations = []
    
    for entity in all_entities:
        entity_endpoints = endpoint_entities.get(entity.lower(), [])
        crud = check_crud_coverage(entity, entity_endpoints)
        
        missing = [op for op, has in crud.items() if not has]
        
        coverage_analysis.append({
            'entity': entity,
            'source': 'mock' if entity in mock_entities else 'interface',
            'endpoints_count': len(entity_endpoints),
            'crud_coverage': crud,
            'missing_operations': missing,
            'existing_endpoints': entity_endpoints
        })
        
        if missing:
            missing_operations.append({
                'entity': entity,
                'missing': missing
            })
    
    # Вычисляем общий процент покрытия
    total_entities = len(all_entities)
    if total_entities == 0:
        coverage_score = 100.0
    else:
        fully_covered = sum(1 for ca in coverage_analysis if not ca['missing_operations'])
        coverage_score = (fully_covered / total_entities) * 100
    
    return {
        'file': str(spec_file),
        'name': spec.get('name', 'unknown'),
        'type': spec.get('type', 'unknown'),
        'total_entities': total_entities,
        'total_endpoints': len(endpoints),
        'coverage_score': coverage_score,
        'coverage_analysis': coverage_analysis,
        'missing_operations': missing_operations,
        'suggestions': generate_suggestions(missing_operations, all_entities)
    }

def generate_suggestions(missing_operations: List[Dict[str, Any]], entities: Set[str]) -> List[Dict[str, Any]]:
    """Генерирует предложения по недостающим эндпоинтам."""
    suggestions = []
    
    for missing in missing_operations:
        entity = missing['entity']
        missing_ops = missing['missing']
        
        entity_lower = entity.lower()
        
        for op in missing_ops:
            if op == 'GET':
                suggestions.append({
                    'method': 'GET',
                    'endpoint': f'/api/{entity_lower}s/',
                    'description': f'Получение списка {entity}',
                    'parameters': 'page, page_size, search (опционально)',
                    'returns': f'Массив объектов {entity}',
                    'priority': 'high'
                })
            elif op == 'POST':
                suggestions.append({
                    'method': 'POST',
                    'endpoint': f'/api/{entity_lower}s/',
                    'description': f'Создание нового {entity}',
                    'parameters': f'Все поля интерфейса {entity}',
                    'returns': f'Созданный объект {entity}',
                    'priority': 'high'
                })
            elif op == 'PUT/PATCH':
                suggestions.append({
                    'method': 'PUT',
                    'endpoint': f'/api/{entity_lower}s/{{id}}/',
                    'description': f'Обновление {entity}',
                    'parameters': f'Измененные поля {entity}',
                    'returns': f'Обновленный объект {entity}',
                    'priority': 'high'
                })
            elif op == 'DELETE':
                if entity_lower not in ['settings', 'config', 'account', 'profile']:
                    suggestions.append({
                        'method': 'DELETE',
                        'endpoint': f'/api/{entity_lower}s/{{id}}/',
                        'description': f'Удаление {entity}',
                        'parameters': 'id',
                        'returns': 'Статус удаления',
                        'priority': 'medium'
                    })
    
    return suggestions

def main():
    """Основная функция."""
    frontend_dir = Path(__file__).parent
    spec_files = list(frontend_dir.rglob("pre-specification.json"))
    
    print(f"🔍 Анализ {len(spec_files)} спецификаций...\n")
    
    results = []
    for spec_file in spec_files:
        analysis = analyze_specification(spec_file)
        if 'error' not in analysis:
            results.append(analysis)
            rel_path = Path(analysis['file']).relative_to(frontend_dir)
            print(f"✓ {rel_path}: {analysis['coverage_score']:.1f}% покрытие ({analysis['total_entities']} сущностей, {len(analysis['missing_operations'])} с недостающими операциями)")
    
    # Сортируем по проценту покрытия
    results.sort(key=lambda x: x['coverage_score'])
    
    # Группируем по уровню покрытия
    low = [r for r in results if r['coverage_score'] < 50]
    medium = [r for r in results if 50 <= r['coverage_score'] < 80]
    high = [r for r in results if r['coverage_score'] >= 80]
    
    print("\n" + "=" * 80)
    print("📊 ИТОГОВАЯ СТАТИСТИКА")
    print("=" * 80)
    print(f"🔴 Низкое покрытие (<50%): {len(low)}")
    print(f"🟡 Среднее покрытие (50-80%): {len(medium)}")
    print(f"🟢 Высокое покрытие (≥80%): {len(high)}")
    
    if results:
        avg_coverage = sum(r['coverage_score'] for r in results) / len(results)
        print(f"\n📈 Средний процент покрытия: {avg_coverage:.1f}%")
    
    # Показываем проблемные спецификации
    if low:
        print("\n" + "=" * 80)
        print("🔴 СПЕЦИФИКАЦИИ С НИЗКИМ ПОКРЫТИЕМ:")
        print("=" * 80)
        for result in low:
            rel_path = Path(result['file']).relative_to(frontend_dir)
            print(f"\n📄 {rel_path}")
            print(f"   Название: {result['name']}")
            print(f"   Покрытие: {result['coverage_score']:.1f}%")
            print(f"   Сущностей: {result['total_entities']}")
            print(f"   Эндпоинтов: {result['total_endpoints']}")
            print(f"   С недостающими операциями: {len(result['missing_operations'])}")
            
            if result['missing_operations']:
                print(f"   Недостающие операции:")
                for missing in result['missing_operations'][:5]:  # Показываем первые 5
                    print(f"     - {missing['entity']}: {', '.join(missing['missing'])}")
    
    # Сохраняем детальный отчет
    report_file = frontend_dir / "detailed_coverage_report.json"
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump({
            'summary': {
                'total_specs': len(results),
                'low_coverage': len(low),
                'medium_coverage': len(medium),
                'high_coverage': len(high),
                'average_coverage': avg_coverage if results else 0
            },
            'results': results
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Детальный отчет сохранен в: {report_file.relative_to(frontend_dir)}")
    
    return results

if __name__ == "__main__":
    main()
