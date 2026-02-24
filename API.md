# Project API Reference

This document summarizes the exported functions, hooks, sagas, Redux actions/selectors, utilities, and major React components in this repository. It's generated from a static analysis of the codebase; use it as a quick reference.

## Conventions
- `->` indicates return type.
- Action payloads are described by shape where known.
- Components are listed with their props type when available.

## Utilities

### lib/utils.ts
- cn(...inputs: ClassValue[]) -> string
  - Description: Utility combining `clsx` and `tailwind-merge` to produce a merged className string.
  - Usage: import { cn } from './lib/utils';

## Hooks

### hooks/useDebounce.tsx
- useDebounce<T>(value: T, delay: number) -> T
  - Description: Returns a debounced value. Useful to avoid rapid updates (e.g., search input).
  - Example: const debounced = useDebounce(value, 300);

## Types
See `types.ts` for all exported TypeScript types and enums (UserRole, Permission, User, Student, Staff, Alumnus, Assignment, Material, ExamSchedule, etc.). These types are used throughout the store, slices, and components.

## Redux store

### store/index.ts
- store: Redux store configured with reducers: `auth`, `app`, `ui` and saga middleware.
- RootState -> ReturnType<typeof store.getState>
- AppDispatch -> typeof store.dispatch

## Auth slice (`store/slices/authSlice.ts`)
Action creators (exported):
- loginRequest(email: string)
- loginSuccess(user: User)
- loginFailure(error: string)
- logout()
- updateUserRequest(payload: Partial<User>)
- updateUserSuccess(user: User)
- updateUserFailure(error: string)
- deleteAccountRequest()

Selectors:
- selectUser(state: RootState) -> User | null
- selectIsAuthenticated(state: RootState) -> boolean
- selectAuthLoading(state: RootState) -> boolean
- selectAuthError(state: RootState) -> string | null
- selectUserPermissions(state: RootState) -> Permission[]
- selectCan(permission: Permission) -> (state: RootState) => boolean

Notes: `loginRequest` expects an email string in this mock app; `authSaga` handles it by looking up `USERS`.

## App slice (`store/slices/appSlice.ts`)
A large set of action creators are exported. Payload shapes shown where available.

User Management:
- addUserRequest(payload: Omit<User, 'id'|'permissions'>)
- bulkAddUsersRequest(payload: Omit<Student, ...>[]) (bulk create students)
- transferStudentsRequest({ studentIds: string[], newDepartmentId: string })
- promoteClassRequest({ departmentId: string, year: number })
- updateUserInListRequest(user: User)
- bulkUpdateUsersStatusRequest({ userIds: string[], status: 'Active' | 'Inactive' })
- bulkPromoteStudentsRequest({ userIds: string[] })
- removeUserRequest(userId: string)
- updateUserPermissionsRequest({ userId: string, permissions: Permission[] })
- setUsers(users: (User|Student|Staff|Alumnus)[])

Department/Classes:
- addDepartmentRequest(name: string)
- setDepartments(departments: Department[])
- assignHODRequest(payload: { deptId: string; staffId: string } | { deptId: string; newUser: { name: string; email: string; contact?: string } })
- assignAdvisorRequest({ departmentId: string; year: number; advisorId: string })
- setClasses(classes: ClassInDepartment[])

Staff Actions:
- submitAttendanceRequest({ courseId: string; records: Record<string, boolean> })
 # Project API Reference

 Detailed, per-file API reference generated from the repository source. This file focuses on exported functions, React components, hooks, Redux actions/selectors, and sagas.

 Conventions
 - `->` indicates return type.
 - For Redux actions we show the action creator name and the expected payload shape (when present).
 - Components are shown with their exported name and props shape when available.

 -------------------------------------------------

 ## Summary (high-level)
 - Utilities: `lib/utils.ts` (cn)
 - Hooks: `hooks/useDebounce.tsx` (useDebounce), `hooks/useAuth.tsx` (placeholder)
 - Types: `types.ts` (UserRole, Permission, User, Student, etc.)
 - Store: `store/index.ts` (store, RootState, AppDispatch)
 - Slices: `store/slices/authSlice.ts`, `store/slices/appSlice.ts`, `store/slices/uiSlice.ts` (actions + selectors)
 - Sagas: `store/sagas/*` (authSaga, appSaga, uiSaga, root saga)
 - UI components: `components/ui/*` (Card, Button, Input, Select, Sheet, Tabs, DropdownMenu, Skeleton, Switch, etc.)
 - Layout & shared: `components/layout/*`, `components/shared/*` (Sidebar, Header, DashboardLayout, Toast, Notifications, EmptyState)
 - Icons: `components/icons/Icons.tsx` (many named icon components)
 - Pages and top-level app: `App.tsx`, `index.tsx`, `pages/*` (Login, Dashboard, Profile...)

 -------------------------------------------------

 ## Per-file API (selected files)

 ### `types.ts`
 Exports: enums and interfaces used across the app.
 - UserRole (enum): ADMIN | PRINCIPAL | HOD | STAFF | STUDENT | EXAM_CELL
 - StudentStatus (enum): ACTIVE | ALUMNI | INACTIVE
 - Permission (enum): MANAGE_USERS, VIEW_USERS, MANAGE_DEPARTMENTS, VIEW_DEPARTMENTS, VIEW_LOGS, CONFIGURE_SYSTEM, MANAGE_ALUMNI, PROMOTE_STUDENTS, GENERATE_REPORTS
 - Type aliases & interfaces: `Grade`, `User`, `Student`, `Alumnus`, `Staff`, `Department`, `Course`, `Mark`, `Attendance`, `Assignment`, `Material`, `ExamSchedule`, `StudentSubmission`, `Tutor`, `TutorApplication`, `TutoringSession`, `MentorAssignment`, `Remark`, `OnDutyApplication`, `NoDuesCertificate`, `ActivityLog`, `Notification`, `Reminder`, `TodaysClass`, `UpcomingEvent`

 Use these types when calling actions/selectors or writing components.

 ### `constants.ts`
 Exports: many mock data arrays and constants used as an in-memory data source.
 - `GRADE_POINTS: Record<Grade, number>`
 - `PERMISSION_DESCRIPTIONS: Record<Permission, string>`
 - Mock arrays: `DEPARTMENTS`, `USERS`, `STUDENTS`, `ALUMNI`, `STAFF`, `CLASSES`, `COURSES`, `MARKS`, `ATTENDANCE`, `ACTIVITY_LOGS`, `NOTIFICATIONS`, `ASSIGNMENTS`, `SUBMISSIONS`, `MATERIALS`, `BOOKS`, `EXAM_SCHEDULES`, `DEPARTMENT_PASS_RATES`, `TUTORS`, `TUTOR_APPLICATIONS`, `TUTORING_SESSIONS`, `MENTOR_ASSIGNMENTS`, `REMARKS`, `ON_DUTY_APPLICATIONS`, `NO_DUES_CERTIFICATES`

 Note: sagas modify these arrays directly (mock persistence).

 ### `lib/utils.ts`
 Exports:
 - cn(...inputs: ClassValue[]) -> string
   - Description: Concatenate/merge className inputs using `clsx` and `twMerge` (Tailwind merge).

 ### `hooks/useDebounce.tsx`
 Exports:
 - useDebounce<T>(value: T, delay: number) -> T
   - Description: Returns a debounced version of `value`. Implementation uses useEffect and setTimeout.
   - Example: const debounced = useDebounce(search, 300)

 ### `hooks/useAuth.tsx`
 - Present in the tree but currently empty/placeholder. You can add authentication helpers here (login, logout wrappers, role checks).

 ### `store/index.ts`
 Exports:
 - `store` (configured Redux store with auth, app, ui reducers and saga middleware)
 - `RootState` type
 - `AppDispatch` type

 ### `store/slices/authSlice.ts`
 Actions (action creators exported):
 - loginRequest(email: string)
 - loginSuccess(user: User)
 - loginFailure(error: string)
 - logout()
 - updateUserRequest(payload: Partial<User>)
 - updateUserSuccess(user: User)
 - updateUserFailure(error: string)
 - deleteAccountRequest()

 Selectors:
 - selectUser(state: RootState) -> User | null
 - selectIsAuthenticated(state: RootState) -> boolean
 - selectAuthLoading(state: RootState) -> boolean
 - selectAuthError(state: RootState) -> string | null
 - selectUserPermissions(state: RootState) -> Permission[]
 - selectCan(permission: Permission) -> (state: RootState) => boolean

 Behavior notes:
 - `authSaga` handles `loginRequest` by looking up `USERS` in `constants.ts` and storing the result in localStorage and Redux.

 ### `store/slices/appSlice.ts`
 Actions (not exhaustive, representative):
 - addUserRequest(payload: Omit<User, 'id'|'permissions'>)
 - bulkAddUsersRequest(payload: Omit<Student, ...>[])
 - transferStudentsRequest({ studentIds: string[], newDepartmentId: string })
 - promoteClassRequest({ departmentId: string, year: number })
 - updateUserInListRequest(user: User)
 - bulkUpdateUsersStatusRequest({ userIds: string[], status: 'Active'|'Inactive' })
 - bulkPromoteStudentsRequest({ userIds: string[] })
 - removeUserRequest(userId: string)
 - updateUserPermissionsRequest({ userId: string, permissions: Permission[] })
 - setUsers(users)

 Department & class management
 - addDepartmentRequest(name: string)
 - assignHODRequest(payload: { deptId, staffId } | { deptId, newUser })
 - assignAdvisorRequest({ departmentId, year, advisorId })

 Staff & exam actions
 - submitAttendanceRequest({ courseId, records })
 - saveMarksRequest({ courseId, marks })
 - addMaterialRequest(material)
 - addAssignmentRequest(assignment)
 - submitAssignmentRequest(submissionPayload)
 - gradeSubmissionRequest({ studentId, assignmentId, grade })
 - addExamSchedulesRequest(schedules)

 Tutoring & mentoring
 - approveTutorApplicationRequest(applicationId)
 - bookTutoringSessionRequest(payload)
 - autoAssignMenteesRequest({ departmentId })
 - addRemarkRequest(payload)

 OD / dues
 - applyForODRequest(payload)
 - processODRequest({ applicationId, decision })
 - updateDuesStatusRequest({ studentId, dueType, status })
 - issueNoDuesCertificateRequest(studentId)

 Selectors:
 - selectAllUsers
 - selectAllDepartments
 - selectAllCourses
 - selectAllMarks
 - selectAllAttendance
 - selectAllMaterials
 - selectAllExamSchedules
 - selectAllAssignments
 - selectAllSubmissions
 - selectAllClasses
 - selectAllTutors
 - selectAllTutorApplications
 - selectAllTutoringSessions
 - selectAllMentorAssignments
 - selectAllRemarks
 - selectAllODApplications
 - selectAllNoDuesCertificates

 ### `store/slices/uiSlice.ts`
 Actions & selectors:
 - showToast({ message, type: 'success'|'error', title? })
 - hideToast()
 - selectToast(state: RootState) -> ToastState | null

 UI behaviour:
 - `uiSaga` auto-hides a toast after ~5s when `showToast` is dispatched.

 ### `store/sagas/appSaga.ts`
 Exports:
 - default export `appSaga()` (Generator) - registers many `takeLatest` watchers.

 Helper functions (internal):
 - generateId(prefix: string) -> string
 - calculateGradeAndPoints(internal: number, exam: number) -> { grade, gradePoint }

 Notable handler generators (signatures):
 - handleAddUser(action: PayloadAction<Omit<User,'id'|'permissions'>>)
 - handleBulkAddUsers(action: PayloadAction<Omit<Student,...>[]>)
 - handleTransferStudents(action: PayloadAction<{ studentIds: string[]; newDepartmentId: string }>)
 - handlePromoteClass(action: PayloadAction<{ departmentId: string; year: number }>)
 - handleUpdateUserInList(action: PayloadAction<User>)
 - handleBulkUpdateUsersStatus(action: PayloadAction<{ userIds: string[]; status: 'Active'|'Inactive' }>)
 - handleRemoveUser(action: PayloadAction<string>)
 - handleUpdateUserPermissions(action: PayloadAction<{ userId: string; permissions: Permission[] }>)
 - handleAddDepartment(action: PayloadAction<string>)
 - handleAssignHOD(action: PayloadAction<{ deptId: string; staffId: string } | { deptId: string; newUser: { name:string; email:string } }>)
 - handleAssignAdvisor(action: PayloadAction<{ departmentId: string; year: number; advisorId: string }>)
 - handleSubmitAttendance(action: PayloadAction<{ courseId: string; records: Record<string, boolean> }>)
 - handleSaveMarks(action: PayloadAction<{ courseId: string; marks: Record<string, { internal?: number; exam?: number }> }>)
 - handleAddMaterial(action: PayloadAction<Omit<Material,'id'|'uploadedAt'>>)
 - handleAddAssignment(action: PayloadAction<Omit<Assignment,'id'|'submitted'>>)
 - handleBulkAssignTopics(action: PayloadAction<{ courseId: string; assignments: { studentId: string; topic: string; remarks?: string }[] }>)
 - handleSubmitAssignment(action: PayloadAction<Omit<StudentSubmission,'submittedAt'|'status'|'grade'>>)
 - handleGradeSubmission(action: PayloadAction<{ studentId: string; assignmentId: string; grade: string }>)
 - handleAddExamSchedules(action: PayloadAction<ExamSchedule[]>)
 - handleApproveTutorApplication(action: PayloadAction<string>)
 - handleBookTutoringSession(action: PayloadAction<Omit<TutoringSession,'id'|'status'>>)
 - handleAutoAssignMentees(action: PayloadAction<{ departmentId: string }>)
 - handleUpdateMentorAssignment(action: PayloadAction<{ studentId: string; newMentorId: string }>)
 - handleAddRemark(action: PayloadAction<Omit<Remark,'id'|'timestamp'>>)
 - handleApplyForOD(action: PayloadAction<Omit<OnDutyApplication,...>>)
 - handleProcessOD(action: PayloadAction<{ applicationId: string; decision: 'approve'|'reject' }>)
 - handleUpdateODApplication(action: PayloadAction<Partial<OnDutyApplication> & { id: string }>)
 - handleUpdateDuesStatus(action: PayloadAction<{ studentId: string; dueType: 'library'|'department'|'accounts'; status: boolean }>)
 - handleIssueNoDuesCertificate(action: PayloadAction<string>)

 Implementation notes:
 - These handlers operate on the mock arrays in `constants.ts` and dispatch `set*` actions to update Redux state. They also call `showToast` on success/error.

 ### `store/sagas/authSaga.ts`
 Exports:
 - default export `authSaga()` (Generator)

 Handler generators:
 - handleLoginRequest(action: PayloadAction<string>)
   - Behavior: finds user by email in `USERS`, stores in localStorage, dispatches `loginSuccess` or `loginFailure`.
 - handleLogout()
   - Behavior: clears `lms_user` from localStorage.
 - handleUpdateUserRequest(action: PayloadAction<Partial<User>>)
   - Behavior: merges updates into current user (localStorage + USERS array) and dispatches `updateUserSuccess`.
 - handleDeleteAccountRequest()
   - Behavior: dispatches `removeUserRequest` (app slice) and logs user out.

 ### `store/sagas/uiSaga.ts`
 Exports:
 - default export `uiSaga()`

 Handler:
 - handleShowToast() — waits 5s then dispatches `hideToast()`

 -------------------------------------------------

 ## UI components (selected)

 ### `components/ui/Card.tsx`
 Exports (named):
 - Card({ children, className? }) -> React.FC
 - CardHeader({ children, className? })
 - CardTitle({ children, className? })
 - CardDescription({ children, className? })
 - CardContent({ children, className? })
 - CardFooter({ children, className? })

 Purpose: layout primitive for titled content blocks, uses `framer-motion` on the container.

 ### `components/ui/Button.tsx`
 Default export: `Button` component
 Props (subset):
 - children: ReactNode
 - variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
 - size?: 'sm' | 'md' | 'lg'
 - leftIcon?, rightIcon?
 - loading?: boolean

 Behavior: Motion-enabled button (hover/tap animations), shows spinner when `loading`.

 ### `components/ui/Input.tsx`
 Export: `Input` (forwardRef)
 Props: extends `React.InputHTMLAttributes<HTMLInputElement>`

 ### `components/ui/Select.tsx`
 Exports:
 - Select({ children, value?, onValueChange? })
 - SelectTrigger (forwardRef) — button wrapper
 - SelectValue({ placeholder? }) — displays current selection
 - SelectContent (forwardRef) — dropdown content
 - SelectItem (forwardRef, props: { value: string }) — selectable item

 Notes: Provides an internal context with `open`, `selectedValue`, `selectedNode` and an `onValueChange` callback.

 ### `components/ui/Sheet.tsx`
 Exports:
 - Sheet({ open, onOpenChange, children })
 - SheetContent (forwardRef, props: { side?: 'left'|'right' }) — sliding panel
 - SheetHeader, SheetTitle, SheetDescription

 Behavior: modal sheet with body scroll lock when open.

 ### `components/ui/Tabs.tsx`
 Exports:
 - Tabs({ defaultValue?, value?, onValueChange?, children })
 - TabsList, TabsTrigger({ value }), TabsContent({ value })

 ### `components/ui/DropdownMenu.tsx`
 Exports:
 - DropdownMenu
 - DropdownMenuTrigger({ children, asChild? })
 - DropdownMenuContent({ align? })
 - DropdownMenuItem
 - DropdownMenuLabel
 - DropdownMenuSeparator

 ### `components/ui/Skeleton.tsx`
 Export: `Skeleton` — simple placeholder block

 ### `components/ui/Switch.tsx`
 Export: `Switch` (forwardRef)
 Props: { checked: boolean; onCheckedChange: (checked: boolean) => void } plus button props

 ### `components/icons/Icons.tsx`
 Exports: many named icon components (React.FC<{ className?: string }>) — examples:
 - NitCampuzLogo, DashboardIcon, UsersIcon, BookOpenIcon, AcademicCapIcon, ClipboardListIcon, BeakerIcon, OfficeBuildingIcon, DocumentReportIcon, MenuIcon, LogoutIcon, XIcon, ChatIcon, PaperAirplaneIcon, BriefcaseIcon, UploadIcon, PencilIcon, TrashIcon, UserAddIcon, SearchIcon, SettingsIcon, CalendarIcon, SendIcon, PlusIcon, DotsHorizontalIcon, ClockIcon, HeartIcon, MailIcon, UserIcon, BarChartIcon, LifebuoyIcon, BellIcon, ChevronLeftIcon, ChevronDownIcon, CheckCircleIcon, ShieldCheckIcon, FileTextIcon, PresentationChartBarIcon, VideoCameraIcon, DownloadIcon, LockClosedIcon, LockOpenIcon, TableIcon, RocketIcon, WarningIcon, FullscreenIcon, GridIcon, ChevronRightIcon, MessageSquareIcon, ExclamationCircleIcon, SpinnerIcon

 Use: import { DashboardIcon } from 'components/icons/Icons';

 ### `components/layout/Sidebar.tsx`
 Default export: `Sidebar`
 Props:
 - isCollapsed: boolean
 - isMobileOpen: boolean
 - setMobileOpen(open: boolean)
 - setIsSettingsOpen(open: boolean)

 Behavior: renders role-aware navigation items using `NavLink`, filters by permissions and advisor/mentor flags.

 ### `components/layout/Header.tsx`
 Default export: `Header`
 Props:
 - setMobileSidebarOpen(open: boolean)
 - isSidebarCollapsed: boolean
 - toggleSidebarCollapse(): void
 - setIsSettingsOpen(open: boolean)

 Behavior: search input, notifications, user menu (profile/logout), keyboard shortcuts for focusing search.

 ### `components/layout/DashboardLayout.tsx`
 Default export: `DashboardLayout`
 Props: { children: ReactNode }

 Composes: `Sidebar`, `Header`, `BottomNavBar`, `SettingsSheet`, `Toast`. Controls sidebar collapse state and settings sheet.

 ### `components/layout/BottomNavBar.tsx`
 Default export: `BottomNavBar` (mobile bottom navigation)

 ### `components/shared/Toast.tsx`
 Default export: `Toast` — reads `state.ui.toast` and renders a dismissable toast with animation. Calls `hideToast` on close.

 ### `components/shared/Notifications.tsx`
 Default export: `Notifications` — dropdown listing `NOTIFICATIONS` with ability to mark as read (local UI state).

 ### `components/shared/EmptyState.tsx`
 Default export: `EmptyState({ title, message, icon? })` — small helper to render empty views.

 -------------------------------------------------

 ## Pages and top-level

 ### `App.tsx`
 - Default export `App` — sets up routing using `HashRouter` and `Routes`.
 - Behavior: redirects unauthenticated users to `/login`, authenticated users to `/*` (Dashboard).

 ### `index.tsx`
 - Renders the React app, wraps `<App />` with `<Provider store={store}>`.

 ### `pages/Login.tsx`
 - Default export: `LoginPage` — form for email/password; uses `loginRequest(email)` for mock quick-login flows. Exposes a few quick login buttons for demo users.

 ### `pages/Dashboard.tsx`
 - Default export: `DashboardPage` — chooses which dashboard component to render based on `user.role` and mounts them inside `DashboardLayout`. Also exposes nested routes for profile/permissions.

 -------------------------------------------------

 ## How to use this reference
 - For runtime usage, import action creators from `store/slices/*` and dispatch via `useDispatch<AppDispatch>()`.
 - For state reading, import selectors and call `useSelector(selectAllUsers)` etc.
 - For UI building, prefer the exported small components in `components/ui/*` and the icon set from `components/icons/Icons.tsx`.

 -------------------------------------------------

 ## Next steps (suggestions)
 - Split this file into directory-level docs (e.g., `docs/store.md`, `docs/components.md`) for easier navigation.
 - Generate JSON/YAML machine-readable API for automated tooling.
 - Add JSDoc comments to public functions and generator handlers in sagas for better editors/tooling support.

 -------------------------------------------------

 If you'd like one of the next steps implemented, tell me which (I can split the docs or produce machine-readable output next).