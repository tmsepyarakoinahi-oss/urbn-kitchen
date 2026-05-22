# Task 2-c: Customer & Employee Portal Components

## Agent: Frontend Developer

## Work Completed

### CustomerPortal.tsx (`/home/z/my-project/src/components/CustomerPortal.tsx`)
- Full customer portal with sidebar navigation + 5 tab content areas
- **Orders**: Table with filter, order detail dialog with items/shipping/payment/totals
- **Profile**: Editable form (name, email, phone), change password section
- **AMC**: Contract cards with coverage, dates, amounts, renewal buttons
- **Service**: Request table, raise new request dialog with AMC contract selector
- **Wishlist**: Product cards with Add to Cart/Remove, stock status, empty state
- Data from: GET /api/orders, GET /api/amc, GET /api/service-requests, POST /api/service-requests, GET /api/products

### EmployeePortal.tsx (`/home/z/my-project/src/components/EmployeePortal.tsx`)
- Full employee portal with sidebar navigation + 5 tab content areas
- **Dashboard**: Welcome, check in/out, task counts, upcoming leaves, recent activity
- **Attendance**: Monthly calendar with color-coded markers, attendance table, check in/out API integration
- **Tasks**: Task cards with filter, priority/status badges, status update via PUT /api/tasks
- **Salary**: Collapsible salary slip cards with earnings/deductions breakdown, download button
- **Leaves**: Leave balance cards with progress bars, apply dialog, history table
- Data from: GET /api/employees, GET /api/attendance, POST /api/attendance, GET /api/tasks, PUT /api/tasks

### Technical Details
- Both files are 'use client' components
- Zustand store integration (customerTab, employeeTab)
- Dark industrial theme: #0b0b0b bg, #59ff00 neon accent, #151518 cards, #101010 sidebar
- Responsive: collapsible mobile sidebar with framer-motion slide animation
- Lint-clean (no ESLint errors)
- All prices formatted as ₹XX,XXX (Indian locale)

### Context from Previous Agents
- Read `/agent-ctx/2-a-backend-developer.md` for API route details
- All API endpoints tested and working
- Database seeded with realistic data
