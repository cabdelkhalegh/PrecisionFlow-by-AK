# Mobile App Navigation Documentation

Complete navigation architecture for the PrecisionFlow mobile application.

## Navigation Framework

**Library:** expo-router (file-based routing)  
**Version:** Latest (with Expo SDK)  
**Pattern:** File-system based routing

## Navigation Structure

### Current Structure

```
app/
├── index.tsx                    # Splash/Welcome screen
├── _layout.tsx                  # Root layout with providers
├── (auth)/
│   ├── _layout.tsx             # Auth layout
│   └── login.tsx               # Login screen
└── (tabs)/
    ├── _layout.tsx             # Tab navigator layout
    ├── index.tsx               # Home/Dashboard tab
    ├── campaigns.tsx           # Campaigns tab
    ├── approvals.tsx           # Approvals tab
    └── profile.tsx             # Profile tab
```

### Planned Expansion

```
app/
├── index.tsx
├── _layout.tsx
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── forgot-password.tsx     # NEW: Password reset
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── campaigns.tsx
│   ├── clients.tsx             # NEW: Clients tab
│   ├── approvals.tsx
│   └── profile.tsx
└── (screens)/                  # NEW: Detail screens
    ├── campaigns/
    │   ├── [id].tsx           # Campaign detail
    │   ├── new.tsx            # Create campaign
    │   └── [id]/
    │       └── edit.tsx       # Edit campaign
    ├── clients/
    │   ├── [id].tsx           # Client detail
    │   ├── new.tsx            # Create client
    │   └── [id]/
    │       └── edit.tsx       # Edit client
    └── approvals/
        └── [id].tsx           # Approval detail
```

## Navigation Patterns

### 1. Tab Navigation

**Location:** `app/(tabs)/_layout.tsx`  
**Type:** Bottom tabs

**Tabs:**
1. **Home** - `(tabs)/index.tsx`
   - Icon: Home
   - Badge: None
   
2. **Campaigns** - `(tabs)/campaigns.tsx`
   - Icon: Briefcase
   - Badge: Active campaigns count
   
3. **Clients** - `(tabs)/clients.tsx` (planned)
   - Icon: Users
   - Badge: None
   
4. **Approvals** - `(tabs)/approvals.tsx`
   - Icon: CheckCircle
   - Badge: Pending approvals count
   
5. **Profile** - `(tabs)/profile.tsx`
   - Icon: User
   - Badge: None

**Configuration:**
```tsx
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
      tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
    }}
  />
  {/* Other tabs */}
</Tabs>
```

### 2. Stack Navigation

**Type:** Modal/push navigation for detail screens

**Pattern:**
```
List Screen (Tab)
└─→ Detail Screen (Modal/Stack)
    └─→ Edit Screen (Modal/Stack)
```

**Example Flow:**
```
Campaigns Tab
└─→ Campaign Detail
    ├─→ Edit Campaign
    └─→ View Brief
```

**Implementation:**
```tsx
// Navigate to detail
router.push(`/campaigns/${id}`);

// Navigate to edit
router.push(`/campaigns/${id}/edit`);

// Go back
router.back();
```

### 3. Modal Presentation

For forms and temporary screens:

```tsx
// Present as modal
router.push({
  pathname: '/campaigns/new',
  params: { presentation: 'modal' },
});
```

## Navigation API

### Router Methods

```tsx
import { router } from 'expo-router';

// Navigate forward (push)
router.push('/campaigns/123');

// Navigate and replace current
router.replace('/login');

// Go back
router.back();

// Navigate to root
router.dismiss();
router.dismissAll();
```

### useRouter Hook

```tsx
import { useRouter } from 'expo-router';

function MyComponent() {
  const router = useRouter();
  
  return (
    <Button onPress={() => router.push('/campaigns')}>
      View Campaigns
    </Button>
  );
}
```

### usePathname Hook

```tsx
import { usePathname } from 'expo-router';

function MyComponent() {
  const pathname = usePathname();
  // pathname = '/campaigns' or '/campaigns/123'
  
  return <Text>Current: {pathname}</Text>;
}
```

## Deep Linking

### Configuration

```json
// app.json
{
  "expo": {
    "scheme": "precisionflow",
    "ios": {
      "bundleIdentifier": "com.precisionflow.app"
    },
    "android": {
      "package": "com.precisionflow.app"
    }
  }
}
```

### Deep Link URLs

```
precisionflow://                          # App root
precisionflow://campaigns                # Campaigns tab
precisionflow://campaigns/123            # Campaign detail
precisionflow://approvals/456            # Approval detail
precisionflow://login                    # Login screen
```

### Handling Deep Links

```tsx
// Automatic with expo-router
// File: app/(screens)/campaigns/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function CampaignDetail() {
  const { id } = useLocalSearchParams();
  // id = '123' from URL: precisionflow://campaigns/123
  
  return <CampaignDetailView id={id} />;
}
```

## Navigation Guards

### Authentication Guard

```tsx
// app/_layout.tsx
export default function RootLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to tabs if authenticated
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  return <Stack />;
}
```

### Permission Guard

```tsx
// Check permissions before navigating
const handleEdit = () => {
  if (!hasEditPermission) {
    Alert.alert('Access Denied', 'You do not have permission to edit');
    return;
  }
  router.push(`/campaigns/${id}/edit`);
};
```

## Screen Transitions

### Default Transitions

- Tab navigation: Instant
- Stack navigation: Slide from right (iOS) / Fade (Android)
- Modal: Slide from bottom

### Custom Transitions

```tsx
<Stack.Screen
  name="campaigns/[id]"
  options={{
    presentation: 'modal',
    animation: 'slide_from_bottom',
  }}
/>
```

## Navigation State

### Persisting Navigation State

```tsx
// Automatic with expo-router
// Navigation state persists across app restarts
```

### Reset Navigation

```tsx
// Reset to root
router.dismissAll();
router.replace('/(tabs)');

// Reset to specific screen
router.replace('/campaigns');
```

## Best Practices

### 1. Use Typed Routes

```tsx
// Define route types
type Routes = {
  campaigns: undefined;
  'campaigns/[id]': { id: string };
  'campaigns/new': undefined;
};

// Use with router
router.push<Routes>('/campaigns/123');
```

### 2. Handle Back Navigation

```tsx
// Always handle back button
const handleBack = () => {
  if (hasUnsavedChanges) {
    Alert.alert(
      'Unsaved Changes',
      'Discard changes?',
      [
        { text: 'Cancel' },
        { text: 'Discard', onPress: () => router.back() },
      ]
    );
  } else {
    router.back();
  }
};
```

### 3. Loading States

```tsx
// Show loading during navigation
const [isNavigating, setIsNavigating] = useState(false);

const handleNavigate = async () => {
  setIsNavigating(true);
  await prefetchData();
  router.push('/destination');
  setIsNavigating(false);
};
```

### 4. Error Handling

```tsx
// Handle navigation errors
try {
  router.push('/campaigns/123');
} catch (error) {
  console.error('Navigation failed:', error);
  Alert.alert('Error', 'Could not navigate to campaign');
}
```

## Common Navigation Flows

### 1. View Item from List

```tsx
// From: Campaigns List
// To: Campaign Detail

<TouchableOpacity onPress={() => router.push(`/campaigns/${campaign.id}`)}>
  <CampaignCard campaign={campaign} />
</TouchableOpacity>
```

### 2. Create New Item

```tsx
// From: Campaigns List
// To: Create Campaign

<Button onPress={() => router.push('/campaigns/new')}>
  New Campaign
</Button>
```

### 3. Edit Item

```tsx
// From: Campaign Detail
// To: Edit Campaign

<Button onPress={() => router.push(`/campaigns/${id}/edit`)}>
  Edit
</Button>
```

### 4. Submit Form and Navigate

```tsx
// From: Create Campaign
// To: Campaign Detail (new)

const handleSubmit = async () => {
  const newCampaign = await createCampaign(formData);
  router.replace(`/campaigns/${newCampaign.id}`);
};
```

### 5. Logout Flow

```tsx
// From: Any screen
// To: Login

const handleLogout = async () => {
  await logout();
  router.replace('/(auth)/login');
};
```

## Navigation Debugging

### Enable Logging

```tsx
// Add to _layout.tsx for development
import { useNavigationContainerRef } from 'expo-router';

export default function RootLayout() {
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (__DEV__) {
      navigationRef.addListener('state', (e) => {
        console.log('Navigation state:', e.data.state);
      });
    }
  }, []);

  return <Stack />;
}
```

### View Current Route

```tsx
import { usePathname, useSegments } from 'expo-router';

function DebugNav() {
  const pathname = usePathname();
  const segments = useSegments();
  
  console.log('Current path:', pathname);
  console.log('Segments:', segments);
}
```

---

**Last Updated:** February 8, 2026  
**Status:** Current navigation documented, expansions planned
