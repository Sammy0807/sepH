# SEP Health

An AI-powered companion for preventive wellness and smarter self-care.

## 🚀 Features

- **Daily Nudges**: Stay on track with gentle reminders tailored to your wellness journey
- **Symptom Logging**: Track how you feel and identify patterns before they become problems
- **Wearable Sync**: Connect to devices like Fitbit and Apple Watch for automatic health metrics
- **Doctor Visit Memory**: Record key notes from appointments and get smart reminders
- **AI Triage** (Coming Soon): Receive early warnings and smart health assessments

## 📁 Project Structure

```
SEPHealth/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── components/              # Modular component structure
│   │   │   ├── Header/              # Hero section with CTA
│   │   │   │   ├── Header.jsx
│   │   │   │   └── Header.css
│   │   │   ├── SurveyBanner/        # Wellness survey promotion
│   │   │   │   ├── SurveyBanner.jsx
│   │   │   │   └── SurveyBanner.css
│   │   │   ├── Features/            # Feature showcase grid
│   │   │   │   ├── Features.jsx
│   │   │   │   └── Features.css
│   │   │   ├── Footer/              # Waitlist signup and links
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Footer.css
│   │   │   ├── WellnessCheck/       # Health assessment questionnaire
│   │   │   │   ├── WellnessCheck.jsx
│   │   │   │   └── WellnessCheck.css
│   │   │   ├── LoginPage/           # User authentication
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── LoginPage.css
│   │   │   └── LandingPage/         # Main landing page composition
│   │   │       ├── LandingPage.jsx
│   │   │       └── LandingPage.css
│   │   ├── App.js                   # Main app with routing
│   │   ├── App.css                  # Global styles
│   │   └── index.js                 # App entry point
│   └── package.json
├── server/                          # Backend API server
│   ├── index.js                     # Express app entry point
│   ├── models/                      # Mongoose models (User, Waitlist)
│   ├── controllers/                 # Route logic (auth, waitlist)
│   ├── routes/                      # Express route definitions
│   └── package.json
└── README.md
```

---

## 🗄️ Backend (Server) Structure & Development

The backend follows a classic **MVC (Model-View-Controller)** pattern for maintainability and scalability:

- **models/**: Mongoose schemas and models (e.g., `User.js`, `Waitlist.js`)
- **controllers/**: Business logic for each resource (e.g., `authController.js`, `waitlistController.js`)
- **routes/**: Express route definitions, mapping endpoints to controller functions (e.g., `auth.js`, `waitlist.js`)
- **index.js**: App entry point, connects to MongoDB, sets up middleware, and mounts routes

### Example Flow
- `POST /api/register` → `routes/auth.js` → `controllers/authController.js` → `models/User.js`
- `POST /api/waitlist` → `routes/waitlist.js` → `controllers/waitlistController.js` → `models/Waitlist.js`

### Adding a New Resource
1. Create a new model in `models/`
2. Add a controller in `controllers/`
3. Define routes in `routes/`
4. Mount the new route in `index.js`

### Backend Development Guidelines
- Keep business logic in controllers, not in routes or index.js
- Use async/await for all database operations
- Validate input in controllers
- Use environment variables for secrets and DB URIs
- Write tests for controllers and routes

---

## 🧪 Backend Testing

Automated tests are essential for ensuring the reliability of your backend API. Use [Jest](https://jestjs.io/) and [Supertest](https://github.com/visionmedia/supertest) for testing Express routes and controllers.

### Example Test File Structure
```
server/
  └── tests/
      ├── auth.test.js         # Tests for auth endpoints
      └── waitlist.test.js     # Tests for waitlist endpoints
```

### Writing a Test (Example: Auth Route)
```js
// server/tests/auth.test.js
const request = require('supertest');
const app = require('../index'); // Export your Express app from index.js

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
```

### Running Backend Tests
```bash
cd server
npm install --save-dev jest supertest
npm test
```

- Place all backend tests in `server/tests/`
- Use `describe` and `it` blocks for organization
- Mock database connections as needed for isolated tests

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Frontend Setup
```bash
cd client
npm install
npm start
```

### Backend Setup
```bash
cd server
npm install
npm start
```

## 🧪 Testing

Run the test suite:
```bash
cd client
npm test
```

The test suite includes:
- Component rendering tests
- User interaction tests
- Form submission tests
- Route navigation tests

## 🎨 Styling

Each component has its own CSS file for modular styling:
- Component-specific styles are in individual `.css` files
- Global styles are in `App.css`
- Responsive design with mobile-first approach

## 🔧 Development Guidelines

### Component Structure
- Each component is in its own folder with `.jsx` and `.css` files
- Components use PropTypes for type checking
- JSDoc comments for documentation
- Consistent naming conventions

### Code Quality
- ESLint configuration for code consistency
- PropTypes for type safety
- Comprehensive test coverage
- Modular component architecture

### Adding New Components
1. Create a new folder in `src/components/`
2. Add component file (e.g., `ComponentName.jsx`)
3. Add corresponding CSS file (e.g., `ComponentName.css`)
4. Add PropTypes and JSDoc comments
5. Write tests for the component
6. Import and use in parent components

## 🚀 Deployment

### Frontend
```bash
cd client
npm run build
```

### Backend
```bash
cd server
npm start
```

## 📝 API Endpoints

- `POST /api/waitlist` - Add email to waitlist
- `POST /api/register` - User registration
- `POST /api/login` - User authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.