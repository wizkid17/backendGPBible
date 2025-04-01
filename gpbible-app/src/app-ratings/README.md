# App Ratings Module

This module provides functionality for collecting user ratings and feedback about the app.

## Features

- Collect app ratings (1-5 stars) from authenticated users
- Collect optional feedback text along with ratings
- Allow users to opt out of future rating prompts
- Support for anonymous ratings
- API to check if a user has already rated the app

## API Endpoints

### Submit a rating (authenticated)

```
POST /app-ratings
```

**Request body:**
```json
{
  "rating": 5,
  "feedback": "I love this app!",
  "dontShowAgain": false
}
```

**Response:**
```json
{
  "id": "uuid",
  "rating": 5,
  "feedback": "I love this app!",
  "userId": "user-uuid",
  "dontShowAgain": false,
  "createdAt": "2023-06-15T12:34:56.789Z"
}
```

### Submit an anonymous rating

```
POST /app-ratings/anonymous
```

**Request body:**
```json
{
  "rating": 4,
  "feedback": "Great app but could use more features",
  "dontShowAgain": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "rating": 4,
  "feedback": "Great app but could use more features",
  "userId": null,
  "dontShowAgain": true,
  "createdAt": "2023-06-15T12:34:56.789Z"
}
```

### Check user rating status

```
GET /app-ratings/status
```

**Response:**
```json
{
  "hasRated": true,
  "dontShowAgain": false
}
```

## Implementation in Frontend

The app rating dialog should be shown to users after they have used the app for a certain period or completed key actions. The dialog should:

1. Ask users if they are enjoying the app
2. If they respond positively, prompt them to rate on the app store
3. If they respond negatively, collect feedback to improve the app
4. Provide an option to not show the dialog again

Example implementation:
- Show the dialog after the user has used the app for 3 days
- Don't show if the user has already submitted a rating or opted out
- Allow the user to dismiss the dialog or select "Don't show again" 