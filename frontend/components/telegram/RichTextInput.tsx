'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { Box, TextField, Button, Flex, Text } from '@radix-ui/themes'
import { CheckIcon, PlusIcon, MinusIcon } from '@radix-ui/react-icons'
import styles from './RichTextInput.module.css'

interface RichTextInputProps {
  value: string
  onChange: (value: string) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void
  placeholder?: string
  style?: React.CSSProperties
  rows?: number
}

/**
 * RichTextInput - компонент для ввода текста с визуальным отображением форматирования
 * 
 * Функциональность:
 * - Отображает markdown-форматирование визуально (жирный, курсив, подчеркнутый, зачеркнутый)
 * - Поддерживает горячие клавиши для форматирования (Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Shift+X)
 * - Хранит текст в markdown-формате для отправки
 * - Поддерживает многострочный ввод (Shift+Enter для новой строки)
 * 
 * Форматы:
 * - **текст** → жирный
 * - *текст* → курсив
 * - <u>текст</u> → подчеркнутый
 * - ~~текст~~ → зачеркнутый
 */
export default function RichTextInput({
  value,
  onChange,
  onKeyDown,
  placeholder = 'Введите сообщение...',
  style,
  rows = 1
}: RichTextInputProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isComposing, setIsComposing] = useState(false)
  const isUpdatingRef = useRef(false)
  const isUserTypingRef = useRef(false) // Флаг активного ввода пользователя
  const [isLinkTooltipOpen, setIsLinkTooltipOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const savedSelectionRef = useRef<Range | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const linkContextRef = useRef<{ 
    leftText: string
    rightText: string
    leftIndex: number
    rightIndex: number
    originalSelectedText: string
    originalLeftText: string
    originalRightText: string
  } | null>(null)

  /**
   * convertMarkdownToHTML - конвертирует markdown в HTML для визуального отображения
   * 
   * Поддерживаемые форматы:
   * - **текст** → <strong>текст</strong>
   * - *текст* → <em>текст</em>
   * - <u>текст</u> → <u>текст</u>
   * - ~~текст~~ → <del>текст</del>
   * - [текст](url) → <a href="url">текст</a>
   * - > текст → <blockquote>текст</blockquote>
   */
  const convertMarkdownToHTML = useCallback((text: string): string => {
    if (!text) return ''

    // Разбиваем на строки для обработки цитат
    const lines = text.split('\n')
    const processedLines: string[] = []
    let inQuote = false
    let quoteContent: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const isQuoteLine = line.trim().startsWith('> ')

      if (isQuoteLine) {
        // Извлекаем содержимое цитаты (убираем "> ")
        const quoteText = line.replace(/^>\s*/, '')
        quoteContent.push(quoteText)
        inQuote = true
      } else {
        // Если были цитаты, закрываем блок
        if (inQuote && quoteContent.length > 0) {
          const quoteHtml = quoteContent.map(q => {
            let qHtml = q
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
            // Обрабатываем форматирование внутри цитаты
            qHtml = qHtml.replace(/~~([^~]+)~~/g, '<del>$1</del>')
            qHtml = qHtml.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            qHtml = qHtml.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
            qHtml = qHtml.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
            qHtml = qHtml.replace(/&lt;u&gt;([^&]+)&lt;\/u&gt;/g, '<u>$1</u>')
            qHtml = qHtml.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            return qHtml
          }).join('<br>')
          processedLines.push(`<blockquote>${quoteHtml}</blockquote>`)
          quoteContent = []
        }
        inQuote = false

        // Обрабатываем обычную строку
        if (line.trim()) {
          let html = line
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')

          // Обрабатываем зачеркнутый (должен быть до жирного, так как использует ~~)
          html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>')
          
          // Обрабатываем жирный (**текст**)
          html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          
          // Обрабатываем жирный+курсив (***текст***)
          html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
          
          // Обрабатываем курсив (*текст*), но не **текст** или ***текст***
          html = html.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
          
          // Обрабатываем подчеркнутый (<u>текст</u>)
          html = html.replace(/&lt;u&gt;([^&]+)&lt;\/u&gt;/g, '<u>$1</u>')
          
          // Обрабатываем ссылки ([текст](url))
          html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
          
          processedLines.push(html)
        } else {
          // Пустая строка - добавляем <br> для переноса
          processedLines.push('<br>')
        }
      }
    }

    // Обрабатываем оставшиеся цитаты в конце
    if (inQuote && quoteContent.length > 0) {
      const quoteHtml = quoteContent.map(q => {
        let qHtml = q
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        qHtml = qHtml.replace(/~~([^~]+)~~/g, '<del>$1</del>')
        qHtml = qHtml.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        qHtml = qHtml.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
        qHtml = qHtml.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
        qHtml = qHtml.replace(/&lt;u&gt;([^&]+)&lt;\/u&gt;/g, '<u>$1</u>')
        qHtml = qHtml.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        return qHtml
      }).join('<br>')
      processedLines.push(`<blockquote>${quoteHtml}</blockquote>`)
    }

    // Объединяем строки, сохраняя переносы через <br>
    // Между каждой парой строк добавляем <br>, кроме случаев когда:
    // - текущая строка уже <br>
    // - следующая строка начинается с <blockquote>
    const result: string[] = []
    for (let i = 0; i < processedLines.length; i++) {
      result.push(processedLines[i])
      // Если это не последняя строка
      if (i < processedLines.length - 1) {
        const current = processedLines[i]
        const next = processedLines[i + 1]
        // Добавляем <br> если:
        // - текущая строка не <br> и не заканчивается на </blockquote>
        // - следующая строка не начинается с <blockquote>
        if (current !== '<br>' && 
            !current.endsWith('</blockquote>') && 
            !next.startsWith('<blockquote>')) {
          result.push('<br>')
        }
      }
    }
    
    return result.join('')
  }, [])

  /**
   * convertHTMLToMarkdown - конвертирует HTML обратно в markdown
   * 
   * Рекурсивно обрабатывает вложенные теги для правильной конвертации
   */
  const convertHTMLToMarkdown = useCallback((html: string): string => {
    if (!html || html === '<br>') return ''

    // Создаем временный элемент для парсинга HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html

    /**
     * Рекурсивная функция для конвертации узла в markdown
     */
    const nodeToMarkdown = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || ''
        // Экранируем специальные символы markdown в тексте
        return text
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement
        const tagName = element.tagName.toLowerCase()
        const children = Array.from(node.childNodes)
        const content = children.map(nodeToMarkdown).join('')

        // Обрабатываем пустые элементы
        if (!content.trim() && tagName !== 'br') {
          return ''
        }

        switch (tagName) {
          case 'strong':
          case 'b':
            // Проверяем, есть ли внутри <em> или <i> (жирный+курсив)
            const hasItalic = element.querySelector('em, i')
            if (hasItalic) {
              // Убираем <em> из content, так как он уже обработан
              const withoutEm = content.replace(/\*([^*]+)\*/g, '$1')
              return `***${withoutEm}***`
            }
            return `**${content}**`
          case 'em':
          case 'i':
            // Проверяем, не внутри ли <strong> (уже обработано)
            if (element.closest('strong, b')) {
              return content
            }
            return `*${content}*`
          case 'u':
            return `<u>${content}</u>`
          case 'del':
          case 's':
            return `~~${content}~~`
          case 'a':
            const href = (element as HTMLAnchorElement).href || ''
            // Извлекаем только URL без протокола, если он есть
            const cleanUrl = href.replace(/^https?:\/\//, '')
            return `[${content}](${cleanUrl})`
          case 'blockquote':
            // Разбиваем содержимое цитаты на строки и добавляем "> " к каждой
            const quoteLines = content.split('\n').filter(l => l.trim())
            return quoteLines.map(line => `> ${line.trim()}`).join('\n')
          case 'br':
            return '\n'
          case 'div':
          case 'p':
            // Для div/p добавляем перенос только если есть контент
            return content ? content + '\n' : content
          default:
            return content
        }
      }

      return ''
    }

    // Конвертируем все узлы, сохраняя переносы строк
    // Обрабатываем узлы последовательно, сохраняя <br> как \n
    let result = ''
    const nodes = Array.from(tempDiv.childNodes)
    
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const markdown = nodeToMarkdown(node)
      result += markdown
      
      // Если это не последний узел
      if (i < nodes.length - 1) {
        const nextNode = nodes[i + 1]
        // Если следующий узел - blockquote, добавляем \n перед ним
        if (nextNode.nodeType === Node.ELEMENT_NODE) {
          const nextTag = (nextNode as HTMLElement).tagName.toLowerCase()
          if (nextTag === 'blockquote') {
            if (!result.endsWith('\n')) {
              result += '\n'
            }
          }
        }
        // Если текущий узел - blockquote, добавляем \n после него
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = (node as HTMLElement).tagName.toLowerCase()
          if (tag === 'blockquote') {
            if (!result.endsWith('\n')) {
              result += '\n'
            }
          }
        }
      }
    }
    
    // Убираем лишние переносы в конце и начале
    result = result.replace(/\n+$/, '').replace(/^\n+/, '')
    
    // Очищаем от множественных переносов (но сохраняем одиночные)
    result = result.replace(/\n{3,}/g, '\n\n')

    return result
  }, [])

  /**
   * Синхронизация содержимого editor с value
   */
  useEffect(() => {
    // Не синхронизируем, если пользователь активно вводит текст или идет композиция
    if (!editorRef.current || isUpdatingRef.current || isComposing || isUserTypingRef.current) return

    const currentHTML = editorRef.current.innerHTML
    const expectedHTML = convertMarkdownToHTML(value)
    
    // Обновляем только если содержимое действительно отличается
    if (currentHTML !== expectedHTML) {
      isUpdatingRef.current = true
      
      // Сохраняем текущую позицию курсора через текстовое содержимое
      const selection = window.getSelection()
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null
      let savedCursorPosition = 0
      
      if (range && editorRef.current.contains(range.commonAncestorContainer)) {
        // Вычисляем позицию курсора в тексте
        const walker = document.createTreeWalker(
          editorRef.current,
          NodeFilter.SHOW_TEXT,
          null
        )
        
        let node = walker.nextNode()
        let offset = 0
        
        while (node) {
          if (node === range.startContainer) {
            savedCursorPosition = offset + range.startOffset
            break
          }
          if (node.textContent) {
            offset += node.textContent.length
          }
          node = walker.nextNode()
        }
      }

      // Обновляем HTML
      editorRef.current.innerHTML = expectedHTML || ''
      
      // Если после установки innerHTML элемент пустой, добавляем <br> для правильной работы плейсхолдера
      if (!editorRef.current.textContent || editorRef.current.textContent.trim() === '') {
        editorRef.current.innerHTML = '<br>'
      }

      // Восстанавливаем курсор на основе сохраненной позиции
      if (savedCursorPosition > 0 && selection) {
        requestAnimationFrame(() => {
          if (!editorRef.current) {
            isUpdatingRef.current = false
            return
          }
          
          try {
            const allText = editorRef.current.textContent || ''
            const targetPosition = Math.min(savedCursorPosition, allText.length)
            
            if (targetPosition >= 0) {
              const walker = document.createTreeWalker(
                editorRef.current,
                NodeFilter.SHOW_TEXT,
                null
              )
              
              let node = walker.nextNode()
              let offset = 0
              
              while (node) {
                if (node.textContent) {
                  const nodeLength = node.textContent.length
                  if (offset + nodeLength >= targetPosition) {
                    const newRange = document.createRange()
                    const nodeOffset = targetPosition - offset
                    newRange.setStart(node, Math.min(nodeOffset, nodeLength))
                    newRange.collapse(true)
                    selection.removeAllRanges()
                    selection.addRange(newRange)
                    break
                  }
                  offset += nodeLength
                }
                node = walker.nextNode()
              }
            }
          } catch (e) {
            // Если не удалось восстановить, оставляем курсор на текущей позиции
          }
          isUpdatingRef.current = false
        })
      } else {
        isUpdatingRef.current = false
      }
    }
  }, [value, convertMarkdownToHTML, isComposing])

  /**
   * Обработка ввода текста
   */
  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    if (!editorRef.current || isComposing || isUpdatingRef.current) return

    // Устанавливаем флаг активного ввода
    isUserTypingRef.current = true
    
    // Используем requestAnimationFrame для отложенной обработки
    requestAnimationFrame(() => {
      if (!editorRef.current || isUpdatingRef.current) return
      
      // Сохраняем текущую позицию курсора
      const selection = window.getSelection()
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null
      let savedCursorPosition = 0
      
      if (range && editorRef.current.contains(range.commonAncestorContainer)) {
        // Вычисляем позицию курсора в тексте
        const walker = document.createTreeWalker(
          editorRef.current,
          NodeFilter.SHOW_TEXT,
          null
        )
        
        let node = walker.nextNode()
        let offset = 0
        
        while (node) {
          if (node === range.startContainer) {
            savedCursorPosition = offset + range.startOffset
            break
          }
          if (node.textContent) {
            offset += node.textContent.length
          }
          node = walker.nextNode()
        }
      }
      
      // Проверяем, пустой ли редактор (только <br> или пусто)
      const isEmpty = !editorRef.current.textContent || 
                      editorRef.current.textContent.trim() === '' ||
                      (editorRef.current.children.length === 0 && editorRef.current.innerHTML === '<br>')
      
      // Если редактор пустой, устанавливаем <br> для правильной работы плейсхолдера
      if (isEmpty && editorRef.current.innerHTML !== '<br>') {
        editorRef.current.innerHTML = '<br>'
      }
      
      const html = editorRef.current.innerHTML
      const markdown = convertHTMLToMarkdown(html)
      
      // Обновляем только если markdown изменился
      if (markdown !== value) {
        // Обновляем значение без синхронизации HTML (чтобы не сбрасывать курсор)
        onChange(markdown)
      }
      
      // Сбрасываем флаг активного ввода через небольшую задержку
      setTimeout(() => {
        isUserTypingRef.current = false
      }, 200)
    })
  }, [onChange, convertHTMLToMarkdown, value, isComposing])

  /**
   * Сохраняет текущее выделение текста
   */
  const saveSelection = useCallback(() => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange()
    }
  }, [])

  /**
   * Восстанавливает сохраненное выделение
   */
  const restoreSelection = useCallback(() => {
    if (savedSelectionRef.current && editorRef.current) {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(savedSelectionRef.current)
      }
    }
  }, [])

  /**
   * Применяет или снимает цитату к выделенному тексту
   * 
   * Поведение:
   * - Если текст уже в цитате - снимает цитату (убирает "> " в начале строк)
   * - Если текст не в цитате - применяет цитату (добавляет "> " в начале строк)
   */
  const applyQuote = useCallback(() => {
    if (!editorRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    if (selectedText) {
      // Если есть выделенный текст
      const lines = selectedText.split('\n')
      
      // Проверяем, все ли строки уже в цитате
      const allQuoted = lines.every(line => line.trim().startsWith('> ') || !line.trim())
      
      if (allQuoted) {
        // Если все строки в цитате - снимаем цитату
        const unquotedLines = lines.map(line => {
          if (line.trim().startsWith('> ')) {
            return line.replace(/^>\s*/, '')
          }
          return line
        }).join('\n')
        
        range.deleteContents()
        const textNode = document.createTextNode(unquotedLines)
        range.insertNode(textNode)
      } else {
        // Если не все в цитате - применяем цитату
        const quotedLines = lines.map(line => line.trim() ? `> ${line.trim()}` : '').filter(l => l).join('\n')
        
        range.deleteContents()
        const textNode = document.createTextNode(quotedLines)
        range.insertNode(textNode)
      }
      
      // Обновляем markdown
      requestAnimationFrame(() => {
        if (editorRef.current) {
          const html = editorRef.current.innerHTML
          const markdown = convertHTMLToMarkdown(html)
          onChange(markdown)
        }
      })
    } else {
      // Если нет выделения, проверяем текущую строку
      const container = range.startContainer
      const textNode = container.nodeType === Node.TEXT_NODE ? container : null
      
      if (textNode && textNode.textContent) {
        const lineStart = range.startOffset
        const textBefore = textNode.textContent.substring(0, lineStart)
        const lineStartIndex = textBefore.lastIndexOf('\n') + 1
        const lineText = textNode.textContent.substring(lineStartIndex, range.startOffset)
        
        // Проверяем, начинается ли текущая строка с цитаты
        if (lineText.trim().startsWith('> ')) {
          // Убираем цитату
          const newText = textNode.textContent.substring(0, lineStartIndex) + 
                        lineText.replace(/^>\s*/, '') + 
                        textNode.textContent.substring(range.startOffset)
          textNode.textContent = newText
          
          // Устанавливаем курсор на новую позицию
          const newOffset = range.startOffset - (lineText.match(/^>\s*/)?.[0]?.length || 0)
          range.setStart(textNode, newOffset)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
        } else {
          // Добавляем цитату
          const newText = textNode.textContent.substring(0, lineStartIndex) + 
                        '> ' + lineText + 
                        textNode.textContent.substring(range.startOffset)
          textNode.textContent = newText
          
          // Устанавливаем курсор на новую позицию
          const newOffset = range.startOffset + 2
          range.setStart(textNode, newOffset)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      } else {
        // Если не удалось определить строку, просто вставляем маркер цитаты
        const textNode = document.createTextNode('> ')
        range.insertNode(textNode)
        range.setStartAfter(textNode)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
      }
      
      // Обновляем markdown
      requestAnimationFrame(() => {
        if (editorRef.current) {
          const html = editorRef.current.innerHTML
          const markdown = convertHTMLToMarkdown(html)
          onChange(markdown)
        }
      })
    }
  }, [onChange, convertHTMLToMarkdown])

  /**
   * Открывает тултип для вставки ссылки
   */
  const openLinkTooltip = useCallback(() => {
    if (!editorRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    // Сохраняем выделение
    saveSelection()
    
    // Получаем весь текст редактора
    const allText = editorRef.current.textContent || ''
    
    // Находим позицию выделенного текста в общем тексте
    // Используем TreeWalker для точного определения позиции
    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    )
    
    let selectionStartPos = 0
    let selectionEndPos = 0
    let node = walker.nextNode()
    let currentPos = 0
    
    while (node) {
      const nodeLength = node.textContent?.length || 0
      
      if (node === range.startContainer) {
        selectionStartPos = currentPos + range.startOffset
      }
      if (node === range.endContainer) {
        selectionEndPos = currentPos + range.endOffset
        break
      }
      
      currentPos += nodeLength
      node = walker.nextNode()
    }
    
    // Находим границы строки (до переноса строки)
    const lastNewlineBefore = allText.lastIndexOf('\n', selectionStartPos - 1)
    const firstNewlineAfter = allText.indexOf('\n', selectionEndPos)
    
    const lineStart = lastNewlineBefore === -1 ? 0 : lastNewlineBefore + 1
    const lineEnd = firstNewlineAfter === -1 ? allText.length : firstNewlineAfter
    
    // Извлекаем текст строки
    const lineText = allText.substring(lineStart, lineEnd)
    const selectionStartInLine = selectionStartPos - lineStart
    const selectionEndInLine = selectionEndPos - lineStart
    
    // Разбиваем на слова и знаки препинания для умного добавления
    const leftPart = lineText.substring(0, selectionStartInLine)
    const rightPart = lineText.substring(selectionEndInLine)
    
    // Сохраняем контекст для кнопок +/-
    linkContextRef.current = {
      leftText: leftPart,
      rightText: rightPart,
      leftIndex: leftPart.length,
      rightIndex: 0,
      originalSelectedText: selectedText,
      originalLeftText: leftPart,
      originalRightText: rightPart
    }
    
    // Устанавливаем текст ссылки
    setLinkText(selectedText)
    setLinkUrl('')
    
    // Вычисляем позицию тултипа (центр выделенного текста)
    const rect = range.getBoundingClientRect()
    const editorRect = editorRef.current.getBoundingClientRect()
    const scrollTop = editorRef.current.scrollTop || 0
    const scrollLeft = editorRef.current.scrollLeft || 0
    
    setTooltipPosition({
      top: rect.top - editorRect.top + rect.height / 2 + scrollTop,
      left: rect.left - editorRect.left + rect.width / 2 + scrollLeft
    })
    
    setIsLinkTooltipOpen(true)
  }, [saveSelection])

  /**
   * Вставляет ссылку в markdown формате
   */
  const insertLink = useCallback(() => {
    if (!linkUrl.trim()) return

    // Восстанавливаем выделение
    restoreSelection()

    if (!editorRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    
    // Проверяем, что выделение находится внутри редактора
    if (!editorRef.current.contains(range.commonAncestorContainer)) {
      return
    }

    const text = linkText.trim() || linkUrl.trim()
    
    // Обрабатываем URL: убираем https:// или https://www. если они есть
    let processedUrl = linkUrl.trim()
    if (processedUrl.startsWith('https://www.')) {
      processedUrl = processedUrl.substring(12) // Убираем "https://www."
    } else if (processedUrl.startsWith('https://')) {
      processedUrl = processedUrl.substring(8) // Убираем "https://"
    }
    
    const linkMarkdown = `[${text}](https://${processedUrl})`

    // Вычисляем, какой текст был добавлен через кнопки +/-
    let textToRemoveFromLeft = ''
    let textToRemoveFromRight = ''
    
    if (linkContextRef.current) {
      const { originalLeftText, originalRightText, leftIndex, rightIndex } = linkContextRef.current
      
      // Текст, который был добавлен слева (от leftIndex до конца originalLeftText)
      textToRemoveFromLeft = originalLeftText.substring(leftIndex)
      
      // Текст, который был добавлен справа (от начала до rightIndex в originalRightText)
      textToRemoveFromRight = originalRightText.substring(0, rightIndex)
    }

    // Если был выделен текст, заменяем его на ссылку
    // Но сначала нужно удалить добавленный текст слева и справа
    if (textToRemoveFromLeft || textToRemoveFromRight) {
      // Расширяем выделение, чтобы включить добавленный текст
      const expandedRange = range.cloneRange()
      
      // Расширяем влево на длину добавленного текста слева
      if (textToRemoveFromLeft) {
        try {
          expandedRange.setStart(range.startContainer, Math.max(0, range.startOffset - textToRemoveFromLeft.length))
        } catch (e) {
          // Если не удалось, используем исходный range
        }
      }
      
      // Расширяем вправо на длину добавленного текста справа
      if (textToRemoveFromRight) {
        try {
          expandedRange.setEnd(range.endContainer, range.endOffset + textToRemoveFromRight.length)
        } catch (e) {
          // Если не удалось, используем исходный range
        }
      }
      
      // Удаляем весь текст (включая добавленный)
      expandedRange.deleteContents()
      
      // Вставляем ссылку
      const textNode = document.createTextNode(linkMarkdown)
      expandedRange.insertNode(textNode)
      
      // Перемещаем курсор после вставленной ссылки
      expandedRange.setStartAfter(textNode)
      expandedRange.collapse(true)
      selection.removeAllRanges()
      selection.addRange(expandedRange)
    } else {
      // Обычная вставка без добавленного текста
      if (range.toString()) {
        range.deleteContents()
      }

      // Вставляем ссылку как текстовый узел (markdown формат)
      const textNode = document.createTextNode(linkMarkdown)
      range.insertNode(textNode)
      
      // Перемещаем курсор после вставленной ссылки
      range.setStartAfter(textNode)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    }

    // Обновляем markdown через handleInput для правильной обработки
    isUserTypingRef.current = true
    requestAnimationFrame(() => {
      if (editorRef.current) {
        const html = editorRef.current.innerHTML
        const markdown = convertHTMLToMarkdown(html)
        if (markdown !== value) {
          onChange(markdown)
        }
        isUserTypingRef.current = false
      }
    })

    setIsLinkTooltipOpen(false)
    setLinkUrl('')
    setLinkText('')
    linkContextRef.current = null
    
    // Возвращаем фокус в редактор
    editorRef.current.focus()
  }, [linkUrl, linkText, restoreSelection, onChange, convertHTMLToMarkdown, value])

  /**
   * Добавляет текст слева от текста ссылки из контекста строки
   */
  const addCharLeft = useCallback(() => {
    if (!linkContextRef.current) return
    
    const { leftText, leftIndex } = linkContextRef.current
    
    if (leftIndex <= 0) return // Нет больше текста слева
    
    // Находим следующее слово/символ слева
    // Ищем последний пробел, запятую или другой разделитель перед leftIndex
    let newIndex = leftIndex - 1
    
    // Пропускаем пробелы
    while (newIndex > 0 && leftText[newIndex - 1] === ' ') {
      newIndex--
    }
    
    // Ищем начало слова или знака препинания
    if (newIndex > 0) {
      // Если перед нами знак препинания, берем его
      if (/[.,!?;:—–\-]/.test(leftText[newIndex - 1])) {
        newIndex--
      } else {
        // Иначе ищем начало слова
        while (newIndex > 0 && !/[.,!?;:\s—–\-]/.test(leftText[newIndex - 1])) {
          newIndex--
        }
      }
    }
    
    const textToAdd = leftText.substring(newIndex, leftIndex)
    linkContextRef.current.leftIndex = newIndex
    
    setLinkText(prev => textToAdd + prev)
  }, [])

  /**
   * Добавляет текст справа от текста ссылки из контекста строки
   */
  const addCharRight = useCallback(() => {
    if (!linkContextRef.current) return
    
    const { rightText, rightIndex } = linkContextRef.current
    
    if (rightIndex >= rightText.length) return // Нет больше текста справа
    
    // Находим следующее слово/символ справа
    let newIndex = rightIndex
    
    // Пропускаем пробелы
    while (newIndex < rightText.length && rightText[newIndex] === ' ') {
      newIndex++
    }
    
    if (newIndex >= rightText.length) return
    
    // Если это знак препинания, берем его
    if (/[.,!?;:—–\-]/.test(rightText[newIndex])) {
      newIndex++
    } else {
      // Иначе ищем конец слова
      while (newIndex < rightText.length && !/[.,!?;:\s—–\-]/.test(rightText[newIndex])) {
        newIndex++
      }
    }
    
    const textToAdd = rightText.substring(rightIndex, newIndex)
    linkContextRef.current.rightIndex = newIndex
    
    setLinkText(prev => prev + textToAdd)
  }, [])

  /**
   * Обработка клика вне тултипа для его закрытия
   */
  useEffect(() => {
    if (!isLinkTooltipOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node) &&
          editorRef.current && !editorRef.current.contains(e.target as Node)) {
        setIsLinkTooltipOpen(false)
        setLinkUrl('')
        setLinkText('')
        linkContextRef.current = null
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isLinkTooltipOpen])

  /**
   * Проверяет, применено ли форматирование к выделенному тексту
   * 
   * Использует встроенные возможности браузера (queryCommandState) для более точной проверки
   * 
   * @param formatType - тип форматирования ('bold' | 'italic' | 'underline' | 'strikethrough')
   * @returns true если форматирование применено, false если нет
   */
  const isFormatApplied = useCallback((formatType: 'bold' | 'italic' | 'underline' | 'strikethrough'): boolean => {
    if (!editorRef.current) return false

    // Фокусируем editor для корректной работы queryCommandState
    editorRef.current.focus()

    // Используем встроенные команды браузера для проверки состояния форматирования
    try {
      switch (formatType) {
        case 'bold':
          return document.queryCommandState('bold')
        case 'italic':
          return document.queryCommandState('italic')
        case 'underline':
          return document.queryCommandState('underline')
        case 'strikethrough':
          return document.queryCommandState('strikeThrough')
        default:
          return false
      }
    } catch (e) {
      // Если queryCommandState не поддерживается, используем fallback проверку
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return false

      const range = selection.getRangeAt(0)
      const container = range.commonAncestorContainer
      const element = container.nodeType === Node.TEXT_NODE 
        ? container.parentElement 
        : container as HTMLElement

      if (!element) return false

      switch (formatType) {
        case 'bold':
          return element.tagName === 'STRONG' || element.tagName === 'B' || 
                 element.closest('strong, b') !== null
        case 'italic':
          return element.tagName === 'EM' || element.tagName === 'I' || 
                 element.closest('em, i') !== null
        case 'underline':
          return element.tagName === 'U' || element.closest('u') !== null
        case 'strikethrough':
          return element.tagName === 'DEL' || element.tagName === 'S' || 
                 element.closest('del, s') !== null
        default:
          return false
      }
    }
  }, [])

  /**
   * Обработка горячих клавиш для форматирования
   * Использует e.code вместо e.key для работы независимо от раскладки клавиатуры
   * Поддерживает переключение: повторное нажатие снимает форматирование
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey

    // Обработка горячих клавиш для форматирования (используем code для независимости от раскладки)
    if (ctrlKey && !e.shiftKey) {
      // Используем code вместо key для работы независимо от раскладки
      const keyCode = e.code.toLowerCase()
      
      if (keyCode === 'keyb') {
        e.preventDefault()
        // Проверяем, применено ли уже жирное форматирование
        const isBold = isFormatApplied('bold')
        if (isBold) {
          // Если уже жирный - снимаем форматирование
          document.execCommand('bold', false, null)
        } else {
          // Если не жирный - применяем форматирование
          document.execCommand('bold', false)
        }
        requestAnimationFrame(() => {
          if (editorRef.current) {
            const html = editorRef.current.innerHTML
            const markdown = convertHTMLToMarkdown(html)
            onChange(markdown)
          }
        })
        return
      }
      
      if (keyCode === 'keyi') {
        e.preventDefault()
        // Проверяем, применен ли уже курсив
        const isItalic = isFormatApplied('italic')
        if (isItalic) {
          document.execCommand('italic', false, null)
        } else {
          document.execCommand('italic', false)
        }
        requestAnimationFrame(() => {
          if (editorRef.current) {
            const html = editorRef.current.innerHTML
            const markdown = convertHTMLToMarkdown(html)
            onChange(markdown)
          }
        })
        return
      }
      
      if (keyCode === 'keyu') {
        e.preventDefault()
        // Проверяем, применено ли уже подчеркивание
        const isUnderline = isFormatApplied('underline')
        if (isUnderline) {
          document.execCommand('underline', false, null)
        } else {
          document.execCommand('underline', false)
        }
        requestAnimationFrame(() => {
          if (editorRef.current) {
            const html = editorRef.current.innerHTML
            const markdown = convertHTMLToMarkdown(html)
            onChange(markdown)
          }
        })
        return
      }
      
      // Cmd+K для вставки ссылки
      if (keyCode === 'keyk') {
        e.preventDefault()
        openLinkTooltip()
        return
      }
    }

    // Обработка Ctrl+Shift+X для зачеркнутого (используем code)
    if (ctrlKey && e.shiftKey && e.code.toLowerCase() === 'keyx') {
      e.preventDefault()
      // Проверяем, применено ли уже зачеркивание
      const isStrikethrough = isFormatApplied('strikethrough')
      if (isStrikethrough) {
        document.execCommand('strikeThrough', false, null)
      } else {
        document.execCommand('strikeThrough', false)
      }
      requestAnimationFrame(() => {
        if (editorRef.current) {
          const html = editorRef.current.innerHTML
          const markdown = convertHTMLToMarkdown(html)
          onChange(markdown)
        }
      })
      return
    }

    // Обработка Ctrl+Shift+. для цитаты (используем code)
    // Для цитаты переключение работает через проверку начала строки
    if (ctrlKey && e.shiftKey && e.code === 'Period') {
      e.preventDefault()
      applyQuote()
      return
    }

    // Вызываем внешний обработчик (для Enter и других клавиш)
    if (onKeyDown) {
      onKeyDown(e)
    }
  }, [onChange, convertHTMLToMarkdown, openLinkTooltip, applyQuote, isFormatApplied])

  /**
   * Обработка composition events (для IME ввода)
   */
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true)
  }, [])

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLDivElement>) => {
    setIsComposing(false)
    handleInput(e as any)
  }, [handleInput])

  return (
    <Box style={{ position: 'relative', flex: '1 1 0%' }}>
      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        className={styles.richTextInput}
        style={{
          ...style,
          minHeight: `${rows * 20 + 20}px`,
          maxHeight: '120px',
          overflowY: 'auto',
          borderRadius: '6px',
          padding: '8px 12px',
          backgroundColor: 'var(--gray-2)',
          border: '1px solid var(--gray-6)',
          outline: 'none',
          fontSize: '14px',
          lineHeight: '1.5',
          ...(value ? {} : {
            color: 'var(--gray-9)',
          })
        }}
        data-placeholder={placeholder}
      />
      
      {/* Тултип для вставки ссылки */}
      {isLinkTooltipOpen && (
        <Box
          ref={tooltipRef}
          style={{
            position: 'absolute',
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            backgroundColor: 'var(--gray-1)',
            border: '1px solid var(--gray-6)',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            minWidth: '280px',
            maxWidth: '400px'
          }}
        >
          <Flex direction="column" gap="2">
            {/* Первая строка: текст ссылки с кнопками +/- */}
            <Flex align="center" gap="1">
              <Button
                size="1"
                variant="soft"
                onClick={addCharLeft}
                disabled={!linkContextRef.current || linkContextRef.current.leftIndex <= 0}
                style={{ flexShrink: 0, width: '24px', height: '24px', padding: 0 }}
              >
                <PlusIcon />
              </Button>
              <TextField.Root
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Текст ссылки"
                autoFocus
                style={{ flex: 1 }}
                size="2"
              />
              <Button
                size="1"
                variant="soft"
                onClick={addCharRight}
                disabled={!linkContextRef.current || 
                  linkContextRef.current.rightIndex >= (linkContextRef.current.rightText.length)}
                style={{ flexShrink: 0, width: '24px', height: '24px', padding: 0 }}
              >
                <PlusIcon />
              </Button>
            </Flex>
            {/* Вторая строка: URL с префиксом https:// и галочкой подтверждения */}
            <Flex align="center" gap="1">
              <Text size="2" style={{ flexShrink: 0, color: 'var(--gray-11)' }}>
                https://
              </Text>
              <TextField.Root
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="example.com"
                style={{ flex: 1 }}
                size="2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && linkUrl.trim()) {
                    e.preventDefault()
                    insertLink()
                  }
                }}
              />
              <Button
                size="2"
                variant="solid"
                onClick={insertLink}
                disabled={!linkUrl.trim()}
                style={{ flexShrink: 0 }}
              >
                <CheckIcon />
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}
    </Box>
  )
}
