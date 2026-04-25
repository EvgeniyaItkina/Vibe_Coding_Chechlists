# To-Do Checklist Application

Full-stack checklist management application
A web application that allows users to create, manage, and track personal checklists.
This project is for learning purposes only.

## Project Structure

```
Site_AI_Agent/
├── frontend/                 # Frontend files
│   ├── index.html           # Main HTML
│   ├── styles.css           # Styling
│   ├── app.ts              # TypeScript frontend logic
│   └── app.js              # Compiled JavaScript
├── backend/                  # Backend files
│   ├── server.ts           # Express server with API endpoints
│   ├── server.js           # Compiled JavaScript
│   └── users/
│       └── user_data/      # User data stored as JSON files
├── package.json            # Project dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server


The server will run on `http://localhost:3000`

### 3. Open Frontend

Open `frontend/index.html` in your browser (use a local server for best results):
```bash
python -m http.server 8000  # from the Site_AI_Agent directory
```

Then visit: `http://localhost:8000/frontend/index.html`

## Features

- **User Registration**: Register with name and phone number
- **User Login**: Login with registered credentials
- **Create Checklists**: Create named to-do lists
- **Manage Items**: Add, edit, delete items in checklists
- **Mark Complete**: Check items as done (text becomes strikethrough)
- **Responsive Design**: Works on desktop and mobile
- **Modal Windows**: Clean UI with modal dialogs for registration and login
- **Data Persistence**: User data stored server-side in JSON files

## API Endpoints

### User Management
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Checklists
- `GET /api/checklists` - Get user's checklists
- `POST /api/checklists` - Create new checklist
- `DELETE /api/checklists/:name` - Delete checklist

### Items
- `POST /api/items` - Add item to checklist
- `PUT /api/items` - Update item
- `DELETE /api/items/:itemIndex` - Delete item

## Architecture

### Frontend (`frontend/`)
- **index.html**: Contains structure with modals for registration, login, and message display
- **styles.css**: Responsive styling with warm green color scheme
- **app.ts**: TypeScript logic that communicates with backend API

### Backend (`backend/`)
- **server.ts**: Express server with CORS support
- **Data Storage**: User data stored as JSON files in `data/ *.json`
- **File naming**: `{name}_{phone_digits}.json`

## User Data Format

Each user is stored in a separate JSON file:

```json
{
  "name": "John",
  "phone": "+1234567890",
  "checklists": [
    {
      "name": "Shopping",
      "items": [
        {
          "text": "Milk",
          "done": false
        },
        {
          "text": "Bread",
          "done": true
        }
      ]
    }
  ]
}
```

## Testing with Playwright

This application is built to be tested with Playwright. Key testing points:
- User registration and login flows
- Checklist creation and deletion
- Item management (add, edit, delete, complete)
- Modal dialogs and notifications
- Data persistence

## Notes

- All data is stored server-side (no localStorage)
- CORS is enabled for frontend-backend communication
- User credentials are name + phone (not encrypted - for testing purposes)
- Data persists across browser sessions
- Authentication is simplified (name + phone) and not secure.
