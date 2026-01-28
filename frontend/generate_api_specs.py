#!/usr/bin/env python3
"""
Скрипт для генерации pre-specification.json файлов на основе документации.
Извлекает информацию о моковых данных и TODO: Интеграция с API из PAGE_DOCUMENTATION.md и COMPONENTS_DOCUMENTATION.md.
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Any, Optional

def extract_mock_data_section(content: str) -> Dict[str, Any]:
    """Извлекает информацию о моковых данных из документации."""
    mock_data = {}
    
    # Ищем раздел "## Моковые данные"
    mock_section_match = re.search(r'## Моковые данные\s*\n(.*?)(?=\n## |$)', content, re.DOTALL)
    if not mock_section_match:
        return mock_data
    
    mock_section = mock_section_match.group(1)
    
    # Ищем все определения моковых данных (начинаются с ### или - **Тип**)
    mock_patterns = [
        r'### (\w+)\s*\n(.*?)(?=\n### |\n## |$)',
        r'- \*\*Тип\*\*: (.+?)\s*\n- \*\*Структура\*\*: (.+?)(?=\n- \*\*|$)',
    ]
    
    for pattern in mock_patterns:
        matches = re.finditer(pattern, mock_section, re.DOTALL)
        for match in matches:
            if len(match.groups()) == 1:
                # Формат ### name
                name = match.group(1)
                description = match.group(0)
            else:
                # Формат - **Тип**: ...
                name = f"mockData_{len(mock_data)}"
                description = match.group(0)
            
            mock_data[name] = {
                "description": description.strip(),
                "extracted_from": "documentation"
            }
    
    return mock_data

def extract_api_todos(content: str) -> List[Dict[str, Any]]:
    """Извлекает информацию о TODO: Интеграция с API."""
    api_todos = []
    seen_endpoints = set()  # Для избежания дубликатов
    
    # Ищем раздел "## TODO: Интеграция с API" или "## TODO:"
    todo_section_match = re.search(r'## TODO:.*?API\s*\n(.*?)(?=\n## |$)', content, re.DOTALL | re.IGNORECASE)
    if not todo_section_match:
        # Пробуем найти просто "## TODO:"
        todo_section_match = re.search(r'## TODO:\s*\n(.*?)(?=\n## |$)', content, re.DOTALL)
    
    if not todo_section_match:
        return api_todos
    
    todo_section = todo_section_match.group(1)
    
    # Ищем нумерованные задачи (1. ❌, 2. ❌, и т.д.)
    task_pattern = r'(\d+)\.\s*❌\s*(.+?)(?=\n\d+\.\s*❌|\n## |$)'
    tasks = re.finditer(task_pattern, todo_section, re.DOTALL)
    
    for task in tasks:
        task_num = task.group(1)
        task_content = task.group(2).strip()
        
        # Извлекаем метод и endpoint из разных форматов
        method = None
        endpoint = None
        
        # Формат 1: "GET `/api/...`" или "GET /api/..."
        method_endpoint_match = re.search(r'(GET|POST|PUT|PATCH|DELETE)\s+[`"]?([^\s`"]+)', task_content, re.IGNORECASE)
        if method_endpoint_match:
            method = method_endpoint_match.group(1).upper()
            endpoint = method_endpoint_match.group(2)
        
        # Формат 2: "- GET `/api/...`" (в списке)
        if not method:
            list_method_match = re.search(r'-\s*(GET|POST|PUT|PATCH|DELETE)\s+[`"]?([^\s`"]+)', task_content, re.IGNORECASE)
            if list_method_match:
                method = list_method_match.group(1).upper()
                endpoint = list_method_match.group(2)
        
        # Извлекаем параметры
        params_match = re.search(r'Параметры[:\s]+(.+?)(?=\n|$)', task_content, re.IGNORECASE | re.MULTILINE)
        params = params_match.group(1).strip() if params_match else None
        
        # Извлекаем возвращаемые данные
        returns_match = re.search(r'Возвращает[:\s]+(.+?)(?=\n|$)', task_content, re.IGNORECASE | re.MULTILINE)
        returns = returns_match.group(1).strip() if returns_match else None
        
        # Создаем уникальный ключ для проверки дубликатов
        endpoint_key = f"{method}:{endpoint}" if method and endpoint else None
        
        # Пропускаем дубликаты
        if endpoint_key and endpoint_key in seen_endpoints:
            continue
        
        if endpoint_key:
            seen_endpoints.add(endpoint_key)
        
        api_todos.append({
            "task_number": int(task_num),
            "description": task_content,
            "method": method,
            "endpoint": endpoint,
            "parameters": params,
            "returns": returns,
            "status": "pending"
        })
    
    # Также ищем задачи без нумерации (начинаются с -), но только если они содержат HTTP методы
    unnumbered_tasks = re.finditer(r'-\s*(.+?)(?=\n-|\n\d+\.|$)', todo_section, re.DOTALL)
    for task in unnumbered_tasks:
        task_content = task.group(1).strip()
        if task_content and not task_content.startswith('❌'):
            # Проверяем, содержит ли задача HTTP метод
            if re.search(r'(GET|POST|PUT|PATCH|DELETE)\s+[`"]?/', task_content, re.IGNORECASE):
                method_endpoint_match = re.search(r'(GET|POST|PUT|PATCH|DELETE)\s+[`"]?([^\s`"]+)', task_content, re.IGNORECASE)
                if method_endpoint_match:
                    method = method_endpoint_match.group(1).upper()
                    endpoint = method_endpoint_match.group(2)
                    endpoint_key = f"{method}:{endpoint}"
                    
                    if endpoint_key not in seen_endpoints:
                        seen_endpoints.add(endpoint_key)
                        api_todos.append({
                            "task_number": len(api_todos) + 1,
                            "description": task_content,
                            "method": method,
                            "endpoint": endpoint,
                            "parameters": None,
                            "returns": None,
                            "status": "pending"
                        })
    
    return api_todos

def extract_interfaces(content: str) -> List[Dict[str, Any]]:
    """Извлекает интерфейсы и типы из документации."""
    interfaces = []
    
    # Ищем раздел "## Интерфейсы и типы" или "## Интерфейсы данных"
    interfaces_section_match = re.search(r'## Интерфейсы.*?\n(.*?)(?=\n## |$)', content, re.DOTALL | re.IGNORECASE)
    if not interfaces_section_match:
        return interfaces
    
    interfaces_section = interfaces_section_match.group(1)
    
    # Ищем определения интерфейсов (начинаются с ###)
    interface_pattern = r'### (\w+)\s*\n```typescript\s*\n(.*?)\n```'
    matches = re.finditer(interface_pattern, interfaces_section, re.DOTALL)
    
    for match in matches:
        name = match.group(1)
        definition = match.group(2).strip()
        
        # Парсим поля интерфейса
        fields = []
        field_pattern = r'(\w+)(\?)?:\s*([^/]+?)(?:\s*//\s*(.+?))?(?=\n|$)'
        field_matches = re.finditer(field_pattern, definition, re.MULTILINE)
        
        for field_match in field_matches:
            field_name = field_match.group(1)
            optional = field_match.group(2) == '?'
            field_type = field_match.group(3).strip()
            comment = field_match.group(4).strip() if field_match.group(4) else None
            
            fields.append({
                "name": field_name,
                "type": field_type,
                "optional": optional,
                "comment": comment
            })
        
        interfaces.append({
            "name": name,
            "definition": definition,
            "fields": fields
        })
    
    return interfaces

def generate_specification(doc_path: str, doc_type: str = "page") -> Optional[Dict[str, Any]]:
    """Генерирует спецификацию API для страницы или компонента."""
    if not os.path.exists(doc_path):
        return None
    
    with open(doc_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Извлекаем название страницы/компонента из пути
    path_parts = doc_path.split('/')
    if doc_type == "page":
        # app/calendar/PAGE_DOCUMENTATION.md -> calendar
        name = path_parts[-2] if len(path_parts) > 1 else "root"
    else:
        # components/telegram/COMPONENTS_DOCUMENTATION.md -> telegram
        name = path_parts[-2] if len(path_parts) > 1 else "root"
    
    # Извлекаем информацию
    mock_data = extract_mock_data_section(content)
    api_todos = extract_api_todos(content)
    interfaces = extract_interfaces(content)
    
    # Извлекаем общее описание
    description_match = re.search(r'## Общее описание\s*\n(.*?)(?=\n## |$)', content, re.DOTALL)
    description = description_match.group(1).strip() if description_match else None
    
    # Извлекаем путь (для страниц)
    path_match = re.search(r'\*\*Путь\*\*:\s*(.+?)(?=\n|$)', content)
    route_path = path_match.group(1).strip() if path_match else None
    
    spec = {
        "name": name,
        "type": doc_type,
        "description": description,
        "route_path": route_path,
        "documentation_file": doc_path,
        "mock_data": mock_data,
        "interfaces": interfaces,
        "api_endpoints": api_todos,
        "generated_at": None  # Будет заполнено позже
    }
    
    return spec

def main():
    """Основная функция для генерации всех спецификаций."""
    frontend_dir = Path(__file__).parent
    app_dir = frontend_dir / "app"
    components_dir = frontend_dir / "components"
    
    specs_generated = 0
    
    # Обрабатываем страницы
    for doc_file in app_dir.rglob("PAGE_DOCUMENTATION.md"):
        spec = generate_specification(str(doc_file), "page")
        if spec:
            # Определяем директорию для сохранения
            spec_dir = doc_file.parent
            spec_file = spec_dir / "pre-specification.json"
            
            # Добавляем timestamp
            from datetime import datetime
            spec["generated_at"] = datetime.now().isoformat()
            
            # Сохраняем спецификацию
            with open(spec_file, 'w', encoding='utf-8') as f:
                json.dump(spec, f, ensure_ascii=False, indent=2)
            
            specs_generated += 1
            print(f"✓ Создана спецификация: {spec_file.relative_to(frontend_dir)}")
    
    # Обрабатываем компоненты
    for doc_file in components_dir.rglob("COMPONENTS_DOCUMENTATION.md"):
        spec = generate_specification(str(doc_file), "component")
        if spec:
            # Определяем директорию для сохранения
            spec_dir = doc_file.parent
            spec_file = spec_dir / "pre-specification.json"
            
            # Добавляем timestamp
            from datetime import datetime
            spec["generated_at"] = datetime.now().isoformat()
            
            # Сохраняем спецификацию
            with open(spec_file, 'w', encoding='utf-8') as f:
                json.dump(spec, f, ensure_ascii=False, indent=2)
            
            specs_generated += 1
            print(f"✓ Создана спецификация: {spec_file.relative_to(frontend_dir)}")
    
    print(f"\n✅ Всего создано спецификаций: {specs_generated}")

if __name__ == "__main__":
    main()
