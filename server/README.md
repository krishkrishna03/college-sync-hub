# College Management System Backend

A comprehensive backend API for college management system built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Students, Faculty, and Admin management
- **Test Management**: Create, assign, and manage various types of tests
- **Course Management**: Course creation, enrollment, and progress tracking
- **Announcement System**: Create and manage announcements
- **Batch & Branch Management**: Organize students by batches and branches
- **Bulk Operations**: Bulk upload for students and faculty
- **Reporting**: Comprehensive reports and analytics

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Students
- `GET /api/students` - Get all students (with filters)
- `POST /api/students` - Create new student
- `POST /api/students/bulk-upload` - Bulk upload students
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/:id/report` - Get student report

### Faculty
- `GET /api/faculty` - Get all faculty
- `POST /api/faculty` - Create new faculty
- `POST /api/faculty/bulk-upload` - Bulk upload faculty
- `PUT /api/faculty/:id` - Update faculty
- `POST /api/faculty/:id/assign-task` - Assign task to faculty
- `DELETE /api/faculty/:id` - Delete faculty

### Tests
- `GET /api/tests` - Get all tests (with filters)
- `POST /api/tests` - Create new test
- `PUT /api/tests/:id/assign` - Assign test to students
- `GET /api/tests/:id/results` - Get test results
- `POST /api/tests/:id/submit` - Submit test answers
- `DELETE /api/tests/:id` - Delete test

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/courses/enrolled-students` - Get enrolled students
- `GET /api/courses/completion-rate` - Get completion statistics

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement
- `POST /api/announcements/:id/mark-read` - Mark as read

### Batches
- `GET /api/batches` - Get all batches
- `POST /api/batches` - Create new batch
- `POST /api/batches/:id/branches` - Add branch to batch
- `PUT /api/batches/:batchId/branches/:branchId` - Update branch
- `DELETE /api/batches/:batchId/branches/:branchId` - Delete branch
- `DELETE /api/batches/:id` - Delete batch

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Environment Configuration**:
   - Copy `.env.example` to `.env`
   - Update MongoDB URI and other configuration

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Start Both Frontend and Backend**:
   ```bash
   # From root directory
   npm run dev:full
   ```

## Database Models

### User Model
- Basic user information for all roles
- Password hashing with bcrypt
- Role-based access control

### Student Model
- Student-specific information
- Course enrollments and progress
- Test results and performance metrics

### Faculty Model
- Faculty-specific information
- Assigned tests and tasks
- Department and designation details

### Test Model
- Test creation and management
- Question bank and results
- Assignment to specific groups

### Course Model
- Course information and modules
- Student enrollments and progress
- Assignments and submissions

### Announcement Model
- Announcement creation and targeting
- Read status tracking
- Scheduling capabilities

### Batch Model
- Batch and branch organization
- Section management
- Student capacity tracking

## Security Features

- JWT authentication
- Password hashing
- Input validation
- CORS protection
- Helmet security headers
- Request rate limiting ready

## File Upload Support

- Multer for file handling
- CSV parsing for bulk uploads
- File validation and cleanup

## Email Integration

- Nodemailer for email sending
- Credential distribution
- Announcement notifications

## Error Handling

- Comprehensive error middleware
- Validation error responses
- Logging with Morgan

## Development Features

- Hot reload with Nodemon
- Environment-based configuration
- Detailed logging
- Health check endpoint