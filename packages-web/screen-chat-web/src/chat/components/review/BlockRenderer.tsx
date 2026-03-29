import { memo } from 'react'
import { Image, Text, TouchableOpacity } from 'react-native'

import { ContentBlock } from './ReviewEditor'
import { styles } from './styles'

interface BlockRendererProps {
  block: ContentBlock
  onEdit: (block: ContentBlock) => void
  onRemove: (id: string) => void
  onImagePress?: (blockId: string) => void
}

const BlockRenderer = memo<BlockRendererProps>(({ block, onEdit, onRemove, onImagePress }) => {
  const renderContent = () => {
    switch (block.type) {
      case 'header':
        return <Text style={styles.headerText}>{block.content || 'Заголовок (нажмите и удерживайте для редактирования)'}</Text>

      case 'image':
        return block.imageUri ? (
          <Image source={{ uri: block.imageUri }} style={styles.imageBlock} resizeMode="cover" />
        ) : (
          <TouchableOpacity style={[styles.imageBlock, styles.emptyImage]} onPress={() => onImagePress?.(block.id)}>
            <Text style={styles.emptyImageText}>Нажмите, чтобы добавить фото</Text>
          </TouchableOpacity>
        )

      default: // text
        return <Text style={styles.textBlock}>{block.content || 'Текст (нажмите и удерживайте для редактирования)'}</Text>
    }
  }

  return (
    <TouchableOpacity style={styles.blockContainer} onLongPress={() => onEdit(block)} activeOpacity={0.7}>
      {renderContent()}
      <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(block.id)}>
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )
})

export default BlockRenderer
