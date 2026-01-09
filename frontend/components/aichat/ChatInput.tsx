'use client'

import AnimatedAIInput from './AnimatedAIInput'

interface ChatInputProps {
  onSend: (message: string, modelId?: string, files?: File[]) => void
  onFileAttach?: (file: File) => void
}

export default function ChatInput({ onSend, onFileAttach }: ChatInputProps) {
  return <AnimatedAIInput onSend={onSend} onFileAttach={onFileAttach} />
}
