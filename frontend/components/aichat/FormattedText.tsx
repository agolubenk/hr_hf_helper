/**
 * FormattedText (components/aichat/FormattedText.tsx) - Компонент для отображения форматированного текста
 * 
 * Назначение:
 * - Парсинг и рендеринг markdown-подобного синтаксиса в сообщениях от системы
 * - Поддержка различных форматов текста: жирный, курсив, заголовки, подчеркнутый, зачеркнутый, код
 * 
 * Поддерживаемые форматы:
 * - **текст** или __текст__ - жирный текст
 * - *текст* или _текст_ - курсив
 * - # Заголовок 1, ## Заголовок 2, ### Заголовок 3, #### Заголовок 4, ##### Заголовок 5, ###### Заголовок 6
 * - <u>текст</u> - подчеркнутый текст
 * - ~~текст~~ - зачеркнутый текст
 * - `код` - inline код
 * - ```код``` - блок кода
 * 
 * Функциональность:
 * - Парсит текст построчно
 * - Обрабатывает блоки кода (```)
 * - Обрабатывает заголовки (#)
 * - Обрабатывает inline форматирование (**жирный**, *курсив*, `код`, ~~зачеркнутый~~, <u>подчеркнутый</u>)
 * - Сохраняет переносы строк
 */

'use client'

import { Box, Text, Button, Separator } from "@radix-ui/themes"
import { ReactNode, useState, useMemo } from "react"
import { CopyIcon, CheckIcon } from "@radix-ui/react-icons"
import styles from './FormattedText.module.css'

interface FormattedTextProps {
  content: string
  disableHeadings?: boolean // Отключить заголовки (для Telegram сообщений)
}

/**
 * Token - интерфейс токена для парсинга
 */
interface Token {
  type: 'text' | 'bold' | 'italic' | 'boldItalic' | 'code' | 'strikethrough' | 'underline' | 'heading' | 'codeBlock' | 'lineBreak' | 'quote' | 'link'
  content: string
  level?: number // Для заголовков (1-6)
  url?: string // Для ссылок
}

/**
 * parseFormattedText - парсинг текста с markdown-подобным синтаксисом
 * 
 * Функциональность:
 * - Разбивает текст на токены
 * - Обрабатывает блоки кода, заголовки, inline форматирование
 * 
 * @param text - текст для парсинга
 * @param disableHeadings - отключить обработку заголовков
 * @returns массив токенов
 */
function parseFormattedText(text: string, disableHeadings: boolean = false): Token[] {
  const tokens: Token[] = []
  
  // Обработка блоков кода (```) - приоритет выше всего
  const codeBlockRegex = /```([\s\S]*?)```/g
  const codeBlockMatches = Array.from(text.matchAll(codeBlockRegex))
  
  if (codeBlockMatches.length > 0) {
    let lastIndex = 0
    for (const match of codeBlockMatches) {
      // Добавляем текст до блока кода
      if (match.index! > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index!)
        tokens.push(...parseTextWithHeadings(beforeText, disableHeadings))
      }
      // Добавляем блок кода
      tokens.push({
        type: 'codeBlock',
        content: match[1]
      })
      lastIndex = match.index! + match[0].length
    }
    // Добавляем оставшийся текст
    if (lastIndex < text.length) {
      const afterText = text.substring(lastIndex)
      tokens.push(...parseTextWithHeadings(afterText, disableHeadings))
    }
    return tokens
  }

  // Обработка обычного текста с заголовками и inline форматированием
  return parseTextWithHeadings(text, disableHeadings)
}

/**
 * parseTextWithHeadings - парсинг текста с заголовками и цитатами
 * 
 * Функциональность:
 * - Обрабатывает заголовки (#) если не отключены
 * - Обрабатывает цитаты (>)
 * - Обрабатывает обычный текст с inline форматированием
 * 
 * @param text - текст для парсинга
 * @param disableHeadings - отключить обработку заголовков
 * @returns массив токенов
 */
function parseTextWithHeadings(text: string, disableHeadings: boolean = false): Token[] {
  const tokens: Token[] = []
  const lines = text.split('\n')
  
  let quoteLines: string[] = []
  
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]
    
    // Проверка на заголовок (только если не отключены)
    const headingMatch = !disableHeadings && line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      // Если были накоплены строки цитаты, добавляем их
      if (quoteLines.length > 0) {
        tokens.push({
          type: 'quote',
          content: quoteLines.join('\n')
        })
        quoteLines = []
      }
      tokens.push({
        type: 'heading',
        level: headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        content: headingMatch[2]
      })
    } 
    // Проверка на цитату (> в начале строки)
    else if (line.trim().startsWith('>')) {
      // Убираем > и пробел после него
      const quoteContent = line.replace(/^>\s?/, '')
      quoteLines.push(quoteContent)
    } 
    else {
      // Если были накоплены строки цитаты, добавляем их
      if (quoteLines.length > 0) {
        tokens.push({
          type: 'quote',
          content: quoteLines.join('\n')
        })
        quoteLines = []
      }
      
      // Обычная строка с inline форматированием (или пустая строка)
      if (line.trim() || lineIndex < lines.length - 1) {
        if (line.trim()) {
          tokens.push(...parseInlineFormatting(line))
        }
      }
    }
    
    // Добавляем перенос строки (кроме последней строки)
    if (lineIndex < lines.length - 1) {
      tokens.push({
        type: 'lineBreak',
        content: '\n'
      })
    }
  }
  
  // Если остались строки цитаты в конце, добавляем их
  if (quoteLines.length > 0) {
    tokens.push({
      type: 'quote',
      content: quoteLines.join('\n')
    })
  }

  return tokens
}

/**
 * parseInlineFormatting - парсинг inline форматирования
 * 
 * Функциональность:
 * - Обрабатывает жирный, курсив, код, зачеркнутый, подчеркнутый текст
 * - Рекурсивно обрабатывает вложенное форматирование
 * 
 * @param text - текст для парсинга
 * @returns массив токенов
 */
function parseInlineFormatting(text: string): Token[] {
  if (!text) return []
  
  const tokens: Token[] = []
  let remainingText = text
  let processed = false

  // Ссылки [текст](url) - приоритет 1
  const linkMatch = remainingText.match(/\[([^\]]+)\]\(([^)]+)\)/)
  if (linkMatch) {
    processed = true
    const before = remainingText.substring(0, linkMatch.index!)
    const after = remainingText.substring(linkMatch.index! + linkMatch[0].length)
    
    if (before) tokens.push(...parseInlineFormatting(before))
    tokens.push({ 
      type: 'link', 
      content: linkMatch[1], 
      url: linkMatch[2] 
    })
    if (after) tokens.push(...parseInlineFormatting(after))
    return tokens
  }

  // Подчеркнутый текст (<u>...</u>) - приоритет 2
  const underlineMatch = remainingText.match(/<u>(.*?)<\/u>/)
  if (underlineMatch) {
    processed = true
    const before = remainingText.substring(0, underlineMatch.index!)
    const after = remainingText.substring(underlineMatch.index! + underlineMatch[0].length)
    
    if (before) tokens.push(...parseInlineFormatting(before))
    tokens.push({ type: 'underline', content: underlineMatch[1] })
    if (after) tokens.push(...parseInlineFormatting(after))
    return tokens
  }

  // Зачеркнутый текст (~~...~~) - приоритет 3
  const strikethroughMatch = remainingText.match(/~~(.*?)~~/)
  if (strikethroughMatch) {
    processed = true
    const before = remainingText.substring(0, strikethroughMatch.index!)
    const after = remainingText.substring(strikethroughMatch.index! + strikethroughMatch[0].length)
    
    if (before) tokens.push(...parseInlineFormatting(before))
    tokens.push({ type: 'strikethrough', content: strikethroughMatch[1] })
    if (after) tokens.push(...parseInlineFormatting(after))
    return tokens
  }

  // Inline код (`...`) - приоритет 4
  const codeMatch = remainingText.match(/`([^`]+)`/)
  if (codeMatch) {
    processed = true
    const before = remainingText.substring(0, codeMatch.index!)
    const after = remainingText.substring(codeMatch.index! + codeMatch[0].length)
    
    if (before) tokens.push(...parseInlineFormatting(before))
    tokens.push({ type: 'code', content: codeMatch[1] })
    if (after) tokens.push(...parseInlineFormatting(after))
    return tokens
  }

  // Жирный и курсивный вместе (***...*** или ___...___) - приоритет 5
  const boldItalicMatch = remainingText.match(/\*\*\*(.*?)\*\*\*/) || remainingText.match(/___(.*?)___/)
  if (boldItalicMatch) {
    processed = true
    const before = remainingText.substring(0, boldItalicMatch.index!)
    const after = remainingText.substring(boldItalicMatch.index! + boldItalicMatch[0].length)
    
    if (before) tokens.push(...parseInlineFormatting(before))
    tokens.push({ type: 'boldItalic', content: boldItalicMatch[1] })
    if (after) tokens.push(...parseInlineFormatting(after))
    return tokens
  }

  // Жирный текст (**...** или __...__) - приоритет 6
  const boldMatch = remainingText.match(/\*\*(.*?)\*\*/) || remainingText.match(/__(.*?)__/)
  if (boldMatch) {
    processed = true
    const before = remainingText.substring(0, boldMatch.index!)
    const after = remainingText.substring(boldMatch.index! + boldMatch[0].length)
    
    if (before) tokens.push(...parseInlineFormatting(before))
    // Рекурсивно обрабатываем содержимое жирного текста
    tokens.push({ type: 'bold', content: boldMatch[1] })
    if (after) tokens.push(...parseInlineFormatting(after))
    return tokens
  }

  // Курсив (*...* или _..._) - приоритет 7 (только если не часть жирного)
  // Ищем одиночные * или _, которые не являются частью ** или __
  let italicMatch: RegExpMatchArray | null = null
  let italicIndex = -1
  
  // Ищем одиночный * (не **)
  for (let i = 0; i < remainingText.length - 1; i++) {
    if (remainingText[i] === '*' && 
        (i === 0 || remainingText[i - 1] !== '*') &&
        remainingText[i + 1] !== '*') {
      const endIndex = remainingText.indexOf('*', i + 1)
      if (endIndex !== -1 && 
          (endIndex === remainingText.length - 1 || remainingText[endIndex + 1] !== '*')) {
        italicMatch = ['*' + remainingText.substring(i + 1, endIndex) + '*', remainingText.substring(i + 1, endIndex)]
        italicIndex = i
        break
      }
    }
  }
  
  // Если не нашли *, ищем одиночный _ (не __)
  if (!italicMatch) {
    for (let i = 0; i < remainingText.length - 1; i++) {
      if (remainingText[i] === '_' && 
          (i === 0 || remainingText[i - 1] !== '_') &&
          remainingText[i + 1] !== '_') {
        const endIndex = remainingText.indexOf('_', i + 1)
        if (endIndex !== -1 && 
            (endIndex === remainingText.length - 1 || remainingText[endIndex + 1] !== '_')) {
          italicMatch = ['_' + remainingText.substring(i + 1, endIndex) + '_', remainingText.substring(i + 1, endIndex)]
          italicIndex = i
          break
        }
      }
    }
  }
  
  if (italicMatch && italicIndex !== -1) {
    processed = true
    const before = remainingText.substring(0, italicIndex)
    const after = remainingText.substring(italicIndex + italicMatch[0].length)
    
    if (before) tokens.push(...parseInlineFormatting(before))
    tokens.push({ type: 'italic', content: italicMatch[1] })
    if (after) tokens.push(...parseInlineFormatting(after))
    return tokens
  }

  // Если не найдено форматирование, возвращаем как обычный текст
  if (!processed && remainingText) {
    tokens.push({ type: 'text', content: remainingText })
  }

  return tokens
}

/**
 * renderToken - рендеринг токена в React элемент
 * 
 * Функциональность:
 * - Рендерит токен с соответствующим форматированием
 * - Для форматированных токенов рекурсивно обрабатывает содержимое для поддержки вложенного форматирования
 * 
 * @param token - токен для рендеринга
 * @param key - ключ для React
 * @returns React элемент
 */
function renderToken(token: Token, key: number): ReactNode {
  // Функция для рекурсивного рендеринга содержимого
  const renderContent = (content: string): ReactNode => {
    const innerTokens = parseInlineFormatting(content)
    return (
      <>
        {innerTokens.map((innerToken, innerKey) => renderToken(innerToken, innerKey))}
      </>
    )
  }

  switch (token.type) {
    case 'text':
      return <span key={key}>{token.content}</span>
    
    case 'bold':
      return <strong key={key}>{renderContent(token.content)}</strong>
    
    case 'italic':
      return <em key={key}>{renderContent(token.content)}</em>
    
    case 'boldItalic':
      return (
        <strong key={key}>
          <em>{renderContent(token.content)}</em>
        </strong>
      )
    
    case 'code':
      return (
        <code key={key} className={styles.inlineCode}>
          {token.content}
        </code>
      )
    
    case 'strikethrough':
      return <del key={key}>{renderContent(token.content)}</del>
    
    case 'underline':
      return <u key={key}>{renderContent(token.content)}</u>
    
    case 'link':
      return (
        <a 
          key={key} 
          href={token.url} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            color: 'inherit', 
            textDecoration: 'underline',
            textDecorationColor: 'currentColor',
            textDecorationThickness: '1px'
          }}
        >
          {renderContent(token.content)}
        </a>
      )
    
    case 'heading':
      // Размеры заголовков: для чатов делаем более компактными
      const headingSize = token.level === 1 ? '4' : token.level === 2 ? '3' : token.level === 3 ? '2' : '2'
      // Используем нативные HTML теги для заголовков, так как Text компонент не поддерживает as="h1" и т.д.
      const HeadingTag = `h${token.level}` as keyof JSX.IntrinsicElements
      return (
        <HeadingTag
          key={key}
          style={{ 
            display: 'block', 
            marginTop: token.level === 1 ? '12px' : '8px', 
            marginBottom: '6px',
            lineHeight: '1.4',
            fontSize: token.level === 1 ? 'var(--font-size-4)' : token.level === 2 ? 'var(--font-size-3)' : 'var(--font-size-2)',
            fontWeight: 'bold',
            color: 'inherit'
          }}
        >
          {renderContent(token.content)}
        </HeadingTag>
      )
    
    case 'codeBlock':
      return <CodeBlock key={key} content={token.content} />
    
    case 'quote':
      // Для цитаты нужно обработать содержимое построчно, чтобы сохранить переносы строк
      // и применить форматирование к каждой строке
      const quoteLines = token.content.split('\n')
      return (
        <Box 
          key={key}
          className={styles.quote}
          style={{
            marginTop: '12px',
            marginBottom: '12px',
            padding: '12px 16px',
            backgroundColor: 'var(--gray-3)',
            borderRadius: '6px',
            borderLeft: '4px dashed var(--gray-8)',
            color: 'inherit'
          }}
        >
          {quoteLines.map((line, lineIndex) => (
            <Box key={lineIndex} style={{ marginBottom: lineIndex < quoteLines.length - 1 ? '4px' : '0' }}>
              {line.trim() ? renderContent(line) : <br />}
            </Box>
          ))}
        </Box>
      )
    
    case 'lineBreak':
      return <br key={key} />
    
    default:
      return <span key={key}>{token.content}</span>
  }
}

/**
 * CodeBlock - компонент блока кода с кнопкой копирования
 * 
 * Функциональность:
 * - Отображает блок кода
 * - Предоставляет кнопку копирования в правом верхнем углу
 * - Показывает подтверждение после копирования
 * 
 * @param content - содержимое блока кода
 */
function CodeBlock({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  /**
   * handleCopy - обработчик копирования кода
   * 
   * Функциональность:
   * - Копирует содержимое блока кода в буфер обмена
   * - Показывает подтверждение на 2 секунды
   * 
   * Поведение:
   * - Использует Clipboard API для копирования
   * - Устанавливает флаг copied в true на 2 секунды
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Ошибка копирования:', err)
    }
  }

  return (
    <Box 
      className={styles.codeBlock}
      style={{ 
        marginTop: '12px', 
        marginBottom: '12px',
        position: 'relative',
        backgroundColor: 'var(--gray-3)',
        borderRadius: '6px',
        border: '1px solid var(--gray-6)',
        overflowX: 'auto'
      }}
    >
      {/* Кнопка копирования в правом верхнем углу */}
      <Button
        size="1"
        variant="soft"
        color="gray"
        onClick={handleCopy}
        className={styles.copyButton}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          zIndex: 10,
          minWidth: 'auto',
          padding: '4px 8px'
        }}
      >
        {copied ? (
          <>
            <CheckIcon width={14} height={14} />
            <Text size="1" style={{ marginLeft: '4px' }}>Скопировано</Text>
          </>
        ) : (
          <CopyIcon width={14} height={14} />
        )}
      </Button>
      <code style={{ 
        fontFamily: 'monospace', 
        fontSize: '13px',
        whiteSpace: 'pre',
        display: 'block',
        padding: '12px',
        paddingRight: '80px' // Отступ справа для кнопки
      }}>
        {content}
      </code>
    </Box>
  )
}

/**
 * FormattedText - компонент для отображения форматированного текста
 * 
 * Функциональность:
 * - Парсит текст с markdown-подобным синтаксисом
 * - Рендерит форматированный текст
 * - Поддерживает жирный, курсив, комбинацию жирного и курсивного, заголовки, цитаты, код, ссылки
 * 
 * @param content - текст для форматирования
 * @param disableHeadings - отключить обработку заголовков (для Telegram сообщений)
 */
/**
 * LinkPreview - компонент превью ссылки
 */
function LinkPreview({ url }: { url: string }) {
  // Извлекаем домен из URL для отображения
  let domain = url
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    domain = urlObj.hostname.replace(/^www\./, '')
  } catch (e) {
    // Если не удалось распарсить, используем исходный URL
  }

  return (
    <a
      href={url.startsWith('http') ? url : `https://${url}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        width: '100%',
        marginTop: '8px',
        padding: '12px',
        backgroundColor: 'var(--gray-3)',
        borderRadius: '6px',
        border: '1px solid var(--gray-6)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'background-color 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--gray-4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--gray-3)'
      }}
    >
      <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '4px' }}>
        {domain}
      </Text>
      <Text size="1" color="gray" style={{ display: 'block', wordBreak: 'break-all' }}>
        {url.startsWith('http') ? url : `https://${url}`}
      </Text>
    </a>
  )
}

export default function FormattedText({ content, disableHeadings = false }: FormattedTextProps) {
  const tokens = parseFormattedText(content, disableHeadings)
  
  // Собираем все ссылки из токенов для превью
  const links = useMemo(() => {
    const linkUrls: string[] = []
    tokens.forEach(token => {
      if (token.type === 'link' && token.url) {
        // Убираем дубликаты
        if (!linkUrls.includes(token.url)) {
          linkUrls.push(token.url)
        }
      }
    })
    return linkUrls
  }, [tokens])

  return (
    <Box style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
      {tokens.map((token, index) => renderToken(token, index))}
      {/* Превью ссылок через сепаратор */}
      {links.length > 0 && (
        <>
          <Separator style={{ marginTop: '12px', marginBottom: '8px' }} />
          {links.map((url, index) => (
            <LinkPreview key={index} url={url} />
          ))}
        </>
      )}
    </Box>
  )
}
