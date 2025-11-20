import React from 'react';
import { BlockType } from '../../api/blocks';
import {
  TextBlock,
  LinkBlock,
  AvatarBlock,
  DividerBlock,
  QABlock,
  IconTextBlock,
  MessengersBlock,
  SocialNetworksBlock,
  MapBlock,
  CustomBlock,
} from './blocks';

interface BlockRendererProps {
  type: BlockType;
  content: Record<string, unknown>;
  isEditing?: boolean;
  onChange?: (content: Record<string, unknown>) => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  type,
  content,
  isEditing = false,
  onChange,
}) => {
  switch (type) {
    case BlockType.TEXT:
      return <TextBlock content={content} isEditing={isEditing} onChange={onChange} />;
    case BlockType.LINK:
      return <LinkBlock content={content} isEditing={isEditing} onChange={onChange} />;
    case BlockType.AVATAR:
      return <AvatarBlock content={content} isEditing={isEditing} onChange={onChange} />;
    case BlockType.DIVIDER:
      return <DividerBlock content={content} isEditing={isEditing} onChange={onChange} />;
    case BlockType.QA:
      return <QABlock content={content} isEditing={isEditing} onChange={onChange} />;
    case BlockType.ICON_TEXT:
      return <IconTextBlock content={content} isEditing={isEditing} onChange={onChange} />;
    case BlockType.MESSENGERS:
      return <MessengersBlock content={content} isEditing={isEditing} onChange={onChange} />;
    case BlockType.SOCIAL_NETWORKS:
      return <SocialNetworksBlock content={content} isEditing={isEditing} onChange={onChange} />;
    case BlockType.MAP:
      return <MapBlock content={content} isEditing={isEditing} onChange={onChange} />;
    case BlockType.CUSTOM:
      return <CustomBlock content={content} isEditing={isEditing} onChange={onChange} />;
    default:
      return <div>Unknown block type</div>;
  }
};

