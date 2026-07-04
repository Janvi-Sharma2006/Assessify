Assessify is a full-stack online assessment portal designed to streamline technical hiring. HR/Admins can create assessment drives, build custom question sets, and review candidate performance through scorecards and leaderboards — while candidates take timed exams through a clean, distraction-free interface with built-in anti-cheat tracking (tab-switch detection).
Built with a Java Spring Boot REST API backend (JWT authentication, role-based authorization via Spring Security, JPA/MySQL persistence) and a React + Vite frontend, the project follows a layered architecture (controller → service → repository) with clear separation between HR/Admin and student roles.
Key features:

Role-based access control (Admin, HR, Student) with JWT-secured endpoints
Drive-based assessment creation with invite links
Dynamic question builder for HR/Admins
Real-time scorecards and leaderboards per drive
Anti-cheat tab-violation tracking during exams
Candidate dashboard with result history

Tech stack: Java, Spring Boot, Spring Security, JPA/Hibernate, MySQL, React, Vite, Axios
