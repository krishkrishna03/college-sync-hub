import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import CollegeDashboard from "./pages/CollegeDashboard";
import MasterAdminDashboard from "./pages/MasterAdminDashboard";
import ExamCreation from "./pages/ExamCreation";
import ExamResults from "./pages/ExamResults";
import AcceptInvitation from "./pages/AcceptInvitation";
import Students from "./pages/Students";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import BatchYears from "./pages/BatchYears";
import Branches from "./pages/Branches";
import FacultyManagement from "./pages/FacultyManagement";
import ExamManagement from "./pages/ExamManagement";
import TestRequest from "./pages/TestRequest";
import LSRW from "./pages/LSRW";
import Courses from "./pages/Courses";
import AvailableCourses from "./pages/AvailableCourses";
import CourseListing from "./pages/CourseListing";
import CourseOverview from "./pages/CourseOverview";
import EnrolledStudents from "./pages/EnrolledStudents";
import CompletionRate from "./pages/CompletionRate";
import ParticipationReport from "./pages/ParticipationReport";
import Assessments from "./pages/Assessments";
import CompanySpecific from "./pages/CompanySpecific";
import MockTests from "./pages/MockTests";
import Announcements from "./pages/Announcements";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/faculty-dashboard" element={<Layout><FacultyDashboard /></Layout>} />
          <Route path="/student-dashboard" element={<Layout><StudentDashboard /></Layout>} />
          <Route path="/admin" element={<Layout><MasterAdminDashboard /></Layout>} />
          <Route path="/exam-creation" element={<Layout><ExamCreation /></Layout>} />
          <Route path="/exam-results/:examId" element={<Layout><ExamResults /></Layout>} />
          <Route path="/college" element={<Layout><CollegeDashboard /></Layout>} />
          <Route path="/students" element={<Layout><Students /></Layout>} />
          <Route path="/batch-years" element={<Layout><BatchYears /></Layout>} />
          <Route path="/branches" element={<Layout><Branches /></Layout>} />
          <Route path="/faculty" element={<Layout><FacultyManagement /></Layout>} />
          <Route path="/exam-management" element={<Layout><ExamManagement /></Layout>} />
          <Route path="/practice" element={<Layout><ExamManagement /></Layout>} />
          <Route path="/assessments" element={<Layout><ExamManagement /></Layout>} />
          <Route path="/company-tests" element={<Layout><ExamManagement /></Layout>} />
          <Route path="/mock-tests" element={<Layout><ExamManagement /></Layout>} />
          <Route path="/lsrw" element={<Layout><LSRW /></Layout>} />
          <Route path="/courses" element={<Layout><Courses /></Layout>} />
          <Route path="/available-courses" element={<Layout><AvailableCourses /></Layout>} />
          <Route path="/course-listing/:categoryId" element={<Layout><CourseListing /></Layout>} />
          <Route path="/course-overview/:id" element={<Layout><CourseOverview /></Layout>} />
          <Route path="/enrolled-students" element={<Layout><EnrolledStudents /></Layout>} />
          <Route path="/completion-rate" element={<Layout><CompletionRate /></Layout>} />
          <Route path="/participation-report" element={<Layout><ParticipationReport /></Layout>} />
          <Route path="/performance/assessment" element={<Layout><Assessments /></Layout>} />
          <Route path="/performance/mock-test" element={<Layout><MockTests /></Layout>} />
          <Route path="/performance/company-specific" element={<Layout><CompanySpecific /></Layout>} />
          <Route path="/announcements" element={<Layout><Announcements /></Layout>} />
          <Route path="/test-request" element={<Layout><TestRequest /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
