# Comment Button Status Report

> **Last Updated:** 2026-02-14

## Status: ✅ IMPLEMENTED (Basic)

The comment system has been implemented with the following capabilities:

- Users can **view all comments** on a post
- Users can **post a new comment**
- The **comment count** is displayed on the PostCard ("View all X comments")
- Pull-to-refresh on the comments screen

### Constraints (by design)

- ❌ No comment replies (flat comments only)
- ❌ No comment likes
- ❌ No edit/delete functionality

---

## Files Modified

| File                                     | Change                                                           |
| ---------------------------------------- | ---------------------------------------------------------------- |
| `backend/models/Post.js`                 | Added `comments` sub-document array and `commentCount` virtual   |
| `backend/routes/posts.js`                | Added `POST /:id/comment` and `GET /:id/comments` routes         |
| `mobile-app/src/config/api.ts`           | Added `ADD_COMMENT` and `GET_COMMENTS` endpoints                 |
| `mobile-app/app/comments/[id].tsx`       | **New file** — Comments screen                                   |
| `mobile-app/src/components/PostCard.tsx` | Comment button navigates to comments screen; shows comment count |
| `mobile-app/app/(tabs)/index.tsx`        | Removed unused `onComment` prop                                  |

## Architecture

### Backend

- **Model**: Comments are stored as an embedded sub-document array on the `Post` document. Each comment has `user` (ObjectId ref), `text`, and `createdAt`.
- **Routes**:
  - `POST /api/posts/:id/comment` — Adds a comment and returns the populated comment
  - `GET /api/posts/:id/comments` — Returns all comments, populated with user data, sorted oldest-first

### Frontend

- **PostCard**: Tapping the chat bubble icon or "View all X comments" navigates to `/comments/[id]`
- **Comments Screen**: Full-screen with a FlatList + bottom input bar, keyboard-avoiding, optimistic append on submit
