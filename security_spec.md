# Security Specification — Thiệp Tri Ân 20/11

## 1. Data Invariants
1. A `TeacherCard` document at `/cards/{cardId}` can only be created, updated, or deleted by an authenticated, email-verified Admin (`isSuperAdmin()` or registered in `/admins/{uid}`).
2. Every `cardId` and `adminId` must match `^[a-zA-Z0-9_-]+$` and be at most 128 characters.
3. On `create`, `ownerUid` must equal `request.auth.uid`, and `createdAt == request.time && updatedAt == request.time`.
4. On `update`, `ownerUid` and `createdAt` are immutable, `updatedAt == request.time`, and only explicit card content fields may be modified.
5. Unauthenticated recipients may `get` a specific `/cards/{cardId}` by its exact shareable link ID, but `list` queries on `/cards` are strictly forbidden to non-admins and non-superadmins without ownership filtering.
6. Only the bootstrapped superadmin (`kienld.neonstudio@gmail.com`, verified email) can add, list, or remove `/admins/{adminId}` entries; collaborator admins can only `get` their own `/admins/$(request.auth.uid)` document to verify status.

## 2. Adversarial Payloads ("Dirty Dozen")
1. Unauthenticated `create` on `/cards/test-card` -> `PERMISSION_DENIED`.
2. Unauthenticated `list` on `/cards` -> `PERMISSION_DENIED`.
3. Non-admin authenticated `create` on `/cards/test-card` -> `PERMISSION_DENIED`.
4. Admin `create` with spoofed `ownerUid` != `request.auth.uid` -> `PERMISSION_DENIED`.
5. Admin `create` with unverified email (`email_verified: false`) -> `PERMISSION_DENIED`.
6. Admin `create` with shadow/extra field (`isFeatured: true`) -> `PERMISSION_DENIED`.
7. Admin `create` with oversized `teacherName` (> 120 chars) or `message` (> 2500 chars) -> `PERMISSION_DENIED`.
8. Admin `create` with client-forged `createdAt` != `request.time` -> `PERMISSION_DENIED`.
9. Admin `update` attempting to mutate `ownerUid` or `createdAt` -> `PERMISSION_DENIED`.
10. Collaborator admin attempting to `update` or `delete` a card owned by another admin -> `PERMISSION_DENIED`.
11. Non-superadmin attempting to `create` their own `/admins/{uid}` document (privilege escalation) -> `PERMISSION_DENIED`.
12. Invalid document ID containing path traversal or special characters (`../etc`, `card$1`) -> `PERMISSION_DENIED`.
