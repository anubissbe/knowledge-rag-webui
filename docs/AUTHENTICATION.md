# Authentication System Documentation

## Overview

The Knowledge RAG WebUI implements a comprehensive JWT-based authentication system that provides secure user registration, login, and session management. The system is built with security best practices and provides a seamless user experience across frontend and backend.

## Architecture

### Backend Authentication
- **JWT Token-based Authentication**: Secure stateless authentication using JSON Web Tokens
- **Password Hashing**: BCrypt with salt rounds for secure password storage
- **Protected Routes**: Middleware-based route protection for sensitive endpoints
- **Token Verification**: Automatic token validation on protected API calls
- **Refresh Token Support**: Built-in token refresh capability

### Frontend Authentication
- **Authentication Context**: Centralized state management using React Context
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Token Persistence**: Secure token storage in localStorage with automatic cleanup
- **Real-time Auth State**: Reactive authentication state across the application

## Features

### User Registration
- **Form Validation**: Client-side and server-side validation
- **Username Requirements**: 3-20 characters, alphanumeric only
- **Password Security**: Minimum 8 characters with confirmation
- **Email Validation**: Proper email format checking
- **Duplicate Prevention**: Email uniqueness enforcement

### User Login
- **Demo Account**: `demo@example.com` / `demo` for testing
- **Remember Me**: Optional persistent login
- **Password Visibility**: Toggle to show/hide password
- **Error Handling**: User-friendly error messages
- **Auto-redirect**: Redirect to intended page after login

### Security Features
- **CORS Protection**: Configured cross-origin resource sharing
- **Rate Limiting**: API protection against brute force attacks
- **Input Validation**: Comprehensive request validation using express-validator
- **SQL Injection Prevention**: Parameterized queries and input sanitization
- **XSS Protection**: Content Security Policy headers
- **Token Expiration**: Configurable JWT expiration (default: 7 days)

## API Endpoints

### Authentication Routes
All authentication routes are prefixed with `/api/v1/auth/`:

#### POST /login
Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "username": "username",
    "name": "Full Name",
    "preferences": { ... }
  },
  "token": "jwt-token-string"
}
```

#### POST /register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "username": "username",
  "name": "Full Name"
}
```

**Response:**
```json
{
  "user": { ... },
  "token": "jwt-token-string"
}
```

#### GET /me
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "username": "username",
  "name": "Full Name",
  "preferences": { ... }
}
```

#### POST /refresh
Refresh JWT token.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "token": "new-jwt-token"
}
```

#### POST /logout
Logout user (client-side token cleanup).

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Protected Routes
The following API routes require authentication:
- `/api/v1/memories/*` - All memory operations
- `/api/v1/collections/*` - Collection management
- `/api/v1/analytics/*` - Analytics data
- `/api/v1/search/*` - Search functionality
- `/api/v1/export/*` - Data export

## Frontend Components

### Authentication Context (`AuthContext`)
Provides authentication state and methods throughout the application:

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
```

### Protected Route Component
Wraps components that require authentication:

```typescript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### Login Page (`/login`)
- Email and password fields with validation
- Demo account quick access
- Link to registration page
- Password visibility toggle
- Remember me option

### Register Page (`/register`)
- Full name, username, email, password fields
- Real-time validation feedback
- Password confirmation
- Link back to login page

### User Menu (Layout Component)
- User profile display
- Settings link
- Logout button
- Responsive design

## Configuration

### Environment Variables

#### Backend (.env)
```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=7d

# Server Configuration
PORT=5002
NODE_ENV=production

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,https://yourapp.com
```

#### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5002/api
VITE_WEBSOCKET_URL=ws://localhost:5002
```

## Security Considerations

### Production Deployment
1. **Change JWT Secret**: Use a strong, unique secret key in production
2. **HTTPS Only**: Ensure all authentication happens over HTTPS
3. **Secure Headers**: Implement proper security headers
4. **Token Expiration**: Set appropriate token expiration times
5. **Rate Limiting**: Configure rate limiting for login attempts
6. **Input Validation**: Validate all user inputs server-side
7. **CORS Configuration**: Restrict CORS to trusted domains

### Password Policy
- Minimum 8 characters length
- Consider implementing complexity requirements
- Regular password rotation recommendations
- Account lockout after failed attempts

### Token Management
- Store tokens securely in localStorage
- Clear tokens on logout
- Automatic token refresh before expiration
- Validate tokens on protected routes

## Testing

### E2E Test Coverage
- ✅ Unauthenticated user redirection
- ✅ Login form validation
- ✅ Demo account login
- ✅ User menu functionality
- ✅ Logout process
- ✅ Protected route access
- ✅ Registration form validation
- ✅ Navigation between auth pages
- ✅ Authentication state persistence

### Manual Testing Checklist
- [ ] Register new account with various inputs
- [ ] Login with valid and invalid credentials
- [ ] Test demo account access
- [ ] Verify protected route redirection
- [ ] Test token persistence across browser refresh
- [ ] Verify logout clears authentication state
- [ ] Test form validation edge cases
- [ ] Verify user menu functionality

## Troubleshooting

### Common Issues

#### "Invalid token" errors
- Check token expiration
- Verify JWT secret configuration
- Ensure proper Authorization header format

#### Login redirects not working
- Check route configuration
- Verify AuthContext implementation
- Ensure ProtectedRoute wrapper usage

#### Backend authentication failures
- Verify environment variables
- Check database user records
- Validate API endpoint availability

### Debug Mode
Enable debug logging:
```typescript
// In development
logger.debug('Authentication state:', { user, token, isAuthenticated });
```

## Future Enhancements

### Planned Features
- **OAuth Integration**: Google, GitHub, Microsoft login
- **Two-Factor Authentication**: TOTP/SMS verification
- **Session Management**: Active session monitoring
- **Password Reset**: Email-based password recovery
- **Account Verification**: Email verification on registration
- **Role-Based Access**: User roles and permissions

### Security Improvements
- **Refresh Token Rotation**: Enhanced token security
- **Device Management**: Track and manage login devices
- **Anomaly Detection**: Suspicious login pattern detection
- **Audit Logging**: Comprehensive authentication logs

## Support

For authentication-related issues:
1. Check the browser console for error messages
2. Verify API connectivity using network tab
3. Check backend logs for authentication errors
4. Ensure environment variables are properly configured
5. Test with demo account first

## Version History

- **v1.0.0**: Initial JWT-based authentication implementation
- **v1.1.0**: Added demo account and improved error handling
- **v1.2.0**: Enhanced security headers and rate limiting