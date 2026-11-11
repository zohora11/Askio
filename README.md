
<div align="center">
  <h1>Askio</h1>
  <p><strong>Ask. Discover. Learn. Grow.</strong></p>
  <p>An AI-powered platform for learning, discovery, and personal growth.</p>
</div>

## Overview

Askio is an AI-powered web application that combines intelligent assistance, learning resources, and personal development tools in one platform. It enables users to discover resources, interact with an AI assistant, save content, and manage learning goals.

## Features

- AI-powered assistant with contextual queries
- Resource discovery, search, and filtering
- Personal library and bookmarks
- Learning goals and progress tracking
- Health and wellness resources
- User profiles and notifications
- English and Bengali language support
- Light and dark themes
- Firebase authentication and database integration
- BDApps OTP and subscription integration

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Backend:** Node.js, Express
- **AI Integration:** Google Gemini API
- **Database:** Firebase Cloud Firestore
- **Authentication:** Firebase Authentication
- **Storage:** Firebase Storage
- **Icons & Animation:** Lucide React, Motion

## Project Structure

```text
Askio/
├── public/
├── src/
│   ├── components/
│   ├── constants/
│   ├── context/
│   ├── data/
│   ├── screens/
│   ├── services/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
├── server.ts
├── firestore.rules
├── firebase-applet-config.json
├── .env.example
├── package.json
└── vite.config.ts
```

## Installation & Setup

### Prerequisites

- Node.js 20+
- npm
- Google Gemini API Key
- Firebase Project

### 1. Clone Repository

```bash
git clone https://github.com/<your-username>/<repository-name>.git
cd <repository-name>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory.

```env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

### 4. Firebase Configuration

Configure your Firebase project in `firebase-applet-config.json`.

Enable the following services:

- Firebase Authentication
- Cloud Firestore
- Firebase Storage

### 5. Run Application

```bash
npm run dev
```

Open the local URL displayed in the terminal.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build application |
| `npm start` | Start production server |
| `npm run preview` | Preview application |
| `npm run lint` | Run TypeScript checks |
| `npm run clean` | Clean build files |

## API Configuration

**Google Gemini API**
- Configure the API key using `GEMINI_API_KEY`.
- Keep the key in the server environment.

**Firebase**
- Use your own Firebase project configuration.
- Configure authentication, database, and storage permissions.

**BDApps**
- Configure the BDApps application credentials and API endpoints before enabling OTP and subscription services.

## Production Build

```bash
npm run build
npm start
```

Deploy using a Node.js-compatible hosting environment with the required environment variables.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push to your branch.
5. Submit a Pull Request.

## Security

- Never commit API keys or private credentials.
- Keep `.env.local` out of version control.
- Use your own Firebase configuration.
- Review Firestore and Storage security rules before deployment.

## License

No license has been specified yet.
