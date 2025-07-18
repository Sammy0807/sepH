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
│   ├── index.js
│   └── package.json
└── README.md
```

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