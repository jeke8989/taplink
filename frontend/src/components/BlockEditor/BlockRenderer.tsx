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
  EventDateTimeBlock,
  EventLocationBlock,
  EventRegistrationBlock,
  EventScheduleBlock,
  EventSpeakersBlock,
  EventPriceBlock,
  EventGalleryBlock,
  EventTicketSaleBlock,
  ImageCarouselBlock,
  DateTimeBlock,
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
    case BlockType.EVENT_DATE_TIME:
      return <EventDateTimeBlock content={content} isEditing={isEditing} onChange={onChange} />;
    case BlockType.EVENT_LOCATION:
      return <EventLocationBlock content={content} isEditing={isEditing} onChange={onChange} />;
    case BlockType.EVENT_REGISTRATION:
      return <EventRegistrationBlock content={content} isEditing={isEditing} onChange={onChange} />;
    case BlockType.EVENT_SCHEDULE:
      return <EventScheduleBlock content={content} isEditing={isEditing} onChange={onChange} />;
    case BlockType.EVENT_SPEAKERS:
      return <EventSpeakersBlock content={content} isEditing={isEditing} onChange={onChange} />;
    case BlockType.EVENT_PRICE:
      return <EventPriceBlock content={content} isEditing={isEditing} onChange={onChange} />;
    case BlockType.EVENT_GALLERY:
      return <EventGalleryBlock content={content} isEditing={isEditing} onChange={onChange} />;
    case BlockType.EVENT_TICKET_SALE:
      return <EventTicketSaleBlock content={content} isEditing={isEditing} onChange={onChange} />;
    case BlockType.IMAGE_CAROUSEL:
      return <ImageCarouselBlock content={content} isEditing={isEditing} onChange={onChange} />;
    case BlockType.DATE_TIME:
      return <DateTimeBlock content={content} isEditing={isEditing} onChange={onChange} />;
    default:
      console.error('Unknown block type:', type);
      return <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
        Неизвестный тип блока: {type}
      </div>;
  }
};

