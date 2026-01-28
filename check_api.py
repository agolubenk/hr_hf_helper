import json

with open('openapi-spec (1).json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Проверяем эндпоинт /applicants
path = '/accounts/{account_id}/applicants'
if path in data.get('paths', {}):
    get_method = data['paths'][path].get('get', {})
    params = get_method.get('parameters', [])
    print(f"\n=== {path} ===")
    print("Parameters:")
    for p in params:
        name = p.get('name', '')
        param_type = p.get('schema', {}).get('type', 'unknown')
        description = p.get('description', '')
        print(f"  {name} ({param_type}): {description[:100]}")

# Проверяем эндпоинт /applicants/sources
path = '/accounts/{account_id}/applicants/sources'
if path in data.get('paths', {}):
    print(f"\n=== {path} ===")
    print(json.dumps(data['paths'][path], indent=2)[:1500])

# Ищем упоминания source в параметрах applicants
path = '/accounts/{account_id}/applicants'
if path in data.get('paths', {}):
    params = data['paths'][path].get('get', {}).get('parameters', [])
    source_params = [p for p in params if 'source' in p.get('name', '').lower()]
    if source_params:
        print(f"\n=== Source parameters in {path} ===")
        for p in source_params:
            print(json.dumps(p, indent=2))

