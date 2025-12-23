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
  - **`components/`**: Reusable Vue components. Organized by purpose/UI section:
    - **`standard/`**: Generic, reusable components that provide slots (wrappers, templates).
    - **`dialogs/`**: Specific dialog content components.
      - **`standard/`**: Standardized dialog wrapper templates (`UnmanicDialogMenu`, etc.).
    - **`forms/`**: Input form components.
    - **`settings/`**: Components specific to the Settings pages.
      - **`library/`**: Components specific to the Libraries settings page.
      - **`link/`**: Components specific to the Link settings page.
      - **`plugins/`**: Components specific to the Plugins settings page.
      - **`workers/`**: Components specific to the Workers settings page.
    - (etc.)
  - **`composables/`**: Vue 3 Composition API composables (e.g., `useMobile`).
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

## Component Standards

### File Structure

- **Ordering**: Components must strictly follow this order:
  1. `<template>`
  2. `<script setup>` (or `<script>`)
  3. `<style scoped>`

### API Style

- **Composition API**: For **all new components** and **major refactors**, use the Vue 3 Composition API with the `<script setup>` syntax.

- **Legacy Support**: Existing components using the Options API can remain as-is for minor edits, but consider refactoring to `<script setup>` if significant changes are required.

### Styling

- **CSS Classes**: Prefer standard CSS classes (including Quasar's utility classes) and `<style scoped>` blocks.

- **Responsiveness**: Use CSS Media Queries (`@media`) within the `<style>` block for responsive logic instead of JavaScript computed properties or inline styles.

- **Dynamic Values**: When component props must affect styling (e.g., a dynamic width), pass them as CSS variables via the `:style` attribute (e.g., `:style="{ '--my-var': props.value }"`) and consume them in CSS (`var(--my-var)`). Avoid direct inline style manipulation for layout logic.

## Composables

### `useMobile`

- **Location**: `src/composables/useMobile.js`

- **Purpose**: Provides a centralized, reactive `isMobile` property.

- **Logic**: Returns `true` if the screen width is less than 1024px (`$q.screen.lt.md`) OR if the platform is detected as a mobile device (`$q.platform.is.mobile`).

- **Usage**:

  ```javascript
  import { useMobile } from "src/composables/useMobile";

  const { isMobile } = useMobile();
  ```

## UI/UX Standards & Best Practices

### Dialogs

- **Location**: New dialog components must be created in `src/components/dialogs/`.
- **Standard Wrappers**: **PREFERRED**. Use the pre-built wrappers in `src/components/dialogs/standard/` to ensure consistent behavior across desktop and mobile.
  - **`UnmanicDialogMenu`**: For side-menus. Slides from right (desktop) or left (mobile). Supports an `action` prop for a header button (e.g., Save).
  - **`UnmanicDialogPopup`**: For standard modals/forms. Centered (desktop) or left-slide full-width (mobile).
  - **`UnmanicDialogWindow`**: For large floating windows. Slides from right with buffer (desktop) or left-slide full-width (mobile).
- **Usage Example**:
  ```html
  <UnmanicDialogPopup title="My Dialog" @hide="onHide">
    <!-- Your Content Here -->
  </UnmanicDialogPopup>
  ```
- **Styling (Manual Implementation)**:
  - If you cannot use the wrappers:
  - Header background: `bg-card-head` (do not use `bg-primary`).
  - Header text: `text-blue-10`.
  - Close/Back buttons: `color="grey-7"`.
  - Header container: Use class `dialog-sticky-header` with `position: sticky; top: 0; z-index: 100;`.
- **Responsiveness (Manual Implementation)**:
  - **Desktop**: Fixed width (e.g., `700px`), standard modal behavior. Transitions: `slide-left` (show) / `slide-right` (hide).
  - **Mobile**: Fullscreen (`maximized`), `width: 100vw`. Transitions: `slide-right` (show) / `slide-left` (hide) (Slides in from left). Implement `v-touch-swipe.touch.left="hide"` for swipe-to-dismiss.

### Mobile Responsiveness

- **Layouts**: Avoid fixed widths (e.g., `min-width: 400px`). Use `full-width` classes and flex columns on mobile.
- **Breakpoints**: Use **`$q.screen.lt.md`** (approx <1024px) as the standard breakpoint for switching to mobile views (e.g., full-width dialogs).
- **Visibility Classes**: **STRICT RULE**: Prefer Quasar's visibility classes (e.g., `lt-md`, `gt-sm`, `lt-sm`) to switch between distinct mobile and desktop layouts. Avoid using `$q.platform.is.mobile` for this purpose.
- **JavaScript Breakpoints**: If JavaScript logic is absolutely required for a layout change (e.g., toggling a component type), use `$q.screen` properties (e.g., `$q.screen.lt.md`) instead of `$q.platform.is.mobile`.
- **Example**:
  ```html
  <component
    :is="$q.screen.lt.md ? 'div' : 'q-btn-group'"
    :class="$q.screen.lt.md ? 'column q-gutter-xs full-width' : ''"
  >
  </component>
  ```
- **Loading States**: Ensure loading skeletons or cards force `width: 100vw` on mobile to prevent the UI from appearing "narrow" before content loads.

### Buttons

- **Color**: Use `color="secondary"` for standard action buttons. Avoid `primary` unless specifically required by a major call-to-action that demands emphasis over standard UI elements.

## Quasar Framework Patterns

### Dialog Custom Events

- **Problem**: The Quasar Dialog plugin chain (`.onOk()`, `.onDismiss()`) does **not** support listening to arbitrary component events (e.g., `.on('custom-event')`).
- **Solution**: Pass event listeners via `componentProps` using the `onEventName` convention.
  ```javascript
  this.$q.dialog({
    component: MyDialog,
    componentProps: {
      onCustomEvent: (payload) => this.handleEvent(payload),
    },
  });
  ```

## Coding Best Practices

### Template Verification

- **Strict Rule**: When modifying Vue templates, especially when copy-pasting blocks, **verify tag nesting**. Ensure every opening tag has a matching closing tag and that `v-for`/`v-if` blocks are correctly scoped.
- **Tools**: Run `npm run build` locally to catch template compilation errors that linter might miss.

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
