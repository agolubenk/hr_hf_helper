'use client'

import * as Popover from '@radix-ui/react-popover'
import { Box, Text, Flex, Button } from "@radix-ui/themes"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import styles from './WikiDeleteConfirmDialog.module.css'

interface WikiDeleteConfirmPopoverProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  trigger: React.ReactNode
  message?: string
}

export default function WikiDeleteConfirmPopover({
  isOpen,
  onClose,
  onConfirm,
  trigger,
  message = 'Вы уверены, что хотите удалить эту страницу?'
}: WikiDeleteConfirmPopoverProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }}>
      <Popover.Trigger asChild>
        {trigger}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content 
          className={styles.popoverContent} 
          side="top" 
          align="end" 
          sideOffset={8}
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          <Box className={styles.popoverHeader}>
            <Flex align="center" gap="3">
              <Box className={styles.iconContainer}>
                <ExclamationTriangleIcon width={20} height={20} />
              </Box>
              <Text size="2" weight="medium" className={styles.messageText}>
                {message}
              </Text>
            </Flex>
          </Box>

          <Flex gap="3" justify="end" className={styles.popoverFooter}>
            <Button
              size="2"
              variant="soft"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Нет
            </Button>
            <Button
              size="2"
              onClick={handleConfirm}
              className={styles.confirmButton}
            >
              Да
            </Button>
          </Flex>
          <Popover.Arrow className={styles.popoverArrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
