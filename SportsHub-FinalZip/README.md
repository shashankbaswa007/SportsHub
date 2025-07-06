# SportsHub - Multi-Sport Tracking Application

## Project Structure

This project is organized into two main parts:

### Client (Frontend)
- **Technology**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

### Server (Backend)
- **Technology**: Django (Python)
- **Database**: SQLite (default)
- **Templates**: Django Templates with Tailwind CSS

## Setup Instructions

### Client Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Server Setup (Optional - Django Backend)
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install Python dependencies:
   ```bash
   pip install django
   ```

3. Run migrations:
   ```bash
   python manage.py migrate
   ```

4. Create sample data:
   ```bash
   python manage.py populate_data
   ```

5. Start the Django server:
   ```bash
   python manage.py runserver
   ```

## Features

- **Multi-Sport Support**: Football, Table Tennis, Basketball, Volleyball, Throwball, Badminton, Kabaddi
- **Live Match Tracking**: Real-time score updates and match status
- **Match Analysis**: Detailed statistics with interactive charts
- **Player Performance**: Individual player statistics and ratings
- **League Standings**: Automatically calculated from match results
- **Admin Panel**: Complete match and player management (Admin username: 160123771030)
- **User Authentication**: Secure login system for CBIT students
- **Responsive Design**: Works on all device sizes

## Admin Access
- Username: `160123771030`
- Password: `160123771030` (default)

## User Registration
- Username format: Must start with `1601` and be exactly 12 digits
- Example: `160123771030`

## Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide React

### Backend (Django)
- Django
- SQLite
- Django Templates
- Chart.js

## File Structure

```
SportsHub-FinalZip/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── data/          # Mock data
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Django Backend
│   ├── sports_tracker/     # Django project
│   ├── tracker/           # Django app
│   ├── templates/         # HTML templates
│   └── manage.py
└── README.md
```

## Development Notes

- The client is a standalone React application that can run independently
- The server is a Django application with its own templates and API
- Both can be developed and deployed separately
- The React app uses local storage for data persistence
- The Django app uses SQLite database

## License

This project is for educational purposes.