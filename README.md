# Echo Transaction Frontend

A modern Next.js frontend application for the Echo Transaction platform, built with TypeScript, Tailwind CSS, and React Hook Form.

## Features

- **Authentication Flow**
  - Email verification with OTP
  - Account type selection (Personal/Business)
  - Secure registration and login
  - Session management

- **User Interface**
  - Modern, responsive design
  - Tailwind CSS for styling
  - Lucide React icons
  - Form validation with Zod

- **Dashboard**
  - Personal and business account views
  - Account information display
  - Quick actions and statistics
  - Responsive navigation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Echo Transaction backend API running

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your backend API URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3001](http://localhost:3001) in your browser

## Project Structure

```
src/
├── app/                    # Next.js 13+ app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and API client
└── types/                # TypeScript type definitions
```

## Authentication Flow

1. **Email Verification** (`/auth/email-verification`)
   - User enters email address
   - System sends OTP via email
   - Email stored in sessionStorage

2. **OTP Verification** (`/auth/otp-verification`)
   - User enters 6-digit OTP code
   - System verifies OTP and returns sessionId
   - SessionId stored for registration

3. **Account Type Selection** (`/auth/account-type`)
   - User chooses Personal or Business account
   - Account type stored in sessionStorage

4. **Registration** (`/auth/register`)
   - Personal: firstname, lastname, password, optional AI fields
   - Business: above + business details (name, type, employee count)
   - Uses sessionId from OTP verification
   - Returns user data and access token

5. **Dashboard** (`/dashboard`)
   - Protected route requiring authentication
   - Displays account-specific information and actions

## API Integration

The frontend communicates with the Echo Transaction backend API:

- **POST** `/api/v1/auth/otp/send` - Send OTP to email
- **POST** `/api/v1/auth/otp/verify` - Verify OTP code
- **POST** `/api/v1/auth/register` - Create new user account
- **POST** `/api/v1/auth/login` - User authentication

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Lucide React** - Icon library

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Form Validation

Forms use Zod schemas for validation:
- Email format validation
- Password strength requirements
- Required field validation
- Business-specific field validation

### State Management

- **Authentication**: Custom `useAuth` hook with localStorage
- **Form State**: React Hook Form for form management
- **Session Data**: sessionStorage for temporary auth flow data

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables
3. Deploy to your preferred hosting platform

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Add proper error handling and validation
4. Test authentication flows thoroughly
# echo-transaction-frontend
