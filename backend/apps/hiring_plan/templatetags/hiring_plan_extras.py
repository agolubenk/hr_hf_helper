from django import template

register = template.Library()

@register.filter
def enumerate_list(value):
    """Возвращает enumerate для списка"""
    return enumerate(value)

@register.filter
def get_item(dictionary, key):
    """Получить элемент из словаря по ключу"""
    return dictionary.get(key, {})
