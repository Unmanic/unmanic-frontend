# Unmanic Frontend - Agent Guide

This document is designed to help AI agents understand the structure, technology stack, and development workflows of the Unmanic Frontend project.

## Project Overview

**Unmanic Frontend** is the web-based user interface for [Unmanic](https://github.com/Unmanic/unmanic), a tool for optimizing video libraries to a uniform format. It interacts with the Unmanic backend API to manage tasks, plugins, settings, and monitor progress.

## Technology Stack

- **Framework**: [Vue.js 3](https://v3.vuejs.org/)
- **UI Component Library**: [Quasar Framework v2](https://quasar.dev/)
- **Build System**: Quasar CLI (Webpack)
- **State Management**: [Vuex](https://vuex.vuejs.org/)
- **Routing**: [Vue Router](https://router.vuejs.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Internationalization**: [Vue-i18n](https://kazupon.github.io/vue-i18n/)
- **Event Bus**: `tiny-emitter`

## Directory Structure

The project follows the standard Quasar directory structure:

- **`src/`**: Source code root.
  - **`assets/`**: Static assets like images and logos.
  - **`boot/`**: Initialization scripts (Axios, i18n, Global Event Bus).
  - **`components/`**: Reusable Vue components.
    - **`dialogs/`**: Components for modal dialogs.
    - **`forms/`**: Components for input forms.
  - **`css/`**: Global styles (SCSS).
  - **`js/`**: Utility scripts and global logic.
    - **`unmanicGlobals.js`**: Core logic for API interaction, session management, and theming.
  - **`language/`**: Translation files (`.json`).
  - **`layouts/`**: Main layout templates (e.g., `MainLayout.vue`).
  - **`pages/`**: View components corresponding to routes.
  - **`router/`**: Vue Router configuration.
  - **`store/`**: Vuex store modules (if present/used).
  - **`App.vue`**: Root Vue component.
  - **`index.template.html`**: HTML template for the app.

## Key Files & patterns

- **`src/js/unmanicGlobals.js`**: Contains the `$unmanic` global object. This is the primary interface for communicating with the backend API. It handles URL resolution, authentication state, and theme management.
- **`src/boot/global-event-bus.js`**: Initializes the global event bus available as `$global`. This is used for decoupled communication between components (e.g., triggering a refresh).
- **`quasar.conf.js`**: The main configuration file for the Quasar framework. It defines boot files, plugins, build settings, and the development server proxy.
- **`package.json`**: Dependency definitions and script commands.

## UI/UX Standards & Best Practices

### Dialogs

- **Location**: New dialog components must be created in `src/components/dialogs/`.
- **Styling**:
  - Header background: `bg-card-head` (do not use `bg-primary`).
  - Header text: `text-blue-10`.
  - Close/Back buttons: `color="grey-7"`.
  - Header container: Use class `dialog-sticky-header` with `position: sticky; top: 0; z-index: 100;`.
- **Responsiveness**:
  - **Desktop**: Fixed width (e.g., `700px`), standard modal behavior. Transitions: `slide-left`/`slide-right`.
  - **Mobile**: Fullscreen (`maximized`), `width: 100vw`. Transitions: `jump-right`/`jump-left`. Implement `v-touch-swipe.touch.right="hide"` for swipe-to-dismiss.

### Mobile Responsiveness

- **Layouts**: Avoid fixed widths (e.g., `min-width: 400px`). Use `full-width` classes and flex columns on mobile.
- **Example**:
  ```html
  <component
    :is="$q.platform.is.mobile ? 'div' : 'q-btn-group'"
    :class="$q.platform.is.mobile ? 'column q-gutter-xs full-width' : ''"
  ></component>
  ```
- **Loading States**: Ensure loading skeletons or cards force `width: 100vw` on mobile to prevent the UI from appearing "narrow" before content loads.

### Buttons

- **Color**: Use `color="secondary"` for standard action buttons. Avoid `primary` unless specifically required by a major call-to-action that demands emphasis over standard UI elements.

## Localization

- **Strict Rule**: **NEVER** hardcode English strings in Vue templates or JavaScript logic.
- **Implementation**:
  1. Add the string to `src/language/en.json`.
  2. Use `$t('path.to.key')` in the component.
- **Scope**: This applies to labels, tooltips, placeholders, status messages, and error messages.

## External API Integrations (e.g., GitHub)

- **Rate Limiting**: Unauthenticated requests (like GitHub's) are strictly limited. You **MUST** implement client-side caching (localStorage or sessionStorage).
- **Caching Strategy**:
  - **Lists (Volatile)**: Cache for short periods (e.g., 10 minutes).
  - **Static/Metadata (Stable)**: Cache for long periods (e.g., 1 hour).
  - **Failures**: Cache 404s/Errors as `null` to prevent retry loops on broken resources.
- **Unmanic Plugin Ecosystem**:
  - Unmanic plugin forks store build metadata in a **`repo` branch**, specifically in a **`repo.json`** file.
  - Do **not** fetch `config.json` from the default branch for distribution metadata.

## Common Tasks

- **Adding a new Page**: Create a `.vue` file in `src/pages/` and add a route in `src/router/routes.js`.
- **Adding a new Component**: Create a `.vue` file in `src/components/`.
- **API Interaction**: Use `this.$axios` or the helper methods in `src/js/unmanicGlobals.js` (available as `this.$unmanic` in components).
- **Translation**: Add new strings to `src/language/en.json` (and other languages as needed) and use `this.$t('key')` in components.
