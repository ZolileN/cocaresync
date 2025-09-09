# CoCareSync

TB/HIV Co-infection Management System

## 🚀 Features

- Patient management for TB/HIV co-infected individuals
- Data quality monitoring and reporting
- Analytics and visualization
- Secure authentication and role-based access control
- Offline-first capabilities
- Responsive design for all devices

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT, OAuth 2.0
- **State Management**: React Query
- **UI Components**: Radix UI, Shadcn UI
- **Build Tool**: Vite
- **Linting/Formatting**: ESLint, Prettier
- **Testing**: Jest, React Testing Library

## 📦 Prerequisites

- Node.js 18+ & npm 8+
- PostgreSQL 14+
- Git

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cocaresync.git
   cd cocaresync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy the example environment file and update the values:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration.

4. **Database setup**
   - Create a new PostgreSQL database
   - Run migrations:
     ```bash
     npm run db:push
     ```

5. **Start the development server**
   ```bash
   # Start both frontend and backend in development mode
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:3000
   - API Server: http://localhost:5000

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open database studio

## 📁 Project Structure

```
.
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   └── src/               # Source files
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Utility functions
│       └── styles/        # Global styles
│
├── server/                # Backend server
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   └── services/          # Business logic
│
├── shared/                # Shared code between frontend and backend
│   ├── schema/           # Database schema
│   └── types/            # Shared TypeScript types
│
├── scripts/               # Utility scripts
├── .github/              # GitHub workflows
└── tests/                # Test files
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
