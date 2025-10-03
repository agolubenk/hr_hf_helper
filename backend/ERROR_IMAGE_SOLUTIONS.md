# 🖼️ Решения для адаптивного отображения изображения 403

## 📋 Проблема
Нужно аккуратно вписать изображение error-403.png в HTML-шаблон, сохраняя пропорции оригинальной картинки. По ширине изображение делится на 2, так как левая и правая стороны относятся к разным темам (светлой и темной).

## 🎯 Решения

### 1️⃣ **Основной подход: background-position** ✅ (используется по умолчанию)

**Принцип работы:**
- Использует `background-size: 200% 100%` для растягивания изображения в 2 раза по ширине
- Переключает `background-position` между `left center` и `right center` для разных тем
- Сохраняет пропорции с помощью `aspect-ratio: 435 / 670`

**CSS:**
```css
.error-403 {
    width: 100%;
    max-width: 435px;
    height: auto;
    aspect-ratio: 435 / 670;
    
    background-image: url('{% static "img/403.png" %}');
    background-size: 200% 100%;
    background-position: left center; /* светлая тема */
    background-repeat: no-repeat;
    border-radius: 15px;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
    transition: box-shadow 0.3s ease;
}

/* Темная тема: показываем правую половину */
body.dark-theme .error-403 {
    background-position: right center;
    box-shadow: 0 0 30px rgba(255, 165, 0, 0.3);
}
```

**Преимущества:**
- ✅ Хорошая совместимость с браузерами
- ✅ Плавные переходы между темами
- ✅ Простота реализации

**Недостатки:**
- ⚠️ Может быть небольшое размытие при растягивании

---

### 2️⃣ **Альтернативный подход: CSS-маска** 🔧 (доступен как опция)

**Принцип работы:**
- Использует `background-size: cover` для полного покрытия элемента
- Применяет CSS-маску для показа только нужной половины изображения
- Переключает маску между темами

**CSS:**
```css
.error-403-alt {
    width: 100%;
    max-width: 435px;
    height: auto;
    aspect-ratio: 435 / 670;
    
    background-image: url('{% static "img/403.png" %}');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 15px;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
    transition: box-shadow 0.3s ease;
    
    /* Маска для светлой темы: показываем левую половину */
    mask: linear-gradient(to right, black 50%, transparent 50%);
    -webkit-mask: linear-gradient(to right, black 50%, transparent 50%);
}

/* Темная тема: показываем правую половину */
body.dark-theme .error-403-alt {
    mask: linear-gradient(to right, transparent 50%, black 50%);
    -webkit-mask: linear-gradient(to right, transparent 50%, black 50%);
}
```

**Преимущества:**
- ✅ Более четкое изображение (без растягивания)
- ✅ Точный контроль над отображением
- ✅ Современный CSS-подход

**Недостатки:**
- ⚠️ Меньшая совместимость с старыми браузерами
- ⚠️ Требует поддержки CSS-масок

---

## 📱 Адаптивность

Оба подхода включают медиа-запросы для мобильных устройств:

```css
/* Планшеты */
@media (max-width: 768px) {
    .error-403, .error-403-alt {
        max-width: 320px;
    }
}

/* Мобильные */
@media (max-width: 480px) {
    .error-403, .error-403-alt {
        max-width: 280px;
    }
}
```

## 🔄 Переключение между подходами

В HTML-шаблоне можно легко переключиться между подходами:

```html
<!-- Основной подход (используется) -->
<div class="error-403"></div>

<!-- Альтернативный подход (закомментирован) -->
<!-- <div class="error-403-alt"></div> -->
```

## 🎨 JavaScript для переключения тем

```javascript
function apply403Theme() {
    const body = document.body;
    const html = document.documentElement;
    const error403 = document.querySelector('.error-403');
    
    const currentTheme = html.getAttribute('data-theme');
    
    if (error403) {
        if (currentTheme === 'dark') {
            body.classList.add('dark-theme');
            body.classList.remove('light-theme');
            error403.style.backgroundPosition = 'right center';
        } else {
            body.classList.add('light-theme');
            body.classList.remove('dark-theme');
            error403.style.backgroundPosition = 'left center';
        }
    }
}
```

## ✅ Рекомендация

**Используйте основной подход** (`error-403`) по умолчанию, так как он:
- Имеет лучшую совместимость с браузерами
- Проще в реализации и поддержке
- Обеспечивает плавные переходы

**Альтернативный подход** (`error-403-alt`) можно использовать, если:
- Нужна максимальная четкость изображения
- Целевая аудитория использует современные браузеры
- Готовы тестировать на разных устройствах

## 🔧 Тестирование

Для тестирования обоих подходов:
1. Откройте страницу 403 ошибки
2. Переключите тему (светлая/темная)
3. Проверьте отображение на разных размерах экрана
4. Убедитесь, что пропорции сохраняются
