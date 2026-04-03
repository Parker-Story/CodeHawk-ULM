# CodeHawk — Frontend

The CodeHawk frontend is a Next.js 16 web application that provides role-based portals for students, faculty, and teaching assistants. It communicates with the Spring Boot backend API for all data operations.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Routes](#routes)
- [Components](#components)
- [Contexts](#contexts)
- [Utilities](#utilities)
- [Styling](#styling)

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 16.1.4 | App framework (App Router) |
| React | 19.2.3 | UI library |
| Tailwind CSS | 4 | Utility-first styling |
| Lucide React | 0.562.0 | Icon library |
| React Big Calendar | 1.19.4 | Calendar UI |
| date-fns | 4.1.0 | Date formatting and utilities |

---

## Project Structure

```
frontend/
├── app/
│   ├── layout.js               # Root layout — mounts AuthProvider, fonts
│   ├── page.js                 # Root page (redirects to login)
│   └── (main)/                 # Route group for all authenticated pages
│       ├── layout.js
│       ├── login/              # Shared login page
│       ├── students/           # Student portal
│       │   ├── layout.js
│       │   ├── dashboard/
│       │   ├── assignments/
│       │   │   └── [id]/submit/
│       │   ├── courses/[id]/
│       │   ├── grades/
│       │   ├── calendar/
│       │   └── account/
│       ├── faculty/            # Faculty portal
│       │   ├── layout.js       # Wraps FacultyClassesProvider
│       │   ├── dashboard/
│       │   ├── courses/[id]/assignments/[assignmentId]/
│       │   ├── rubrics/
│       │   ├── suites/
│       │   ├── archived/
│       │   ├── calendar/
│       │   └── account/
│       └── ta/                 # Teaching assistant portal
│           ├── layout.js
│           ├── dashboard/
│           ├── courses/[id]/assignments/[assignmentId]/
│           ├── calendar/
│           └── account/
├── components/
│   ├── shared/                 # Components shared across all portals
│   ├── faculty/                # Faculty-specific components
│   └── students/               # Student-specific components
├── contexts/                   # React context providers
├── lib/                        # Utilities and configuration
└── public/                     # Static assets
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install and Run

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

### Other Scripts

```bash
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

This is the only environment variable used. It sets the backend API base URL and defaults to `http://localhost:8080` if not provided.

---

## Routes

### Student Portal (`/students`)

| Route | Description |
|---|---|
| `/students/dashboard` | Overview of enrolled courses and recent activity |
| `/students/assignments` | List of all assignments across courses |
| `/students/assignments/[id]/submit` | Code submission page for an assignment |
| `/students/courses/[id]` | Course detail view |
| `/students/grades` | Grade and feedback history |
| `/students/calendar` | Calendar of upcoming deadlines |
| `/students/account` | Account settings and password change |

### Faculty Portal (`/faculty`)

| Route | Description |
|---|---|
| `/faculty/dashboard` | Course management overview |
| `/faculty/courses/[id]/assignments/[assignmentId]` | Assignment detail and submission grading |
| `/faculty/rubrics` | Create and manage grading rubrics |
| `/faculty/suites` | Create and manage test suites |
| `/faculty/archived` | View archived/completed courses |
| `/faculty/calendar` | Calendar of course events and deadlines |
| `/faculty/account` | Account settings and password change |

### Teaching Assistant Portal (`/ta`)

| Route | Description |
|---|---|
| `/ta/dashboard` | Overview of assigned courses |
| `/ta/courses/[id]/assignments/[assignmentId]` | Review and grade student submissions |
| `/ta/calendar` | Calendar of course deadlines |
| `/ta/account` | Account settings and password change |

---

## Components

### Shared (`components/shared/`)

| Component | Description |
|---|---|
| `PortalLayout.jsx` | Root layout wrapper for all portals — mounts Navbar and Sidebar |
| `Navbar.jsx` | Top navigation bar with role badge and mobile menu toggle |
| `Sidebar.jsx` | Left sidebar with role-based navigation links and sign-out |
| `Dialog.jsx` | Reusable modal with size variants (`sm`, `md`, `lg`, `xl`) |
| `LoginForm.jsx` | Auth form with login, role-select, and register modes |
| `DropZone.jsx` | Drag-and-drop file upload zone |
| `Toast.jsx` | Toast notification component |
| `DashboardLayout.jsx` | Main content container with responsive layout |
| `DashboardView.jsx` | Dashboard layout with optional header action and secondary panel |
| `CalendarView.jsx` | Calendar display wrapper around React Big Calendar |
| `AccountView.jsx` | User account information display |
| `ChangePasswordDialog.jsx` | Password change modal |

### Faculty (`components/faculty/`)

| Component | Description |
|---|---|
| `NewAssignmentDialog.jsx` | Create new assignment modal |
| `GradingWorkspaceDialog.jsx` | Grading interface for reviewing submissions |
| `GradeReportDialog.jsx` | View and export grade reports |
| `ArchiveClassDialog.jsx` | Confirm and archive a course |

### Students (`components/students/`)

| Component | Description |
|---|---|
| `EnrollCourseDialog.jsx` | Enroll in a course by CRN |

---

## Contexts

### `AuthContext` (`contexts/AuthContext.jsx`)

Global authentication state. Persisted in `localStorage`.

```js
import { useAuth } from "@/contexts/AuthContext";

const { user, setUser } = useAuth();
```

**User object shape:**

```js
{
  id: string,
  cwid: string,
  firstName: string,
  lastName: string,
  role: "STUDENT" | "TA" | "FACULTY",
  email: string
}
```

### `FacultyClassesContext` (`contexts/FacultyClassesContext.jsx`)

Scoped to the faculty portal. Manages the list of courses for the logged-in faculty member.

```js
import { useFacultyClasses } from "@/contexts/FacultyClassesContext";

const { classes, setClasses } = useFacultyClasses();
```

---

## Utilities

### `lib/apiBase.js`

Exports the backend base URL used for all `fetch` calls:

```js
import { API_BASE } from "@/lib/apiBase";

fetch(`${API_BASE}/api/auth/login`, { ... });
```

### `lib/portals.js`

Portal configuration object (`PORTAL_CONFIG`) that defines sidebar items, navigation paths, icon names, active styles, and calendar events for each role. Also exports `eventsFromConfig()` to convert config events into `Date` objects for React Big Calendar.

---

## Styling

- **Tailwind CSS v4** via PostCSS
- **Fonts:** Geist Sans and Geist Mono (loaded via `next/font`)
- **Color palette:**
  - Backgrounds: `zinc-800`, `zinc-900`
  - Text: `white`, `zinc-300`, `zinc-400`
  - Accent: Gold (`#C9A84C`, `#F5E6C8`)
  - Primary action: Dark red (`#7C1D2E`)
  - Borders: `zinc-700`
- Sidebar is fixed at `256px` wide; collapses on mobile via toggle
- Navbar is fixed at `64px` tall
- Main content offsets by `lg:ml-64` on large screens
