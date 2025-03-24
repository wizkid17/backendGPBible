# Messaging Module

This module provides functionality for direct messaging between users and group chats in the application.

## Features

- Direct messaging between users
- Group chats with multiple participants
- Create new groups and add members
- Unread message counters
- Message status tracking (read/unread)

## API Endpoints

### Messages

#### Send a message
```
POST /messaging/messages
```

**Request body:**
```json
{
  "content": "Hello, how are you?",
  "recipientId": "user-uuid"  // For new conversations
}
```
OR
```json
{
  "content": "Hello, how are you?",
  "conversationId": "conversation-uuid"  // For existing conversations
}
```
OR
```json
{
  "content": "Hello everyone!",
  "groupId": "group-uuid"  // For group messages
}
```

#### Get conversation messages
```
GET /messaging/conversations/:conversationId/messages
```

#### Get group messages
```
GET /messaging/groups/:groupId/messages
```

#### Mark messages as read
```
POST /messaging/conversations/:conversationId/read
```

### Groups

#### Create a group
```
POST /messaging/groups
```

**Request body:**
```json
{
  "name": "Family Group",
  "description": "A group for family members",
  "avatarUrl": "https://example.com/image.jpg",
  "memberIds": ["user-uuid-1", "user-uuid-2"]
}
```

#### Add members to a group
```
POST /messaging/groups/members
```

**Request body:**
```json
{
  "groupId": "group-uuid",
  "memberIds": ["user-uuid-1", "user-uuid-2"]
}
```

#### Get user's groups
```
GET /messaging/groups
```

#### Get group details
```
GET /messaging/groups/:groupId
```

### Conversations

#### Get user's conversations
```
GET /messaging/conversations
```

#### Get unread message counts
```
GET /messaging/unread-counts
```

## Architecture

The messaging system consists of four main entities:

1. **ChatMessage** - Represents individual messages with content, sender, and destination (conversation or group)
2. **ChatConversation** - Represents a one-on-one conversation between two users
3. **ChatGroup** - Represents a group chat with multiple participants
4. **ChatGroupMember** - Links users to groups and tracks their admin status

## User Experience

As shown in the UI design:

1. Users start on the "Messages" screen showing all their conversations and group chats
2. Users can create new groups by selecting the "Create group" option
3. When creating a group, users can:
   - Set a name for the group
   - Select contacts to add to the group
   - Customize the group settings
4. In existing chats, users can:
   - Send messages
   - See when messages are read
   - View members of a group
   - Share invite links
   
The interface clearly indicates unread messages with notification counters and provides a smooth experience for navigating between direct messages and group conversations. 