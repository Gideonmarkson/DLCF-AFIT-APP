# 🕊️ DLCF AFIT Intellectuals Hub

> **Deeper Life Campus Fellowship (DLCF), Air Force Institute of Technology (AFIT), Kaduna**  
> *Official Digital Platform for Academic Excellence, Pastoral Care, and Fellowship Governance.*

---

## 📌 Executive Overview

**DLCF AFIT Intellectuals Hub** is a full-stack, mobile-first web application designed specifically for the student and patron community at the **Air Force Institute of Technology (AFIT), Kaduna**. The hub unifies academic peer-mentorship, spiritual nurture through Daily Manna devotionals, confidential pastoral counseling, past examination question banks, financial aid alerts with live countdown timers, media service recordings, and multi-tier executive governance.

---

## 🌟 Key Application Features & Modules

### 🎓 1. Academic Excellence & Course Registration (`/academic/course-registration` & `/academic/peer-network`)
* **Session Course Setup**: Log enrolled semester courses (*e.g., AEE 311, MET 301, EEE 301*), compute total credit units, and upload official AFIT Course Registration Slips (PDF/Images).
* **Peer Mentorship Graph**: Automatic matching with high-achieving senior brethren (**CGPA ≥ 4.00**) who previously earned 'A' or 'B' grades in those exact courses.
* **Upload Semester Results (`/academic/results/upload`)**: Row-Level Security (RLS) encrypted semester result uploads with automatic CGPA calculation.

### 📖 2. Spiritual Nurture & Bible Schedule Builder (`/spiritual/devotionals`)
* **Daily Manna Scripture Reflections**: Daily scripture passages (*e.g., Daniel 1:17-20*) with spiritual application notes.
* **Bible & Academic Study Schedule Builder**: Customized timetable generator pairing Bible study times with AFIT engineering course loads.

### 🕊️ 3. Confidential Pastoral Counseling (`/spiritual/counseling`)
* **Student Counseling Submission**: Encrypted ticket submission with optional anonymity, burden classification (*Academic Pressure, Spiritual Growth, Personal*), and direct notification dispatch via Resend API.
* **Associate Coordinator Pastoral Inbox**: Interactive 2-column workspace for Associate Coordinators (Staff Advisors) to review member burdens, filter by category, and send pastoral replies.

### 📁 4. AFIT Past Questions Repository (`/academic/resources`)
* **Course & Level Indexed Repository**: Downloadable AFIT examination question papers (PDF) sorted by Level (100L - 500L, ND & HND) and department.

### 🏆 5. Scholarships & Financial Aid Hub (`/academic/scholarships`)
* **Verified Opportunities**: Federal (PTDF, FSB), corporate (MTN, NNPC/Chevron), and DLCF Alumni emergency tuition grants.
* **Live Countdown Timers**: Real-time ticker counting down exact days, hours, minutes, and seconds to application closing deadlines.
* **Role Permissions**: Scholarship alerts are published by the **Academic Director (Exco)** and **System Administrator**.

### 🎬 6. Fellowship Media Repository (`/fellowship/media`)
* **In-Browser Audio Sermon Player**: Stream Sunday service messages and audio sermons (MP3) in-browser.
* **Special Service Videos & Flyers**: View video ministrations (MP4) and download HD event program flyers (PNG, JPG).
* **Role Permissions**: Media uploads are published by the **Media Coordinator**, **Assistant Media Coordinator**, **Secretarial Coordinator**, and **System Administrator**.

### 👥 7. Executive & Staff Directories (`/fellowship/excos` & `/fellowship/coordinators`)
* **Student Excos Roster (`/fellowship/excos`)**: Verified roster of 19 student executive portfolios with academic department, level, CGPA badges, and direct Call/WhatsApp contact buttons.
* **Associate Coordinators Directory (`/fellowship/coordinators`)**: Roster of AFIT staff patrons, sub-group associate coordinators, brother, and sister coordinators.

### ⚙️ 8. System Administration Control Center (`/admin/system-management`)
* **Role-Based Access Control (RBAC)**: Strictly restricted to `SYSTEM_ADMINISTRATOR`. Unloads a 5-tab Super Admin control dashboard:
  1. **System Overview**: Live member counts, counseling resolution rates, and database RLS status.
  2. **User Management**: Role promotion/demotion (*Student, Student Exco, Associate Coordinator, System Admin*).
  3. **Security Keys & Passcodes**: Rotation of accreditation keys.
  4. **Email Broadcast Center**: Mass announcement dispatch to registered members via Resend API.
  5. **System Audit Trail**: Immutable security event logs.

---

## 🔒 Role Perspectives & Access Controls

The platform implements 4 distinct role perspectives:

| Role Perspective | Primary Focus & Access Permissions |
| :--- | :--- |
| `GENERAL_STUDENT` | Course registration, peer mentorship, result uploads, counseling, past questions, devotionals, media, and scholarships. |
| `STUDENT_EXECUTIVE` | All student features + Academic Director scholarship posting, Media/Secretarial coordinator media uploads, and Exco Governance Queue (`/admin/academic-overview`). |
| `ASSOCIATE_COORDINATOR` | Pastoral Counseling Reply Workspace (`/spiritual/counseling`), Media uploads (for Secretarial/Media staff), and Coordinator Governance Queue (`/admin/academic-overview`). *Access guarded from student registration pages.* |
| `SYSTEM_ADMINISTRATOR` | Full Super Admin Control Center (`/admin/system-management`), user role promotions, passcode rotation, email broadcast center, media uploads, and scholarship management. |


## 🛠️ Technology Stack

* **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server & Client Components)
* **Language**: [TypeScript 5](https://www.typescriptlang.org/)
* **Styling & UI**: [Tailwind CSS 3](https://tailwindcss.com/), Vanilla CSS, [Framer Motion](https://www.framer.com/motion/), [Lucide Icons](https://lucide.dev/), [Radix UI](https://www.radix-ui.com/)
* **Database & RLS**: [Supabase PostgreSQL](https://supabase.com/) with Row-Level Security policies
* **Email Dispatch**: [Resend API](https://resend.com/)

---

## 🚀 Getting Started & Local Development

### 1. Prerequisites
* Node.js v18.x or later installed on your PC.

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Running the Local Server
To run the server bound to all network interfaces (`0.0.0.0`) for local and mobile Wi-Fi testing:
```bash
npm run dev
```

### 4. Access URLs
* **Local PC Browser**: `http://localhost:3000`
* **Mobile Device Wi-Fi Access**: `http://192.168.0.3:3000`

---

## 📄 License & Attribution

© 2026 **Deeper Life Campus Fellowship (DLCF), Air Force Institute of Technology (AFIT), Kaduna**.  
*All rights reserved. Built for Academic Distinction & Spiritual Excellence.*
