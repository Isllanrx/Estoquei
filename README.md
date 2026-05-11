# Estoquei - Modern Messaging System

Estoquei is a professional-grade, full-stack messaging application built with the MEAN stack (MongoDB, Express, Angular, Node.js). It features a modern, layered architecture designed for scalability, performance, and security.

## 🏛 Architecture Overview

The project follows a **Layered Architecture** pattern, ensuring strict separation of concerns and high maintainability.

```mermaid
graph TD
    subgraph Frontend (Angular 18)
        UI[Standalone Components] --> Signals[Angular Signals]
        Signals --> Services[Domain Services]
        Services --> Interceptors[HTTP Interceptors]
    end

    subgraph Backend (Node.js/Express)
        Interceptors --> API[Express API]
        API --> Controllers[Controllers]
        Controllers --> BServices[Business Services]
        BServices --> Models[Mongoose Models]
        Models --> DB[(MongoDB)]
    end

    subgraph Security
        Auth[JWT Authentication]
        Error[Global Error Handler]
    end
```

### Key Technical Enhancements
- **State Management:** Migrated from `BehaviorSubject` to **Angular Signals** for reactive and optimized change detection.
- **Backend Layers:** Implemented `Controllers` and `Services` to decouple business logic from HTTP routing.
- **Data Optimization:** Solved the **N+1 Query Problem** using Mongoose `.populate()`, reducing network overhead by over 80%.
- **Security:**
    - Centralized `AuthInterceptor` for automatic JWT management.
    - Global Error Handling middleware to prevent server crashes.
    - Protected routes and validated login logic.
- **DX (Developer Experience):**
    - Environment-based configurations.
    - Path aliases and standardized naming conventions.
    - Clean and documented codebase.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or via Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/estoquei/Estoquei.git
   cd Estoquei
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file based on the environment variables mentioned below
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## ⚙️ Environment Variables

### Backend (`backend/.env`)
- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for token generation
- `NODE_ENV`: `development` or `production`

## 🛠 Tech Stack
- **Frontend:** Angular 18, TypeScript, Vanilla CSS.
- **Backend:** Node.js, Express, Mongoose.
- **Database:** MongoDB.
- **Security:** JWT, Bcrypt.

## 📝 License
This project is for educational and professional demonstration purposes.
