/**
 * FinanceSettingsPage (company-settings/finance/page.tsx) - Страница финансовых настроек компании
 * 
 * Назначение:
 * - Управление валютами компании
 * - Настройка источников курсов валют (API)
 * - Управление налогами по странам
 * - Настройка формата расчета зарплаты (Gross/Net)
 * 
 * Функциональность:
 * - Вкладки для переключения между разделами:
 *   - Валюты: управление валютами компании
 *   - API источники: настройка источников курсов валют
 *   - Налоги: управление налогами по странам
 * - Автоматическое добавление валют офисов компании
 * - Настройка основных и дополнительных валют
 * - Управление порядком отображения валют
 * - Настройка API источников для автоматического обновления курсов
 * - Управление налогами для каждой страны отдельно
 * - Переключение формата расчета зарплаты (Gross/Net) для каждой страны
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useToast: для отображения уведомлений
 * - Sidebar: содержит ссылку на эту страницу в разделе "Настройки компании"
 * - Настройки компании: использует информацию об офисах для определения валют
 * 
 * Поведение:
 * - При загрузке определяет валюты офисов компании и добавляет их в список
 * - При переключении вкладки меняет отображаемый раздел
 * - При добавлении валюты добавляет её в список
 * - При настройке API источника сохраняет параметры для обновления курсов
 * - При добавлении налога привязывает его к стране
 * 
 * TODO: Заменить моковые данные на реальные из API
 */

'use client'

import AppLayout from "@/components/AppLayout"
import { Box, Text, Tabs, Flex, TextField, TextArea, Button, Table, Card, Badge, Callout, Switch, Select } from "@radix-ui/themes"
import { useState } from "react"
import { InfoCircledIcon, PlusIcon, TrashIcon, Pencil2Icon, CheckIcon, Cross2Icon, MixerHorizontalIcon } from "@radix-ui/react-icons"
import { useToast } from "@/components/Toast/ToastContext"
import styles from '../company-settings.module.css'

/**
 * Currency - интерфейс валюты
 * 
 * Структура:
 * - id: уникальный идентификатор валюты
 * - code: код валюты (USD, EUR, BYN, PLN и т.д.)
 * - name: название валюты
 * - isMain: флаг основной валюты
 * - order: порядок сортировки
 * - isActive: флаг активности валюты
 * - isOfficeCurrency: флаг валюты офиса компании (автоматически определяется по офисам)
 */
interface Currency {
  id: string
  code: string
  name: string
  isMain: boolean
  order: number
  isActive: boolean
  isOfficeCurrency?: boolean // Валюта, соответствующая офису компании
}

/**
 * CurrencyAPISource - интерфейс источника курсов валют через API
 * 
 * Структура:
 * - id: уникальный идентификатор источника
 * - name: название источника (например, НБРБ)
 * - url: URL API источника
 * - currencyPath: путь к полю кода валюты в JSON ответе
 * - ratePath: путь к полю курса валюты в JSON ответе
 * - scalePath: путь к полю масштаба (номинала) валюты в JSON ответе
 * - isMain: флаг основного источника
 * - isAdditional: флаг дополнительного источника (fallback)
 */
interface CurrencyAPISource {
  id: string
  name: string
  url: string
  currencyPath?: string
  ratePath?: string
  scalePath?: string
  isMain?: boolean
  isAdditional?: boolean
}

/**
 * Tax - интерфейс налога
 * 
 * Структура:
 * - id: уникальный идентификатор налога
 * - name: название налога
 * - rate: ставка налога в процентах (строка для точности)
 * - is_active: флаг активности налога
 * - country: страна, к которой привязан налог
 */
interface Tax {
  id: string
  name: string
  rate: string
  is_active: boolean
  country: string
}

/**
 * countryToCurrency - маппинг стран на валюты
 * 
 * Используется для:
 * - Автоматического определения валют офисов компании
 * - Добавления валют офисов в список валют
 * 
 * Структура:
 * - Ключ: название страны
 * - Значение: объект с кодом и названием валюты
 */
const countryToCurrency: Record<string, { code: string; name: string }> = {
  'Беларусь': { code: 'BYN', name: 'Белорусский рубль' },
  'Польша': { code: 'PLN', name: 'Польский злотый' },
  'Россия': { code: 'RUB', name: 'Российский рубль' },
  'Украина': { code: 'UAH', name: 'Украинская гривна' },
}

// Моковые данные валют
const mockCurrencies: Currency[] = [
  { id: '1', code: 'BYN', name: 'Белорусский рубль', isMain: true, order: 1, isActive: true, isOfficeCurrency: true },
  { id: '2', code: 'USD', name: 'Доллар США', isMain: false, order: 2, isActive: true },
  { id: '3', code: 'EUR', name: 'Евро', isMain: false, order: 3, isActive: true },
  { id: '4', code: 'PLN', name: 'Польский злотый', isMain: false, order: 4, isActive: true, isOfficeCurrency: true },
]

// Моковые данные API источников
const mockAPISources: CurrencyAPISource[] = [
  {
    id: '1',
    name: 'НБРБ (Национальный банк Республики Беларусь)',
    url: 'https://www.nbrb.by/api/exrates/rates',
    currencyPath: 'Cur_Abbreviation',
    ratePath: 'Cur_OfficialRate',
    scalePath: 'Cur_Scale',
    isMain: true,
    isAdditional: false
  }
]

export default function FinanceSettingsPage() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<'currencies' | 'api' | 'taxes'>('currencies')
  
  // Страны офисов компании (моковые данные - в реальном приложении брать из настроек)
  const mockOffices = [
    { id: 1, country: 'Беларусь', address: 'ул. Ленина, 10, Минск' },
    { id: 2, country: 'Польша', address: 'ul. Marszałkowska, 1, Warszawa' },
  ]
  const officeCountries = Array.from(new Set(mockOffices.map(o => o.country)))
  
  /**
   * officeCurrencies - массив кодов валют офисов компании
   * 
   * Функциональность:
   * - Определяет валюты на основе стран офисов компании
   * - Использует маппинг countryToCurrency для преобразования стран в валюты
   * 
   * Алгоритм:
   * 1. Получает уникальные страны офисов
   * 2. Преобразует страны в объекты валют через countryToCurrency
   * 3. Фильтрует несуществующие валюты (null)
   * 4. Извлекает коды валют
   * 
   * Используется для:
   * - Автоматического добавления валют офисов в список валют
   * - Помечения валют офисов флагом isOfficeCurrency
   */
  const officeCurrencies = officeCountries
    .map(country => countryToCurrency[country])
    .filter(Boolean)
    .map(currency => currency.code)
  
  /**
   * initializeCurrencies - инициализация списка валют с автоматическим добавлением валют офисов
   * 
   * Функциональность:
   * - Добавляет валюты офисов компании в список валют, если их еще нет
   * - Помечает существующие валюты офисов флагом isOfficeCurrency
   * 
   * Алгоритм:
   * 1. Создает копию существующих валют
   * 2. Для каждой валюты офиса:
   *    - Если валюты нет в списке - добавляет её с флагом isOfficeCurrency
   *    - Если валюта уже есть - помечает её флагом isOfficeCurrency
   * 3. Возвращает обновленный список валют
   * 
   * Используется для:
   * - Инициализации списка валют при загрузке страницы
   * - Обеспечения наличия валют офисов в списке
   * 
   * @returns массив валют с добавленными валютами офисов
   */
  const initializeCurrencies = (): Currency[] => {
    const existing = [...mockCurrencies]
    const existingCodes = new Set(existing.map(c => c.code))
    
    officeCurrencies.forEach((code, index) => {
      if (!existingCodes.has(code)) {
        const currencyInfo = Object.values(countryToCurrency).find(c => c.code === code)
        if (currencyInfo) {
          existing.push({
            id: `office-${code}`,
            code: code,
            name: currencyInfo.name,
            isMain: false,
            order: existing.length + 1,
            isActive: true,
            isOfficeCurrency: true
          })
        }
      } else {
        // Помечаем существующие валюты офисов
        const currency = existing.find(c => c.code === code)
        if (currency) {
          currency.isOfficeCurrency = true
        }
      }
    })
    
    return existing
  }
  
  const [currencies, setCurrencies] = useState<Currency[]>(initializeCurrencies())
  const [apiSources, setApiSources] = useState<CurrencyAPISource[]>(mockAPISources)
  const [isAddingCurrency, setIsAddingCurrency] = useState(false)
  const [newCurrency, setNewCurrency] = useState({ code: '', name: '' })
  const [isAddingAPI, setIsAddingAPI] = useState(false)
  const [newAPISource, setNewAPISource] = useState<Partial<CurrencyAPISource>>({
    name: '',
    url: '',
    currencyPath: '',
    ratePath: '',
    scalePath: ''
  })
  const [editingAPISourceId, setEditingAPISourceId] = useState<string | null>(null)
  const [editingAPISource, setEditingAPISource] = useState<Partial<CurrencyAPISource>>({
    name: '',
    url: '',
    currencyPath: '',
    ratePath: '',
    scalePath: ''
  })
  const [mainCurrencyAPIUrl, setMainCurrencyAPIUrl] = useState('https://www.nbrb.by/api/exrates/rates')
  const [currencyRules, setCurrencyRules] = useState('Курсы валют обновляются автоматически из НБРБ. При недоступности НБРБ используются fallback значения.')
  
  // Налоги по странам (моковые данные)
  const [taxesByCountry, setTaxesByCountry] = useState<Record<string, Tax[]>>({
    'Беларусь': [
      { id: '1', name: 'Подоходный налог (PIT)', rate: '13.00', is_active: true, country: 'Беларусь' },
      { id: '2', name: 'Социальные взносы', rate: '35.00', is_active: true, country: 'Беларусь' },
    ],
    'Польша': [
      { id: '3', name: 'Подоходный налог (PIT)', rate: '17.00', is_active: true, country: 'Польша' },
      { id: '4', name: 'Социальные взносы (ZUS)', rate: '19.48', is_active: true, country: 'Польша' },
      { id: '5', name: 'Медицинское страхование', rate: '9.00', is_active: true, country: 'Польша' },
    ],
  })
  
  const [isAddingTax, setIsAddingTax] = useState(false)
  const [newTax, setNewTax] = useState({ name: '', rate: '', country: officeCountries[0] || '' })
  const [editingTaxId, setEditingTaxId] = useState<string | null>(null)
  const [editingTax, setEditingTax] = useState({ name: '', rate: '', is_active: true, country: '' })
  // Формат расчета для каждой страны отдельно (true = Gross, false = Net)
  const [grossFormatByCountry, setGrossFormatByCountry] = useState<Record<string, boolean>>(
    officeCountries.reduce((acc, country) => {
      acc[country] = true // По умолчанию Gross для всех стран
      return acc
    }, {} as Record<string, boolean>)
  )
  
  /**
   * handleToggleGrossFormat - обработчик переключения формата расчета зарплаты (Gross/Net)
   * 
   * Функциональность:
   * - Переключает формат расчета зарплаты для указанной страны
   * - Gross (true) - зарплата до вычета налогов
   * - Net (false) - зарплата после вычета налогов
   * 
   * Поведение:
   * - Вызывается при переключении Switch формата расчета
   * - Инвертирует текущее значение для указанной страны
   * - Сохраняет настройку для каждой страны отдельно
   * 
   * Используется для:
   * - Настройки формата расчета зарплаты для каждой страны
   * - Отображения зарплатных вилок в правильном формате
   * 
   * @param country - страна, для которой переключается формат
   */
  const handleToggleGrossFormat = (country: string) => {
    setGrossFormatByCountry(prev => ({
      ...prev,
      [country]: !prev[country]
    }))
  }
  
  /**
   * handleAddTax - обработчик добавления нового налога
   * 
   * Функциональность:
   * - Валидирует данные нового налога
   * - Создает новый налог и добавляет его в список налогов страны
   * - Очищает форму добавления
   * 
   * Валидация:
   * - name: обязательное поле (не пустое)
   * - rate: обязательное поле, должно быть числом от 0 до 100
   * - country: обязательное поле (выбрана страна)
   * 
   * Поведение:
   * - Проверяет заполненность всех полей
   * - Парсит ставку налога в число
   * - Проверяет диапазон ставки (0-100%)
   * - Создает объект налога с уникальным ID (timestamp)
   * - Добавляет налог в массив налогов выбранной страны
   * - Очищает форму и закрывает режим добавления
   * 
   * Используется для:
   * - Добавления нового налога для страны при клике на "Добавить налог"
   * 
   * TODO: Реализовать сохранение через API
   * - POST /api/company-settings/finance/taxes/ - создание налога
   */
  const handleAddTax = () => {
    if (!newTax.name || !newTax.rate || !newTax.country) {
      alert('Заполните все поля')
      return
    }
    
    const rate = parseFloat(newTax.rate)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      alert('Ставка должна быть числом от 0 до 100')
      return
    }
    
    const tax: Tax = {
      id: Date.now().toString(),
      name: newTax.name,
      rate: rate.toFixed(2),
      is_active: true,
      country: newTax.country
    }
    
    setTaxesByCountry(prev => ({
      ...prev,
      [newTax.country]: [...(prev[newTax.country] || []), tax]
    }))
    
    setNewTax({ name: '', rate: '', country: officeCountries[0] || '' })
    setIsAddingTax(false)
  }
  
  /**
   * handleEditTax - обработчик начала редактирования налога
   * 
   * Функциональность:
   * - Открывает режим редактирования для указанного налога
   * - Загружает данные налога в форму редактирования
   * 
   * Поведение:
   * - Устанавливает editingTaxId в ID редактируемого налога
   * - Загружает данные налога в editingTax для редактирования
   * 
   * Используется для:
   * - Начала редактирования налога при клике на кнопку редактирования
   * 
   * @param tax - налог для редактирования
   */
  const handleEditTax = (tax: Tax) => {
    setEditingTaxId(tax.id)
    setEditingTax({
      name: tax.name,
      rate: tax.rate,
      is_active: tax.is_active,
      country: tax.country
    })
  }
  
  /**
   * handleSaveEditTax - обработчик сохранения изменений налога
   * 
   * Функциональность:
   * - Валидирует данные отредактированного налога
   * - Обновляет налог в списке налогов страны
   * - Закрывает режим редактирования
   * 
   * Валидация:
   * - editingTaxId: должен быть установлен
   * - name: обязательное поле (не пустое)
   * - rate: обязательное поле, должно быть числом от 0 до 100
   * 
   * Поведение:
   * - Проверяет наличие editingTaxId
   * - Проверяет заполненность полей
   * - Парсит ставку налога в число
   * - Проверяет диапазон ставки (0-100%)
   * - Обновляет налог в массиве налогов страны
   * - Очищает editingTaxId и editingTax
   * 
   * Используется для:
   * - Сохранения изменений налога при клике на "Сохранить"
   * 
   * TODO: Реализовать сохранение через API
   * - PUT /api/company-settings/finance/taxes/{id}/ - обновление налога
   */
  const handleSaveEditTax = () => {
    if (!editingTaxId || !editingTax.name || !editingTax.rate) {
      alert('Заполните все поля')
      return
    }
    
    const rate = parseFloat(editingTax.rate)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      alert('Ставка должна быть числом от 0 до 100')
      return
    }
    
    setTaxesByCountry(prev => ({
      ...prev,
      [editingTax.country]: prev[editingTax.country].map(t =>
        t.id === editingTaxId
          ? { ...t, name: editingTax.name, rate: rate.toFixed(2), is_active: editingTax.is_active }
          : t
      )
    }))
    
    setEditingTaxId(null)
    setEditingTax({ name: '', rate: '', is_active: true, country: '' })
  }
  
  /**
   * handleDeleteTax - обработчик удаления налога
   * 
   * Функциональность:
   * - Показывает предупреждающее уведомление с подтверждением удаления
   * - Удаляет налог из списка налогов страны
   * 
   * Поведение:
   * - Вызывается при клике на кнопку удаления налога
   * - Показывает toast-уведомление с вопросом
   * - При подтверждении удаляет налог по ID из массива налогов страны
   * 
   * Связи:
   * - useToast: использует toast для отображения уведомления
   * 
   * @param taxId - ID налога для удаления
   * @param country - страна, к которой привязан налог
   * 
   * TODO: Реализовать удаление через API
   * - DELETE /api/company-settings/finance/taxes/{id}/ - удаление налога
   */
  const handleDeleteTax = (taxId: string, country: string) => {
    toast.showWarning('Удалить налог?', 'Вы уверены, что хотите удалить этот налог?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        {
          label: 'Удалить',
          onClick: () => setTaxesByCountry(prev => ({
            ...prev,
            [country]: prev[country].filter(t => t.id !== taxId)
          })),
          variant: 'solid',
          color: 'red',
        },
      ],
    })
  }
  
  /**
   * handleToggleTaxActive - обработчик переключения активности налога
   * 
   * Функциональность:
   * - Переключает флаг активности налога (is_active)
   * - Позволяет временно отключить налог без удаления
   * 
   * Поведение:
   * - Вызывается при переключении Switch активности налога
   * - Инвертирует значение is_active для указанного налога
   * - Обновляет налог в массиве налогов страны
   * 
   * Используется для:
   * - Временного отключения налога без удаления
   * - Управления видимостью налога в расчетах
   * 
   * @param taxId - ID налога для переключения
   * @param country - страна, к которой привязан налог
   * 
   * TODO: Реализовать сохранение через API
   * - PATCH /api/company-settings/finance/taxes/{id}/ - обновление активности налога
   */
  const handleToggleTaxActive = (taxId: string, country: string) => {
    setTaxesByCountry(prev => ({
      ...prev,
      [country]: prev[country].map(t =>
        t.id === taxId ? { ...t, is_active: !t.is_active } : t
      )
    }))
  }

  /**
   * handleAddCurrency - обработчик добавления новой валюты
   * 
   * Функциональность:
   * - Валидирует данные новой валюты
   * - Создает новую валюту и добавляет её в список
   * - Очищает форму добавления
   * 
   * Валидация:
   * - code: обязательное поле (код валюты, например, USD, EUR)
   * - name: обязательное поле (название валюты)
   * 
   * Поведение:
   * - Проверяет заполненность полей code и name
   * - Создает объект валюты с уникальным ID (timestamp)
   * - Добавляет валюту в конец списка (order = currencies.length + 1)
   * - Очищает форму и закрывает режим добавления
   * 
   * Используется для:
   * - Добавления новой валюты при клике на "Добавить валюту"
   * 
   * TODO: Реализовать сохранение через API
   * - POST /api/company-settings/finance/currencies/ - создание валюты
   */
  const handleAddCurrency = () => {
    if (!newCurrency.code || !newCurrency.name) {
      alert('Заполните код и название валюты')
      return
    }

    const currency: Currency = {
      id: Date.now().toString(),
      code: newCurrency.code.toUpperCase(),
      name: newCurrency.name,
      isMain: currencies.length === 0,
      order: currencies.length + 1,
      isActive: true
    }

    setCurrencies([...currencies, currency])
    setNewCurrency({ code: '', name: '' })
    setIsAddingCurrency(false)
  }

  const handleSetMainCurrency = (id: string) => {
    setCurrencies(prev => prev.map(c => ({
      ...c,
      isMain: c.id === id
    })))
  }

  const handleDeleteCurrency = (id: string) => {
    const currency = currencies.find(c => c.id === id)
    if (currency?.isOfficeCurrency) {
      toast.showError('Невозможно удалить', 'Нельзя удалить валюту, соответствующую офису компании. Вы можете деактивировать её.')
      return
    }
    toast.showWarning('Удалить валюту?', 'Вы уверены, что хотите удалить эту валюту?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: () => setCurrencies(prev => prev.filter(c => c.id !== id)), variant: 'solid', color: 'red' },
      ],
    })
  }
  
  const handleToggleCurrencyActive = (id: string) => {
    setCurrencies(prev => prev.map(c =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ))
  }

  const handleAddAPISource = () => {
    if (!newAPISource.name || !newAPISource.url) {
      alert('Заполните название и URL API источника')
      return
    }

    const source: CurrencyAPISource = {
      id: Date.now().toString(),
      name: newAPISource.name!,
      url: newAPISource.url!,
      currencyPath: newAPISource.currencyPath,
      ratePath: newAPISource.ratePath,
      scalePath: newAPISource.scalePath
    }

    setApiSources([...apiSources, source])
    setNewAPISource({ name: '', url: '', currencyPath: '', ratePath: '', scalePath: '' })
    setIsAddingAPI(false)
  }

  const handleDeleteAPISource = (id: string) => {
    toast.showWarning('Удалить API источник?', 'Вы уверены, что хотите удалить этот API источник?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: () => setApiSources(prev => prev.filter(s => s.id !== id)), variant: 'solid', color: 'red' },
      ],
    })
  }

  const handleEditAPISource = (source: CurrencyAPISource) => {
    setEditingAPISourceId(source.id)
    setEditingAPISource({
      name: source.name,
      url: source.url,
      currencyPath: source.currencyPath || '',
      ratePath: source.ratePath || '',
      scalePath: source.scalePath || ''
    })
  }

  const handleSaveEditAPISource = () => {
    if (!editingAPISourceId || !editingAPISource.name || !editingAPISource.url) {
      alert('Заполните название и URL API источника')
      return
    }

    setApiSources(prev => prev.map(s => 
      s.id === editingAPISourceId
        ? {
            ...s,
            name: editingAPISource.name!,
            url: editingAPISource.url!,
            currencyPath: editingAPISource.currencyPath,
            ratePath: editingAPISource.ratePath,
            scalePath: editingAPISource.scalePath
          }
        : s
    ))
    setEditingAPISourceId(null)
    setEditingAPISource({ name: '', url: '', currencyPath: '', ratePath: '', scalePath: '' })
  }

  const handleCancelEditAPISource = () => {
    setEditingAPISourceId(null)
    setEditingAPISource({ name: '', url: '', currencyPath: '', ratePath: '', scalePath: '' })
  }

  const sortedCurrencies = [...currencies].sort((a, b) => a.order - b.order)

  return (
    <AppLayout pageTitle="Финансы">
      <Box className={styles.container}>
        <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
          Финансы
        </Text>

        <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as 'currencies' | 'api' | 'taxes')}>
          <Tabs.List>
            <Tabs.Trigger value="currencies">Валюты</Tabs.Trigger>
            <Tabs.Trigger value="api">API источники</Tabs.Trigger>
            <Tabs.Trigger value="taxes">
              <MixerHorizontalIcon width={16} height={16} />
              Налоги
            </Tabs.Trigger>
          </Tabs.List>

          <Box mt="4">
            <Tabs.Content value="currencies">
              <Flex direction="column" gap="4">
                <Flex justify="between" align="center">
                  <Text size="4" weight="bold">Валюты компании</Text>
                  <Button onClick={() => setIsAddingCurrency(true)}>
                    <PlusIcon width={16} height={16} />
                    Добавить валюту
                  </Button>
                </Flex>

                {isAddingCurrency && (
                  <Card style={{ padding: '16px' }}>
                    <Flex direction="column" gap="3">
                      <TextField.Root
                        placeholder="Код валюты (например, USD)"
                        value={newCurrency.code}
                        onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value })}
                      />
                      <TextField.Root
                        placeholder="Название валюты (например, Доллар США)"
                        value={newCurrency.name}
                        onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
                      />
                      <Flex gap="2">
                        <Button onClick={handleAddCurrency}>Сохранить</Button>
                        <Button variant="soft" onClick={() => {
                          setIsAddingCurrency(false)
                          setNewCurrency({ code: '', name: '' })
                        }}>
                          Отмена
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                )}

                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Порядок</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Код</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Название</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Тип</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Главная</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Действия</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {sortedCurrencies.map((currency) => (
                      <Table.Row key={currency.id}>
                        <Table.Cell>
                          <Text>{currency.order}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text weight="medium">{currency.code}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{currency.name}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          {currency.isOfficeCurrency ? (
                            <Badge color="blue" size="1">Валюта офиса</Badge>
                          ) : (
                            <Text size="1" color="gray">Дополнительная</Text>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <Switch
                            checked={currency.isActive}
                            onCheckedChange={() => handleToggleCurrencyActive(currency.id)}
                          />
                        </Table.Cell>
                        <Table.Cell>
                          {currency.isMain ? (
                            <Badge color="green">Главная</Badge>
                          ) : (
                            <Button
                              size="1"
                              variant="soft"
                              onClick={() => handleSetMainCurrency(currency.id)}
                            >
                              Сделать главной
                            </Button>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          {currency.isOfficeCurrency ? (
                            <Text size="1" color="gray">Нельзя удалить</Text>
                          ) : (
                            <Button
                              size="1"
                              variant="soft"
                              color="red"
                              onClick={() => handleDeleteCurrency(currency.id)}
                            >
                              <TrashIcon width={14} height={14} />
                            </Button>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>

                <Callout.Root>
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    Главная валюта используется для редактирования зарплатных вилок. Остальные валюты пересчитываются автоматически на основе курсов из API источников.
                  </Callout.Text>
                </Callout.Root>
              </Flex>
            </Tabs.Content>

            <Tabs.Content value="api">
              <Flex direction="column" gap="4">
                <Flex justify="between" align="center">
                  <Text size="4" weight="bold">API источники валют</Text>
                  <Button onClick={() => setIsAddingAPI(true)}>
                    <PlusIcon width={16} height={16} />
                    Добавить источник
                  </Button>
                </Flex>

                <Card style={{ padding: '16px' }}>
                  <Flex direction="column" gap="3">
                    <Text size="3" weight="bold">Основной API источник</Text>
                    <Select.Root
                      value={apiSources.find(s => s.isMain)?.id || ''}
                      onValueChange={(value) => {
                        setApiSources(prev => prev.map(s => ({
                          ...s,
                          isMain: s.id === value,
                          isAdditional: s.isMain && s.id !== value ? false : s.isAdditional
                        })))
                      }}
                    >
                      <Select.Trigger placeholder="Выберите главный источник" />
                      <Select.Content>
                        {apiSources.map((source) => (
                          <Select.Item key={source.id} value={source.id}>
                            {source.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                    <Text size="2" color="gray">
                      Главный источник используется для получения курсов валют по умолчанию
                    </Text>
                  </Flex>
                </Card>
                
                <Card style={{ padding: '16px' }}>
                  <Flex direction="column" gap="3">
                    <Text size="3" weight="bold">Дополнительные API источники</Text>
                    <Flex direction="column" gap="2">
                      {apiSources.filter(s => !s.isMain).map((source) => (
                        <Flex key={source.id} align="center" gap="2">
                          <input
                            type="checkbox"
                            checked={source.isAdditional || false}
                            onChange={(e) => {
                              setApiSources(prev => prev.map(s =>
                                s.id === source.id ? { ...s, isAdditional: e.target.checked } : s
                              ))
                            }}
                            style={{ width: '16px', height: '16px' }}
                          />
                          <Text size="2">{source.name}</Text>
                        </Flex>
                      ))}
                      {apiSources.filter(s => !s.isMain).length === 0 && (
                        <Text size="2" color="gray">
                          Добавьте дополнительные источники для использования в качестве резервных
                        </Text>
                      )}
                    </Flex>
                    <Text size="2" color="gray">
                      Дополнительные источники используются как резервные при недоступности главного источника
                    </Text>
                  </Flex>
                </Card>

                <Text size="3" weight="bold">Правила определения валют/курсов</Text>
                <TextArea
                  placeholder="Опишите правила определения валют и курсов из API..."
                  value={currencyRules}
                  onChange={(e) => setCurrencyRules(e.target.value)}
                  rows={5}
                  style={{
                    resize: 'vertical'
                  }}
                />

                {isAddingAPI && (
                  <Card style={{ padding: '16px' }}>
                    <Flex direction="column" gap="3">
                      <TextField.Root
                        placeholder="Название источника (например, НБРБ)"
                        value={newAPISource.name || ''}
                        onChange={(e) => setNewAPISource({ ...newAPISource, name: e.target.value })}
                      />
                      <TextField.Root
                        placeholder="URL API"
                        value={newAPISource.url || ''}
                        onChange={(e) => setNewAPISource({ ...newAPISource, url: e.target.value })}
                      />
                      <TextField.Root
                        placeholder="Путь к коду валюты в JSON (например, Cur_Abbreviation)"
                        value={newAPISource.currencyPath || ''}
                        onChange={(e) => setNewAPISource({ ...newAPISource, currencyPath: e.target.value })}
                      />
                      <TextField.Root
                        placeholder="Путь к курсу в JSON (например, Cur_OfficialRate)"
                        value={newAPISource.ratePath || ''}
                        onChange={(e) => setNewAPISource({ ...newAPISource, ratePath: e.target.value })}
                      />
                      <TextField.Root
                        placeholder="Путь к масштабу в JSON (например, Cur_Scale)"
                        value={newAPISource.scalePath || ''}
                        onChange={(e) => setNewAPISource({ ...newAPISource, scalePath: e.target.value })}
                      />
                      <Flex gap="2">
                        <Button onClick={handleAddAPISource}>Сохранить</Button>
                        <Button variant="soft" onClick={() => {
                          setIsAddingAPI(false)
                          setNewAPISource({ name: '', url: '', currencyPath: '', ratePath: '', scalePath: '' })
                        }}>
                          Отмена
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                )}

                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Название</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>URL</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Пути в JSON</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Тип</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Действия</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {apiSources.map((source) => {
                      const isEditing = editingAPISourceId === source.id
                      
                      return (
                        <Table.Row key={source.id}>
                          <Table.Cell>
                            {isEditing ? (
                              <TextField.Root
                                value={editingAPISource.name || ''}
                                onChange={(e) => setEditingAPISource({ ...editingAPISource, name: e.target.value })}
                                size="2"
                                placeholder="Название источника"
                              />
                            ) : (
                              <Text weight="medium">{source.name}</Text>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {isEditing ? (
                              <TextField.Root
                                value={editingAPISource.url || ''}
                                onChange={(e) => setEditingAPISource({ ...editingAPISource, url: e.target.value })}
                                size="2"
                                placeholder="URL API"
                                style={{ width: '100%' }}
                              />
                            ) : (
                              <Text size="2" style={{ wordBreak: 'break-all' }}>{source.url}</Text>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {isEditing ? (
                              <Flex direction="column" gap="2">
                                <TextField.Root
                                  value={editingAPISource.currencyPath || ''}
                                  onChange={(e) => setEditingAPISource({ ...editingAPISource, currencyPath: e.target.value })}
                                  size="2"
                                  placeholder="Путь к коду валюты"
                                />
                                <TextField.Root
                                  value={editingAPISource.ratePath || ''}
                                  onChange={(e) => setEditingAPISource({ ...editingAPISource, ratePath: e.target.value })}
                                  size="2"
                                  placeholder="Путь к курсу"
                                />
                                <TextField.Root
                                  value={editingAPISource.scalePath || ''}
                                  onChange={(e) => setEditingAPISource({ ...editingAPISource, scalePath: e.target.value })}
                                  size="2"
                                  placeholder="Путь к масштабу"
                                />
                              </Flex>
                            ) : (
                              <Flex direction="column" gap="1">
                                {source.currencyPath && (
                                  <Text size="1" color="gray">
                                    Валюта: {source.currencyPath}
                                  </Text>
                                )}
                                {source.ratePath && (
                                  <Text size="1" color="gray">
                                    Курс: {source.ratePath}
                                  </Text>
                                )}
                                {source.scalePath && (
                                  <Text size="1" color="gray">
                                    Масштаб: {source.scalePath}
                                  </Text>
                                )}
                              </Flex>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {!isEditing && (
                              <Flex direction="column" gap="1">
                                {source.isMain && (
                                  <Badge color="green" size="1">Главный</Badge>
                                )}
                                {source.isAdditional && (
                                  <Badge color="blue" size="1">Дополнительный</Badge>
                                )}
                                {!source.isMain && !source.isAdditional && (
                                  <Text size="1" color="gray">Не используется</Text>
                                )}
                              </Flex>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {isEditing ? (
                              <Flex gap="1">
                                <Button
                                  size="1"
                                  variant="soft"
                                  color="green"
                                  onClick={handleSaveEditAPISource}
                                >
                                  <CheckIcon width={14} height={14} />
                                </Button>
                                <Button
                                  size="1"
                                  variant="soft"
                                  onClick={handleCancelEditAPISource}
                                >
                                  <Cross2Icon width={14} height={14} />
                                </Button>
                              </Flex>
                            ) : (
                              <Flex gap="1">
                                <Button
                                  size="1"
                                  variant="soft"
                                  onClick={() => handleEditAPISource(source)}
                                >
                                  <Pencil2Icon width={14} height={14} />
                                </Button>
                                <Button
                                  size="1"
                                  variant="soft"
                                  color="red"
                                  onClick={() => handleDeleteAPISource(source.id)}
                                >
                                  <TrashIcon width={14} height={14} />
                                </Button>
                              </Flex>
                            )}
                          </Table.Cell>
                        </Table.Row>
                      )
                    })}
                  </Table.Body>
                </Table.Root>

                <Callout.Root>
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    <Flex direction="column" gap="2">
                      <Text>
                        Укажите пути в JSON ответе API для автоматического извлечения данных о валютах.
                      </Text>
                      <Text size="2" color="gray">
                        Пример: Если API возвращает {'{'} "Cur_Abbreviation": "USD", "Cur_OfficialRate": 3.25 {'}'}, 
                        то укажите Cur_Abbreviation для кода валюты и Cur_OfficialRate для курса.
                      </Text>
                    </Flex>
                  </Callout.Text>
                </Callout.Root>
              </Flex>
            </Tabs.Content>

            <Tabs.Content value="taxes">
              <Flex direction="column" gap="4">
                <Flex justify="between" align="center">
                  <Text size="4" weight="bold">Налоги по странам</Text>
                  <Button onClick={() => setIsAddingTax(true)}>
                    <PlusIcon width={16} height={16} />
                    Добавить налог
                  </Button>
                </Flex>


                {isAddingTax && (
                  <Card style={{ padding: '16px' }}>
                    <Flex direction="column" gap="3">
                      <TextField.Root
                        placeholder="Название налога"
                        value={newTax.name}
                        onChange={(e) => setNewTax({ ...newTax, name: e.target.value })}
                      />
                      <TextField.Root
                        placeholder="Ставка (%)"
                        type="number"
                        value={newTax.rate}
                        onChange={(e) => setNewTax({ ...newTax, rate: e.target.value })}
                      />
                      <Flex gap="2" align="center">
                        <Text size="2">Страна:</Text>
                        <select
                          value={newTax.country}
                          onChange={(e) => setNewTax({ ...newTax, country: e.target.value })}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--gray-6)',
                            backgroundColor: 'var(--gray-2)',
                            color: 'var(--gray-12)',
                            flex: 1
                          }}
                        >
                          {officeCountries.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </Flex>
                      <Flex gap="2">
                        <Button onClick={handleAddTax}>Сохранить</Button>
                        <Button variant="soft" onClick={() => {
                          setIsAddingTax(false)
                          setNewTax({ name: '', rate: '', country: officeCountries[0] || '' })
                        }}>
                          Отмена
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                )}

                {officeCountries.map((country) => {
                  const countryTaxes = taxesByCountry[country] || []
                  const activeCountryTaxes = countryTaxes.filter(t => t.is_active)
                  const totalRate = activeCountryTaxes.reduce((sum, tax) => {
                    const rate = parseFloat(tax.rate) || 0
                    return sum + rate
                  }, 0)
                  
                  const isGrossFormat = grossFormatByCountry[country] ?? true
                  
                  const exampleAmount = 5000
                  let exampleNet = exampleAmount
                  let exampleGross = exampleAmount
                  let exampleTaxes = 0
                  
                  if (isGrossFormat) {
                    exampleNet = totalRate > 0 ? exampleGross * (1 - totalRate / 100) : exampleGross
                    exampleTaxes = exampleGross - exampleNet
                  } else {
                    exampleGross = totalRate > 0 ? exampleNet / (1 - totalRate / 100) : exampleNet
                    exampleTaxes = exampleGross - exampleNet
                  }
                  
                  return (
                    <Card key={country} style={{ padding: '16px' }}>
                      <Flex direction="column" gap="3">
                        <Flex align="center" justify="between">
                          <Text size="4" weight="bold">{country}</Text>
                          <Flex align="center" gap="3">
                            <Text size="2" color={!isGrossFormat ? 'gray' : undefined} weight={isGrossFormat ? 'medium' : undefined}>
                              Gross
                            </Text>
                            <Switch
                              checked={isGrossFormat}
                              onCheckedChange={() => handleToggleGrossFormat(country)}
                            />
                            <Text size="2" color={isGrossFormat ? 'gray' : undefined} weight={!isGrossFormat ? 'medium' : undefined}>
                              Net
                            </Text>
                          </Flex>
                        </Flex>
                        
                        <Table.Root>
                          <Table.Header>
                            <Table.Row>
                              <Table.ColumnHeaderCell>Налог</Table.ColumnHeaderCell>
                              <Table.ColumnHeaderCell>Ставка</Table.ColumnHeaderCell>
                              <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                              <Table.ColumnHeaderCell>Действия</Table.ColumnHeaderCell>
                            </Table.Row>
                          </Table.Header>
                          <Table.Body>
                            {countryTaxes.map((tax) => {
                              const isEditing = editingTaxId === tax.id
                              
                              return (
                                <Table.Row key={tax.id}>
                                  <Table.Cell>
                                    {isEditing ? (
                                      <TextField.Root
                                        value={editingTax.name}
                                        onChange={(e) => setEditingTax({ ...editingTax, name: e.target.value })}
                                        size="2"
                                      />
                                    ) : (
                                      <Text weight="medium">{tax.name}</Text>
                                    )}
                                  </Table.Cell>
                                  <Table.Cell>
                                    {isEditing ? (
                                      <TextField.Root
                                        value={editingTax.rate}
                                        onChange={(e) => setEditingTax({ ...editingTax, rate: e.target.value })}
                                        type="number"
                                        size="2"
                                        style={{ width: '100px' }}
                                      />
                                    ) : (
                                      <Text>{tax.rate}%</Text>
                                    )}
                                  </Table.Cell>
                                  <Table.Cell>
                                    {isEditing ? (
                                      <Switch
                                        checked={editingTax.is_active}
                                        onCheckedChange={(checked) => setEditingTax({ ...editingTax, is_active: checked })}
                                      />
                                    ) : (
                                      <Badge color={tax.is_active ? 'green' : 'gray'}>
                                        {tax.is_active ? 'Активен' : 'Неактивен'}
                                      </Badge>
                                    )}
                                  </Table.Cell>
                                  <Table.Cell>
                                    {isEditing ? (
                                      <Flex gap="1">
                                        <Button
                                          size="1"
                                          variant="soft"
                                          color="green"
                                          onClick={handleSaveEditTax}
                                        >
                                          <CheckIcon width={14} height={14} />
                                        </Button>
                                        <Button
                                          size="1"
                                          variant="soft"
                                          onClick={() => {
                                            setEditingTaxId(null)
                                            setEditingTax({ name: '', rate: '', is_active: true, country: '' })
                                          }}
                                        >
                                          <Cross2Icon width={14} height={14} />
                                        </Button>
                                      </Flex>
                                    ) : (
                                      <Flex gap="1">
                                        <Button
                                          size="1"
                                          variant="soft"
                                          onClick={() => handleEditTax(tax)}
                                        >
                                          <Pencil2Icon width={14} height={14} />
                                        </Button>
                                        <Button
                                          size="1"
                                          variant="soft"
                                          onClick={() => handleToggleTaxActive(tax.id, tax.country)}
                                        >
                                          {tax.is_active ? 'Деактивировать' : 'Активировать'}
                                        </Button>
                                        <Button
                                          size="1"
                                          variant="soft"
                                          color="red"
                                          onClick={() => handleDeleteTax(tax.id, tax.country)}
                                        >
                                          <TrashIcon width={14} height={14} />
                                        </Button>
                                      </Flex>
                                    )}
                                  </Table.Cell>
                                </Table.Row>
                              )
                            })}
                          </Table.Body>
                        </Table.Root>
                        
                        {countryTaxes.length > 0 && (
                          <Box style={{
                            padding: '12px',
                            backgroundColor: 'var(--gray-2)',
                            borderRadius: '6px',
                            border: '1px solid var(--gray-6)'
                          }}>
                            <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                              Пример расчета ({isGrossFormat ? 'Gross → Net' : 'Net → Gross'})
                            </Text>
                            <Flex direction="column" gap="1">
                              {isGrossFormat ? (
                                <>
                                  <Text size="2" color="gray">
                                    Gross: {exampleGross.toFixed(2)} {country === 'Польша' ? 'PLN' : 'BYN'}
                                  </Text>
                                  <Text size="2" color="gray">
                                    Налоги ({totalRate.toFixed(2)}%): {exampleTaxes.toFixed(2)} {country === 'Польша' ? 'PLN' : 'BYN'}
                                  </Text>
                                  <Text size="2" weight="medium">
                                    Net: {exampleNet.toFixed(2)} {country === 'Польша' ? 'PLN' : 'BYN'}
                                  </Text>
                                </>
                              ) : (
                                <>
                                  <Text size="2" color="gray">
                                    Net: {exampleNet.toFixed(2)} {country === 'Польша' ? 'PLN' : 'BYN'}
                                  </Text>
                                  <Text size="2" color="gray">
                                    Налоги ({totalRate.toFixed(2)}%): {exampleTaxes.toFixed(2)} {country === 'Польша' ? 'PLN' : 'BYN'}
                                  </Text>
                                  <Text size="2" weight="medium">
                                    Gross: {exampleGross.toFixed(2)} {country === 'Польша' ? 'PLN' : 'BYN'}
                                  </Text>
                                </>
                              )}
                            </Flex>
                          </Box>
                        )}
                      </Flex>
                    </Card>
                  )
                })}
              </Flex>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Box>
    </AppLayout>
  )
}
