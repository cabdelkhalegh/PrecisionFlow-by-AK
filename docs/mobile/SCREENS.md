# Mobile App Screens Documentation

This document provides comprehensive documentation for all screens in the PrecisionFlow mobile application.

## Overview

**Total Screens:** 8 (implemented)  
**Framework:** React Native with Expo  
**Navigation:** expo-router (file-based routing)  
**API:** tRPC with React Query  

---

## Screen Index

1. [Splash/Welcome Screen](#1-splashwelcome-screen)
2. [Login Screen](#2-login-screen)
3. [Home/Dashboard Screen](#3-homedashboard-screen)
4. [Campaigns List Screen](#4-campaigns-list-screen)
5. [Approvals List Screen](#5-approvals-list-screen)
6. [Profile Screen](#6-profile-screen)
7. [Tab Navigation Layout](#7-tab-navigation-layout)
8. [Root Layout](#8-root-layout)

---

## 1. Splash/Welcome Screen

**File:** `app/index.tsx`  
**Route:** `/`  
**Type:** Initial screen

### Purpose
The first screen users see when opening the app. Handles initial authentication check and routing.

### Functionality
- Checks for existing authentication token
- Redirects authenticated users to dashboard
- Redirects unauthenticated users to login
- Shows app branding/logo (splash screen)

### UI Components
- App logo
- Loading indicator
- Minimal UI (transition screen)

### Navigation Flow
```
Splash Screen
├─→ If authenticated → Dashboard (tabs/index)
└─→ If not authenticated → Login (auth/login)
```

### API Calls
- Token validation (implicit via auth context)

### User Interactions
- None (automatic routing)

### Edge Cases
- Invalid/expired token → redirect to login
- Network error → show error, retry option
- First-time install → redirect to login

### Code Example
```tsx
// app/index.tsx
export default function Index() {
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [user, isLoading]);
  
  return <SplashScreen />;
}
```

---

## 2. Login Screen

**File:** `app/(auth)/login.tsx`  
**Route:** `/login`  
**Type:** Authentication

### Purpose
Allow users to authenticate and access the application.

### Functionality
- Email/password input
- Form validation
- Authentication via tRPC
- Secure token storage
- Error handling
- Redirect to dashboard on success

### UI Components
- Text inputs (email, password)
- Submit button
- Error message display
- Loading indicator
- Forgot password link (if implemented)

### Navigation Flow
```
Login Screen
├─→ On success → Dashboard (tabs/index)
└─→ On forgot password → Password Reset (if implemented)
```

### API Calls
- `auth.login` mutation
- Returns: user object and token

### User Interactions
1. Enter email address
2. Enter password
3. Tap "Login" button
4. View loading state
5. On success: redirected to dashboard
6. On error: see error message, retry

### Form Validation
- Email: required, valid email format
- Password: required, minimum length

### Security
- Passwords masked
- Token stored in expo-secure-store
- HTTPS only
- Token transmitted securely

### Error Handling
- Invalid credentials
- Network errors
- Server errors
- Form validation errors

### Code Example
```tsx
// app/(auth)/login.tsx
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = trpc.auth.login.useMutation();
  const { setToken } = useAuth();
  
  const handleLogin = async () => {
    try {
      const result = await loginMutation.mutateAsync({
        email,
        password,
      });
      await setToken(result.token);
      router.replace('/(tabs)');
    } catch (error) {
      // Show error
    }
  };
  
  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput 
        value={password} 
        onChangeText={setPassword}
        secureTextEntry 
      />
      <Button onPress={handleLogin} />
    </View>
  );
}
```

---

## 3. Home/Dashboard Screen

**File:** `app/(tabs)/index.tsx`  
**Route:** `/` (after authentication)  
**Type:** Main dashboard

### Purpose
Provide an overview of key metrics and quick access to main features.

### Functionality
- Display key statistics
- Show recent activity
- Quick action buttons
- Pull-to-refresh
- Real-time data updates

### UI Components
- Stat cards (campaigns, approvals, etc.)
- Recent activity list
- Quick action buttons
- Pull-to-refresh control
- Loading states

### Data Displayed
- Total campaigns count
- Active campaigns count
- Pending approvals count
- Recent campaign updates
- User's recent activity

### Navigation Flow
```
Dashboard
├─→ View Campaigns → Campaigns tab
├─→ View Approvals → Approvals tab
├─→ Quick Actions → Relevant screens
└─→ Recent Items → Detail screens
```

### API Calls
- `dashboard.getStats` query
- `campaigns.list` query (recent)
- `approvals.list` query (pending)

### User Interactions
1. Pull down to refresh data
2. Tap stat cards to view details
3. Tap recent items to open details
4. Use quick action buttons

### Refresh Behavior
- Pull-to-refresh triggers data reload
- Auto-refresh every 60 seconds (optional)
- Show loading indicators

### Edge Cases
- No data available → empty state message
- API errors → error message with retry
- Slow network → show loading, timeout after 30s

### Code Example
```tsx
// app/(tabs)/index.tsx
export default function DashboardScreen() {
  const { data: stats, isLoading, refetch } = trpc.dashboard.getStats.useQuery();
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <StatCard title="Total Campaigns" value={stats?.totalCampaigns} />
      <StatCard title="Active Campaigns" value={stats?.activeCampaigns} />
      <StatCard title="Pending Approvals" value={stats?.pendingApprovals} />
      <RecentActivity items={stats?.recentActivity} />
    </ScrollView>
  );
}
```

---

## 4. Campaigns List Screen

**File:** `app/(tabs)/campaigns.tsx`  
**Route:** `/campaigns`  
**Type:** List view

### Purpose
Display all campaigns and allow browsing/filtering.

### Functionality
- List all campaigns
- Search campaigns
- Filter by status
- Sort options
- Pull-to-refresh
- Navigate to campaign details

### UI Components
- Search bar
- Filter chips/buttons
- Campaign list items
- Pull-to-refresh control
- Empty state
- Loading indicators

### Data Displayed Per Campaign
- Campaign name
- Client name
- Status badge
- Start/end dates
- Brief preview (if available)

### Navigation Flow
```
Campaigns List
└─→ Tap campaign → Campaign Detail (to be implemented)
```

### API Calls
- `campaigns.list` query
- Parameters: search, filters, pagination

### User Interactions
1. Pull to refresh list
2. Tap search to enter query
3. Select filters (status, date range)
4. Scroll through list
5. Tap campaign to view details

### Filtering Options
- Status: All, Active, Completed, Draft
- Date range: Custom range picker
- Client: Select from client list

### Search Behavior
- Real-time search (debounced)
- Searches: campaign name, client name
- Clear search button

### Edge Cases
- No campaigns → empty state with "Create Campaign" button
- Search no results → "No campaigns found" message
- API error → error message with retry button

### Code Example
```tsx
// app/(tabs)/campaigns.tsx
export default function CampaignsScreen() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  
  const { data, isLoading, refetch } = trpc.campaigns.list.useQuery({
    search,
    status: status !== 'all' ? status : undefined,
  });
  
  return (
    <View>
      <SearchBar value={search} onChangeText={setSearch} />
      <FilterChips selected={status} onSelect={setStatus} />
      <FlatList
        data={data?.campaigns}
        renderItem={({ item }) => (
          <CampaignCard
            campaign={item}
            onPress={() => router.push(`/campaigns/${item.id}`)}
          />
        )}
        refreshControl={<RefreshControl onRefresh={refetch} />}
        ListEmptyComponent={<EmptyState />}
      />
    </View>
  );
}
```

---

## 5. Approvals List Screen

**File:** `app/(tabs)/approvals.tsx`  
**Route:** `/approvals`  
**Type:** List view

### Purpose
Display all approvals and their status.

### Functionality
- List all approvals
- Filter by status (pending, approved, rejected)
- Sort by date
- Pull-to-refresh
- Navigate to approval details

### UI Components
- Filter tabs/chips
- Approval list items
- Status badges
- Pull-to-refresh control
- Empty state

### Data Displayed Per Approval
- Approval type
- Campaign name
- Requester name
- Status (pending/approved/rejected)
- Request date
- Approval/rejection date

### Navigation Flow
```
Approvals List
└─→ Tap approval → Approval Detail (to be implemented)
```

### API Calls
- `approvals.list` query
- `approvals.getPending` query (for current user)

### User Interactions
1. Pull to refresh list
2. Switch between filter tabs
3. Scroll through list
4. Tap approval to view/act on it

### Filtering Options
- All approvals
- Pending (awaiting action)
- Approved
- Rejected
- My approvals (where user is approver)

### Status Indicators
- Pending: Yellow/orange badge
- Approved: Green badge
- Rejected: Red badge
- Overridden: Purple badge

### Edge Cases
- No approvals → empty state
- No pending approvals → "All caught up!" message
- API error → error message with retry

### Code Example
```tsx
// app/(tabs)/approvals.tsx
export default function ApprovalsScreen() {
  const [filter, setFilter] = useState('pending');
  
  const { data, isLoading, refetch } = trpc.approvals.list.useQuery({
    status: filter !== 'all' ? filter : undefined,
  });
  
  return (
    <View>
      <FilterTabs
        tabs={['all', 'pending', 'approved', 'rejected']}
        selected={filter}
        onSelect={setFilter}
      />
      <FlatList
        data={data?.approvals}
        renderItem={({ item }) => (
          <ApprovalCard
            approval={item}
            onPress={() => router.push(`/approvals/${item.id}`)}
          />
        )}
        refreshControl={<RefreshControl onRefresh={refetch} />}
      />
    </View>
  );
}
```

---

## 6. Profile Screen

**File:** `app/(tabs)/profile.tsx`  
**Route:** `/profile`  
**Type:** User profile

### Purpose
Display user information and app settings.

### Functionality
- Show user information
- App settings
- Logout functionality
- Version information
- Support/help links

### UI Components
- User avatar
- User name and email
- Settings list
- Logout button
- Version text
- Section headers

### Data Displayed
- User name
- User email
- User role
- Profile picture (if available)
- App version

### Navigation Flow
```
Profile
├─→ Edit Profile → Edit Screen (if implemented)
├─→ Settings → Settings Screen (if implemented)
└─→ Logout → Login Screen
```

### API Calls
- `user.getCurrentUser` query
- `auth.logout` mutation

### User Interactions
1. View profile information
2. Tap "Edit Profile" to edit (if implemented)
3. Toggle settings
4. Tap "Logout" to sign out
5. Confirm logout in dialog

### Settings Options
- Notifications (on/off)
- Theme (light/dark/auto)
- Language preference
- Data sync preferences

### Logout Flow
1. User taps "Logout"
2. Confirmation dialog appears
3. User confirms
4. Token removed from storage
5. Redirect to login screen

### Edge Cases
- Network error on logout → still remove local token
- User data load error → show cached data if available

### Code Example
```tsx
// app/(tabs)/profile.tsx
export default function ProfileScreen() {
  const { user } = useAuth();
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };
  
  return (
    <ScrollView>
      <UserCard user={user} />
      <SettingsSection>
        <SettingRow title="Notifications" type="toggle" />
        <SettingRow title="Theme" type="select" />
      </SettingsSection>
      <Button title="Logout" onPress={handleLogout} />
      <Text>Version {APP_VERSION}</Text>
    </ScrollView>
  );
}
```

---

## 7. Tab Navigation Layout

**File:** `app/(tabs)/_layout.tsx`  
**Route:** N/A (layout component)  
**Type:** Navigation layout

### Purpose
Provide bottom tab navigation for main app sections.

### Functionality
- Bottom tab bar with 5 tabs
- Active tab indication
- Icons for each tab
- Tab labels
- Navigation between tabs

### Tab Configuration
1. **Home** - Dashboard screen
   - Icon: Home
   - Route: /(tabs)/index

2. **Campaigns** - Campaigns list
   - Icon: Briefcase
   - Route: /(tabs)/campaigns

3. **Clients** - Clients list (to be implemented)
   - Icon: Users
   - Route: /(tabs)/clients

4. **Approvals** - Approvals list
   - Icon: CheckCircle
   - Route: /(tabs)/approvals

5. **Profile** - User profile
   - Icon: User
   - Route: /(tabs)/profile

### UI Components
- Tab bar
- Tab icons
- Tab labels
- Active indicator

### Behavior
- Persists active tab on navigation
- Scrolls to top when tapping active tab
- Shows badge on approvals tab if pending items

### Code Example
```tsx
// app/(tabs)/_layout.tsx
export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="campaigns"
        options={{
          title: 'Campaigns',
          tabBarIcon: ({ color }) => <BriefcaseIcon color={color} />,
        }}
      />
      {/* Additional tabs */}
    </Tabs>
  );
}
```

---

## 8. Root Layout

**File:** `app/_layout.tsx`  
**Route:** N/A (root layout)  
**Type:** App layout

### Purpose
Wrap entire app with providers and global configuration.

### Functionality
- React Query provider
- tRPC client provider
- Auth context provider
- Font loading
- Theme provider
- Global error boundary

### Providers Used
- QueryClientProvider (React Query)
- TRPCProvider (tRPC client)
- AuthProvider (authentication context)
- ThemeProvider (app theme)

### Global Configuration
- API base URL
- Query client settings
- Default query options
- Error handling
- Token management

### Error Boundary
- Catches unhandled errors
- Displays error screen
- Allows app restart
- Logs errors for debugging

### Code Example
```tsx
// app/_layout.tsx
export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => createTRPCClient());
  
  return (
    <TRPCProvider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <ErrorBoundary>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              </Stack>
            </ErrorBoundary>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </TRPCProvider>
  );
}
```

---

## Screen Documentation Template

For new screens, use this template:

```markdown
## [Screen Number]. [Screen Name]

**File:** `path/to/screen.tsx`  
**Route:** `/route`  
**Type:** [List view | Detail view | Form | etc.]

### Purpose
[What is this screen for?]

### Functionality
- [Feature 1]
- [Feature 2]
- [etc.]

### UI Components
- [Component 1]
- [Component 2]
- [etc.]

### Data Displayed
- [Data point 1]
- [Data point 2]
- [etc.]

### Navigation Flow
```
[Screen Name]
├─→ [Action 1] → [Destination 1]
└─→ [Action 2] → [Destination 2]
```

### API Calls
- `endpoint.method` - Description

### User Interactions
1. [Interaction 1]
2. [Interaction 2]
3. [etc.]

### Edge Cases
- [Case 1] → [Handling]
- [Case 2] → [Handling]

### Code Example
```tsx
// Code sample
```
```

---

**Last Updated:** February 8, 2026  
**Status:** 8 screens documented, ready for additional screens
