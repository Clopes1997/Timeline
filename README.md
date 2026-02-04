# Timeline Visualization

A React-based timeline visualization application that displays project items on a horizontal timeline with drag-and-drop functionality.

## Features

- **Visual Timeline**: Display timeline items with start and end dates on a horizontal timeline
- **Drag & Drop**: Drag items to change their dates, or resize them by dragging the edges
- **Search**: Filter timeline items by name using the search bar
- **Zoom**: Zoom in and out to adjust the timeline scale
- **Auto-lane Assignment**: Items are automatically arranged in lanes to prevent overlaps
- **Item Editing**: Double-click items to edit their names

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

   This will start the Parcel development server and automatically open the app in your browser.

## Technologies Used

- React 18 with TypeScript
- Parcel 2 (build tool)
- CSS for styling
- Jest with ts-jest for testing

## What I like about my implementation.

- I like my implementation for the fact that it's visually simple but very effective. I'm using a modular TypeScript architecture with custom hooks, context, and a state store pattern, making maintenance easier and code more reusable. The separation of concerns between `TimelineContainer` (logic), `TimelineView` (presentation), and custom hooks (`useDragAndDrop`, `useItemEditing`, `useTooltip`) creates a clean, maintainable structure. The design looks clean and I'm very happy about how small and lightweight the project is, while still being feature-rich.


## What I would change if I were going to do it again.

- If I could do it again, I'd expand test coverage with more edge cases and integration tests. I'd also improve responsiveness for mobile devices and bring small feature improvements, like filter by date range, or even assign tasks to users. I might also consider using a more robust state management solution if the application scales further, though the current store pattern works well for this scope.

## How I made my design decisions.

- When looking for inspiration to build it, I focused my benchmark on products that benefit most from this feature in terms of job to be done: product management tools. I searched and tested Notion for usability/behavior and used Product Board and Monday for look and feel. Also, while building it, I wanted to bring an experience within WCAG accessibility standards as well as  8pt grid compliance as much as I could, giving a clean but effective aesthetic

## How I would test this if I had more time.

- I've already implemented unit tests for `assignLanes`, `dateUtils`, `timelineUtils`, and basic `Timeline` component tests. If I had more time, I'd expand coverage with additional unit tests for edge cases like overlapping items, single-day items, items spanning years, invalid dates, date range calculations, and position calculations at different zoom levels. I'd also add more comprehensive integration tests for drag-and-drop (resize start/end, boundary conditions like resizing past opposite end), editing (save on blur/Enter, cancel on Escape), zoom (reset, lane recalculation), and edge-case scenarios (e.g., items with same start/end dates). I'd also add E2E tests for the complete user workflows.

## Project Structure

- `src/TimelineContainer.tsx` - Main container component managing timeline state and logic
- `src/TimelineView.tsx` - Presentational component for rendering the timeline UI
- `src/Timeline.tsx` - Timeline component wrapper
- `src/assignLanes.ts` - Lane assignment algorithm for preventing overlaps
- `src/timelineItems.ts` - Sample timeline data
- `src/index.tsx` - App entry point with search functionality
- `src/components/` - Reusable UI components (TimelineItem, DateLabels, ErrorBoundary)
- `src/hooks/` - Custom React hooks (useDragAndDrop, useItemEditing, useTooltip)
- `src/context/` - React context for timeline handlers
- `src/store/` - State store using React's useSyncExternalStore for optimized re-renders
- `src/utils/` - Utility functions for date calculations and timeline positioning
- `src/types.ts` - TypeScript type definitions
- `src/constants.ts` - Timeline configuration and color palette
- `src/__tests__/` - Test files for components and utilities
