# Cross-Department Permit Workflow Tracker with Accountable Delay Reasons

> **Public Transport Authority Operational Permit Management System**  
> Resolves cross-department responsibility gaps, unrecorded delay bottlenecks, and premature approvals through explicit ownership assignment, document completeness enforcement, and accountable delay tracking.

---

## 📌 Problem Statement Overview

Public transport authorities process complex operational permits—such as bus stop bay relocations, dedicated BRT lane access, special transit corridors, and road excavation permits. In typical municipal setups, applications move between departments (Document Intake, Traffic Engineering, Field Inspection, Operations, Executive Approval) without clear active responsibility or explanation for delays.

This project delivers a **Cross-Department Permit Workflow Tracker** built specifically to establish:
1. **Explicit Department Ownership & Owner Role** at every workflow stage.
2. **Mandatory Document Completeness Verification** prior to downstream handoffs.
3. **Controlled & Accountable Delay Reasons** without punitive employee surveillance.
4. **Offline / Low-Bandwidth Capability** for field-based permit capture.
5. **Measurable Baseline vs. Prototype Comparison** demonstrating a **75.5% delay reduction** and **100% process visibility**.

---

## 🎯 Key Features & PS Compliance Checklist

- [x] **Cross-Department Permit Tracking:** Full lifecycle coverage across 5 transit departments.
- [x] **Active Responsibility Visibility:** Identifies exact department, officer role, and assigned owner.
- [x] **Department Handoffs:** Sender-receiver handoff mechanism requiring explicit acceptance.
- [x] **Document Completeness Safeguard:** Blocks incomplete applications from progressing.
- [x] **Accountable Delay Reasons:** Controlled dropdown of non-punitive delay categories.
- [x] **Offline / Low-Bandwidth Capture:** Local queue storage with automatic background synchronization.
- [x] **Reproducible Automated Test Harness:** 5 automated test cases covering realistic edge/failure states.
- [x] **Synthetic Benchmark Experiment:** Quantitative comparison ($N=100$) of Baseline vs. Prototype.
- [x] **Anti-Surveillance & Privacy Compliance:** Zero employee tracking, productivity scores, or disciplinary metrics.

---

## 🛠️ Technology Stack

* **Frontend Framework:** React 18 + TypeScript
* **Build Tooling:** Vite 5
* **UI Components & Icons:** Lucide React + CSS Grid/Flexbox
* **State & Persistence:** LocalStorage API with Safe In-Memory Node Fallback
* **Automated Testing:** Native TypeScript Test Harness (`src/services/testHarness.ts`)

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher

### Installation & Running Locally

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd Permit
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000/`.

4. **Build for Production:**
   ```bash
   npm run build
   ```

5. **Run Automated Edge-Case Test Suite & Synthetic Benchmark:**
   ```bash
   npm test
   ```
   *(Or navigate to the **Test Harness** and **Experiment Report** tabs directly in the web UI).*

---

## 📊 Measurable Experiment Summary (N=100 Synthetic Applications)

| Metric | Baseline Queue | Target Goal | Prototype Result | Improvement |
| :--- | :---: | :---: | :---: | :---: |
| **Mean Processing Time** | `21.2 days` | $\ge 20\%$ reduction | **`5.2 days`** | **`75.5% Delay Reduction`** |
| **Owner Responsibility Visibility** | `35.0%` | $\ge 90.0\%$ | **`100.0%`** | **`+65.0% Visibility`** |
| **Delay Reason Visibility** | `11.0%` | $\ge 90.0\%$ | **`100.0%`** | **`+89.0% Visibility`** |
| **SLA Breach Rate (>14 Days)** | `98.0%` | $< 10.0\%$ | **`0.0%`** | **`100.0% Compliance`** |

---

## 📁 Repository Structure & Documentation

```text
Permit/
├── src/
│   ├── components/            # React UI Views & Modals
│   │   ├── ApplicationDetailModal.tsx
│   │   ├── ApplicationListView.tsx
│   │   ├── DashboardView.tsx
│   │   ├── DocumentationView.tsx
│   │   ├── ExperimentReportView.tsx
│   │   ├── FieldCaptureView.tsx
│   │   ├── Navbar.tsx
│   │   └── TestHarnessView.tsx
│   ├── services/              # Core Domain Engines & Storage
│   │   ├── baselineEngine.ts
│   │   ├── experimentRunner.ts
│   │   ├── storage.ts
│   │   ├── testHarness.ts
│   │   └── workflowEngine.ts
│   └── types/                 # TypeScript Data Schemas & Types
│       └── index.ts
├── docs/                      # Core PS Documentation Suite
│   ├── ARCHITECTURE.md
│   ├── DATA_SCHEMA.md
│   ├── DECISION_LOGIC.md
│   ├── EXPERIMENT.md
│   ├── RISK_REGISTER.md
│   ├── STAKEHOLDER_VALIDATION.md
│   ├── USER_GUIDE.md
│   ├── phase1_report.md
│   └── phase2_3_report.md
├── scripts/
│   └── runTests.ts            # Standalone Automated Test Runner
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🛡️ Anti-Surveillance Statement

This project strictly adheres to anti-surveillance design constraints:
* **Process Accountability over Employee Surveillance:** We monitor permit locations, document completeness, and operational delay reasons.
* **No Employee Ranking:** We explicitly forbid employee productivity scores, keystroke monitoring, screen scraping, or automated disciplinary triggers.

---

## 📄 License
Licensed under the MIT License for Public Transport Authorities.
