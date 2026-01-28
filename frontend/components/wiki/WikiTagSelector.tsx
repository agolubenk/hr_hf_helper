'use client'

import { useState } from "react"
import { Box, Flex, Text, Button, TextField } from "@radix-ui/themes"
import { PlusIcon, Cross2Icon } from "@radix-ui/react-icons"
import styles from './WikiTagSelector.module.css'

interface Tag {
  id: string
  label: string
  color: string
}

interface WikiTagSelectorProps {
  availableTags: Tag[]
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

export default function WikiTagSelector({
  availableTags,
  selectedTags,
  onTagsChange
}: WikiTagSelectorProps) {
  const [newTagName, setNewTagName] = useState('')
  const [isAddingTag, setIsAddingTag] = useState(false)

  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId))
    } else {
      onTagsChange([...selectedTags, tagId])
    }
  }

  const handleAddNewTag = () => {
    if (newTagName.trim()) {
      const tagLabel = newTagName.trim().startsWith('#') 
        ? newTagName.trim() 
        : `#${newTagName.trim()}`
      
      // Проверяем, нет ли уже такого тега
      const existingTag = availableTags.find(tag => 
        tag.label.toLowerCase() === tagLabel.toLowerCase()
      )
      
      if (!existingTag && !selectedTags.includes(tagLabel)) {
        // Добавляем новый тег (в реальном приложении здесь будет API вызов)
        onTagsChange([...selectedTags, tagLabel])
        setNewTagName('')
        setIsAddingTag(false)
      }
    }
  }

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(id => id !== tagId))
  }

  // Получаем информацию о теге по его ID или label
  const getTagInfo = (tagId: string): Tag | null => {
    return availableTags.find(tag => tag.id === tagId || tag.label === tagId) || null
  }

  return (
    <Box className={styles.tagSelector}>
      <Text size="2" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
        Метки (теги)
      </Text>
      
      {/* Выбранные теги */}
      {selectedTags.length > 0 && (
        <Flex gap="2" wrap="wrap" style={{ marginBottom: '12px' }}>
          {selectedTags.map((tagId) => {
            const tagInfo = getTagInfo(tagId)
            const displayLabel = tagInfo?.label || tagId
            const tagColor = tagInfo?.color || '#6b7280'
            
            return (
              <Box
                key={tagId}
                className={styles.selectedTag}
                style={{
                  backgroundColor: tagColor,
                  color: '#ffffff',
                  border: `1px solid ${tagColor}`,
                }}
              >
                <Text size="1" weight="medium" style={{ lineHeight: '1.5', whiteSpace: 'nowrap' }}>
                  {displayLabel}
                </Text>
                <Box
                  className={styles.removeButton}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveTag(tagId)
                  }}
                  title="Удалить метку"
                >
                  <Cross2Icon width={12} height={12} />
                </Box>
              </Box>
            )
          })}
        </Flex>
      )}

      {/* Доступные теги для выбора */}
      <Flex gap="2" wrap="wrap" style={{ marginBottom: '12px' }}>
        {availableTags
          .filter(tag => !selectedTags.includes(tag.id) && !selectedTags.includes(tag.label))
          .map((tag) => (
            <Button
              key={tag.id}
              size="2"
              variant="soft"
              onClick={() => handleTagToggle(tag.id)}
              style={{
                backgroundColor: 'transparent',
                color: tag.color,
                border: `1px solid ${tag.color}`,
                borderRadius: '9999px',
              }}
            >
              {tag.label}
            </Button>
          ))}
      </Flex>

      {/* Добавление нового тега */}
      {isAddingTag ? (
        <Flex gap="2" align="center">
          <TextField.Root
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Введите название тега"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddNewTag()
              } else if (e.key === 'Escape') {
                setIsAddingTag(false)
                setNewTagName('')
              }
            }}
            style={{ flex: 1 }}
            autoFocus
          />
          <Button
            size="2"
            onClick={handleAddNewTag}
            style={{
              backgroundColor: 'var(--accent-9)',
              color: '#ffffff',
            }}
          >
            Добавить
          </Button>
          <Button
            size="2"
            variant="soft"
            onClick={() => {
              setIsAddingTag(false)
              setNewTagName('')
            }}
          >
            Отмена
          </Button>
        </Flex>
      ) : (
        <Button
          size="2"
          variant="soft"
          onClick={() => setIsAddingTag(true)}
          style={{
            backgroundColor: 'var(--gray-3)',
            color: 'var(--gray-11)',
          }}
        >
          <PlusIcon width={14} height={14} />
          Добавить метку
        </Button>
      )}

      <Text size="1" color="gray" style={{ display: 'block', marginTop: '8px' }}>
        Выберите существующие метки или создайте новую
      </Text>
    </Box>
  )
}
