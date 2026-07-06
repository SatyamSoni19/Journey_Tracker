import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import { AIPlannerPage } from "@/pages/dashboard/AIPlannerPage";
import MyTrips from "@/pages/MyTrips"; // MyTrips component
import JourneyDetail from "@/pages/JourneyDetail";
import NotFound from "@/pages/NotFound";
import { ProtectedRoute, GuestRoute } from "@/components/RouteGuards";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-planner"
          element={
            <ProtectedRoute>
              <AIPlannerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auth"
          element={
            <GuestRoute>
              <Auth />
            </GuestRoute>
          }
        />
        <Route
          path="/my-trips"
          element={
            <ProtectedRoute>
              <MyTrips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journeys/:id"
          element={
            <ProtectedRoute>
              <JourneyDetail />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;