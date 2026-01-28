'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { Box, Dialog, TextField, Button, Flex, Text } from '@radix-ui/themes'
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
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const savedSelectionRef = useRef<Range | null>(null)

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

    return processedLines.join('')
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

    // Конвертируем все узлы
    let result = Array.from(tempDiv.childNodes)
      .map(nodeToMarkdown)
      .join('')
      .replace(/\n+$/, '') // Убираем лишние переносы в конце
      .replace(/^\n+/, '') // Убираем лишние переносы в начале

    // Очищаем от лишних пробелов и переносов
    result = result.replace(/\n{3,}/g, '\n\n')

    return result
  }, [])

  /**
   * useEffect - синхронизация содержимого editor с value
   * 
   * Функциональность:
   * - Синхронизирует содержимое contentEditable элемента с пропсом value
   * - Сохраняет и восстанавливает позицию курсора при обновлении
   * - Предотвращает бесконечные циклы обновления через isUpdatingRef
   * 
   * Поведение:
   * - Выполняется при изменении value или isComposing
   * - Проверяет, отличается ли текущий HTML от ожидаемого
   * - Если отличается и не идет ввод (isComposing) - обновляет содержимое
   * - Сохраняет позицию курсора перед обновлением
   * - Восстанавливает курсор после обновления с учетом изменений DOM
   * 
   * Алгоритм восстановления курсора:
   * 1. Сохраняет Range с позицией курсора
   * 2. Обновляет innerHTML
   * 3. Находит соответствующий текстовый узел в новом DOM через TreeWalker
   * 4. Вычисляет смещение курсора относительно начала текста
   * 5. Восстанавливает курсор в новой позиции
   * 
   * Защита от циклов:
   * - isUpdatingRef предотвращает обновление во время обработки ввода
   * - isComposing предотвращает обновление во время ввода через IME
   */
  useEffect(() => {
    if (!editorRef.current || isUpdatingRef.current) return

    const currentHTML = editorRef.current.innerHTML
    const expectedHTML = convertMarkdownToHTML(value)
    
    // Обновляем только если содержимое отличается (чтобы не сбрасывать курсор)
    if (currentHTML !== expectedHTML && !isComposing) {
      isUpdatingRef.current = true
      
      // Сохраняем более детальную информацию о позиции курсора
      const selection = window.getSelection()
      let savedRange: Range | null = null
      if (selection && selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange()
      }

      // Если значение пустое, используем пустой div, чтобы плейсхолдер работал
      editorRef.current.innerHTML = expectedHTML || ''
      
      // Если после установки innerHTML элемент пустой, добавляем <br> для правильной работы плейсхолдера
      if (!editorRef.current.textContent || editorRef.current.textContent.trim() === '') {
        editorRef.current.innerHTML = '<br>'
      }

      // Восстанавливаем курсор с улучшенной логикой для многострочного текста
      if (savedRange && selection && editorRef.current.contains(savedRange.commonAncestorContainer)) {
        try {
          // Пытаемся восстановить курсор в той же позиции
          const newRange = document.createRange()
          
          // Находим соответствующий узел в новом DOM
          const findNode = (oldNode: Node, newContainer: Node): Node | null => {
            if (oldNode === editorRef.current) return newContainer
            
            // Если это текстовый узел, ищем соответствующий текстовый узел
            if (oldNode.nodeType === Node.TEXT_NODE) {
              const walker = document.createTreeWalker(
                newContainer,
                NodeFilter.SHOW_TEXT,
                null
              )
              
              let node = walker.nextNode()
              let textOffset = 0
              const oldText = oldNode.textContent || ''
              const oldOffset = savedRange!.startOffset
              
              while (node) {
                const nodeText = node.textContent || ''
                if (textOffset + nodeText.length >= oldOffset) {
                  // Нашли соответствующий узел
                  newRange.setStart(node, oldOffset - textOffset)
                  newRange.setEnd(node, Math.min(savedRange!.endOffset - textOffset, nodeText.length))
                  return node
                }
                textOffset += nodeText.length
                node = walker.nextNode()
              }
            }
            
            return null
          }
          
          const newStartNode = findNode(savedRange.startContainer, editorRef.current)
          const newEndNode = findNode(savedRange.endContainer, editorRef.current)
          
          if (newStartNode && newEndNode) {
            // Вычисляем смещение для нового узла
            const walker = document.createTreeWalker(
              editorRef.current,
              NodeFilter.SHOW_TEXT,
              null
            )
            
            let startOffset = 0
            let endOffset = 0
            let node = walker.nextNode()
            
            while (node) {
              if (node === newStartNode) {
                startOffset = savedRange.startOffset
                break
              }
              startOffset += (node.textContent || '').length
              node = walker.nextNode()
            }
            
            node = walker.nextNode()
            while (node) {
              if (node === newEndNode) {
                endOffset = savedRange.endOffset
                break
              }
              endOffset += (node.textContent || '').length
              node = walker.nextNode()
            }
            
            if (newStartNode.nodeType === Node.TEXT_NODE) {
              const startTextNode = newStartNode as Text
              const endTextNode = newEndNode as Text
              newRange.setStart(startTextNode, Math.min(savedRange.startOffset, startTextNode.length))
              newRange.setEnd(endTextNode, Math.min(savedRange.endOffset, endTextNode.length))
              selection.removeAllRanges()
              selection.addRange(newRange)
            }
          }
        } catch (e) {
          // Если не удалось восстановить курсор, ставим в конец
          try {
            const range = document.createRange()
            range.selectNodeContents(editorRef.current)
            range.collapse(false)
            selection.removeAllRanges()
            selection.addRange(range)
          } catch (e2) {
            // Игнорируем ошибки восстановления курсора
          }
        }
      }
      
      isUpdatingRef.current = false
    }
  }, [value, convertMarkdownToHTML, isComposing])

  /**
   * handleInput - обработчик ввода текста в contentEditable
   * 
   * Функциональность:
   * - Обрабатывает ввод текста в contentEditable элементе
   * - Конвертирует HTML в markdown и обновляет value через onChange
   * - Сохраняет и восстанавливает позицию курсора
   * 
   * Поведение:
   * - Вызывается при каждом изменении содержимого editor
   * - Сохраняет позицию курсора перед обработкой
   * - Использует requestAnimationFrame для отложенной обработки
   * - Конвертирует HTML в markdown через convertHTMLToMarkdown
   * - Обновляет value только если markdown изменился
   * - Восстанавливает курсор после обновления
   * 
   * Алгоритм:
   * 1. Сохраняет Range с позицией курсора
   * 2. Проверяет, пустой ли редактор (для правильной работы placeholder)
   * 3. Конвертирует HTML в markdown
   * 4. Если markdown изменился - вызывает onChange
   * 5. Восстанавливает курсор через TreeWalker
   * 
   * Защита:
   * - isUpdatingRef предотвращает обработку во время синхронизации
   * - isComposing предотвращает обработку во время ввода через IME
   * 
   * @param e - событие ввода
   */
  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    if (!editorRef.current || isComposing || isUpdatingRef.current) return

    // Сохраняем позицию курсора перед обновлением
    const selection = window.getSelection()
    let savedRange: Range | null = null
    if (selection && selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0).cloneRange()
    }

    // Используем requestAnimationFrame для отложенной обработки
    requestAnimationFrame(() => {
      if (!editorRef.current || isUpdatingRef.current) return
      
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
        isUpdatingRef.current = true
        onChange(markdown)
        
        // Восстанавливаем курсор после обновления
        requestAnimationFrame(() => {
          if (savedRange && selection && editorRef.current) {
            try {
              // Пытаемся восстановить курсор в той же позиции
              const newRange = document.createRange()
              
              // Находим узел, который соответствует сохраненному контейнеру
              const findTextNode = (offset: number): { node: Node; nodeOffset: number } | null => {
                const walker = document.createTreeWalker(
                  editorRef.current!,
                  NodeFilter.SHOW_TEXT,
                  null
                )
                
                let node = walker.nextNode()
                let currentOffset = 0
                
                while (node) {
                  const nodeText = node.textContent || ''
                  if (currentOffset + nodeText.length >= offset) {
                    return {
                      node,
                      nodeOffset: offset - currentOffset
                    }
                  }
                  currentOffset += nodeText.length
                  node = walker.nextNode()
                }
                
                return null
              }
              
              const startPos = findTextNode(savedRange.startOffset)
              const endPos = findTextNode(savedRange.endOffset)
              
              if (startPos && endPos && startPos.node.nodeType === Node.TEXT_NODE && endPos.node.nodeType === Node.TEXT_NODE) {
                newRange.setStart(startPos.node as Text, Math.min(startPos.nodeOffset, (startPos.node as Text).length))
                newRange.setEnd(endPos.node as Text, Math.min(endPos.nodeOffset, (endPos.node as Text).length))
                selection.removeAllRanges()
                selection.addRange(newRange)
              }
            } catch (e) {
              // Игнорируем ошибки восстановления курсора
            }
          }
          
          // Сбрасываем флаг после небольшой задержки
          setTimeout(() => {
            isUpdatingRef.current = false
          }, 0)
        })
      } else {
        isUpdatingRef.current = false
      }
    })
  }, [onChange, convertHTMLToMarkdown, value, isComposing])

  /**
   * saveSelection - сохранение текущего выделения текста
   * 
   * Функциональность:
   * - Сохраняет текущий Range (выделение/позицию курсора) в savedSelectionRef
   * 
   * Используется для:
   * - Сохранения позиции курсора перед операциями форматирования
   * - Восстановления выделения после вставки ссылок
   * 
   * Поведение:
   * - Вызывается перед операциями, которые могут изменить DOM
   * - Сохраняет Range в savedSelectionRef для последующего восстановления
   */
  const saveSelection = useCallback(() => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange()
    }
  }, [])

  /**
   * restoreSelection - восстановление сохраненного выделения текста
   * 
   * Функциональность:
   * - Восстанавливает ранее сохраненный Range из savedSelectionRef
   * 
   * Используется для:
   * - Восстановления позиции курсора после операций форматирования
   * - Восстановления выделения после вставки ссылок
   * 
   * Поведение:
   * - Вызывается после операций, которые изменили DOM
   * - Восстанавливает Range из savedSelectionRef
   * - Устанавливает выделение в window.getSelection()
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
   * openLinkDialog - открытие диалога для вставки ссылки
   * 
   * Функциональность:
   * - Открывает диалог для ввода URL и текста ссылки
   * - Сохраняет текущее выделение текста
   * - Устанавливает выделенный текст как текст ссылки (если есть)
   * 
   * Поведение:
   * - Вызывается при нажатии Ctrl+K или через UI
   * - Сохраняет выделение через saveSelection
   * - Если есть выделенный текст - использует его как текст ссылки
   * - Открывает диалог вставки ссылки
   */
  const openLinkDialog = useCallback(() => {
    if (!editorRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    // Сохраняем выделение
    saveSelection()
    
    // Устанавливаем текст ссылки
    setLinkText(selectedText)
    setLinkUrl('')
    setIsLinkDialogOpen(true)
  }, [saveSelection])

  /**
   * insertLink - вставка ссылки в markdown формате
   * 
   * Функциональность:
   * - Вставляет ссылку в формате [текст](url) в markdown
   * - Восстанавливает ранее сохраненное выделение
   * - Заменяет выделенный текст на ссылку (если был выделен текст)
   * 
   * Поведение:
   * - Вызывается при сохранении ссылки в диалоге
   * - Валидирует URL (не должен быть пустым)
   * - Восстанавливает выделение через restoreSelection
   * - Если был выделен текст - заменяет его на ссылку
   * - Если текста не было - использует URL как текст
   * - Обновляет markdown через onChange
   * - Закрывает диалог
   * 
   * Формат ссылки:
   * - [текст](url) - markdown формат ссылки
   * - Текст берется из linkText или linkUrl
   * - URL берется из linkUrl
   */
  const insertLink = useCallback(() => {
    if (!linkUrl.trim()) return

    // Восстанавливаем выделение
    restoreSelection()

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const text = linkText.trim() || linkUrl.trim()
    const linkMarkdown = `[${text}](${linkUrl.trim()})`

    // Если был выделен текст, заменяем его на ссылку
    if (range.toString()) {
      range.deleteContents()
    }

    // Вставляем ссылку
    const textNode = document.createTextNode(linkMarkdown)
    range.insertNode(textNode)

    // Обновляем markdown
    requestAnimationFrame(() => {
      if (editorRef.current) {
        const html = editorRef.current.innerHTML
        const markdown = convertHTMLToMarkdown(html)
        onChange(markdown)
      }
    })

    setIsLinkDialogOpen(false)
    setLinkUrl('')
    setLinkText('')
  }, [linkUrl, linkText, restoreSelection, onChange, convertHTMLToMarkdown])

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
   * handleKeyDown - обработка горячих клавиш для форматирования
   * 
   * Функциональность:
   * - Обрабатывает горячие клавиши для форматирования текста
   * - Поддерживает переключение форматирования (повторное нажатие снимает)
   * - Использует e.code вместо e.key для работы независимо от раскладки
   * 
   * Поддерживаемые комбинации:
   * - Ctrl+B (Cmd+B на Mac): жирный текст
   * - Ctrl+I (Cmd+I на Mac): курсив
   * - Ctrl+U (Cmd+U на Mac): подчеркнутый
   * - Ctrl+Shift+X (Cmd+Shift+X на Mac): зачеркнутый
   * - Ctrl+K (Cmd+K на Mac): вставка ссылки
   * 
   * Поведение:
   * - Определяет платформу (Mac/Windows/Linux) для правильной обработки модификаторов
   * - Использует document.execCommand для применения форматирования
   * - Проверяет текущее состояние форматирования через isFormatApplied
   * - Если форматирование уже применено - снимает его
   * - Если не применено - применяет его
   * - После форматирования конвертирует HTML в markdown и обновляет value
   * 
   * Особенности:
   * - Использует e.code для независимости от раскладки клавиатуры
   * - Использует requestAnimationFrame для отложенного обновления markdown
   * - Передает событие в onKeyDown (если передан) для дополнительной обработки
   * 
   * @param e - событие клавиатуры
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
          document.execCommand('bold', false, undefined)
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
          document.execCommand('italic', false, undefined)
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
          document.execCommand('underline', false, undefined)
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
        openLinkDialog()
        return
      }
    }

    // Обработка Ctrl+Shift+X для зачеркнутого (используем code)
    if (ctrlKey && e.shiftKey && e.code.toLowerCase() === 'keyx') {
      e.preventDefault()
      // Проверяем, применено ли уже зачеркивание
      const isStrikethrough = isFormatApplied('strikethrough')
      if (isStrikethrough) {
        document.execCommand('strikeThrough', false, undefined)
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
  }, [onChange, convertHTMLToMarkdown, openLinkDialog, applyQuote, isFormatApplied])

  /**
   * handleCompositionStart - обработчик начала ввода через IME (Input Method Editor)
   * 
   * Функциональность:
   * - Устанавливает флаг isComposing в true
   * - Предотвращает обработку ввода во время ввода через IME
   * 
   * Используется для:
   * - Корректной обработки ввода на китайском, японском, корейском языках
   * - Предотвращения преждевременной обработки ввода во время композиции
   */
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true)
  }, [])

  /**
   * handleCompositionEnd - обработчик окончания ввода через IME
   * 
   * Функциональность:
   * - Устанавливает флаг isComposing в false
   * - Вызывает handleInput для обработки завершенного ввода
   * 
   * Используется для:
   * - Обработки завершенного ввода через IME
   * - Обновления markdown после завершения композиции
   * 
   * @param e - событие композиции
   */
  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLDivElement>) => {
    setIsComposing(false)
    handleInput(e as any)
  }, [handleInput])

  return (
    <>
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
          position: 'relative',
          ...(value ? {} : {
            color: 'var(--gray-9)',
          })
        }}
        data-placeholder={placeholder}
      />
      
      {/* Диалог для вставки ссылки */}
      <Dialog.Root open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Вставить ссылку</Dialog.Title>
          <Flex direction="column" gap="3" mt="3">
            <Box>
              <Text size="2" weight="medium" mb="1" as="div">
                Текст ссылки
              </Text>
              <TextField.Root
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Текст ссылки"
                autoFocus
              />
            </Box>
            <Box>
              <Text size="2" weight="medium" mb="1" as="div">
                URL
              </Text>
              <TextField.Root
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && linkUrl.trim()) {
                    e.preventDefault()
                    insertLink()
                  }
                }}
              />
            </Box>
            <Flex gap="3" justify="end" mt="2">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Отмена
                </Button>
              </Dialog.Close>
              <Button 
                onClick={insertLink} 
                disabled={!linkUrl.trim()}
              >
                Вставить
              </Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}
