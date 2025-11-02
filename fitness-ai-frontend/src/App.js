import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Import Components
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Nutrition from './components/Nutrition';
import Performance from './components/Performance';
import Profile from './components/Profile';
import FitnessPlan from './components/FitnessPlan';
import ActivityLog from './components/ActivityLog';
import InjuryCheck from './components/InjuryCheck';
import Footer from './components/Footer';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import FoodRecommendations from './components/FoodRecommendations';
import TrainingPage from './components/TrainingPage';
import WorkoutListPage from './components/WorkoutListPage';
import WorkoutDetailPage from './components/WorkoutDetailPage'; // <-- ADD THIS IMPORT
import Calendar from './components/Calendar';
import Welcome from './components/Welcome';
import AchievementsPage from './components/AchievementsPage';
import CompetitionCategoryPage from './components/CompetitionCategoryPage';
import CompetitionListPage from './components/CompetitionListPage';
import CompetitionPlanPage from './components/CompetitionPlanPage';
import HealthDashboard from './components/HealthDashboard';

// This component decides which page to show at the root URL ('/')
const Home = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? <Dashboard /> : <Welcome />;
};

const AppLayout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const showLayout = isAuthenticated() && !['/login', '/signup'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {showLayout && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Home />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/fitness-plan" element={<FitnessPlan />} />
            <Route path="/activity-log" element={<ActivityLog />} />
            <Route path="/injury-check" element={<InjuryCheck />} />
            <Route path="/food-recommendations" element={<FoodRecommendations />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/training/:categoryId" element={<WorkoutListPage />} />
            <Route path="/training/workout/:workoutId" element={<WorkoutDetailPage />} /> {/* <-- ADD THIS LINE */}
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/competitions" element={<CompetitionCategoryPage />} />
            <Route path="/competitions/:categoryId" element={<CompetitionListPage />} />
            <Route path="/competitions/plan/:competitionId" element={<CompetitionPlanPage />} />
            <Route path="/health" element={<HealthDashboard />} />
          </Route>

          {/* Fallback for any other route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showLayout && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppLayout />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;