# Cell Groups App - Full Documentation

## Overview
This application is a progressive web app (PWA) built with React, Vite, Material-UI, and Firebase. It is designed to help a church or community organization manage their "Cell Groups" (small groups). The app has two primary user roles: **Admin** and **Cell Leader**.

## Core Features & Functionality
- **Firebase Backend:** Uses Firestore for database management and real-time syncing across devices.
- **PWA Ready:** The app can be installed on a mobile device and caches files for fast loading.
- **Role-Based Authentication:** Distinct logins for Admins and Cell Leaders using Firebase Authentication (or a custom passcode-based auth system implemented in the app).
- **Offline Support:** Basic offline capabilities via service workers.
- **Animations:** Custom SplitText, Animated Buttons, and Headless UI for a modern aesthetic.

---

## 1. Authentication Pages
### Admin Login (`AdminLogin.jsx`)
- Requires a specific passcode (e.g., "123456") to enter the Admin Dashboard.
- Secure, straightforward entry point for administrators.

### Cell Leader Login (`CellLeaderLogin.jsx`)
- Cell leaders select their name from a dropdown of approved leaders.
- Requires a 4-digit PIN for access.
- Handles leader authentication and redirects to the Cell Leader Dashboard.

### Cell Leader Signup (`CellLeaderSignup.jsx`)
- Allows new cell leaders to register.
- Collects name, phone number, and a 4-digit PIN.
- New accounts are set to `approved: false` by default and must be approved by an Admin.

### Pending Approval (`PendingApproval.jsx`)
- A waiting screen shown to newly signed-up cell leaders until an Admin approves their account.

---

## 2. Admin Dashboard (`AdminDashboard.jsx`)
The main hub for administrators. Uses a tabbed interface (bottom navigation on mobile, grid buttons on desktop).

### Tab 0: Home / Quick Actions (`AdminHomePage.jsx`)
- **Announcements Feed:** Displays a real-time feed of announcements created by the Admin.
- **Weekly Group Attendance Graph:** A dynamic Recharts Bar Chart showing the total Present/Absent members for each cell leader for a specific week.
- **Graph Click Details:** Clicking on a bar in the graph opens a dialog showing the exact names of the members who were present or absent for that leader.

### Tab 1: Member Management (`AdminMembersPage.jsx` / `AdminFamilyProfilePage.jsx`)
- Add, edit, and delete members.
- Assign members to specific Cell Leaders.
- Members can be grouped into Families.
- **Family Profiles:** View all members of a specific family and their collective attendance.

### Tab 2: Approve Leaders (`AdminApprovePage.jsx`)
- Lists all pending cell leader registrations.
- Admin can review, approve, or reject new leader accounts.

### Tab 3: Announcements (`AdminAnnouncementsPage.jsx`)
- Form to create new announcements.
- Choose whether the announcement goes to "All", "Leaders", or "Members".

### Tab 4: Meeting Places (`AdminMeetingPlacesPage.jsx`)
- Create and manage approved meeting locations for the cell groups.

### Tab 5: Testimonies (`AdminTestimoniesPage.jsx`)
- View testimonies submitted by cell leaders from their weekly meetings.

### Tab 6: Prayer Requests (`AdminViewPrayerRequestsPage.jsx`)
- View prayer requests submitted by members/leaders.

### Tab 12: Cell Leader Profiles (`AdminLeaderProfilesListPage.jsx` / `AdminLeaderProfilePage.jsx`)
- **Profiles List:** Shows all active (green badge) and pending (grey badge) cell leaders. Active leaders are sorted to the top.
- **Weekly Dashboard (Profile Page):** When a leader is selected, opens a comprehensive dashboard.
- Features a **Headless UI Week Selector** to filter data by week.
- Shows the Leader's personal attendance, the group's pie chart attendance, meeting place, and weekly activity reports (Testimonies, Visitors, Discussions).

---

## 3. Cell Leader Dashboard (`CellLeaderDashboard.jsx`)
The customized view for individual cell leaders.

### Home Tab (`CellLeaderHomePage.jsx`)
- Shows announcements relevant to leaders.
- Quick summary of their group's recent activity.

### Member Attendance (`CellLeaderAttendancePage.jsx`)
- Leaders can take weekly attendance for the members assigned to them.
- Simple Present/Absent toggles.
- Auto-calculates the "Tuesday Week Start Date" to ensure attendance is grouped correctly by week.

### Meeting Place & Activity Report (`CellLeaderMeetingPlacePage.jsx` / `CellLeaderReportCardPage.jsx`)
- Leaders select where their group met this week.
- Leaders submit a "Report Card" detailing if they had any Testimonies, New Visitors, or specific Discussions during the meeting.

### Prayer Requests (`CellLeaderSubmitPrayerRequestPage.jsx`)
- Submit new prayer requests on behalf of their members to the Admin.

---

## 4. Components & UI Elements
### `AnimatedButton.jsx`
- A reusable Material-UI Button styled with custom CSS hover and active states (scale down, shadow increase) to mimic Shadcn UI/Animate-UI.

### `SplitText.jsx`
- A text component that animates strings character-by-character on load (mimicking React Bits).

### `HeadlessWeekSelector.jsx`
- A custom dropdown menu built with `@headlessui/react`.
- Smooth fade and scale transitions.
- Used to select dates dynamically across the admin and leader dashboards.

### `BirthdayNotificationBar.jsx` / `BirthdaysView.jsx`
- Automatically calculates and displays upcoming birthdays for members, ensuring the community can celebrate together.

## Technical Architecture
- **Routing:** `react-router-dom` handles navigation between the main app views.
- **State Management:** React `useState` and `useEffect` combined with Firestore real-time listeners (`onSnapshot`).
- **Styling:** `@mui/material` combined with custom CSS variables and utility classes for a clean, glass-morphism aesthetic.
- **Charts:** `recharts` is used for rendering the pie charts and bar graphs.
