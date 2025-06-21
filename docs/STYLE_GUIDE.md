# Knowledge RAG WebUI Style Guide

## Overview

This style guide provides specific implementation details for the visual design language of the Knowledge RAG WebUI, including CSS specifications, component styling patterns, and brand guidelines.

## 🎨 Brand Identity

### Logo and Branding
- **Name**: Knowledge RAG WebUI
- **Tagline**: "Intelligent Memory Management"
- **Personality**: Professional, Modern, Accessible, Intelligent

### Visual Hierarchy
- **Primary**: Memory management and discovery
- **Secondary**: Search and organization
- **Tertiary**: Settings and configuration

## 🌈 Color System

### Primary Palette

#### Blue (Primary Brand Color)
```css
:root {
  --blue-50: #eff6ff;   /* Light backgrounds, subtle highlights */
  --blue-100: #dbeafe;  /* Hover states, light overlays */
  --blue-200: #bfdbfe;  /* Borders, disabled states */
  --blue-300: #93c5fd;  /* Icons, secondary elements */
  --blue-400: #60a5fa;  /* Active states, links */
  --blue-500: #3b82f6;  /* Primary actions, main brand */
  --blue-600: #2563eb;  /* Hover states for primary */
  --blue-700: #1d4ed8;  /* Active states, pressed */
  --blue-800: #1e40af;  /* Text on light backgrounds */
  --blue-900: #1e3a8a;  /* Headers, strong emphasis */
  --blue-950: #172554;  /* Deep contrast elements */
}
```

#### Gray (Neutral Scale)
```css
:root {
  --gray-50: #f9fafb;   /* Page backgrounds */
  --gray-100: #f3f4f6;  /* Card backgrounds */
  --gray-200: #e5e7eb;  /* Borders, dividers */
  --gray-300: #d1d5db;  /* Form borders */
  --gray-400: #9ca3af;  /* Placeholder text */
  --gray-500: #6b7280;  /* Secondary text */
  --gray-600: #4b5563;  /* Primary text */
  --gray-700: #374151;  /* Headers */
  --gray-800: #1f2937;  /* Strong headers */
  --gray-900: #111827;  /* Maximum contrast */
  --gray-950: #030712;  /* Pure black alternative */
}
```

### Semantic Colors

#### Success (Green)
```css
:root {
  --green-50: #ecfdf5;
  --green-100: #d1fae5;
  --green-500: #10b981;  /* Success messages, confirmations */
  --green-600: #059669;  /* Success button hover */
  --green-700: #047857;  /* Success button active */
}
```

#### Warning (Amber)
```css
:root {
  --amber-50: #fffbeb;
  --amber-100: #fef3c7;
  --amber-500: #f59e0b;  /* Warning messages, caution */
  --amber-600: #d97706;  /* Warning button hover */
  --amber-700: #b45309;  /* Warning button active */
}
```

#### Error (Red)
```css
:root {
  --red-50: #fef2f2;
  --red-100: #fee2e2;
  --red-500: #ef4444;    /* Error messages, destructive actions */
  --red-600: #dc2626;    /* Error button hover */
  --red-700: #b91c1c;    /* Error button active */
}
```

### Dark Mode Colors

#### Dark Theme Overrides
```css
[data-theme="dark"] {
  --gray-50: #0f1419;    /* Dark page background */
  --gray-100: #1a202c;   /* Dark card background */
  --gray-200: #2d3748;   /* Dark borders */
  --gray-300: #4a5568;   /* Dark form borders */
  --gray-400: #718096;   /* Dark placeholder */
  --gray-500: #a0aec0;   /* Dark secondary text */
  --gray-600: #cbd5e0;   /* Dark primary text */
  --gray-700: #e2e8f0;   /* Dark headers */
  --gray-800: #f7fafc;   /* Dark strong headers */
  --gray-900: #ffffff;   /* Dark maximum contrast */
}
```

## 📝 Typography System

### Font Stacks

#### Primary Font (UI Text)
```css
:root {
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 
               "Segoe UI", Roboto, "Helvetica Neue", Arial, 
               "Noto Sans", sans-serif, "Apple Color Emoji", 
               "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}
```

#### Secondary Font (Code/Technical)
```css
:root {
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", 
               Consolas, "Liberation Mono", Menlo, monospace;
}
```

### Type Scale and Hierarchy

#### Heading Styles
```css
.text-3xl {
  font-size: 1.875rem;    /* 30px */
  line-height: 2.25rem;   /* 36px */
  font-weight: 700;       /* Bold */
  color: var(--gray-900);
  margin-bottom: 1rem;
}

.text-2xl {
  font-size: 1.5rem;      /* 24px */
  line-height: 2rem;      /* 32px */
  font-weight: 600;       /* Semi-bold */
  color: var(--gray-800);
  margin-bottom: 0.75rem;
}

.text-xl {
  font-size: 1.25rem;     /* 20px */
  line-height: 1.75rem;   /* 28px */
  font-weight: 600;       /* Semi-bold */
  color: var(--gray-800);
  margin-bottom: 0.5rem;
}

.text-lg {
  font-size: 1.125rem;    /* 18px */
  line-height: 1.75rem;   /* 28px */
  font-weight: 500;       /* Medium */
  color: var(--gray-700);
}
```

#### Body Text Styles
```css
.text-base {
  font-size: 1rem;        /* 16px */
  line-height: 1.5rem;    /* 24px */
  font-weight: 400;       /* Normal */
  color: var(--gray-600);
}

.text-sm {
  font-size: 0.875rem;    /* 14px */
  line-height: 1.25rem;   /* 20px */
  font-weight: 400;       /* Normal */
  color: var(--gray-500);
}

.text-xs {
  font-size: 0.75rem;     /* 12px */
  line-height: 1rem;      /* 16px */
  font-weight: 400;       /* Normal */
  color: var(--gray-400);
}
```

### Reading Experience

#### Content Typography
```css
.prose {
  color: var(--gray-600);
  line-height: 1.7;
  font-size: 1rem;
}

.prose h1 {
  color: var(--gray-900);
  font-weight: 700;
  font-size: 1.875rem;
  line-height: 1.2;
  margin-top: 0;
  margin-bottom: 1rem;
}

.prose h2 {
  color: var(--gray-800);
  font-weight: 600;
  font-size: 1.5rem;
  line-height: 1.3;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

.prose p {
  margin-bottom: 1rem;
}

.prose ul, .prose ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.prose li {
  margin-bottom: 0.25rem;
}

.prose code {
  font-family: var(--font-mono);
  background-color: var(--gray-100);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.prose blockquote {
  border-left: 4px solid var(--blue-200);
  padding-left: 1rem;
  font-style: italic;
  color: var(--gray-500);
  margin: 1.5rem 0;
}
```

## 🧩 Component Styling

### Button System

#### Primary Button
```css
.btn-primary {
  background-color: var(--blue-600);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  min-height: 44px; /* Touch target */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background-color: var(--blue-700);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.4);
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}

.btn-primary:disabled {
  background-color: var(--gray-300);
  color: var(--gray-500);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

#### Secondary Button
```css
.btn-secondary {
  background-color: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-200);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-secondary:hover {
  background-color: var(--gray-200);
  border-color: var(--gray-300);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

#### Destructive Button
```css
.btn-destructive {
  background-color: var(--red-600);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-destructive:hover {
  background-color: var(--red-700);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}
```

### Card System

#### Memory Card
```css
.memory-card {
  background-color: white;
  border: 1px solid var(--gray-200);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.memory-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border-color: var(--gray-300);
}

.memory-card.selected {
  border-color: var(--blue-500);
  background-color: var(--blue-50);
  box-shadow: 0 0 0 2px var(--blue-200);
}

.memory-card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.memory-card-summary {
  color: var(--gray-600);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.memory-card-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--gray-500);
  margin-bottom: 1rem;
}

.memory-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
```

#### Search Result Card
```css
.search-result-card {
  background-color: white;
  border: 1px solid var(--gray-200);
  border-radius: 0.5rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease-in-out;
}

.search-result-card:hover {
  border-color: var(--blue-300);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-result-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--blue-600);
  margin-bottom: 0.5rem;
  text-decoration: none;
}

.search-result-title:hover {
  color: var(--blue-700);
  text-decoration: underline;
}

.search-result-snippet {
  color: var(--gray-600);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.search-result-highlight {
  background-color: var(--yellow-200);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.search-result-score {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--gray-500);
}
```

### Form Elements

#### Input Fields
```css
.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  background-color: white;
  transition: all 0.2s ease-in-out;
  min-height: 44px; /* Touch target */
}

.form-input:focus {
  outline: none;
  border-color: var(--blue-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: var(--gray-400);
}

.form-input:disabled {
  background-color: var(--gray-50);
  color: var(--gray-500);
  cursor: not-allowed;
}

.form-input.error {
  border-color: var(--red-500);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
```

#### Search Input
```css
.search-input {
  position: relative;
  width: 100%;
}

.search-input-field {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.75rem;
  font-size: 1rem;
  background-color: white;
  transition: all 0.2s ease-in-out;
  min-height: 48px;
}

.search-input-field:focus {
  outline: none;
  border-color: var(--blue-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  width: 1.25rem;
  height: 1.25rem;
}
```

### Navigation

#### Header Navigation
```css
.header {
  background-color: white;
  border-bottom: 1px solid var(--gray-200);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.95);
}

.nav-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
  text-decoration: none;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-600);
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease-in-out;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link:hover {
  color: var(--blue-600);
  background-color: var(--blue-50);
}

.nav-link.active {
  color: var(--blue-600);
  background-color: var(--blue-100);
  font-weight: 600;
}
```

### Tags and Badges

#### Tag Component
```css
.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: var(--gray-100);
  color: var(--gray-700);
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  border: 1px solid var(--gray-200);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  min-height: 32px;
}

.tag:hover {
  background-color: var(--gray-200);
  border-color: var(--gray-300);
}

.tag.selected {
  background-color: var(--blue-100);
  color: var(--blue-700);
  border-color: var(--blue-300);
}

.tag.selected:hover {
  background-color: var(--blue-200);
  border-color: var(--blue-400);
}

.tag-small {
  padding: 0.125rem 0.375rem;
  font-size: 0.625rem;
  min-height: 24px;
}

.tag-large {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  min-height: 36px;
}
```

#### Status Badges
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.375rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge-success {
  background-color: var(--green-100);
  color: var(--green-700);
}

.badge-warning {
  background-color: var(--amber-100);
  color: var(--amber-700);
}

.badge-error {
  background-color: var(--red-100);
  color: var(--red-700);
}

.badge-info {
  background-color: var(--blue-100);
  color: var(--blue-700);
}
```

## 📐 Layout Specifications

### Grid System

#### Container Styles
```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

.container-sm {
  max-width: 640px;
}

.container-md {
  max-width: 768px;
}

.container-lg {
  max-width: 1024px;
}

.container-xl {
  max-width: 1280px;
}

.container-full {
  max-width: 100%;
}
```

#### Grid Layouts
```css
.grid {
  display: grid;
  gap: 1.5rem;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.grid-auto-fit {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.grid-auto-fill {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}
```

### Responsive Breakpoints

#### Media Queries
```css
/* Extra Small devices (phones, 480px and down) */
@media (max-width: 480px) {
  .container {
    padding: 0 0.75rem;
  }
  
  .grid {
    gap: 1rem;
  }
  
  .grid-cols-2,
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: 1fr;
  }
}

/* Small devices (landscape phones, 640px and up) */
@media (min-width: 640px) {
  .sm\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .sm\:gap-6 {
    gap: 1.5rem;
  }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .md\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* Large devices (desktops, 1024px and up) */
@media (min-width: 1024px) {
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  
  .lg\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
```

## 🎭 Animation and Motion

### Transition Specifications

#### Standard Transitions
```css
.transition-standard {
  transition: all 0.2s ease-in-out;
}

.transition-fast {
  transition: all 0.15s ease-out;
}

.transition-slow {
  transition: all 0.3s ease-in-out;
}

.transition-transform {
  transition: transform 0.2s ease-in-out;
}

.transition-opacity {
  transition: opacity 0.2s ease-in-out;
}

.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}
```

#### Loading Animations
```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-bounce {
  animation: bounce 1s infinite;
}
```

#### Hover Effects
```css
.hover-lift {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.hover-scale {
  transition: transform 0.2s ease-in-out;
}

.hover-scale:hover {
  transform: scale(1.05);
}

.hover-glow {
  transition: box-shadow 0.2s ease-in-out;
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}
```

## 💫 Special Effects

### Glassmorphism
```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
}

.glass-dark {
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
}
```

### Gradient Backgrounds
```css
.gradient-primary {
  background: linear-gradient(135deg, var(--blue-500) 0%, var(--blue-600) 100%);
}

.gradient-secondary {
  background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-200) 100%);
}

.gradient-rainbow {
  background: linear-gradient(135deg, 
    var(--blue-500) 0%, 
    var(--purple-500) 25%, 
    var(--pink-500) 50%, 
    var(--red-500) 75%, 
    var(--orange-500) 100%);
}
```

### Shadow System
```css
.shadow-sm {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.shadow {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
}

.shadow-md {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
}

.shadow-lg {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);
}

.shadow-2xl {
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.shadow-inner {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.shadow-none {
  box-shadow: none;
}
```

## 🌗 Dark Mode Implementation

### Dark Mode Class Toggle
```css
/* Light mode (default) */
:root {
  color-scheme: light;
}

/* Dark mode */
[data-theme="dark"] {
  color-scheme: dark;
}

[data-theme="dark"] .memory-card {
  background-color: var(--gray-800);
  border-color: var(--gray-700);
  color: var(--gray-100);
}

[data-theme="dark"] .memory-card:hover {
  border-color: var(--gray-600);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .btn-primary {
  background-color: var(--blue-600);
}

[data-theme="dark"] .btn-secondary {
  background-color: var(--gray-700);
  border-color: var(--gray-600);
  color: var(--gray-200);
}

[data-theme="dark"] .form-input {
  background-color: var(--gray-800);
  border-color: var(--gray-600);
  color: var(--gray-100);
}

[data-theme="dark"] .form-input:focus {
  border-color: var(--blue-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}
```

## 🎯 Accessibility Standards

### Focus Management
```css
.focus-ring {
  outline: none;
}

.focus-ring:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  border-color: var(--blue-500);
}

.focus-ring:focus:not(:focus-visible) {
  box-shadow: none;
  border-color: initial;
}
```

### Screen Reader Support
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### High Contrast Mode Support
```css
@media (prefers-contrast: high) {
  .memory-card {
    border-width: 2px;
    border-color: var(--gray-900);
  }
  
  .btn-primary {
    border: 2px solid var(--blue-800);
  }
  
  .tag {
    border-width: 2px;
  }
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .hover-lift:hover {
    transform: none;
  }
  
  .hover-scale:hover {
    transform: none;
  }
}
```

This comprehensive style guide provides the foundation for consistent, accessible, and beautiful styling across the Knowledge RAG WebUI application.