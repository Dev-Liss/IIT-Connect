# IIT Connect (CoNNect)

A cross-platform campus social app for IIT students, lecturers, and alumni. Built with Expo and React Native using Expo Router’s file-based navigation. Current implementation focuses on polished UI flows with mocked data for chat, messaging, feed, and content creation.

**Tech Stack**

- **Runtime:** Expo SDK 54, React Native 0.81
- **Navigation:** Expo Router + `@react-navigation/native`
- **UI:** React Native, `@expo/vector-icons`, `expo-image`, `react-native-reanimated`
- **Platform:** Android, iOS, Web via `react-native-web`
- **Dev tooling:** ESLint (expo config), Babel module resolver, TypeScript types

**Project Structure**

- **App root:** [app/iit-connect](app/iit-connect)
- **Entry + Router:** `main: expo-router/entry` in [app/iit-connect/package.json](app/iit-connect/package.json)
- **Routes:** File-based under [app/iit-connect/app](app/iit-connect/app)
  - Root stack layout: [app/iit-connect/app/\_layout.jsx](app/iit-connect/app/_layout.jsx)
  - Auth stack: [app/iit-connect/app/(auth)](<app/iit-connect/app/(auth)>) → `login.jsx`, `signup.jsx`, `user-type.jsx`
  - Tabs stack: [app/iit-connect/app/(tabs)](<app/iit-connect/app/(tabs)>) → `index.jsx` (Home), `explore.jsx`, `messages.jsx`, `more.jsx`, `profile.jsx`
  - Messaging stack: [app/iit-connect/app/messages](app/iit-connect/app/messages) → `chat.jsx`, `new-chat.jsx`, `new-group.jsx`, `new-community.jsx`, `create-group.jsx`
  - Content creation stack: [app/iit-connect/app/content](app/iit-connect/app/content) → `create-post.jsx`, `create-event.jsx`, `create-announcement.jsx`, `create-reel.jsx`
  - Shared components: [app/iit-connect/components](app/iit-connect/components)
  - Styles: [app/iit-connect/styles](app/iit-connect/styles)
  - Hooks: [app/iit-connect/hooks](app/iit-connect/hooks)

**Navigation & Flow**

- **Root stack:** Defined in [app/iit-connect/app/\_layout.jsx](app/iit-connect/app/_layout.jsx). Provides theme via `ThemeProvider` and registers screens: `index`, `welcome`, `(auth)`, `(tabs)`, `messages`, `content`, `modal`.
- **Initial redirect:** [app/iit-connect/app/index.jsx](app/iit-connect/app/index.jsx) checks `isAuthenticated` (currently hardcoded) and redirects to `(tabs)` when signed in, else to `welcome`.
- **Welcome → Auth:** [app/iit-connect/app/welcome.jsx](app/iit-connect/app/welcome.jsx) sends users to user type selection at `(auth)/user-type`.
- **Auth screens:**
  - [login.jsx](<app/iit-connect/app/(auth)/login.jsx>) validates IIT email (`@iit.ac.lk`), password length; on success redirects to `(tabs)`.
  - [signup.jsx](<app/iit-connect/app/(auth)/signup.jsx>) two-step signup with IIT email validation, profile fields, password + confirm; on success redirects to `(tabs)`.
  - [user-type.jsx](<app/iit-connect/app/(auth)/user-type.jsx>) captures role (student/lecture/alumni) before login.
- **Tabs:** Defined in [app/iit-connect/app/(tabs)/\_layout.jsx](<app/iit-connect/app/(tabs)/_layout.jsx>) using `Tabs`:
  - `index` (Home feed), `explore`, `more`, `messages`, `profile`. Custom `HapticTab` button, icons via `Ionicons`.
- **Modal route:** [app/iit-connect/app/modal.jsx](app/iit-connect/app/modal.jsx) registered for modal presentation.

**Home Feed**

- Screen: [app/iit-connect/app/(tabs)/index.jsx](<app/iit-connect/app/(tabs)/index.jsx>)
- Features: Stories UI, feed posts, announcements, events (all mocked). Actions include like, comment stub, share stub, save toggle. “Create” modal links to content creation screens.

**Explore**

- Screen: [app/iit-connect/app/(tabs)/explore.jsx](<app/iit-connect/app/(tabs)/explore.jsx>)
- Purpose: Demo page showcasing Expo Router concepts, collapsible sections, and platform notes.

**Messaging Overview**

- List screen: [app/iit-connect/app/(tabs)/messages.jsx](<app/iit-connect/app/(tabs)/messages.jsx>)
  - Tabs: All, Direct, Groups, Clubs
  - Mocked conversations with avatars/badges, unread counts, online status
  - Search filter; tapping a conversation navigates into chat with params
  - FAB opens a menu for New Chat, New Group, New Community
- New flows:
  - [new-chat.jsx](app/iit-connect/app/messages/new-chat.jsx): start a direct chat (placeholder)
  - [new-group.jsx](app/iit-connect/app/messages/new-group.jsx): select users with search and checkboxes, then proceed to group creation
  - [create-group.jsx](app/iit-connect/app/messages/create-group.jsx): finalize group (placeholder)
  - [new-community.jsx](app/iit-connect/app/messages/new-community.jsx): start community chat (placeholder)

**Chat Implementation**

- Screen: [app/iit-connect/app/messages/chat.jsx](app/iit-connect/app/messages/chat.jsx)
- Data: `DUMMY_MESSAGES` array mocked in-file; no backend yet.
- State: Local `useState` stores `messages` and input text; `sendMessage()` appends new messages with timestamp.
- UI: `FlatList` renders bubbles for “me” vs “other”; optional file attachment card with download icon; header shows `name` and status.
- Behavior: Auto-scroll to end on content size change, disabled send when input empty, KeyboardAvoidingView handles input on iOS/Android.
- Limitations: No real-time transport, persistence, or file upload; routing passes params (`id`, `name`, `type`) from list.

**Content Creation**

- Screens: [create-post.jsx](app/iit-connect/app/content/create-post.jsx), [create-event.jsx](app/iit-connect/app/content/create-event.jsx), [create-announcement.jsx](app/iit-connect/app/content/create-announcement.jsx), [create-reel.jsx](app/iit-connect/app/content/create-reel.jsx)
- All screens are UI-first with basic validation and “TODO” hooks for future API integration.

**Theming & Utilities**

- Theme: `ThemeProvider` from `@react-navigation/native` toggled via [hooks/use-color-scheme.js](app/iit-connect/hooks/use-color-scheme.js) and [use-theme-color.js](app/iit-connect/hooks/use-theme-color.js)
- Components: Haptic tab button [components/haptic-tab.jsx](app/iit-connect/components/haptic-tab.jsx), collapsible sections [components/ui/collapsible.jsx](app/iit-connect/components/ui/collapsible.jsx), parallax scroll [components/parallax-scroll-view.jsx](app/iit-connect/components/parallax-scroll-view.jsx), themed text/view wrappers.
- Styles: Screen-specific styles live under [app/iit-connect/styles](app/iit-connect/styles) (e.g., `chat.styles.js`, `home.styles.js`).

**How It Was Built**

- **Expo Router:** File-based routing defines stacks and tabs by directory structure; layouts control navigator configuration.
- **Screens:** Functional React components with `useState` for local UI and mocked data; iconography via `@expo/vector-icons`.
- **Navigation:** `router.push()` and `Redirect` manage flows; params passed through route links.
- **Animations/Haptics:** `react-native-reanimated` prepared for smooth UI; Haptic interactions via `expo-haptics` (hooked in custom tab button).
- **Cross-platform:** Web support via `react-native-web`; platform-aware components (e.g., `KeyboardAvoidingView`).

**Running the App**

1. Install prerequisites: Node.js LTS, Git, Android Studio (or Xcode), Expo Go (device) or emulators.
2. Install dependencies:

```bash
cd app/iit-connect
npm install
```

3. Start in development:

```bash
npm run start
```

4. Quick targets:

```bash
npm run android
npm run ios
npm run web
```

**Current Limitations & Next Steps**

- No backend or auth persistence yet; all data is mocked.
- Chat lacks real-time transport and storage.
- Media picking/upload not implemented.
- Suggested roadmap:
  - Integrate backend (e.g., Firebase/Firestore or Supabase) for auth, messages, posts.
  - Use realtime channels (Firestore listeners or WebSocket) for chat.
  - Implement image/video picker and secure uploads.
  - Add profile management and settings.

**Files To Reference During Viva**

- Routing: [app/iit-connect/app/\_layout.jsx](app/iit-connect/app/_layout.jsx), [app/iit-connect/app/(tabs)/\_layout.jsx](<app/iit-connect/app/(tabs)/_layout.jsx>)
- Auth: [app/iit-connect/app/(auth)/login.jsx](<app/iit-connect/app/(auth)/login.jsx>), [app/iit-connect/app/(auth)/signup.jsx](<app/iit-connect/app/(auth)/signup.jsx>), [app/iit-connect/app/(auth)/user-type.jsx](<app/iit-connect/app/(auth)/user-type.jsx>)
- Messaging: [app/iit-connect/app/(tabs)/messages.jsx](<app/iit-connect/app/(tabs)/messages.jsx>), [app/iit-connect/app/messages/chat.jsx](app/iit-connect/app/messages/chat.jsx)
- Home & Create: [app/iit-connect/app/(tabs)/index.jsx](<app/iit-connect/app/(tabs)/index.jsx>), [app/iit-connect/app/content](app/iit-connect/app/content)
