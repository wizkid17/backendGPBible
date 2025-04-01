# Listado de Endpoints de la API de GPBible

Este documento proporciona un listado completo de todos los endpoints disponibles en la API de GPBible para facilitar las pruebas.

## Configuración para Postman

Para probar estos endpoints, puedes importar el archivo `postman-collection.json` en Postman y configurar las variables de entorno:

- `base_url`: URL base de la API (por defecto: `http://localhost:3000`)
- `auth_token`: Token JWT de autenticación
- `userId`, `userId1`, `userId2`: IDs de usuarios para pruebas
- `conversationId`: ID de una conversación
- `groupId`: ID de un grupo

## Endpoints de Autenticación

### Login
- **URL**: `POST /auth/login`
- **Body**:
  ```json
  {
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
  }
  ```
- **Respuesta**: Devuelve un token JWT

### Registro
- **URL**: `POST /auth/register`
- **Body**:
  ```json
  {
    "email": "nuevo@ejemplo.com",
    "password": "contraseña123",
    "name": "Nuevo Usuario"
  }
  ```

## Endpoints de Calificaciones de la App

### Enviar Calificación (Autenticado)
- **URL**: `POST /app-ratings`
- **Auth**: Requiere token JWT
- **Body**:
  ```json
  {
    "rating": 5,
    "feedback": "¡Me encanta esta aplicación!",
    "dontShowAgain": false
  }
  ```

### Enviar Calificación Anónima
- **URL**: `POST /app-ratings/anonymous`
- **Body**:
  ```json
  {
    "rating": 4,
    "feedback": "Buena aplicación pero podría tener más funcionalidades",
    "dontShowAgain": true
  }
  ```

### Obtener Estado de Calificación
- **URL**: `GET /app-ratings/status`
- **Auth**: Requiere token JWT

## Endpoints de Mensajería

### Mensajes

#### Enviar Mensaje (Nuevo destinatario)
- **URL**: `POST /messaging/messages`
- **Auth**: Requiere token JWT
- **Body**:
  ```json
  {
    "content": "Hola, ¿cómo estás?",
    "recipientId": "id-del-usuario"
  }
  ```

#### Enviar Mensaje (Conversación existente)
- **URL**: `POST /messaging/messages`
- **Auth**: Requiere token JWT
- **Body**:
  ```json
  {
    "content": "¡Hola de nuevo!",
    "conversationId": "id-de-conversacion"
  }
  ```

#### Enviar Mensaje a Grupo
- **URL**: `POST /messaging/messages`
- **Auth**: Requiere token JWT
- **Body**:
  ```json
  {
    "content": "¡Hola a todos!",
    "groupId": "id-del-grupo"
  }
  ```

#### Obtener Mensajes de una Conversación
- **URL**: `GET /messaging/conversations/:conversationId/messages`
- **Auth**: Requiere token JWT

#### Obtener Mensajes de un Grupo
- **URL**: `GET /messaging/groups/:groupId/messages`
- **Auth**: Requiere token JWT

#### Marcar Mensajes como Leídos
- **URL**: `POST /messaging/conversations/:conversationId/read`
- **Auth**: Requiere token JWT

### Grupos

#### Crear Grupo
- **URL**: `POST /messaging/groups`
- **Auth**: Requiere token JWT
- **Body**:
  ```json
  {
    "name": "Grupo familiar",
    "description": "Grupo para comunicación familiar",
    "avatarUrl": "https://ejemplo.com/avatar.jpg",
    "memberIds": ["id-miembro-1", "id-miembro-2"]
  }
  ```

#### Añadir Miembros a un Grupo
- **URL**: `POST /messaging/groups/members`
- **Auth**: Requiere token JWT
- **Body**:
  ```json
  {
    "groupId": "id-del-grupo",
    "memberIds": ["id-miembro-1", "id-miembro-2"]
  }
  ```

#### Obtener Grupos del Usuario
- **URL**: `GET /messaging/groups`
- **Auth**: Requiere token JWT

#### Obtener Detalles de un Grupo
- **URL**: `GET /messaging/groups/:groupId`
- **Auth**: Requiere token JWT

### Conversaciones

#### Obtener Conversaciones del Usuario
- **URL**: `GET /messaging/conversations`
- **Auth**: Requiere token JWT

#### Obtener Conteo de Mensajes No Leídos
- **URL**: `GET /messaging/unread-counts`
- **Auth**: Requiere token JWT

## Endpoints de Usuarios

### Obtener Perfil de Usuario
- **URL**: `GET /users/profile`
- **Auth**: Requiere token JWT 