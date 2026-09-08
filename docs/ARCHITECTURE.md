# System Architecture Diagram & Data Flow

> **Public Transport Authority Permit Workflow Tracker**

---

## 1. High-Level Architecture Diagram

```text
[ User / Field Capture ] (Web UI & Low-Bandwidth Field Form)
          │
          ▼
[ Local Offline Queue Storage ] ──► (Sync Trigger) ──► [ Workflow Engine & Rule Validator ]
                                                                  │
                                       ┌──────────────────────────┴──────────────────────────┐
                                       ▼                                                     ▼
                         [ Document Completeness Logic ]                        [ Department Handoff & Ownership ]
                                       │                                                     │
                                       ▼                                                     ▼
                         [ Accountable Delay Registry ]                         [ Decision Engine & Audit Log ]
                                       │                                                     │
                                       └──────────────────────────┬──────────────────────────┘
                                                                  ▼
                                                   [ Synthetic Benchmark Engine ]
                                                                  │
                                                                  ▼
                                                   [ Comparative Metric Reports ]
```

---

## 2. Component Descriptions

### 1. User & Field Capture Interface
* **Web UI (Desktop & Mobile):** Responsive dashboard providing permit creation, search, filter, and detail modals.
* **Low-Bandwidth Field Form:** Streamlined form designed for mobile field officers with local caching and `pending_sync` indicator.

### 2. Workflow & Decision Engine (`src/services/workflowEngine.ts`)
* Implements deterministic state transition rules governing application statuses (`SUBMITTED`, `DOCUMENTS_PENDING`, `IN_REVIEW`, `PENDING_HANDOFF_ACCEPTANCE`, `DELAYED`, `APPROVED`, `REJECTED`).
* Validates document completeness before allowing handoffs.
* Enforces explicit sender-receiver handoff acceptance.
* Prevents premature approval when applications are delayed or documents are missing.

### 3. State & Persistence Layer (`src/services/storage.ts`)
* Provides LocalStorage persistence with an automatic in-memory fallback for SSR/Node environments.
* Manages offline queue storage and synchronization.

### 4. Synthetic Benchmark Engine (`src/services/experimentRunner.ts`)
* Simulates 100 synthetic permit applications comparing Baseline queue processing vs Prototype workflow engine.
* Calculates mean calendar days, responsibility visibility %, delay reason visibility %, and SLA breach rates.
