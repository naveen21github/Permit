# Workflow Rules & Decision Logic Matrix

> **Deterministic Workflow State Machine Rules**

---

## Workflow Rules Summary

1. **Document Verification Rule:**
   - `IF` required documents are incomplete $\implies$ `status` remains `DOCUMENTS_PENDING` and `delayReason` is set to `'Awaiting applicant document'`.
   - `IF` all required documents are present $\implies$ `status` transitions to `DOCUMENTS_VERIFIED`.

2. **Cross-Department Handoff Initiation Rule:**
   - `IF` `documentsCheck.isComplete === false` $\implies$ Handoff attempt throws `WorkflowValidationError`.
   - `IF` an unaccepted pending handoff already exists $\implies$ New handoff attempt throws `WorkflowValidationError`.

3. **Handoff Ownership Retention Rule:**
   - `WHEN` a handoff is initiated $\implies$ Active owner (`currentOwner`) remains as the **sender** until the recipient explicitly calls `acceptHandoff`. The status becomes `PENDING_HANDOFF_ACCEPTANCE`.

4. **Premature Approval Prevention Rule:**
   - Approval attempt is **rejected** with `WorkflowValidationError` IF:
     1. Documents are incomplete (`documentsCheck.isComplete === false`).
     2. Application is marked `DELAYED`.
     3. An unaccepted handoff is pending (`pendingHandoff !== null`).
