# Data Schema & Entity Specifications

> **Permit Workflow Tracker Entity Data Model**

---

## 1. PermitApplication Entity

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique permit ID (e.g. `PRM-2026-1042`). |
| `permitType` | `PermitType` | Category of permit (e.g. `Bus Stop Bay Relocation`). |
| `routeRef` | `string` | Target transit route reference. |
| `applicantRef` | `string` | Applicant organization reference. |
| `currentDepartment` | `Department` | Active department owning the application. |
| `currentRole` | `Role` | Assigned officer role. |
| `currentOwner` | `string` | Name of currently responsible officer. |
| `pendingHandoff` | `DepartmentHandoff \| null` | Pending unaccepted handoff record. |
| `status` | `WorkflowStatus` | Application lifecycle state. |
| `submissionTimestamp`| `string (ISO 8601)` | Timestamp when application was created. |
| `dueTimestamp` | `string (ISO 8601)` | Targeted SLA completion deadline. |
| `documentsCheck` | `DocumentCheckStatus` | Document completeness status record. |
| `delayReason` | `DelayReason \| null` | Controlled accountable delay category. |
| `delayNotes` | `string \| null` | Explanatory note for the logged delay. |
| `decisionReason` | `string \| null` | Justification for approval/rejection. |
| `decisionTimestamp` | `string \| null` | Timestamp of final decision. |
| `isOfflineCaptured` | `boolean` | Flag indicating field offline origin. |
| `syncStatus` | `'synced' \| 'pending_sync'` | Local queue sync state. |
| `handoffHistory` | `DepartmentHandoff[]` | Completed handoff audit log. |
| `timelineEvents` | `TimelineEvent[]` | Complete event audit log. |

---

## 2. Department & Role Enums

```typescript
export type Department =
  | 'Document Intake & Verification'
  | 'Traffic Management & Engineering'
  | 'Field Inspection & Safety'
  | 'Operations & Fleet Planning'
  | 'Executive & Regulatory Approval';

export type Role =
  | 'Intake Officer'
  | 'Compliance Specialist'
  | 'Traffic Engineer'
  | 'Signals & Corridor Lead'
  | 'Safety Inspector'
  | 'Field Assessor'
  | 'Fleet Coordinator'
  | 'Operations Planner'
  | 'Department Director'
  | 'Permit Authority Head';
```

---

## 3. Accountable Delay Reasons

```typescript
export type DelayReason =
  | 'Awaiting applicant document'
  | 'Safety clarification'
  | 'Traffic coordination'
  | 'Field inspection unavailable'
  | 'Capacity constraint'
  | 'System/offline sync';
```

---

## 4. DepartmentHandoff Interface

```typescript
export interface DepartmentHandoff {
  id: string;
  fromDepartment: Department;
  toDepartment: Department;
  fromOwner: string;
  toOwner: string;
  toRole: Role;
  handoffReason: string;
  initiatedAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}
```
