# CURSOR - AI Trading Platform

A professional AI-powered cryptocurrency trading analysis platform powered by Gemini 2.0 Flash.

## Features

- **AI-Powered Chart Analysis**: Upload trading charts and get instant AI analysis using Gemini 2.0 Flash
- **Professional Trading Signals**: Get precise entry/exit points, stop-loss levels, and risk management recommendations
- **Technical Analysis**: Comprehensive analysis including support/resistance levels, volume analysis, and technical indicators
- **Risk Management**: Advanced risk assessment and position sizing recommendations
- **Market Insights**: Deep market context analysis including market cycles and institutional activity
- **Real-time Processing**: Lightning-fast analysis results in seconds

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS with custom Cursor-inspired design
- **AI Integration**: Google Gemini 2.0 Flash
- **UI Components**: Radix UI with custom styling
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js

## Design Philosophy

The platform follows a clean, professional design inspired by Cursor's dark theme:

- **Minimalist Interface**: Clean, distraction-free design focused on functionality
- **Professional Typography**: Inter font family for optimal readability
- **Consistent Color Scheme**: Black background with white text and subtle gray accents
- **No Animations**: Performance-focused design without unnecessary animations
- **Responsive Design**: Optimized for all device sizes

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google AI API key for Gemini 2.0 Flash

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fahadcryptobot4.0
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add the following environment variables:
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_postgresql_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

## API Endpoints

### Chart Analysis
- **POST** `/api/analyze-chart`
  - Analyzes uploaded chart images using Gemini 2.0 Flash
  - Returns comprehensive trading analysis including signals, risk assessment, and recommendations

### Authentication
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/signup` - User registration

### Portfolio Management
- **GET/POST** `/api/portfolio` - Portfolio data management
- **GET/POST** `/api/trades` - Trade history management
- **GET/POST** `/api/signals` - Trading signals management

## Key Components

### Dashboard
- Clean, professional interface with quick stats
- AI capabilities overview
- Chart analysis section
- Recent analysis history

### Chart Upload
- Drag-and-drop file upload
- Image validation and preview
- Real-time analysis with Gemini 2.0 Flash
- Comprehensive results display

### Analysis Results
- Basic information (symbol, pattern, trend)
- Price levels (entry, target, stop-loss)
- Technical analysis and indicators
- Risk assessment and recommendations
- Market context and key levels

## Utility Functions

The platform includes comprehensive utility functions for:

- **File Validation**: Image file type and size validation
- **Data Formatting**: Price, percentage, and ratio formatting
- **Error Handling**: Consistent error message handling
- **API Response Sanitization**: Safe data processing and formatting

## Styling

### CSS Classes
- `.clean-card`: Professional card styling
- `.professional-button`: Consistent button styling
- `.professional-text`: Typography styling
- `.professional-heading`: Heading typography
- `.status-online/offline/pending`: Status indicators

### Color Scheme
- Background: Pure black (#000000)
- Text: White (#ffffff)
- Accent: Gray variations for secondary text
- Status colors: Green (success), Red (error), Yellow (warning)

## Performance Optimizations

- No animations for faster loading
- Optimized image handling
- Efficient API response processing
- Minimal bundle size with tree shaking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.