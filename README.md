# DevXchange - Stack Overflow Clone

A modern, full-featured Q&A platform inspired by Stack Overflow, built with Next.js and Appwrite. DevXchange allows developers to ask questions, share knowledge, and collaborate with a global developer community.

## 🚀 Features

### Core Functionality

- **Question & Answer System**
  - Ask questions with rich text editor (Markdown support)
  - Post answers to questions
  - Edit and delete your own questions/answers
  - Image attachments for questions
  - Tag-based question categorization

- **Voting System**
  - Upvote/downvote questions and answers
  - Real-time reputation tracking
  - Vote-based content ranking

- **Comments**
  - Comment on questions and answers
  - Real-time comment updates
  - Delete your own comments

- **User Profiles**
  - View user statistics (reputation, questions asked, answers given)
  - Browse user's questions, answers, and votes
  - Edit profile information
  - Profile pages with activity tracking

- **Search & Filter**
  - Search questions by title and content
  - Filter questions by tags
  - Pagination for large result sets

- **Authentication & Authorization**
  - User registration and login
  - Protected routes (e.g., ask question page)
  - Session management with automatic verification
  - Secure logout functionality

### User Experience

- **Modern UI/UX**
  - Dark theme with beautiful gradients
  - Responsive design (mobile-friendly)
  - Smooth animations and transitions
  - Interactive components (particles, shimmer effects, magic cards)
  - Floating navigation bar

- **Real-time Updates**
  - Live comment additions
  - Dynamic vote counts
  - Instant UI updates after actions

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16.0.10](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: 
  - Radix UI primitives
  - Custom animated components (particles, shimmer, magic cards)
  - Tabler Icons
- **State Management**: Zustand with Immer middleware
- **Rich Text Editor**: React Markdown Editor (@uiw/react-md-editor)
- **Animations**: Motion (Framer Motion), Canvas Confetti

### Backend & Database

- **Backend as a Service**: [Appwrite](https://appwrite.io/)
  - Authentication (Email/Password)
  - Database (Appwrite Tables)
  - Storage (File uploads)
  - Server SDK (node-appwrite)

### Key Libraries

- **State Persistence**: Zustand Persist middleware
- **Form Handling**: React Hook Form patterns
- **Utilities**: 
  - `slugify` for URL-friendly slugs
  - `clsx` and `tailwind-merge` for conditional styling
  - `immer` for immutable state updates

## 📁 Project Structure

```
stackoverflow-clone/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── logout/
│   ├── api/                      # API routes
│   │   ├── answer/
│   │   └── vote/
│   ├── components/               # Page-specific components
│   │   ├── Header.tsx
│   │   ├── HeroSection.tsx
│   │   └── ...
│   ├── questions/                # Question pages
│   │   ├── ask/                  # Ask question (protected)
│   │   ├── [quesId]/[quesName]/  # Question detail
│   │   └── page.tsx              # Questions list
│   └── users/                    # User profile pages
│       └── [userId]/[userSlug]/
├── components/                   # Reusable components
│   ├── Answers.tsx
│   ├── Comments.tsx
│   ├── ProtectedRoute.tsx
│   ├── QuestionCard.tsx
│   └── ui/                       # UI component library
├── models/                       # Data models & config
│   ├── client/                   # Client-side Appwrite config
│   ├── server/                   # Server-side Appwrite config
│   └── name.ts                   # Collection/bucket names
├── store/                        # State management
│   └── auth.ts                   # Authentication store
├── utils/                        # Utility functions
└── lib/                          # Shared utilities
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Appwrite account and project
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stackoverflow-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
   APPWRITE_API_KEY=your-api-key
   ```

4. **Set up Appwrite Database**
   
   The application will automatically create the database and collections on first run. Alternatively, you can run the setup scripts manually:
   - Database: `models/server/createDB.ts`
   - Collections: `models/server/*.collection.ts`

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### Collections

- **questions**: Stores question data
  - `title` (string)
  - `content` (string, markdown)
  - `tags` (string array)
  - `authorId` (string)
  - `attachmentId` (string, optional)

- **answers**: Stores answer data
  - `questionId` (string)
  - `content` (string, markdown)
  - `authorId` (string)

- **comments**: Stores comments on questions/answers
  - `type` (string: "question" | "answer")
  - `typeId` (string)
  - `content` (string)
  - `authorId` (string)

- **votes**: Stores upvote/downvote data
  - `type` (string: "question" | "answer")
  - `typeId` (string)
  - `votedById` (string)
  - `voteStatus` (string: "upvoted" | "downvoted")

### Indexes

- Fulltext indexes on `questions.title` and `questions.content` for search functionality
- Regular indexes on frequently queried fields

## 🔐 Authentication Flow

1. **Registration**: User creates account → Auto-login → Redirect to home
2. **Login**: User logs in → Session created → State updated → Redirect
3. **Session Management**: Automatic session verification on app load
4. **Protected Routes**: Routes like "Ask Question" require authentication
5. **Logout**: Clears session and state → Redirects to home

## 🎨 Key Features Implementation

### State Management

- **Zustand Store**: Centralized authentication state
- **Persist Middleware**: State persists across page reloads
- **Immer Middleware**: Immutable state updates

### Performance Optimizations

- **Connection Pooling**: Singleton Appwrite client instances
- **Cached Initialization**: Database/storage checks cached after first run
- **Parallel Queries**: Multiple database queries executed in parallel
- **Pagination**: Efficient data loading with offset/limit

### Security

- **Protected Routes**: Client and server-side route protection
- **Session Verification**: Automatic session validation
- **API Key Security**: Server-side API keys never exposed to client

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚢 Deployment

The application can be deployed on any platform that supports Next.js:

- **Vercel** (Recommended) - Optimized for Next.js
- **Netlify** - Great for static/serverless
- **Railway** - Full-stack deployment
- **Docker** - Containerized deployment

Make sure to set environment variables in your deployment platform.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Inspired by Stack Overflow
- Built with Next.js and Appwrite
- UI components from various open-source libraries

---

**Built with ❤️ for the developer community**
