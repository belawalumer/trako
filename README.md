# Trako - Project Management Dashboard

A comprehensive project management and developer allocation system built with Next.js, Supabase, and Tailwind CSS.

## Features

### 🎯 Project Management
- **Enhanced Project Statuses**: 8 comprehensive statuses including New Projects in Pipeline, Gathering Requirements, Waiting for Client Approval, Client Not Responding, Started, Active, Completed, and Stopped
- **Multi-Category Support**: Projects can now have multiple categories (Web, Mobile, UI/UX, Backend, DevOps, Other) for better organization
- **Priority Management**: Low, Medium, High, and Urgent priority levels
- **Drag-and-Drop Board**: Intuitive Kanban-style board with drag-and-drop functionality for easy project status management
- **Project Filtering**: Filter projects by status, category, and individual project selection
- **Project Details**: Comprehensive project view with developer allocations, tasks, and timeline information

### 👥 Developer Management
- **Developer Profiles**: Complete developer profiles with skills, availability, and working hours
- **Multi-Project Allocation**: Developers can be assigned to multiple projects simultaneously
- **Hours Tracking**: Track allocated vs. worked hours per developer per project
- **Allocation Percentage**: Visual representation of developer workload across projects
- **Availability Status**: Real-time availability tracking for resource planning
- **Skills Management**: Tag developers with relevant skills for better project matching

### 📊 Dashboard & Analytics
- **Project Statistics**: Overview of project distribution by status and category
- **Team Performance**: Developer allocation and workload analytics
- **Recent Activity**: Live feed of project and task updates
- **Quick Actions**: Fast access to create projects and manage team

### 🔐 Authentication & Security
- **Secure Authentication**: Supabase Auth integration with email/password
- **Role-based Access**: Admin controls for project and developer management
- **Session Management**: Persistent login sessions with automatic token refresh

### ⚡ Real-time Features
- **Live Updates**: Real-time project status and allocation updates
- **Instant Synchronization**: Changes reflect immediately across all connected clients
- **Optimistic UI**: Smooth user experience with instant feedback

## Tech Stack

### Frontend
- **Framework**: Next.js 15.5.3 with App Router
- **React**: React 19.1.0 with React DOM 19.1.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with PostCSS
- **UI Components**: Headless UI 2.2.7
- **Icons**: Heroicons 2.2.0, Lucide React 0.544.0

### Backend & Database
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Database**: PostgreSQL with UUID primary keys
- **Authentication**: Supabase Auth with Next.js integration
- **Real-time**: Supabase Realtime subscriptions

### Drag & Drop
- **Core**: @dnd-kit/core 6.3.1
- **Sortable**: @dnd-kit/sortable 10.0.0
- **Utilities**: @dnd-kit/utilities 3.2.2

### Development & Build
- **Build Tool**: Next.js with Turbopack
- **Linting**: ESLint 9 with Next.js config
- **Deployment**: Netlify
- **Notifications**: React Hot Toast 2.6.0

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd project-management-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up the database

#### For New Installations
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `create-tables.sql` and run it
4. This will create all necessary tables and insert sample data

#### For Existing Installations (Migration)
If you have an existing database, run the migration scripts in order:

1. **Core Migration**: Run `migration.sql` to update existing tables with new fields and constraints
2. **Add Sort Order**: Run `add-sort-order.sql` to add drag-and-drop ordering support
3. **Multi-Category Support**: Run `update-categories-to-array.sql` to enable multiple categories per project

**Migration Order:**
```sql
-- 1. Run migration.sql first
-- 2. Then run add-sort-order.sql
-- 3. Finally run update-categories-to-array.sql
```

**Important Notes:**
- The migration scripts are designed to be safe and won't break existing data
- The old `category` field is kept for backward compatibility
- All new fields have sensible defaults
- Indexes are created for better performance

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment on Netlify

### 1. Build the project

```bash
npm run build
```

### 2. Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set the build command to: `npm run build`
3. Set the publish directory to: `.next`
4. Add the following environment variables in Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Netlify domain)

### 3. Configure Supabase for production

1. In your Supabase project settings, add your Netlify domain to the allowed origins
2. Update the site URL in Supabase Auth settings

## Project Structure

```
src/
├── app/                           # Next.js app directory
│   ├── auth/                     # Authentication pages
│   │   ├── login/                # Login page
│   │   └── signup/               # Signup page
│   ├── dashboard/                # Dashboard page
│   │   ├── page.tsx             # Main dashboard
│   │   └── loading.tsx           # Loading skeleton
│   ├── board/                    # Project board page
│   │   └── page.tsx             # Kanban board view
│   ├── developers/               # Developer management page
│   │   └── page.tsx             # Developer management
│   ├── layout.tsx                # Root layout with navigation
│   ├── loading.tsx               # Global loading component
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                    # Reusable components
│   ├── Layout.tsx                # Main layout with navigation
│   ├── LoadingSpinner.tsx        # Loading spinner component
│   ├── PageSkeleton.tsx          # Page loading skeleton
│   ├── RouteTransition.tsx       # Page transition animations
│   ├── # Dashboard Components
│   ├── DashboardStats.tsx        # Dashboard statistics
│   ├── DashboardActions.tsx      # Dashboard action buttons
│   ├── ProjectList.tsx           # Project list component
│   ├── RecentActivity.tsx        # Recent activity feed
│   ├── # Project Management
│   ├── ProjectBoard.tsx          # Drag-and-drop Kanban board
│   ├── ProjectColumn.tsx         # Board column component
│   ├── ProjectCard.tsx           # Project card component
│   ├── ProjectForm.tsx           # Project creation/editing form
│   ├── ProjectDetails.tsx        # Project details modal
│   ├── BoardActions.tsx          # Board action buttons
│   ├── # Developer Management
│   ├── DeveloperStats.tsx        # Developer statistics
│   ├── DeveloperList.tsx         # Developer list component
│   ├── DeveloperForm.tsx         # Developer creation/editing form
│   ├── DeveloperActions.tsx      # Developer action buttons
│   ├── # Project Allocation
│   ├── ProjectAllocations.tsx    # Project allocation management
│   ├── ProjectAllocationForm.tsx # Allocation form
│   └── # Task Management
│       └── TaskCard.tsx          # Task card component
└── lib/                          # Utility functions and configurations
    ├── supabase.ts               # Supabase client and type definitions
    ├── supabase-client.ts        # Client-side Supabase instance
    ├── supabase-server.ts        # Server-side Supabase instance
    ├── auth-utils.ts             # Authentication utilities
    ├── data.ts                   # Server-side data fetching
    ├── data-client.ts            # Client-side data fetching
    └── actions.ts                # Server actions for forms
```

### Key Features by Component

#### Dashboard (`/dashboard`)
- **DashboardStats**: Project and developer statistics with visual charts
- **ProjectList**: Recent projects with status indicators
- **RecentActivity**: Live activity feed
- **DashboardActions**: Quick action buttons for creating projects

#### Project Board (`/board`)
- **ProjectBoard**: Main Kanban board with drag-and-drop functionality
- **ProjectColumn**: Individual status columns with project cards
- **ProjectCard**: Interactive project cards with developer info
- **BoardActions**: Add project and filter controls

#### Developer Management (`/developers`)
- **DeveloperList**: Complete developer roster with availability
- **DeveloperStats**: Team performance and allocation metrics
- **DeveloperForm**: Create and edit developer profiles
- **DeveloperActions**: Management action buttons

#### Project Allocation
- **ProjectAllocations**: View and manage developer assignments
- **ProjectAllocationForm**: Assign developers to projects with hours

#### Authentication (`/auth`)
- **Login/Signup**: Secure authentication with Supabase Auth
- **Protected Routes**: Middleware-based route protection

## Recent Updates & Improvements

### 🚀 Version 0.1.0 - Latest Features

#### Enhanced Project Management
- **8 Comprehensive Statuses**: Added new project statuses for better workflow management
  - New Projects in Pipeline
  - Gathering Requirements
  - Waiting for Client Approval
  - Client Not Responding
- **Multi-Category Support**: Projects can now have multiple categories for better organization
- **Drag-and-Drop Ordering**: Added sort order support for custom project arrangement
- **Enhanced Filtering**: Filter projects by status, category, and individual project selection

#### Improved Developer Management
- **Skills Array**: Developers can now have multiple skills for better project matching
- **Working Hours**: Configurable weekly working hours per developer
- **Availability Tracking**: Real-time availability status for resource planning
- **Enhanced Allocation**: Better visualization of developer workload across projects

#### Database Improvements
- **Performance Indexes**: Added strategic indexes for faster queries
- **Auto-Update Triggers**: Automatic timestamp updates on record modifications
- **Backward Compatibility**: Maintained compatibility with existing data
- **Migration Scripts**: Safe migration paths for existing installations

#### UI/UX Enhancements
- **Modern Design**: Updated with Tailwind CSS 4 and latest design patterns
- **Loading States**: Improved loading skeletons and spinners
- **Responsive Design**: Better mobile and tablet experience
- **Toast Notifications**: User-friendly feedback for all actions

#### Technical Improvements
- **Next.js 15**: Upgraded to latest Next.js with App Router
- **React 19**: Latest React features and performance improvements
- **TypeScript 5**: Enhanced type safety and developer experience
- **Turbopack**: Faster development builds
- **ESLint 9**: Latest linting rules and configurations

## Database Schema

The application uses the following main tables:

### Core Tables

#### `projects`
- **id**: UUID primary key
- **name**: Project name (VARCHAR 255)
- **description**: Project description (TEXT)
- **status**: Project status with 8 possible values:
  - `new_projects_in_pipeline`
  - `gathering_requirements`
  - `waiting_for_client_approval`
  - `client_not_responding`
  - `started`
  - `active`
  - `completed`
  - `stopped`
- **priority**: Priority level (`low`, `medium`, `high`, `urgent`)
- **category**: Single category (legacy field for backward compatibility)
- **categories**: Array of categories for multi-category support
- **start_date**: Project start date
- **end_date**: Project end date
- **sort_order**: Integer for drag-and-drop ordering
- **created_at**: Timestamp with timezone
- **updated_at**: Timestamp with timezone (auto-updated)

#### `developers`
- **id**: UUID primary key
- **name**: Developer name (VARCHAR 255)
- **email**: Unique email address (VARCHAR 255)
- **avatar_url**: Profile image URL (TEXT)
- **skills**: Array of skills (TEXT[])
- **working_hours**: Weekly working hours (INTEGER, default 40)
- **is_available**: Availability status (BOOLEAN, default true)
- **created_at**: Timestamp with timezone
- **updated_at**: Timestamp with timezone (auto-updated)

#### `project_allocations`
- **id**: UUID primary key
- **project_id**: Foreign key to projects table
- **developer_id**: Foreign key to developers table
- **hours_allocated**: Allocated hours (INTEGER, default 0)
- **hours_worked**: Worked hours (INTEGER, default 0)
- **allocation_percentage**: Allocation percentage (DECIMAL 5,2)
- **start_date**: Allocation start date
- **end_date**: Allocation end date
- **created_at**: Timestamp with timezone
- **updated_at**: Timestamp with timezone (auto-updated)
- **UNIQUE constraint**: (project_id, developer_id)

#### `tasks`
- **id**: UUID primary key
- **project_id**: Foreign key to projects table
- **title**: Task title (VARCHAR 255)
- **description**: Task description (TEXT)
- **status**: Task status
- **priority**: Task priority
- **assigned_to**: Foreign key to developers table
- **due_date**: Task due date
- **created_at**: Timestamp with timezone
- **updated_at**: Timestamp with timezone (auto-updated)

### Indexes
- `idx_projects_status`: Performance index on project status
- `idx_projects_priority`: Performance index on project priority
- `idx_projects_categories`: GIN index for array category filtering
- `idx_projects_status_sort_order`: Composite index for board ordering
- `idx_developers_available`: Performance index on developer availability

### Triggers
- **Auto-update triggers**: Automatically update `updated_at` timestamp on record modification

## Features in Detail

### Dashboard
- Project statistics and status breakdown
- Recent projects list
- Activity feed
- Quick overview of team performance

### Project Board
- Drag-and-drop task management
- Filter by project
- Assign developers to tasks
- Real-time status updates

### Developer Management
- Developer profiles with skills and availability
- Project allocation tracking
- Hours allocation and completion rates
- Team overview and statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.