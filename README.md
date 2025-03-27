# E-Commerce Platform - Angular Frontend

[![Angular](https://img.shields.io/badge/Angular-v16+-red.svg)](https://angular.io/)
[![.NET Core](https://img.shields.io/badge/.NET-v7.0+-blue.svg)](https://dotnet.microsoft.com/)

A modern e-commerce platform with a responsive Angular frontend and .NET Core API backend, supporting both authenticated users and guest shoppers.
The Project Back-End: [Back-End](https://github.com/omar-salah-elshafey/ecommerce-backend)

## Key Features

### 🛒 Core Shopping Features
- **Guest Shopping Experience**
  - Add items to cart without registration
  - Persistent cart using browser LocalStorage
  - Cart merging upon login
- **User Authentication**
  - JWT-based registration/login
  - Refresh token rotation
  - Role-based authorization
- **Product Management**
  - Infinite scroll product listing
  - Category filtering
  - Search functionality
  - Product details with image gallery
- **Cart & Wishlist**
  - Real-time quantity updates
  - Stock validation
  - Max order quantity enforcement
  - Wishlist management

### 👤 User Features
- **Profile Management**
  - Update personal information
  - Change password functionality
  - Order history tracking
  - Account deletion
- **UI/UX**
  - RTL (Right-to-Left) Arabic support
  - Responsive design
  - Material Design components
  - Form validations
  - Loading states & error handling

## Tech Stack

### Frontend
| Component              | Technology                          |
|------------------------|-------------------------------------|
| Framework              | Angular 19                         |
| UI Library             | Angular Material                    |
| State Management       | RxJS Observables + BehaviorSubjects|
| Authentication         | JWT with HTTP Interceptors         |
| Cookie Management      | ngx-cookie-service                 |
| Form Handling          | Reactive Forms                     |
| HTTP Client            | Angular HttpClient                 |
| Animation              | Angular Animations                 |

### Backend (API)
- .NET Core 8 Web API
- Entity Framework Core
- CQRS with MediatR
- JWT Authentication
- AutoMapper
- FluentValidation
- Swagger/OpenAPI Documentation

## Development Setup

### Prerequisites
- Node.js v18+
- Angular CLI v16+
- .NET Core SDK 7.0+
- SQL Server (or compatible database)

### Installation
1. Clone repository:
   ```bash
   git clone https://github.com/omar-salah-elshafey/ecommerce-frontend.git
   cd ecommerce-platform/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   # src/environments/environment.ts
   export const environment = {
     production: false,
     apiUrl: 'https://localhost:7085/api' (or a different port if configured).
   };
   ```

4. Run the Angular application:
   ```bash
   ng serve
   ```

5. Run the .NET API:
   ```bash
   cd ../backend
   dotnet run
   ```

## API Endpoints
| Service          | Endpoints                          |
|------------------|------------------------------------|
| Authentication   | `/api/Auth/register-user`, `/api/Auth/login`, `/api/Auth/refreshtoken` |
| Products         | `/api/Products`, `/api/Products/get-product-by-id/{id}` |
| Cart             | `/api/Carts/add-to-cart`, `/api/Carts/get-cart` |
| Wishlist         | `/api/Wishlists/add-to-wishlist/{productId}`, `/api/Wishlists/get-wishlist`, `/api/Wishlists/remove-wishlist-item/{productId}` |
| User Management  | `/api/UserManagement/get-current-user-profile`, `/api/UserManagement/update-user` |

## Project Structure
```
src/app/
├── core/
│   ├── guards/
│   ├── interceptors/
│   ├── models/
│   ├── services/
├── features/
│   ├── auth/
│   ├── cart/
│   ├── products/
│   ├── profile/
│   └── wishlist/
|   ...
├── shared/
│   ├── components/
│   └── directives/
└── environments/
```

## Key Services
- **AuthService**: Handles JWT authentication and token refresh
- **CartService**: Manages cart operations and local storage
- **ProductService**: Handles product fetching and filtering
- **UserProfileService**: Manages user profile operations
- **WishlistService**: Handles wishlist operations

## Additional Configuration
```typescript
// Sample environment configuration
export const environment = {
  production: false,
  apiUrl: 'https://your-api-url',
};
```

---
## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
