# AI Chat Module

Este módulo proporciona funcionalidad de chat con inteligencia artificial para responder preguntas sobre la Biblia y temas espirituales.

## Configuración

El módulo utiliza la API de OpenAI para generar respuestas. Para configurar la integración, debes agregar las siguientes variables de entorno en tu archivo `.env`:

```
# OpenAI Configuration
OPENAI_API_KEY=tu-clave-api-de-openai
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=500
```

### Variables de entorno

- `OPENAI_API_KEY`: Tu clave API de OpenAI. Puedes obtenerla en [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- `OPENAI_MODEL`: El modelo de OpenAI a utilizar (por defecto: gpt-3.5-turbo)
- `OPENAI_TEMPERATURE`: Controla la aleatoriedad de las respuestas (0.0 - 1.0)
- `OPENAI_MAX_TOKENS`: Número máximo de tokens en la respuesta

## Modo simulado (Dummy Mode)

Si no se proporciona una clave API válida, el servicio funcionará en "modo simulado" y generará respuestas predefinidas basadas en palabras clave en los mensajes del usuario. Esto es útil para desarrollo y pruebas.

## Endpoints de la API

- `POST /ai-chat/send-message`: Envía un mensaje al asistente de IA
- `GET /ai-chat/conversations`: Obtiene las conversaciones recientes del usuario
- `GET /ai-chat/conversation/:conversationId`: Obtiene una conversación específica
- `POST /ai-chat/conversation/:conversationId`: Guarda mensajes en una conversación
- `DELETE /ai-chat/conversation/:conversationId`: Elimina una conversación
- `PUT /ai-chat/conversation/:conversationId/title`: Actualiza el título de una conversación

## Estructura de las conversaciones

Las conversaciones tienen la siguiente estructura:

- `id`: Identificador único de la conversación
- `userId`: ID del usuario propietario
- `title`: Título de la conversación (generado automáticamente del primer mensaje)
- `messages`: Array de mensajes en la conversación
  - `role`: Rol del mensaje (user, assistant, system)
  - `content`: Contenido del mensaje

## Manejo de errores

El servicio incluye manejo de diversos errores:

- Límites de tasa (rate limits) de la API de OpenAI
- Errores de red
- Errores de autorización
- Conversaciones no encontradas

En caso de errores críticos con la API de OpenAI, el servicio caerá automáticamente al modo simulado para garantizar que los usuarios siempre reciban una respuesta. 