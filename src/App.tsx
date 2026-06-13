import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header, Footer } from "./components";
import {
  HomePage,
  ActivityDetailPage,
  ClubPage,
  RegistrationPage,
  ProfilePage,
  LoginPage,
  ActivitiesListPage,
  ClubsListPage,
  NotificationsPage,
} from "./pages";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/activities" element={<ActivitiesListPage />} />
            <Route path="/clubs" element={<ClubsListPage />} />
            <Route path="/activity/:id" element={<ActivityDetailPage />} />
            <Route path="/club/:id" element={<ClubPage />} />
            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-4">页面不存在</p>
                    <a
                      href="/"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      返回首页
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
