# CV Editor with Live Preview and Auto-Save

## Overview

The CV Editor is a comprehensive form editor component that allows users to create, edit, and manage their CVs with real-time preview and automatic saving functionality.

## Features

### ✅ Implemented Features

1. **Live Preview Updates**
   - Real-time preview that updates as you type
   - Three view modes: Preview, Editor, and JSON
   - Seamless switching between modes

2. **Form Editing Capabilities**
   - Personal Information editing
   - Work Experience management (add, edit, remove)
   - Skills categorization (add, edit, remove categories)
   - Rich text editing for job descriptions

3. **Auto-Save Functionality**
   - Automatic saving after 3 seconds of inactivity
   - Visual indicators for save status
   - Manual save option available

4. **User Experience**
   - Visual feedback for unsaved changes
   - Loading states during save operations
   - Success/error notifications using Sonner toast
   - Professional CV preview layout

## Technical Implementation

### State Management
- Uses React hooks (useState, useCallback, useEffect) for efficient state management
- Tracks unsaved changes and save status
- Implements debounced auto-save functionality

### Live Updates
- Form inputs trigger immediate state updates
- Preview component re-renders automatically when data changes
- Uses controlled components for form fields

### Save Functionality
- Simulated API calls with error handling
- Progress indicators during save operations
- Toast notifications for user feedback
- Prevents duplicate saves when already saving

## Usage

### Basic Setup
```tsx
import CVEditor from "@/components/cv-editor"

function MyApp() {
  return <CVEditor selectedFile="my-resume.json" />
}
```

### Key Functions

1. **Personal Information Updates**
   - Real-time field updates
   - Immediate preview refresh

2. **Experience Management**
   - Add new experiences
   - Edit existing entries
   - Remove experiences
   - Multi-line description support

3. **Skills Management**
   - Category-based organization
   - Comma-separated skill input
   - Add/remove categories

## Demo

Visit `/cv-demo` to see the CV Editor in action with:
- File selection simulation
- Full editing capabilities
- Live preview updates
- Save functionality

## File Structure

```
src/components/
├── cv-editor.tsx          # Main CV editor component
└── ui/                    # UI components

src/app/cv-demo/
├── page.tsx              # Demo page
└── layout.tsx            # Demo layout
```

## Status Indicators

- 🟢 **Saved**: All changes are saved
- 🟡 **Saving**: Save operation in progress
- 🟠 **Unsaved Changes**: Edits pending save

## Auto-Save Behavior

- Triggers 3 seconds after the last edit
- Only saves when there are actual changes
- Shows visual feedback during the process
- Falls back to manual save if auto-save fails

## Dependencies

- React 18+
- Next.js 15+
- Sonner (for toast notifications)
- Lucide React (for icons)
- Tailwind CSS (for styling)
- Framer Motion (for animations)

## Future Enhancements

- Drag and drop section reordering
- Template selection
- PDF export functionality
- Cloud storage integration
- Collaborative editing
- Version history
- Custom section types
