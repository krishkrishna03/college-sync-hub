Build a full-stack educational platform with the following specifications:

Technologies:

Frontend: React.js with React Router v6, state management (Context API or Redux), responsive design, modals, tabs, tables, charts for analytics, and interactive dashboards. Include animations/hover effects to make the UI sharp.

Backend: Node.js + Express.js, MongoDB (Atlas), full CRUD APIs, JWT authentication, role-based access control, email notifications, and logging.

Extras: Include input validation, error handling, and responsive UI for desktop and mobile.

Master Admin Portal:
Fixed login credentials.

Dashboard: Show Total Colleges, Total Students, Platform Activity (audit logs of all actions), charts/graphs for platform stats.

College Management:

Create new college accounts with: College Name, Email, Address, College Code.

Send invitation email to college with login credentials.

College account only created after acceptance.

Master Admin can create and delete college accounts (no edit).

Exam Management:

Multi-step form:

Exam Details: Test Type (Practice, Assessment, Mock Test, Company Specific), Description, Subject, Skills (Tech, Logical, Reasoning, Verbal, Coding, Other), Number of Questions, Difficulty Level, Duration.

Questions & Answers: Enter each question, multiple options, and correct answer.

Overview: Review all details before saving.

Exams stored in DB and displayed under subject + test type tabs.

Assign exams to colleges, send notifications, track reports.

Notifications: Title, Message, Target Role (All, Faculty, Students), College Selection.

Audit Logs: Track all actions on the platform.

Profile Management: View/edit profile with updated UI.

UI Enhancements: Use charts, cards, tables, and hover effects for a modern look.

College Dashboard:
Can create Faculty and Student accounts:

Fields: Name, ID, Email, Branch, Batch, Section.

Two methods: Manual entry or Bulk upload (CSV/Excel).

Backend sends login credentials to the email provided; account activated only after acceptance.

Assign tests to students: Specify Start & End Date/Time, Subject, Test Type, Batch, Branch, Section.

View/download reports of individual students in tabular format with filters.

Create announcements and notifications for students/faculty (CRUD).

Profile Management: View/edit profile.

UI Enhancements: Use modals, tables with sorting/filtering, and cards for announcements.

Faculty Dashboard:
Metrics: Total Tests Created, Tests Assigned, Tests Approved, Students Assigned (display with charts).

Request new tests directly to Master Admin or College.

View individual student progress, test reports, and download PDFs.

Check announcements and notifications.

Profile Management: View/edit profile.

UI Enhancements: Use interactive charts and cards for stats.

Student Dashboard:
Metrics: Assigned Exams, Available to Take, Practice Completed, Upcoming Deadlines, Average Score.

Can attempt exams online; after completion, view detailed report with corrections.

Notifications and announcements visible.

Profile Management: View/edit profile.

UI Enhancements: Use progress bars, charts, and tabs for exam categories.

General Requirements:
Role-based access control: Master Admin, College Admin, Faculty, Student.

Frontend: Clean, responsive UI with modern design, hover effects, modals, tables, forms, tabs, and interactive dashboards.

Backend: Node.js + Express.js, MongoDB, full CRUD for all entities.

Authentication & Authorization: JWT for all protected routes.

Email Integration: Send login credentials and notifications to Faculty and Student emails upon creation.

Audit Logs: Track all actions for Master Admin.

Validation & Error Handling: Backend validation, frontend alerts, and notifications.

Extra Enhancements:

Charts for analytics (total students, exams, completion rates).

Responsive tables with search, sort, and pagination.

Interactive dashboards with hover effects and badges.

Modular and reusable React components for forms, tables, and cards.

Deliverables:
Complete project structure: frontend React components/pages, backend routes/controllers/models, MongoDB schema design.

Utility functions for emails, notifications, and audit logs.

All CRUD operations working end-to-end.

Ensure smooth navigation, authentication, and role-based permissions.

update the above project with this all feactures and functions
