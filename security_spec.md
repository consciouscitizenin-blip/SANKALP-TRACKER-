# Security Specification — Sankalp SSC CGL Command Center

## 1. Data Invariants

1. **PII & Private State Isolation (`/user_progress/{userId}`)**:
   - Only the authenticated owner (`request.auth.uid == userId`) with a verified email (`request.auth.token.email_verified == true`) can read, create, or update their own progress document.
   - `uid` inside the payload must strictly match `userId` and `request.auth.uid` and remain immutable across updates.
   - `updatedAt` must equal `request.time`.

2. **Public Non-PII Leaderboard (`/leaderboard/{userId}`)**:
   - Stores strictly non-PII preparation metrics (`displayName`, `xpPoints`, `streakDays`, `weeklyHours`, `syllabusPercent`, `targetTier`, `updatedAt`).
   - Authenticated users can read (`get`, `list`) entries where `resource.data.xpPoints >= 0` to compare progress against peers.
   - Only the verified owner (`request.auth.uid == userId`) can create or update their own leaderboard entry, and `incoming().uid == request.auth.uid`.

3. **Study Group Discussion Forum (`/forum_posts/{postId}`)**:
   - Authenticated users can read posts where `resource.data.upvotes >= 0`.
   - Creation requires a verified email, valid `postId`, `incoming().authorUid == request.auth.uid`, and `incoming().createdAt == request.time`.
   - Updates follow Action-Based Update patterns: either the author updates `title`/`body`, or a verified user increments `upvotes` by +1 using `affectedKeys().hasOnly(['upvotes'])`.

## 2. The "Dirty Dozen" Payloads

1. **Shadow Field Injection on `user_progress`**: `{ ..., "isAdmin": true }` -> Rejected by `hasOnly`.
2. **Unverified Email Write**: `request.auth.token.email_verified == false` -> Rejected by `isVerifiedUser()`.
3. **Identity Spoofing on `user_progress`**: `uid: "victim-uid"` when `auth.uid == "attacker-uid"` -> Rejected by `data.uid == request.auth.uid`.
4. **Cross-User Read on `user_progress`**: User A attempts `get(/user_progress/userB)` -> Rejected by `isOwner(userId)`.
5. **Oversized String DoW Attack**: `displayName` with 10,000 characters -> Rejected by `.size() <= 80`.
6. **ID Poisoning Attack**: `postId` with invalid characters `../../evil` -> Rejected by `isValidId(postId)`.
7. **Timestamp Forgery on `forum_posts`**: Client passes past/future `createdAt` -> Rejected by `incoming().createdAt == request.time`.
8. **Immutable Field Mutation on `forum_posts`**: Updating `authorUid` on an existing post -> Rejected by `incoming().authorUid == existing().authorUid` and `affectedKeys().hasOnly(...)`.
9. **Arbitrary Upvote Inflation**: Updating `upvotes` by +500 in one call -> Rejected by `incoming().upvotes == existing().upvotes + 1`.
10. **Negative Metric Injection**: Setting `weeklyCompletedHours: -50` -> Rejected by `>= 0` range check.
11. **Value Poisoning on Update**: Updating `title` on `forum_posts` to a boolean or 50KB string -> Rejected because `isValidForumPost(incoming())` wraps the entire `allow update` block.
12. **Unbounded List / Shadow Collection Access**: Writing to `/unprotected_collection/doc1` -> Rejected by global safety net `match /{document=**} { allow read, write: if false; }`.
