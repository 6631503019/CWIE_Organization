# CWIE Organization Backend

A comprehensive Express.js + MongoDB backend API for managing organizations, reviews, MOUs, and roadshows with JWT authentication and custom error handling.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **File Upload**: Support for logos, MOU documents, posters, and activity images  
- **Custom Error Handling**: Detailed error codes and structured responses
- **Data Validation**: Comprehensive input validation with custom error messages
- **Security**: Helmet, CORS, rate limiting, and input sanitization
- **Database**: MongoDB with Mongoose ODM
- **API Documentation**: RESTful API with consistent response format

## 📁 Project Structure

```
backend/
├── controllers/          # Business Logic
│   ├── authController.js
│   ├── organizationController.js
│   ├── reviewController.js
│   ├── mouController.js
│   └── roadshowController.js
├── models/              # MongoDB Schemas  
│   ├── User.js
│   ├── Organization.js
│   ├── Review.js
│   ├── MOU.js
│   └── Roadshow.js
├── routes/              # API Routes
│   ├── authRoutes.js
│   ├── organizationRoutes.js
│   ├── reviewRoutes.js
│   ├── mouRoutes.js
│   └── roadshowRoutes.js
├── middleware/          # Middleware Functions
│   ├── auth.js
│   ├── errorHandler.js
│   └── upload.js
├── config/              # Database Configuration
│   ├── database.js
│   └── jwt.js
├── utils/               # Utility Functions
│   ├── customError.js
│   └── errorCodes.js
├── uploads/             # File Uploads
│   ├── logos/
│   ├── mou/
│   ├── posters/
│   └── activities/
└── server.js           # Main Server File
```

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update environment variables:
   ```bash
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/cwie_organization
   JWT_SECRET=your_very_long_and_secure_jwt_secret_key
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔐 Authentication

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

## 📊 API Endpoints

### Organizations
- `GET /api/organizations` - Get all organizations
- `GET /api/organizations/:id` - Get single organization
- `POST /api/organizations` - Create organization (Admin only)
- `PUT /api/organizations/:id` - Update organization (Admin only)
- `DELETE /api/organizations/:id` - Delete organization (Admin only)

### Reviews
- `GET /api/reviews/organization/:organizationId` - Get reviews for organization
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review (Admin only)
- `DELETE /api/reviews/:id` - Delete review (Admin only)

### MOUs
- `GET /api/mou` - Get all MOUs
- `GET /api/mou/:id` - Get single MOU
- `POST /api/mou` - Create MOU (Admin only)
- `PUT /api/mou/:id` - Update MOU (Admin only)
- `DELETE /api/mou/:id` - Delete MOU (Admin only)

### Roadshows
- `GET /api/roadshows` - Get all roadshows
- `GET /api/roadshows/:id` - Get single roadshow
- `POST /api/roadshows` - Create roadshow (Admin only)
- `PUT /api/roadshows/:id` - Update roadshow (Admin only)
- `DELETE /api/roadshows/:id` - Delete roadshow (Admin only)

## 🚨 Error Handling

The API uses a comprehensive error code system with 5-digit codes:

### Error Code Format
- **401xx**: Authentication Errors
- **400xx**: Validation Errors  
- **403xx**: Forbidden Errors
- **404xx**: Not Found Errors
- **409xx**: Conflict Errors
- **500xx**: Server Errors

### Example Error Response
```json
{
  "success": false,
  "message": "Invalid email address format",
  "errorCode": 40010,
  "statusCode": 400,
  "timestamp": "2026-01-11T10:30:00.000Z",
  "data": {
    "field": "email",
    "value": "invalid-email"
  }
}
```

## 📁 File Upload

The API supports file uploads for:
- **Organization Logos**: JPG, PNG, GIF (max 10MB)
- **MOU Documents**: PDF only (max 10MB)
- **Roadshow Posters**: JPG, PNG, GIF (max 10MB)
- **Activity Images**: JPG, PNG, GIF (max 10MB)

Files are stored in the `uploads/` directory with organized subdirectories.

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Comprehensive data validation
- **File Upload Security**: Type and size restrictions

## 🗄️ Database Schema

### User Schema
- Email (unique, required)
- Password (hashed, required)
- Name (required)
- Role (user/admin)
- isActive (boolean)

### Organization Schema
- Thai/English names (required)
- Thai/English addresses (required)
- Organization type (enum)
- Contact information
- Logo path
- Visibility settings

### Review Schema
- Organization reference
- Job position
- Review text
- Rating (1-5)

### MOU Schema
- Organization reference
- File path
- Publication status

### Roadshow Schema
- Topic and details
- Event date
- Poster and activity images
- Visibility settings

## 🚀 Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Set environment variables**
   ```bash
   NODE_ENV=production
   MONGODB_URI=<production-mongodb-uri>
   JWT_SECRET=<production-jwt-secret>
   ```

3. **Start production server**
   ```bash
   npm start
   ```

## 📝 API Testing

### Health Check
```bash
GET /api/health
```

### API Info
```bash
GET /api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.