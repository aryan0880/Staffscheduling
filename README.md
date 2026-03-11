
  # Staff Scheduling and Shift Management System

📌 Project Overview

The Staff Scheduling and Shift Management System (SSMS) is a web-based application developed to automate the process of managing staff shifts, schedules, and leave requests.

This system eliminates manual scheduling errors and provides a centralized platform for efficient workforce management.

This project is developed as a college mini project using modern web technologies with a clean and professional UI design.

---

🎯 Problem Statement

In many organizations, staff scheduling is done manually using registers or spreadsheets. This often leads to:

- Shift conflicts
- Unequal workload distribution
- Difficulty in tracking leave requests
- Manual errors in scheduling
- Time-consuming management process

Managing staff manually becomes complex as the organization grows.

---

💡 Proposed Solution

The Staff Scheduling and Shift Management System provides:

- Digital staff management
- Automated shift assignment
- Leave request handling
- Schedule tracking
- Real-time updates
- Centralized dashboard

The system ensures accuracy, transparency, and better workforce planning.

---

🚀 Features

🔐 Authentication

- Secure Login System
- Role-based access (Admin & Staff)
- JWT-based authentication
- Password encryption using bcrypt

👨‍💼 Admin Features

- Add / Edit / Delete Staff
- Create and Manage Shifts
- Assign Shifts to Staff
- View Assigned Schedules
- Approve / Reject Leave Requests
- View Reports

👩‍💻 Staff Features

- View Assigned Shifts
- Apply for Leave
- Track Leave Status
- View Schedule

📊 Dashboard

- Total Staff Count
- Total Shifts
- Today's Assignments
- Pending Leave Requests

---

🛠️ Tech Stack

Frontend

- React (Vite)
- Tailwind CSS
- React Router
- Axios

Backend

- Node.js
- Express.js
- MySQL

Security

- JWT Authentication
- Password Hashing (bcrypt)

---

🗂️ Project Structure

Frontend

/src
  /components
  /pages
  /services
  /context
  /utils

Backend

/controllers
/routes
/models
/middleware
/config
server.js

---

🗄️ Database Schema

users

- id (Primary Key)
- name
- email
- password
- role (admin/staff)

staff

- id
- department
- contact
- availability

shifts

- id
- shift_name
- start_time
- end_time

schedules

- id
- staff_id
- shift_id
- date

leave_requests

- id
- staff_id
- from_date
- to_date
- reason
- status

---

⚙️ Installation & Setup

1️⃣ Clone Repository

git clone <repository-link>
cd staff-scheduling-system

2️⃣ Backend Setup

cd backend
npm install

Create ".env" file:

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=ssms
JWT_SECRET=your_secret_key

Run backend:

npm start

3️⃣ Frontend Setup

cd frontend
npm install
npm run dev

Open in browser:

http://localhost:5173

---

🔒 Default Login Credentials (Demo)

Admin

Email: admin@gmail.com
Password: admin123

---

📱 UI Design Approach

The UI is designed with:

- Clean layout
- Card-based dashboard
- Professional color scheme
- Responsive design
- Consistent spacing
- Modern typography

The goal was to keep the interface simple, readable, and suitable for academic demonstration.

---

📈 Future Enhancements

- Attendance Tracking System
- Calendar-based Shift View
- Email Notifications
- Export Reports (PDF/CSV)
- Role-based Permission Control
- Dark Mode

---

🎓 Academic Relevance

This project demonstrates practical implementation of:

- Full Stack Development
- REST API Integration
- Database Management
- Authentication & Authorization
- CRUD Operations
- UI/UX Design Principles

---

👨‍💻 Developed By

Aryan Sonawane
College Mini Project

---

📜 License

This project is developed for academic purposes only.

---

⭐ If you found this project useful, feel free to star the repository.