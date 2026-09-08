# Concise Risk Register

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Incorrect Workflow State Skip** | High | Enforce strict state machine assertions in `workflowEngine.ts`. |
| **Stale Offline Queue Data** | Medium | Local storage queue versioning + explicit `OFFLINE_SYNC` timeline events. |
| **Missing Documents** | High | Prevent handoff initiation if mandatory document list is incomplete. |
| **Unclear Handoff Ownership** | High | Maintain sending officer as active owner until receiving officer accepts. |
| **Punitive Surveillance Misuse** | High | Exclude all individual employee performance scores, metrics, or rankings. |
