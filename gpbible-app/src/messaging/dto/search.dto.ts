import { IsOptional, IsString } from 'class-validator';

export class SearchResponseDto {
  people: PersonSearchResult[];
  chats: ChatSearchResult[];
  activeTab?: 'chats' | 'people' | null;
}

export class PersonSearchResult {
  id: string;
  name: string;
  picture?: string;
  lastMessage?: string;
  timestamp?: Date;
  isFaithful?: boolean;
}

export class ChatSearchResult {
  id: string;
  type: 'group' | 'conversation';
  name: string;
  picture?: string;
  lastMessage?: string;
  timestamp?: Date;
} 