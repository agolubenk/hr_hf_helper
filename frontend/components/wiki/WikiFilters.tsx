'use client'

import { Flex, Box, Text, TextField, Button } from "@radix-ui/themes"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import styles from './WikiFilters.module.css'

interface Tag {
  id: string
  label: string
  color: string
}

interface WikiFiltersProps {
  tags: Tag[]
  selectedTag: string | null
  onTagSelect: (tagId: string | null) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export default function WikiFilters({
  tags,
  selectedTag,
  onTagSelect,
  searchQuery,
  onSearchChange,
}: WikiFiltersProps) {
  return (
    <Box className={styles.filtersContainer}>
      {/* Поиск - выше меток */}
      <Flex gap="2" align="center" className={styles.searchContainer} mb="3">
        <TextField.Root
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по названию или содержимому..."
          style={{ flex: 1 }}
        />
        <Button
          size="3"
          variant="soft"
          style={{
            backgroundColor: 'var(--gray-2)',
            border: '1px solid var(--gray-6)',
          }}
        >
          <MagnifyingGlassIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />
        </Button>
      </Flex>
      
      {/* Фильтр по тегам */}
      <Flex align="center" gap="2" wrap="wrap">
        <Flex align="center" gap="2">
          <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text size="1" style={{ color: 'var(--gray-11)' }}>🏷️</Text>
          </Box>
          <Text size="2" weight="medium" color="gray">
            Фильтр по меткам:
          </Text>
        </Flex>
        
        <Button
          size="2"
          variant={selectedTag === null ? 'solid' : 'soft'}
          style={{
            backgroundColor: selectedTag === null ? '#2563eb' : 'var(--gray-3)',
            color: selectedTag === null ? '#ffffff' : 'var(--gray-11)',
            borderRadius: '9999px',
          }}
          onClick={() => onTagSelect(null)}
        >
          Все теги
        </Button>
        
        <Flex gap="2" wrap="wrap">
          {tags.map((tag) => (
            <Button
              key={tag.id}
              size="2"
              variant={selectedTag === tag.id ? 'solid' : 'soft'}
              style={{
                backgroundColor: selectedTag === tag.id ? tag.color : 'transparent',
                color: selectedTag === tag.id ? '#ffffff' : tag.color,
                border: `1px solid ${tag.color}`,
                borderRadius: '9999px',
              }}
              onClick={() => onTagSelect(selectedTag === tag.id ? null : tag.id)}
            >
              {tag.label}
            </Button>
          ))}
        </Flex>
      </Flex>
    </Box>
  )
}
