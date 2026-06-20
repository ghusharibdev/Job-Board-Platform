# Job Board Platform API

A backend API for a job board and recruitment management system built with Node.js, Express.js, MongoDB, Mongoose, Passport.js, and session-based authentication.

The system supports two main user roles: Employers and Candidates. Employers can post jobs, view applications, and update application status. Candidates can search jobs, upload resumes, apply for jobs, and track their applications.

## Features

* Candidate and employer registration
* Session-based login and logout using Passport.js
* Password hashing using bcrypt
* Employer job posting
* Candidate job search with filters
* Job application submission
* Duplicate application prevention
* Application status management
* Resume upload using Multer
* Email notification support using Nodemailer
* MongoDB persistence with Mongoose models
* Protected routes for authenticated users

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* Passport.js
* Express Session
* Connect Mongo
* Bcrypt
* Multer
* Nodemailer
* Dotenv

## Project Structure

```text
Job-Board-Platform/
├── server.js
├── package.json
├── .env.example
├── src/
│   ├── auth/
│   │   ├── encryption.js
│   │   └── local-strategy.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── candidateController.js
│   │   └── employerController.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   └── notify.js
│   ├── models/
│   │   ├── Application.js
│   │   ├── Candidate.js
│   │   ├── Employer.js
│   │   ├── JobListing.js
│   │   └── User.js
│   └── routes/
│       ├── authRouter.js
│       ├── candidateRoutes.js
│       └── employerRoutes.js
└── uploads/
```

## Installation and Setup

Clone the repository:

```bash
git clone https://github.com/ghusharibdev/Job-Board-Platform.git
cd Job-Board-Platform
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the root directory:

```env
PORT=3000
DB_URL=your_mongodb_connection_string
SESS_SECRET=your_session_secret
MAILER_EMAIL=your_email
MAILER_PASSWORD=your_email_app_password
```

Start the server:

```bash
npm start
```

The server will run on:

```text
http://localhost:3000
```

## API Endpoints

### Authentication

| Method | Endpoint  | Description                      |
| ------ | --------- | -------------------------------- |
| POST   | `/signup` | Register a candidate or employer |
| POST   | `/login`  | Login user                       |
| POST   | `/logout` | Logout user                      |

### Employer Routes

| Method | Endpoint                   | Description                          |
| ------ | -------------------------- | ------------------------------------ |
| POST   | `/postJob`                 | Post a new job                       |
| POST   | `/employerUpdateDetails`   | Update employer profile              |
| POST   | `/updateStatus`            | Update candidate application status  |
| GET    | `/jobs`                    | View jobs posted by employer         |
| GET    | `/applications`            | View received applications           |
| GET    | `/applications/job/:jobId` | View applications for a specific job |

### Candidate Routes

| Method | Endpoint            | Description                 |
| ------ | ------------------- | --------------------------- |
| POST   | `/searchJob`        | Search jobs                 |
| POST   | `/applyJob`         | Apply for a job             |
| POST   | `/uploadResume`     | Upload candidate resume     |
| GET    | `/getResume`        | Get uploaded resume         |
| GET    | `/applications`     | View submitted applications |
| GET    | `/applications/:id` | View a specific application |

## Sample Request Bodies

### Signup

```json
{
  "username": "candidate1",
  "password": "123456",
  "userType": "Candidate",
  "name": "Ali Candidate"
}
```

### Login

```json
{
  "username": "candidate1",
  "password": "123456"
}
```

### Post Job

```json
{
  "jobTitle": "MERN Stack Intern",
  "jobDescription": "Intern will work on Node.js, Express.js and MongoDB APIs.",
  "experience": "entry",
  "salary": 25000,
  "role": "Software Engineering Intern"
}
```

### Apply for Job

```json
{
  "jobId": "paste_job_id_here"
}
```

### Update Application Status

```json
{
  "applicationId": "paste_application_id_here",
  "status": "accepted"
}
```

## API Testing Screenshots

### Employer Authentication

![Employer Authentication](assets/screenshots/employer-auth.png)

### Job Posting

![Job Posting](assets/screenshots/job-posting.png)

### Candidate Application

![Candidate Application](assets/screenshots/candidate-application.png)

### Application Status Management

![Application Status Management](assets/screenshots/status-update.png)

## Environment Variables

| Variable          | Description                          |
| ----------------- | ------------------------------------ |
| `PORT`            | Server port                          |
| `DB_URL`          | MongoDB connection string            |
| `SESS_SECRET`     | Secret used for signing sessions     |
| `MAILER_EMAIL`    | Email account used for notifications |
| `MAILER_PASSWORD` | App password for email sending       |

## Notes

* This project uses session-based authentication, so protected routes require the user to be logged in.
* Use the same Postman session while testing protected endpoints.
* Do not commit the `.env` file to GitHub.
* Add only `.env.example` to show required environment variables.

## Author

Ghusharib Najam
