/**
 * OfferTemplatePage (company-settings/recruiting/offer-template/page.tsx) - Страница управления шаблоном оффера
 * 
 * Назначение:
 * - Управление шаблоном оффера для кандидатов
 * - Загрузка шаблона в форматах DOCX, PPTX, Figma
 * - Настройка переменных для подстановки в шаблон
 * - Предпросмотр шаблона с подставленными значениями
 * 
 * Функциональность:
 * - Загрузка файла шаблона (drag & drop или выбор файла)
 * - Поддержка форматов: .docx, .pptx, .figma
 * - Предпросмотр DOCX и PPTX файлов в браузере
 * - Настройка переменных для подстановки в шаблон
 * - Автоматическое масштабирование предпросмотра под размер контейнера
 * - Модальное окно предпросмотра для мобильных устройств
 * - Подстановка значений переменных в предпросмотр
 * 
 * Связи:
 * - AppLayout: оборачивает страницу в общий layout
 * - useToast: для отображения уведомлений
 * - mammoth.js: библиотека для конвертации DOCX в HTML
 * - JSZip: библиотека для парсинга PPTX файлов
 * - Sidebar: содержит ссылку на эту страницу в разделе "Настройки рекрутинга"
 * 
 * Поведение:
 * - При загрузке файла автоматически генерируется предпросмотр
 * - При изменении переменных обновляется предпросмотр
 * - На мобильных устройствах предпросмотр открывается в модальном окне
 * - Переменные в шаблоне должны быть в формате {variable_name}
 * 
 * TODO: Реализовать сохранение шаблона на сервер
 * TODO: Реализовать обработку Figma файлов на сервере
 */

'use client'

import AppLayout from "@/components/AppLayout"
import { Flex, Text, Button, Box, TextField, Card, Separator, Select, Dialog } from "@radix-ui/themes"
import { UploadIcon, FileTextIcon, DownloadIcon } from "@radix-ui/react-icons"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/components/Toast/ToastContext"
import styles from '../../company-settings.module.css'

/**
 * Динамический импорт библиотек для предпросмотра файлов
 * 
 * mammoth: библиотека для конвертации DOCX в HTML
 * pptx2html: библиотека для конвертации PPTX в HTML (не используется, парсим вручную через JSZip)
 * 
 * Загружаются динамически только в браузере (typeof window !== 'undefined')
 * для уменьшения размера бандла и поддержки SSR
 */
let mammoth: any = null
let pptx2html: any = null

// Загружаем библиотеки динамически
if (typeof window !== 'undefined') {
  import('mammoth').then((module) => {
    mammoth = module.default
  }).catch(() => {
    console.warn('mammoth.js не загружен')
  })
  
  // PPTX2HTML может быть доступен через глобальный объект или require
  try {
    // Попробуем загрузить через динамический импорт
    import('pptx2html').then((module) => {
      pptx2html = module.default || module
    }).catch(() => {
      // Если не работает, попробуем использовать через window если доступно
      if ((window as any).PPTX2HTML) {
        pptx2html = (window as any).PPTX2HTML
      }
    })
  } catch (e) {
    console.warn('pptx2html не загружен')
  }
}

/**
 * Variable - интерфейс переменной для подстановки в шаблон
 * 
 * Структура:
 * - key: ключ переменной в формате {variable_name}
 * - value: значение переменной для подстановки
 * - category: категория переменной (для группировки)
 * - label: отображаемое название переменной
 */
interface Variable {
  key: string
  value: string
  category: string
  label: string
}

/**
 * VariableOption - интерфейс опции переменной из списка доступных
 * 
 * Структура:
 * - key: ключ переменной в формате {variable_name}
 * - label: отображаемое название переменной
 * - category: категория переменной
 * - defaultValue: значение по умолчанию для переменной
 */
interface VariableOption {
  key: string
  label: string
  category: string
  defaultValue: string
}

/**
 * AVAILABLE_VARIABLES - список доступных переменных для подстановки в шаблон
 * 
 * Категории переменных:
 * - Компания и вакансия: информация о компании и вакансии
 * - Условия оффера: зарплата, бонусы, условия работы
 * - Кандидат: информация о кандидате
 * - Рекрутер: контакты рекрутера
 * - Системные: системные переменные (дата формирования и т.д.)
 * 
 * Используется для:
 * - Отображения списка доступных переменных при добавлении
 * - Предзаполнения значений по умолчанию
 * - Группировки переменных по категориям
 */
const AVAILABLE_VARIABLES: VariableOption[] = [
  // Компания и вакансия
  { key: '{company_name}', label: 'Название компании', category: 'Компания и вакансия', defaultValue: 'ООО "Компания"' },
  { key: '{vacancy_name}', label: 'Название вакансии', category: 'Компания и вакансия', defaultValue: 'Frontend Developer' },
  
  // Условия оффера
  { key: '{salary_before_tax}', label: 'Сумма на ИС (до вычета налогов)', category: 'Условия оффера', defaultValue: '200,000' },
  { key: '{salary_after_tax}', label: 'Сумма после ИС (после вычета налогов)', category: 'Условия оффера', defaultValue: '174,000' },
  { key: '{bonus}', label: 'Премия', category: 'Условия оффера', defaultValue: '50,000' },
  { key: '{special_conditions}', label: 'Специфические условия', category: 'Условия оффера', defaultValue: 'Удаленная работа, гибкий график' },
  { key: '{salary_type}', label: 'Нет/Гросс', category: 'Условия оффера', defaultValue: 'Нет' },
  { key: '{currency}', label: 'Валюта', category: 'Условия оффера', defaultValue: 'RUB' },
  
  // Кандидат
  { key: '{candidate_name}', label: 'ФИО кандидата', category: 'Кандидат', defaultValue: 'Иван Иванов' },
  { key: '{start_date}', label: 'Дата старта', category: 'Кандидат', defaultValue: '01.02.2026' },
  { key: '{location}', label: 'Локация', category: 'Кандидат', defaultValue: 'Москва' },
  
  // Рекрутер
  { key: '{recruiter_name}', label: 'ФИО рекрутера', category: 'Рекрутер', defaultValue: 'Петр Петров' },
  { key: '{recruiter_first_name}', label: 'Имя рекрутера', category: 'Рекрутер', defaultValue: 'Петр' },
  { key: '{recruiter_phone}', label: 'Телефон рекрутера', category: 'Рекрутер', defaultValue: '+7 (999) 123-45-67' },
  { key: '{recruiter_email}', label: 'Почта рекрутера', category: 'Рекрутер', defaultValue: 'recruiter@company.com' },
  { key: '{recruiter_telegram}', label: 'Телеграм рекрутера', category: 'Рекрутер', defaultValue: '@recruiter' },
  { key: '{recruiter_linkedin}', label: 'Линкедин рекрутера', category: 'Рекрутер', defaultValue: 'linkedin.com/in/recruiter' },
  
  // Системные
  { key: '{generation_date}', label: 'Дата формирования', category: 'Системные', defaultValue: new Date().toLocaleDateString('ru-RU') },
]

/**
 * OfferTemplatePage - компонент страницы управления шаблоном оффера
 * 
 * Состояние:
 * - templateFile: загруженный файл шаблона
 * - isDragging: флаг перетаскивания файла (для визуальной обратной связи)
 * - previewContent: HTML содержимое предпросмотра
 * - previewLoading: флаг загрузки предпросмотра
 * - previewError: ошибка при обработке файла
 * - variables: массив переменных для подстановки в шаблон
 * - selectedVariableKey: выбранная переменная для добавления
 * - newVariableValue: значение новой переменной
 * - isMobilePreviewOpen: флаг открытия модального окна предпросмотра на мобильных
 * - fileType: тип загруженного файла ('docx', 'pptx', 'figma')
 * - isMobile: флаг определения мобильного устройства
 */
export default function OfferTemplatePage() {
  // Хук для отображения уведомлений
  const toast = useToast()
  // Загруженный файл шаблона (DOCX, PPTX или Figma)
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  // Флаг перетаскивания файла (для визуальной обратной связи при drag & drop)
  const [isDragging, setIsDragging] = useState(false)
  // HTML содержимое предпросмотра шаблона
  const [previewContent, setPreviewContent] = useState<string>('')
  // Флаг загрузки предпросмотра (показывает индикатор загрузки)
  const [previewLoading, setPreviewLoading] = useState(false)
  // Ошибка при обработке файла (отображается в предпросмотре)
  const [previewError, setPreviewError] = useState<string | null>(null)
  /**
   * variables - массив переменных для подстановки в шаблон
   * 
   * Инициализируется с предустановленными переменными:
   * - company_name, vacancy_name: информация о компании и вакансии
   * - candidate_name: имя кандидата
   * - salary_before_tax, currency: условия оффера
   * - start_date: дата старта работы
   * - generation_date: дата формирования оффера
   */
  const [variables, setVariables] = useState<Variable[]>([
    { key: '{company_name}', value: 'ООО "Компания"', category: 'Компания и вакансия', label: 'Название компании' },
    { key: '{vacancy_name}', value: 'Frontend Developer', category: 'Компания и вакансия', label: 'Название вакансии' },
    { key: '{candidate_name}', value: 'Иван Иванов', category: 'Кандидат', label: 'ФИО кандидата' },
    { key: '{salary_before_tax}', value: '200,000', category: 'Условия оффера', label: 'Сумма на ИС' },
    { key: '{currency}', value: 'RUB', category: 'Условия оффера', label: 'Валюта' },
    { key: '{start_date}', value: '01.02.2026', category: 'Кандидат', label: 'Дата старта' },
    { key: '{generation_date}', value: new Date().toLocaleDateString('ru-RU'), category: 'Системные', label: 'Дата формирования' },
  ])
  // Выбранная переменная из списка доступных для добавления
  const [selectedVariableKey, setSelectedVariableKey] = useState<string>('')
  // Значение новой переменной при добавлении
  const [newVariableValue, setNewVariableValue] = useState('')
  // Флаг открытия модального окна предпросмотра на мобильных устройствах
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false)
  // Тип загруженного файла: 'docx', 'pptx' или 'figma'
  const [fileType, setFileType] = useState<'docx' | 'pptx' | 'figma' | null>(null)
  // Ref для контейнера предпросмотра (используется для автоматического масштабирования)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  
  /**
   * isMobile - флаг определения мобильного устройства
   * 
   * Используется для:
   * - Адаптации интерфейса под мобильные устройства
   * - Открытия предпросмотра в модальном окне на мобильных
   * - Изменения раскладки (вертикальная вместо горизонтальной)
   */
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Автоматическое масштабирование предпросмотра
  useEffect(() => {
    if (!previewContent || !previewContainerRef.current || !fileType) return
    
    const container = previewContainerRef.current
    
    const scaleToFit = () => {
      if (!container) return
      
      const containerRect = container.getBoundingClientRect()
      const availableWidth = containerRect.width - 40
      const availableHeight = containerRect.height - 40
      
      if (fileType === 'docx') {
        const docxWrapper = container.querySelector('.docx-wrapper') as HTMLElement
        if (!docxWrapper) return
        
        // A4 размеры в миллиметрах
        const a4WidthMM = 210
        const a4HeightMM = 297
        const a4Ratio = a4WidthMM / a4HeightMM // ≈ 0.707
        
        // Конвертируем мм в пиксели (примерно 3.78px на мм при 96 DPI)
        const mmToPx = 3.779527559
        const a4WidthPx = a4WidthMM * mmToPx
        const a4HeightPx = a4HeightMM * mmToPx
        
        // Устанавливаем размеры документа в мм (A4)
        docxWrapper.style.width = `${a4WidthMM}mm`
        docxWrapper.style.minHeight = `${a4HeightMM}mm`
        docxWrapper.style.height = 'auto'
        
        // Ждем рендеринга и получаем реальные размеры
        setTimeout(() => {
          const docxRect = docxWrapper.getBoundingClientRect()
          const docxWidth = docxRect.width || a4WidthPx
          const docxHeight = docxRect.height || a4HeightPx
          
          // Вычисляем масштаб для помещения документа в доступное пространство
          const scaleX = availableWidth / docxWidth
          const scaleY = availableHeight / docxHeight
          const scale = Math.min(scaleX, scaleY, 1) // Не увеличиваем больше оригинала
          
          // Применяем масштаб
          docxWrapper.style.transform = `scale(${scale})`
          docxWrapper.style.transformOrigin = 'top center'
          
          // Устанавливаем размеры контейнера для правильного отображения
          const scaledWidth = docxWidth * scale
          const scaledHeight = docxHeight * scale
          container.style.width = `${scaledWidth}px`
          container.style.height = `${scaledHeight}px`
          container.style.maxWidth = '100%'
          container.style.maxHeight = '100%'
        }, 100)
      } else if (fileType === 'pptx') {
        // Для PPTX: масштабируем каждый слайд под контейнер 16:9
        const slides = container.querySelectorAll('.slide-container') as NodeListOf<HTMLElement>
        if (slides.length === 0) return
        
        // 16:9 пропорции
        const slideRatio = 16 / 9
        const containerRatio = availableWidth / availableHeight
        
        slides.forEach((slide) => {
          let scale: number
          if (containerRatio > slideRatio) {
            // Контейнер шире - масштабируем по высоте
            scale = availableHeight / 540
          } else {
            // Контейнер выше - масштабируем по ширине
            scale = availableWidth / 960
          }
          
          // Не увеличиваем больше оригинала
          scale = Math.min(scale, 1)
          
          slide.style.transform = `scale(${scale})`
          slide.style.transformOrigin = 'center top'
          slide.style.width = '960px'
          slide.style.height = '540px'
        })
      }
    }
    
    // Масштабируем после загрузки контента (несколько попыток для надежности)
    const timeoutId1 = setTimeout(scaleToFit, 100)
    const timeoutId2 = setTimeout(scaleToFit, 300)
    const timeoutId3 = setTimeout(scaleToFit, 500)
    
    // Масштабируем при изменении размера окна
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(scaleToFit, 100)
    })
    resizeObserver.observe(container)
    
    return () => {
      clearTimeout(timeoutId1)
      clearTimeout(timeoutId2)
      clearTimeout(timeoutId3)
      resizeObserver.disconnect()
    }
  }, [previewContent, fileType])

  const processFilePreview = async (file: File) => {
    setPreviewLoading(true)
    setPreviewError(null)
    setPreviewContent('')
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    try {
      if (fileExtension === '.docx') {
        // Загружаем mammoth.js если еще не загружен
        if (!mammoth) {
          const mammothModule = await import('mammoth')
          mammoth = mammothModule.default
        }
        
        const arrayBuffer = await file.arrayBuffer()
        
        // Конвертируем с поддержкой изображений
        const result = await mammoth.convertToHtml(
          { arrayBuffer },
          {
            convertImage: mammoth.images.imgElement((image: { read: (format: string) => Promise<unknown>; contentType: string }) => {
              return image.read('base64').then((imageBuffer: any) => {
                return {
                  src: `data:${image.contentType};base64,${imageBuffer}`
                }
              })
            })
          }
        )
        
        // Подставляем значения переменных
        let html = result.value
        
        // Добавляем стили, имитирующие документ Word (A4 пропорции) с автоматическим масштабированием
        html = `
          <style>
            * {
              box-sizing: border-box;
            }
            html, body { 
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
            }
            body { 
              font-family: 'Times New Roman', 'Liberation Serif', serif;
              line-height: 1.5;
              color: #000;
              background: white;
              display: block;
            }
            .docx-wrapper {
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              padding: 25.4mm 31.7mm;
              background: white;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              transform-origin: top center;
              overflow: visible;
              box-sizing: border-box;
              display: block;
            }
            @media screen and (max-width: 768px) {
              .docx-wrapper {
                width: 100%;
                padding: 15mm 20mm;
              }
            }
            h1, h2, h3, h4, h5, h6 {
              margin-top: 1.5em;
              margin-bottom: 0.5em;
              font-weight: 600;
            }
            p {
              margin: 1em 0;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 1em 0;
            }
            table td, table th {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
            }
            table th {
              background-color: #f5f5f5;
              font-weight: 600;
            }
            img {
              max-width: 100% !important;
              height: auto !important;
              margin: 1em 0;
              display: block;
            }
            .docx-wrapper img {
              width: auto;
              max-width: 100%;
            }
            ul, ol {
              margin: 1em 0;
              padding-left: 2em;
            }
            blockquote {
              border-left: 4px solid #ddd;
              padding-left: 1em;
              margin: 1em 0;
              color: #666;
            }
            code {
              background-color: #f5f5f5;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
            }
            pre {
              background-color: #f5f5f5;
              padding: 1em;
              border-radius: 4px;
              overflow-x: auto;
            }
          </style>
          <div class="docx-wrapper">
            ${html}
          </div>
        `
        
        variables.forEach(variable => {
          const regex = new RegExp(variable.key.replace(/[{}]/g, '\\$&'), 'g')
          html = html.replace(regex, `<span style="background-color: #fff3cd; padding: 2px 4px; border-radius: 3px; font-weight: 500;">${variable.value}</span>`)
        })
        
        setPreviewContent(html)
      } else if (fileExtension === '.pptx') {
        try {
          // Используем JSZip для парсинга PPTX (PPTX это zip архив с XML файлами)
          const JSZip = (await import('jszip')).default
          const arrayBuffer = await file.arrayBuffer()
          const zip = await JSZip.loadAsync(arrayBuffer)
          
          // Создаем карту изображений (relationship ID -> base64)
          const imageMap = new Map<string, string>()
          const mediaFiles = Object.keys(zip.files).filter(name => 
            name.startsWith('ppt/media/') && 
            (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.gif'))
          )
          
          for (const mediaFile of mediaFiles) {
            try {
              const imageBlob = await zip.files[mediaFile].async('blob')
              const reader = new FileReader()
              const base64 = await new Promise<string>((resolve) => {
                reader.onloadend = () => {
                  const result = reader.result as string
                  resolve(result)
                }
                reader.readAsDataURL(imageBlob)
              })
              const fileName = mediaFile.split('/').pop() || ''
              imageMap.set(fileName, base64)
            } catch (e) {
              console.warn(`Не удалось загрузить изображение ${mediaFile}`)
            }
          }
          
          // Извлекаем содержимое слайдов
          const slideFiles = Object.keys(zip.files)
            .filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))
            .sort((a, b) => {
              const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0')
              const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0')
              return numA - numB
            })
          
          let           htmlContent = `
            <style>
              * {
                box-sizing: border-box;
              }
              body {
                background: #f0f0f0;
                padding: 0;
                margin: 0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                overflow: visible;
              }
              .slides-wrapper {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                padding: 20px;
                gap: 20px;
              }
              .slide-container {
                width: 960px;
                height: 540px;
                padding: 40px 60px;
                border: 1px solid #ddd;
                border-radius: 8px;
                background: white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                position: relative;
                aspect-ratio: 16/9;
                max-width: 100%;
                max-height: 100%;
                transform-origin: center top;
                flex-shrink: 0;
              }
              @media screen and (max-width: 1200px) {
                .slide-container {
                  width: 100%;
                  max-width: 960px;
                  height: auto;
                  aspect-ratio: 16/9;
                }
              }
              @media screen and (max-width: 768px) {
                .slide-container {
                  padding: 20px 30px;
                }
              }
              .slide-number {
                font-size: 12px;
                color: #999;
                margin-bottom: 20px;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .slide-content {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              }
              .slide-content p {
                margin: 12px 0;
                line-height: 1.6;
              }
              .slide-content h1, .slide-content h2, .slide-content h3 {
                margin: 20px 0 12px 0;
                font-weight: 600;
              }
              .slide-content table {
                border-collapse: collapse;
                width: 100%;
                margin: 16px 0;
              }
              .slide-content table td, .slide-content table th {
                border: 1px solid #ddd;
                padding: 8px 12px;
                text-align: left;
              }
              .slide-content table th {
                background-color: #f5f5f5;
                font-weight: 600;
              }
              .slide-content img {
                max-width: 100%;
                height: auto;
                margin: 16px 0;
                border-radius: 4px;
              }
              .slide-content ul, .slide-content ol {
                margin: 12px 0;
                padding-left: 2em;
              }
            </style>
            <div style="padding: 20px; background: #f5f5f5; min-height: 100vh;">
          `
          
          for (let i = 0; i < Math.min(slideFiles.length, 50); i++) {
            const slideFile = slideFiles[i]
            const content = await zip.files[slideFile].async('string')
            
            // Парсим XML
            const parser = new DOMParser()
            const xmlDoc = parser.parseFromString(content, 'text/xml')
            
            htmlContent += `<div class="slide-container">`
            htmlContent += `<div class="slide-number">Слайд ${i + 1} из ${slideFiles.length}</div>`
            htmlContent += `<div class="slide-content">`
            
            // Извлекаем изображения через relationships
            try {
              const slideFileName = slideFile.split('/').pop() || ''
              const relFile = `ppt/slides/_rels/${slideFileName}.rels`
              
              if (zip.files[relFile]) {
                const relContent = await zip.files[relFile].async('string')
                const relDoc = parser.parseFromString(relContent, 'text/xml')
                const relationships = relDoc.getElementsByTagName('Relationship')
                
                // Создаем карту relationship ID -> имя файла
                const relMap = new Map<string, string>()
                for (let r = 0; r < relationships.length; r++) {
                  const rel = relationships[r]
                  const id = rel.getAttribute('Id')
                  const target = rel.getAttribute('Target') || ''
                  if (id && target) {
                    // Преобразуем относительный путь в абсолютный
                    const imagePath = target.startsWith('../') 
                      ? target.replace('../', 'ppt/')
                      : `ppt/slides/${target}`
                    const imageName = imagePath.split('/').pop() || ''
                    relMap.set(id, imageName)
                  }
                }
                
                // Ищем изображения в слайде
                const imageElements = xmlDoc.getElementsByTagName('a:blip')
                for (let imgIdx = 0; imgIdx < imageElements.length; imgIdx++) {
                  const imgEl = imageElements[imgIdx]
                  const embed = imgEl.getAttribute('r:embed')
                  if (embed) {
                    const imageName = relMap.get(embed)
                    if (imageName) {
                      const base64 = imageMap.get(imageName)
                      if (base64) {
                        htmlContent += `<img src="${base64}" alt="Изображение" style="max-width: 100%; height: auto; margin: 16px 0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />`
                      }
                    }
                  }
                }
              }
            } catch (e) {
              console.warn('Ошибка при обработке изображений:', e)
            }
            
            // Извлекаем текст с форматированием по параграфам
            const paragraphs = xmlDoc.getElementsByTagName('a:p')
            for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
              const paragraph = paragraphs[pIdx]
              const textRuns = paragraph.getElementsByTagName('a:r')
              
              if (textRuns.length === 0) {
                // Пустой параграф - добавляем отступ
                htmlContent += '<p style="margin: 8px 0;">&nbsp;</p>'
                continue
              }
              
              let paragraphContent = ''
              
              for (let r = 0; r < textRuns.length; r++) {
                const run = textRuns[r]
                const textNode = run.getElementsByTagName('a:t')[0]
                if (textNode) {
                  let text = textNode.textContent || ''
                  
                  // Проверяем форматирование
                  const rPr = run.getElementsByTagName('a:rPr')[0]
                  let formattedText = text
                  
                  if (rPr) {
                    const isBold = rPr.getAttribute('b') === '1'
                    const isItalic = rPr.getAttribute('i') === '1'
                    const fontSize = rPr.getAttribute('sz') ? parseInt(rPr.getAttribute('sz')!) / 100 : null
                    const color = rPr.getElementsByTagName('a:solidFill')[0]?.getElementsByTagName('a:srgbClr')[0]?.getAttribute('val')
                    
                    if (isBold) formattedText = `<strong>${formattedText}</strong>`
                    if (isItalic) formattedText = `<em>${formattedText}</em>`
                    if (fontSize) {
                      formattedText = `<span style="font-size: ${fontSize}pt;">${formattedText}</span>`
                    }
                    if (color) {
                      formattedText = `<span style="color: #${color};">${formattedText}</span>`
                    }
                  }
                  
                  paragraphContent += formattedText
                }
              }
              
              // Проверяем, является ли параграф заголовком (по размеру шрифта или стилю)
              const firstRun = textRuns[0]
              let isHeading = false
              let headingLevel = 3
              if (firstRun) {
                const rPr = firstRun.getElementsByTagName('a:rPr')[0]
                if (rPr) {
                  const fontSize = rPr.getAttribute('sz') ? parseInt(rPr.getAttribute('sz')!) / 100 : null
                  if (fontSize && fontSize > 24) {
                    isHeading = true
                    headingLevel = fontSize > 36 ? 1 : fontSize > 28 ? 2 : 3
                  }
                }
              }
              
              // Подставляем переменные
              variables.forEach(variable => {
                const regex = new RegExp(variable.key.replace(/[{}]/g, '\\$&'), 'g')
                paragraphContent = paragraphContent.replace(regex, `<span style="background-color: #fff3cd; padding: 2px 4px; border-radius: 3px; font-weight: 500;">${variable.value}</span>`)
              })
              
              if (paragraphContent.trim()) {
                if (isHeading) {
                  htmlContent += `<h${headingLevel} style="margin: 20px 0 12px 0; font-weight: 600;">${paragraphContent}</h${headingLevel}>`
                } else {
                  htmlContent += `<p style="margin: 12px 0; line-height: 1.6;">${paragraphContent}</p>`
                }
              }
            }
            
            // Извлекаем таблицы
            const tables = xmlDoc.getElementsByTagName('a:tbl')
            for (let t = 0; t < tables.length; t++) {
              const table = tables[t]
              htmlContent += '<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">'
              
              const rows = table.getElementsByTagName('a:tr')
              for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
                const row = rows[rowIdx]
                const isHeader = rowIdx === 0
                htmlContent += `<tr>`
                
                const cells = row.getElementsByTagName('a:tc')
                for (let c = 0; c < cells.length; c++) {
                  const cell = cells[c]
                  const cellTexts = cell.getElementsByTagName('a:t')
                  let cellContent = ''
                  for (let ct = 0; ct < cellTexts.length; ct++) {
                    cellContent += cellTexts[ct].textContent || ''
                  }
                  
                  // Подставляем переменные в ячейках
                  variables.forEach(variable => {
                    const regex = new RegExp(variable.key.replace(/[{}]/g, '\\$&'), 'g')
                    cellContent = cellContent.replace(regex, `<span style="background-color: #fff3cd; padding: 2px 4px; border-radius: 3px;">${variable.value}</span>`)
                  })
                  
                  const tag = isHeader ? 'th' : 'td'
                  htmlContent += `<${tag} style="border: 1px solid #ddd; padding: 8px 12px;">${cellContent || '&nbsp;'}</${tag}>`
                }
                htmlContent += `</tr>`
              }
              htmlContent += '</table>'
            }
            
            htmlContent += `</div></div>`
          }
          
          if (slideFiles.length === 0) {
            htmlContent += '<div class="slide-container"><p style="color: #666;">Не удалось найти слайды в файле</p></div>'
          }
          
            htmlContent = `<div class="slides-wrapper">${htmlContent}</div>`
          setPreviewContent(htmlContent)
        } catch (error: any) {
          console.error('Ошибка при обработке PPTX:', error)
          setPreviewError(`Ошибка при обработке PPTX файла: ${error.message || 'Не удалось обработать файл'}`)
        }
      } else if (fileExtension === '.figma') {
        setPreviewContent('')
        setPreviewError('Для предпросмотра Figma файлов требуется обработка на сервере.')
      }
    } catch (error: any) {
      console.error('Ошибка при обработке файла:', error)
      setPreviewError(`Ошибка при обработке файла: ${error.message || 'Неизвестная ошибка'}`)
    } finally {
      setPreviewLoading(false)
    }
  }

  const validateAndSetFile = async (file: File) => {
    const allowedTypes = ['.docx', '.pptx', '.figma']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (allowedTypes.includes(fileExtension)) {
      setTemplateFile(file)
      setFileType(fileExtension.replace('.', '') as 'docx' | 'pptx' | 'figma')
      await processFilePreview(file)
      // На мобильных открываем предпросмотр в модальном окне
      if (isMobile) {
        setIsMobilePreviewOpen(true)
      }
      // Здесь можно добавить логику для извлечения переменных из файла
      // Например, парсинг docx/pptx для поиска {variable_name}
    } else {
      alert('Поддерживаются только файлы: .docx, .pptx, .figma')
    }
  }
  
  // Обновляем предпросмотр при изменении переменных
  useEffect(() => {
    if (templateFile && previewContent && !previewError) {
      processFilePreview(templateFile)
    }
  }, [variables])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
      e.target.value = ''
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      validateAndSetFile(files[0])
    }
  }

  const handleAddVariable = () => {
    if (selectedVariableKey && newVariableValue.trim()) {
      const variableOption = AVAILABLE_VARIABLES.find(v => v.key === selectedVariableKey)
      if (variableOption) {
        // Проверяем, не добавлена ли уже эта переменная
        const exists = variables.find(v => v.key === selectedVariableKey)
        if (!exists) {
          setVariables([...variables, {
            key: selectedVariableKey,
            value: newVariableValue.trim(),
            category: variableOption.category,
            label: variableOption.label
          }])
          setSelectedVariableKey('')
          setNewVariableValue('')
        } else {
          alert('Эта переменная уже добавлена')
        }
      }
    }
  }

  const handleDeleteVariable = (index: number) => {
    toast.showWarning('Удалить переменную?', 'Вы уверены, что хотите удалить эту переменную?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: () => setVariables(prev => prev.filter((_, i) => i !== index)), variant: 'solid', color: 'red' },
      ],
    })
  }

  const handleVariableChange = (index: number, newValue: string) => {
    const updated = [...variables]
    updated[index] = { ...updated[index], value: newValue }
    setVariables(updated)
  }
  
  const handleVariableKeyChange = (index: number, newKey: string) => {
    // Проверяем формат переменной (должна быть в фигурных скобках)
    let formattedKey = newKey.trim()
    if (!formattedKey.startsWith('{')) {
      formattedKey = `{${formattedKey}`
    }
    if (!formattedKey.endsWith('}')) {
      formattedKey = `${formattedKey}}`
    }
    
    // Проверяем на уникальность
    const isDuplicate = variables.some((v, i) => i !== index && v.key === formattedKey)
    if (isDuplicate) {
      alert('Переменная с таким именем уже существует')
      return
    }
    
    // Проверяем, не совпадает ли с предопределенными переменными
    const isPredefined = AVAILABLE_VARIABLES.some(v => v.key === formattedKey)
    if (isPredefined) {
      const existingVar = variables.find(v => v.key === formattedKey)
      if (existingVar && variables.indexOf(existingVar) !== index) {
        alert('Переменная с таким именем уже существует в списке')
        return
      }
    }
    
    const updated = [...variables]
    updated[index] = { ...updated[index], key: formattedKey }
    setVariables(updated)
  }
  
  // Получаем доступные переменные, которые еще не добавлены
  const getAvailableVariablesForSelect = () => {
    const addedKeys = new Set(variables.map(v => v.key))
    return AVAILABLE_VARIABLES.filter(v => !addedKeys.has(v.key))
  }
  
  // Группируем переменные по категориям для отображения
  const getVariablesByCategory = () => {
    const grouped: { [key: string]: Variable[] } = {}
    variables.forEach(v => {
      if (!grouped[v.category]) {
        grouped[v.category] = []
      }
      grouped[v.category].push(v)
    })
    return grouped
  }

  return (
    <AppLayout pageTitle="Шаблон оффера">
      <Box className={styles.container}>
        <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
          Шаблон оффера
        </Text>

        <Flex direction="column" gap="4">
          {/* Загрузка файла */}
          <Card>
            <Flex direction="column" gap="3">
              <Text size="4" weight="bold">Загрузка шаблона</Text>
              <Separator size="4" />
              
              <Box>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Файл шаблона (docx, pptx, figma)
                </Text>
                <Box
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    border: isDragging ? '2px dashed var(--accent-9)' : '2px dashed var(--gray-a6)',
                    borderRadius: '8px',
                    padding: '32px',
                    textAlign: 'center',
                    backgroundColor: isDragging ? 'var(--accent-2)' : 'var(--gray-2)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.docx,.pptx,.figma'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        validateAndSetFile(file)
                      }
                    }
                    input.click()
                  }}
                >
                  {templateFile ? (
                    <Flex direction="column" gap="2" align="center">
                      <FileTextIcon width={48} height={48} style={{ color: 'var(--accent-9)' }} />
                      <Text size="3" weight="medium">{templateFile.name}</Text>
                      <Text size="1" color="gray">
                        {(templateFile.size / 1024).toFixed(2)} KB
                      </Text>
                      <Button
                        size="2"
                        variant="soft"
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation()
                          toast.showWarning('Удалить файл?', 'Вы уверены, что хотите удалить загруженный файл?', {
                            actions: [
                              { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
                              { label: 'Удалить', onClick: () => setTemplateFile(null), variant: 'solid', color: 'red' },
                            ],
                          })
                        }}
                        mt="2"
                      >
                        Удалить файл
                      </Button>
                      <Text size="1" color="gray" mt="2">
                        Нажмите или перетащите другой файл для замены
                      </Text>
                    </Flex>
                  ) : (
                    <Flex direction="column" gap="2" align="center">
                      <UploadIcon width={48} height={48} style={{ color: 'var(--gray-9)' }} />
                      <Text size="3" weight="medium">
                        Перетащите файл сюда или нажмите для выбора
                      </Text>
                      <Text size="2" color="gray">
                        Поддерживаются форматы: .docx, .pptx, .figma
                      </Text>
                    </Flex>
                  )}
                </Box>
                <Text size="1" color="gray" mt="2" style={{ display: 'block' }}>
                  В файле используйте переменные в фигурных скобках, например: {'{company_name}'}, {'{candidate_name}'}, {'{salary_before_tax}'}, {'{start_date}'}
                </Text>
              </Box>
            </Flex>
          </Card>

          {/* Предпросмотр и настройка переменных */}
          <Flex 
            direction={isMobile ? "column" : "row"} 
            gap="4" 
            style={{ alignItems: 'flex-start' }}
          >
            {/* Предпросмотр документа */}
            <Card style={{ 
              flex: isMobile ? '1' : '2.5', 
              minWidth: isMobile ? '100%' : '60%',
              maxWidth: isMobile ? '100%' : 'none',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Flex direction="column" gap="3">
                <Flex align="center" justify="between">
                  <Text size="4" weight="bold">Предпросмотр</Text>
                  {isMobile && templateFile && previewContent && (
                    <Button
                      variant="soft"
                      size="2"
                      onClick={() => setIsMobilePreviewOpen(true)}
                    >
                      Открыть в полном экране
                    </Button>
                  )}
                </Flex>
                <Separator size="4" />
                
                {templateFile ? (
                  <Box style={{ 
                    minHeight: '400px', 
                    border: '1px solid var(--gray-a6)', 
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: 'var(--gray-2)',
                    overflow: 'auto'
                  }}>
                    {previewLoading ? (
                      <Flex direction="column" gap="2" align="center" justify="center" style={{ height: '100%', minHeight: '400px' }}>
                        <Text size="3" color="gray">
                          Загрузка предпросмотра...
                        </Text>
                      </Flex>
                    ) : previewError ? (
                      <Flex direction="column" gap="2" align="center" justify="center" style={{ height: '100%', minHeight: '400px' }}>
                        <FileTextIcon width={48} height={48} style={{ color: 'var(--gray-9)' }} />
                        <Text size="3" color="gray" weight="medium">
                          {templateFile.name}
                        </Text>
                        <Text size="2" color="orange" style={{ textAlign: 'center', maxWidth: '400px' }}>
                          {previewError}
                        </Text>
                        <Button
                          variant="soft"
                          onClick={() => {
                            const url = URL.createObjectURL(templateFile)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = templateFile.name
                            a.click()
                            URL.revokeObjectURL(url)
                          }}
                        >
                          <DownloadIcon width={16} height={16} />
                          Скачать файл
                        </Button>
                      </Flex>
                    ) : previewContent ? (
                      <Box
                        ref={previewContainerRef}
                        style={{
                          backgroundColor: fileType === 'docx' ? 'white' : '#f0f0f0',
                          width: '100%',
                          maxWidth: '100%',
                          height: isMobile ? '60vh' : '80vh',
                          minHeight: '400px',
                          overflow: 'auto',
                          borderRadius: '4px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'flex-start',
                          padding: '20px',
                          position: 'relative',
                          margin: '0 auto'
                        }}
                      >
                        <div
                          dangerouslySetInnerHTML={{ __html: previewContent }}
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: fileType === 'pptx' ? 'flex-start' : 'center',
                            overflow: 'auto'
                          }}
                        />
                      </Box>
                    ) : (
                      <Flex direction="column" gap="2" align="center" justify="center" style={{ height: '100%', minHeight: '400px' }}>
                        <FileTextIcon width={48} height={48} style={{ color: 'var(--gray-9)' }} />
                        <Text size="3" color="gray" weight="medium">
                          {templateFile.name}
                        </Text>
                        <Text size="2" color="gray">
                          Предпросмотр загружается...
                        </Text>
                      </Flex>
                    )}
                  </Box>
                ) : (
                  <Box style={{ 
                    minHeight: '400px', 
                    border: '1px dashed var(--gray-a6)', 
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--gray-2)'
                  }}>
                    <Text size="2" color="gray">
                      Загрузите файл шаблона для предпросмотра
                    </Text>
                  </Box>
                )}
              </Flex>
            </Card>

            {/* Настройка переменных */}
            <Card style={{ flex: isMobile ? '1' : '1', minWidth: isMobile ? '100%' : '350px', maxWidth: isMobile ? '100%' : '400px' }}>
                    <Flex direction="column" gap="3">
                      <Text size="4" weight="bold">Настройка переменных</Text>
                      <Separator size="4" />
                      
                      <Text size="2" color="gray" mb="2">
                        Настройте примеры значений для переменных в шаблоне. Эти значения будут использоваться для предпросмотра.
                      </Text>

                      {/* Список существующих переменных по категориям */}
                      <Flex direction="column" gap="3">
                        {Object.entries(getVariablesByCategory()).map(([category, categoryVariables]) => (
                          <Box key={category}>
                            <Text size="2" weight="bold" mb="2" style={{ display: 'block', color: 'var(--gray-11)' }}>
                              {category}
                            </Text>
                            <Flex direction="column" gap="2">
                              {categoryVariables.map((variable, index) => {
                                const globalIndex = variables.findIndex(v => v.key === variable.key)
                                return (
                                  <Box
                                    key={variable.key}
                                    style={{
                                      padding: '12px',
                                      border: '1px solid var(--gray-a6)',
                                      borderRadius: '6px',
                                      backgroundColor: 'var(--gray-2)'
                                    }}
                                  >
                                    <Flex direction="column" gap="2">
                                      <Flex align="center" justify="between">
                                        <Flex direction="column" gap="1" style={{ flex: 1 }}>
                                          <TextField.Root
                                            size="1"
                                            value={variable.key}
                                            onChange={(e) => handleVariableKeyChange(globalIndex, e.target.value)}
                                            placeholder="{variable_name}"
                                            style={{ fontFamily: 'monospace' }}
                                          />
                                          <Text size="1" color="gray">
                                            {variable.label}
                                          </Text>
                                        </Flex>
                                        <Button
                                          size="1"
                                          variant="soft"
                                          color="red"
                                          onClick={() => handleDeleteVariable(globalIndex)}
                                          ml="2"
                                        >
                                          Удалить
                                        </Button>
                                      </Flex>
                                      <TextField.Root
                                        size="2"
                                        value={variable.value}
                                        onChange={(e) => handleVariableChange(globalIndex, e.target.value)}
                                        placeholder="Значение переменной"
                                      />
                                    </Flex>
                                  </Box>
                                )
                              })}
                            </Flex>
                          </Box>
                        ))}
                        
                        {variables.length === 0 && (
                          <Text size="2" color="gray" style={{ textAlign: 'center', padding: '20px' }}>
                            Нет добавленных переменных. Добавьте переменные из списка ниже.
                          </Text>
                        )}
                      </Flex>

                      <Separator size="4" />

                      {/* Добавление новой переменной */}
                      <Box>
                        <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                          Добавить переменную
                        </Text>
                        <Flex direction="column" gap="2">
                          <Box>
                            <Text size="1" weight="medium" mb="1" style={{ display: 'block' }}>
                              Выберите переменную
                            </Text>
                            <Select.Root
                              value={selectedVariableKey}
                              onValueChange={(value) => {
                                setSelectedVariableKey(value)
                                const option = AVAILABLE_VARIABLES.find(v => v.key === value)
                                if (option) {
                                  setNewVariableValue(option.defaultValue)
                                }
                              }}
                            >
                              <Select.Trigger placeholder="Выберите переменную..." />
                              <Select.Content>
                                {Object.entries(
                                  getAvailableVariablesForSelect().reduce((acc, v) => {
                                    if (!acc[v.category]) acc[v.category] = []
                                    acc[v.category].push(v)
                                    return acc
                                  }, {} as { [key: string]: VariableOption[] })
                                ).map(([category, options]) => (
                                  <Select.Group key={category}>
                                    <Select.Label>{category}</Select.Label>
                                    {options.map(option => (
                                      <Select.Item key={option.key} value={option.key}>
                                        {option.label} ({option.key})
                                      </Select.Item>
                                    ))}
                                  </Select.Group>
                                ))}
                              </Select.Content>
                            </Select.Root>
                          </Box>
                          <Box>
                            <Text size="1" weight="medium" mb="1" style={{ display: 'block' }}>
                              Пример значения
                            </Text>
                            <TextField.Root
                              size="2"
                              value={newVariableValue}
                              onChange={(e) => setNewVariableValue(e.target.value)}
                              placeholder="Введите пример значения"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && selectedVariableKey && newVariableValue.trim()) {
                                  handleAddVariable()
                                }
                              }}
                            />
                          </Box>
                          <Button
                            variant="soft"
                            onClick={handleAddVariable}
                            disabled={!selectedVariableKey || !newVariableValue.trim()}
                          >
                            Добавить переменную
                          </Button>
                        </Flex>
                      </Box>
                    </Flex>
                  </Card>
          </Flex>

          {/* Кнопки сохранения */}
          <Flex gap="3" justify="end">
            <Button variant="soft">
              Отмена
            </Button>
            <Button variant="solid" disabled={!templateFile}>
              Сохранить шаблон
          </Button>
        </Flex>
      </Flex>
      
      {/* Модальное окно предпросмотра для мобильных */}
      <Dialog.Root open={isMobilePreviewOpen} onOpenChange={setIsMobilePreviewOpen}>
        <Dialog.Content 
          style={{ 
            maxWidth: '100vw',
            maxHeight: '100vh',
            width: '100%',
            height: '100%',
            padding: '0'
          }}
        >
          <Dialog.Title style={{ padding: '16px', borderBottom: '1px solid var(--gray-a6)' }}>
            <Flex align="center" justify="between">
              <Text>Предпросмотр</Text>
              <Button
                variant="ghost"
                size="2"
                onClick={() => setIsMobilePreviewOpen(false)}
              >
                Закрыть
              </Button>
            </Flex>
          </Dialog.Title>
          
          <Box
            style={{
              padding: '16px',
              height: 'calc(100vh - 120px)',
              overflow: 'hidden',
              backgroundColor: fileType === 'docx' ? 'white' : '#f0f0f0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            {previewLoading ? (
              <Flex direction="column" gap="2" align="center" justify="center" style={{ height: '100%' }}>
                <Text size="3" color="gray">
                  Загрузка предпросмотра...
                </Text>
              </Flex>
            ) : previewError ? (
              <Flex direction="column" gap="2" align="center" justify="center" style={{ height: '100%' }}>
                <FileTextIcon width={48} height={48} style={{ color: 'var(--gray-9)' }} />
                <Text size="3" color="gray" weight="medium">
                  {templateFile?.name}
                </Text>
                <Text size="2" color="orange" style={{ textAlign: 'center', maxWidth: '400px' }}>
                  {previewError}
                </Text>
              </Flex>
            ) : previewContent ? (
              <Box
                ref={previewContainerRef}
                style={{
                  width: '100%',
                  height: '100%',
                  aspectRatio: fileType === 'docx' ? '210/297' : '16/9', // A4 для DOCX, 16:9 для PPTX
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: fileType === 'pptx' ? 'flex-start' : 'center',
                    overflow: 'auto'
                  }}
                />
              </Box>
            ) : null}
          </Box>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  </AppLayout>
)
}
