# OAuth Setup Guide

This document provides instructions for setting up Google and Apple OAuth authentication.

## Current Status

✅ **Authentication System**: Fully implemented with email/password and SSO support
✅ **Frontend Integration**: Google and Apple Sign-In SDKs loaded and configured
✅ **Backend Endpoints**: OAuth callback handlers ready at `/api/auth/google` and `/api/auth/apple`
✅ **Environment Configuration**: Template files created with placeholder credentials

## What Works Now

- **Email/Password Authentication**: Fully functional with 8+ character password requirement
- **User Registration**: Create new accounts with email and password
- **User Login**: Authenticate existing users
- **Data Segregation**: Each user can only access their own todos
- **JWT Tokens**: Secure session management with 7-day expiration
- **Protected Routes**: Frontend automatically redirects unauthenticated users to login

## OAuth Setup Required

To enable Google and Apple Sign-In, you need to configure OAuth credentials:

### 1. Google OAuth Setup

1. **Create OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new project or select existing one
   - Enable "Google+ API"
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins: `http://localhost:5173` (and your production URL)
   - Add authorized redirect URIs: `http://localhost:5173` (and your production URL)

2. **Configure Frontend**:
   - Copy your Client ID
   - Update `/frontend/.env`:
     ```
     VITE_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com
     ```

3. **Configure Backend** (Optional - for server-side validation):
   - Update `/backend/.env`:
     ```
     GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET
     ```

### 2. Apple OAuth Setup

1. **Create Service ID**:
   - Go to [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list/serviceId)
   - Sign in with your Apple Developer account
   - Click "+" to create a new identifier
   - Select "Services IDs" and continue
   - Enter a description and identifier (e.g., `com.yourcompany.app`)
   - Configure "Sign in with Apple":
     - Add domains: `localhost` for development, your production domain
     - Add return URLs: `http://localhost:5173` for development, your production URL

2. **Configure Frontend**:
   - Update `/frontend/.env`:
     ```
     VITE_APPLE_CLIENT_ID=com.yourcompany.app
     VITE_APPLE_REDIRECT_URI=http://localhost:5173
     ```

3. **Configure Backend** (Optional - for server-side validation):
   - Create a Key in Apple Developer Portal (Keys section)
   - Download the `.p8` key file
   - Update `/backend/.env`:
     ```
     APPLE_CLIENT_ID=com.yourcompany.app
     APPLE_TEAM_ID=YOUR_TEAM_ID
     APPLE_KEY_ID=YOUR_KEY_ID
     APPLE_PRIVATE_KEY_PATH=/app/config/AuthKey.p8
     ```

### 3. Testing OAuth

Once configured:

1. **Restart the Application**:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

2. **Test Google Sign-In**:
   - Navigate to http://localhost:5173
   - Click "Sign in with Google"
   - A popup/redirect will appear with Google's OAuth consent screen
   - After authorization, you'll be logged in automatically

3. **Test Apple Sign-In**:
   - Click "Sign in with Apple"
   - Apple's authentication popup will appear
   - After authorization, you'll be logged in automatically

## Development Without OAuth

The application is **fully functional** without OAuth setup:

- Use email/password authentication
- Create account at `/register`
- Login at `/login`
- All todo CRUD operations work with email/password auth

OAuth is an optional enhancement for user convenience.

## How It Works

### Frontend Flow

1. **Google**: Uses Google Sign-In JavaScript SDK
   - Initializes with client ID
   - Shows Google One Tap UI
   - Returns JWT credential token
   - Decodes JWT to extract email, sub (user ID), and name
   - Sends to backend `/api/auth/google`

2. **Apple**: Uses Apple Sign-In JavaScript SDK
   - Initializes with client ID and redirect URI
   - Shows Apple authentication popup
   - Returns authorization code and user info
   - Sends to backend `/api/auth/apple`

### Backend Flow

1. Receives OAuth data (email, providerId, name)
2. Checks if user exists with that provider
3. If exists: returns JWT token for existing user
4. If new: creates user account and returns JWT token
5. Frontend stores JWT token in localStorage
6. All subsequent API requests include JWT token in Authorization header

## Security Notes

- JWT tokens expire after 7 days
- Passwords are hashed with bcrypt (10 rounds)
- Minimum password length: 8 characters
- Each user's data is isolated by userId foreign key
- OAuth credentials should never be committed to git
- Use environment variables for all secrets
- In production, use HTTPS for all OAuth callbacks

## Troubleshooting

**Google Sign-In not appearing**:
- Check browser console for errors
- Verify `VITE_GOOGLE_CLIENT_ID` is set correctly
- Ensure domain is authorized in Google Cloud Console

**Apple Sign-In not working**:
- Apple requires HTTPS for production (use localhost for development)
- Verify Service ID configuration in Apple Developer Portal
- Check that domains and return URLs are correctly configured

**Backend OAuth errors**:
- Check backend logs: `docker-compose logs -f backend`
- Verify environment variables are loaded
- Test with email/password auth to isolate OAuth issues
