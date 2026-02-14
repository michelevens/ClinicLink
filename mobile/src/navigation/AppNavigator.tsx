import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../theme'
import type { UserRole } from '../types'

// Shared screens
import { DashboardScreen } from '../screens/dashboard/DashboardScreen'
import { MoreMenuScreen } from '../screens/shared/MoreMenuScreen'
import { SettingsScreen } from '../screens/shared/SettingsScreen'
import { ProfileEditScreen } from '../screens/shared/ProfileEditScreen'
import { NotificationPrefsScreen } from '../screens/shared/NotificationPrefsScreen'
import { MfaSettingsScreen } from '../screens/shared/MfaSettingsScreen'

// Student screens
import { RotationSearchScreen } from '../screens/student/RotationSearchScreen'
import { SlotDetailScreen } from '../screens/student/SlotDetailScreen'
import { ApplicationsScreen } from '../screens/student/ApplicationsScreen'
import { HourLogScreen } from '../screens/student/HourLogScreen'
import { HourLogEntryScreen } from '../screens/student/HourLogEntryScreen'
import { EvaluationsScreen } from '../screens/student/EvaluationsScreen'
import { CertificatesScreen } from '../screens/student/CertificatesScreen'
import { BookmarksScreen } from '../screens/student/BookmarksScreen'
import { SavedSearchesScreen } from '../screens/student/SavedSearchesScreen'
import { StudentProfileScreen } from '../screens/student/StudentProfileScreen'

// Messaging screens
import { ConversationsScreen } from '../screens/messaging/ConversationsScreen'
import { MessageThreadScreen } from '../screens/messaging/MessageThreadScreen'
import { NewConversationScreen } from '../screens/messaging/NewConversationScreen'

// Preceptor screens
import { MyStudentsScreen } from '../screens/preceptor/MyStudentsScreen'
import { StudentDetailScreen } from '../screens/preceptor/StudentDetailScreen'
import { HourReviewScreen } from '../screens/preceptor/HourReviewScreen'
import { CreateEvaluationScreen } from '../screens/preceptor/CreateEvaluationScreen'
import { PreceptorProfileScreen } from '../screens/preceptor/PreceptorProfileScreen'

// Site manager screens
import { MySiteScreen } from '../screens/site/MySiteScreen'
import { SlotManagementScreen } from '../screens/site/SlotManagementScreen'
import { SlotFormScreen } from '../screens/site/SlotFormScreen'
import { SiteApplicationsScreen } from '../screens/site/SiteApplicationsScreen'
import { SitePreceptorsScreen } from '../screens/site/SitePreceptorsScreen'
import { ComplianceScreen } from '../screens/site/ComplianceScreen'

// University screens
import { ProgramsScreen } from '../screens/university/ProgramsScreen'
import { PlacementsScreen } from '../screens/university/PlacementsScreen'
import { AgreementsScreen } from '../screens/university/AgreementsScreen'
import { AnalyticsScreen } from '../screens/university/AnalyticsScreen'

// Admin screens
import { AdminUsersScreen } from '../screens/admin/AdminUsersScreen'
import { UserDetailScreen } from '../screens/admin/UserDetailScreen'
import { SitesDirectoryScreen } from '../screens/admin/SitesDirectoryScreen'
import { SiteDetailScreen } from '../screens/admin/SiteDetailScreen'
import { UniversitiesScreen } from '../screens/admin/UniversitiesScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

const noHeader = { headerShown: false } as const

// ─── Stack navigators for each tab ────────────────────────────────

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="SlotDetail" component={SlotDetailScreen} />
    </Stack.Navigator>
  )
}

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="RotationSearch" component={RotationSearchScreen} />
      <Stack.Screen name="SlotDetail" component={SlotDetailScreen} />
    </Stack.Navigator>
  )
}

function HoursStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="HourLog" component={HourLogScreen} />
      <Stack.Screen name="HourLogEntry" component={HourLogEntryScreen} />
    </Stack.Navigator>
  )
}

function StudentsStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="MyStudents" component={MyStudentsScreen} />
      <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
      <Stack.Screen name="CreateEvaluation" component={CreateEvaluationScreen} />
      <Stack.Screen name="HourReview" component={HourReviewScreen} />
    </Stack.Navigator>
  )
}

function MessagesStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="Conversations" component={ConversationsScreen} />
      <Stack.Screen name="MessageThread" component={MessageThreadScreen} />
      <Stack.Screen name="NewConversation" component={NewConversationScreen} />
    </Stack.Navigator>
  )
}

function SiteStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="MySite" component={MySiteScreen} />
      <Stack.Screen name="SlotManagement" component={SlotManagementScreen} />
      <Stack.Screen name="SlotCreate" component={SlotFormScreen} />
      <Stack.Screen name="SlotEdit" component={SlotFormScreen} />
      <Stack.Screen name="SiteApplications" component={SiteApplicationsScreen} />
      <Stack.Screen name="SitePreceptors" component={SitePreceptorsScreen} />
      <Stack.Screen name="Compliance" component={ComplianceScreen} />
    </Stack.Navigator>
  )
}

function SlotsStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="SlotManagement" component={SlotManagementScreen} />
      <Stack.Screen name="SlotCreate" component={SlotFormScreen} />
      <Stack.Screen name="SlotEdit" component={SlotFormScreen} />
    </Stack.Navigator>
  )
}

function ProgramsStackNav() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="Programs" component={ProgramsScreen} />
    </Stack.Navigator>
  )
}

function PlacementsStackNav() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="Placements" component={PlacementsScreen} />
    </Stack.Navigator>
  )
}

function UsersStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="UserDetail" component={UserDetailScreen} />
    </Stack.Navigator>
  )
}

function SitesStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="SitesDirectory" component={SitesDirectoryScreen} />
      <Stack.Screen name="SiteDetail" component={SiteDetailScreen} />
    </Stack.Navigator>
  )
}

function MoreStackNav() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="MoreMenu" component={MoreMenuScreen} />
      {/* Shared */}
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="NotificationPrefs" component={NotificationPrefsScreen} />
      <Stack.Screen name="MfaSettings" component={MfaSettingsScreen} />
      {/* Student */}
      <Stack.Screen name="Applications" component={ApplicationsScreen} />
      <Stack.Screen name="Evaluations" component={EvaluationsScreen} />
      <Stack.Screen name="Certificates" component={CertificatesScreen} />
      <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
      <Stack.Screen name="SavedSearches" component={SavedSearchesScreen} />
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
      <Stack.Screen name="SlotDetail" component={SlotDetailScreen} />
      <Stack.Screen name="HourLogEntry" component={HourLogEntryScreen} />
      {/* Preceptor */}
      <Stack.Screen name="MyStudents" component={MyStudentsScreen} />
      <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
      <Stack.Screen name="HourReview" component={HourReviewScreen} />
      <Stack.Screen name="CreateEvaluation" component={CreateEvaluationScreen} />
      <Stack.Screen name="PreceptorProfile" component={PreceptorProfileScreen} />
      {/* Site Manager */}
      <Stack.Screen name="MySite" component={MySiteScreen} />
      <Stack.Screen name="SlotManagement" component={SlotManagementScreen} />
      <Stack.Screen name="SlotCreate" component={SlotFormScreen} />
      <Stack.Screen name="SlotEdit" component={SlotFormScreen} />
      <Stack.Screen name="SiteApplications" component={SiteApplicationsScreen} />
      <Stack.Screen name="SitePreceptors" component={SitePreceptorsScreen} />
      <Stack.Screen name="Compliance" component={ComplianceScreen} />
      {/* University */}
      <Stack.Screen name="Programs" component={ProgramsScreen} />
      <Stack.Screen name="Placements" component={PlacementsScreen} />
      <Stack.Screen name="Agreements" component={AgreementsScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      {/* Admin */}
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="UserDetail" component={UserDetailScreen} />
      <Stack.Screen name="SitesDirectory" component={SitesDirectoryScreen} />
      <Stack.Screen name="SiteDetail" component={SiteDetailScreen} />
      <Stack.Screen name="Universities" component={UniversitiesScreen} />
    </Stack.Navigator>
  )
}

// ─── Tab icon mapping ─────────────────────────────────────────────

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

interface TabConfig {
  name: string
  component: () => React.JSX.Element
  icon: IoniconsName
  iconFocused: IoniconsName
  label: string
}

const TAB_CONFIGS: Record<UserRole, TabConfig[]> = {
  student: [
    { name: 'Home', component: HomeStack, icon: 'home-outline', iconFocused: 'home', label: 'Home' },
    { name: 'Search', component: SearchStack, icon: 'search-outline', iconFocused: 'search', label: 'Search' },
    { name: 'Hours', component: HoursStack, icon: 'time-outline', iconFocused: 'time', label: 'Hours' },
    { name: 'Messages', component: MessagesStack, icon: 'chatbubble-outline', iconFocused: 'chatbubble', label: 'Messages' },
    { name: 'More', component: MoreStackNav, icon: 'ellipsis-horizontal-outline', iconFocused: 'ellipsis-horizontal', label: 'More' },
  ],
  preceptor: [
    { name: 'Home', component: HomeStack, icon: 'home-outline', iconFocused: 'home', label: 'Home' },
    { name: 'Students', component: StudentsStack, icon: 'people-outline', iconFocused: 'people', label: 'Students' },
    { name: 'Hours', component: HoursStack, icon: 'time-outline', iconFocused: 'time', label: 'Hours' },
    { name: 'Messages', component: MessagesStack, icon: 'chatbubble-outline', iconFocused: 'chatbubble', label: 'Messages' },
    { name: 'More', component: MoreStackNav, icon: 'ellipsis-horizontal-outline', iconFocused: 'ellipsis-horizontal', label: 'More' },
  ],
  site_manager: [
    { name: 'Home', component: HomeStack, icon: 'home-outline', iconFocused: 'home', label: 'Home' },
    { name: 'Site', component: SiteStack, icon: 'business-outline', iconFocused: 'business', label: 'Site' },
    { name: 'Slots', component: SlotsStack, icon: 'calendar-outline', iconFocused: 'calendar', label: 'Slots' },
    { name: 'Messages', component: MessagesStack, icon: 'chatbubble-outline', iconFocused: 'chatbubble', label: 'Messages' },
    { name: 'More', component: MoreStackNav, icon: 'ellipsis-horizontal-outline', iconFocused: 'ellipsis-horizontal', label: 'More' },
  ],
  coordinator: [
    { name: 'Home', component: HomeStack, icon: 'home-outline', iconFocused: 'home', label: 'Home' },
    { name: 'Students', component: StudentsStack, icon: 'people-outline', iconFocused: 'people', label: 'Students' },
    { name: 'Programs', component: ProgramsStackNav, icon: 'school-outline', iconFocused: 'school', label: 'Programs' },
    { name: 'Messages', component: MessagesStack, icon: 'chatbubble-outline', iconFocused: 'chatbubble', label: 'Messages' },
    { name: 'More', component: MoreStackNav, icon: 'ellipsis-horizontal-outline', iconFocused: 'ellipsis-horizontal', label: 'More' },
  ],
  professor: [
    { name: 'Home', component: HomeStack, icon: 'home-outline', iconFocused: 'home', label: 'Home' },
    { name: 'Students', component: StudentsStack, icon: 'people-outline', iconFocused: 'people', label: 'Students' },
    { name: 'Placements', component: PlacementsStackNav, icon: 'briefcase-outline', iconFocused: 'briefcase', label: 'Placements' },
    { name: 'Messages', component: MessagesStack, icon: 'chatbubble-outline', iconFocused: 'chatbubble', label: 'Messages' },
    { name: 'More', component: MoreStackNav, icon: 'ellipsis-horizontal-outline', iconFocused: 'ellipsis-horizontal', label: 'More' },
  ],
  admin: [
    { name: 'Home', component: HomeStack, icon: 'home-outline', iconFocused: 'home', label: 'Home' },
    { name: 'Users', component: UsersStack, icon: 'person-outline', iconFocused: 'person', label: 'Users' },
    { name: 'Sites', component: SitesStack, icon: 'business-outline', iconFocused: 'business', label: 'Sites' },
    { name: 'Messages', component: MessagesStack, icon: 'chatbubble-outline', iconFocused: 'chatbubble', label: 'Messages' },
    { name: 'More', component: MoreStackNav, icon: 'ellipsis-horizontal-outline', iconFocused: 'ellipsis-horizontal', label: 'More' },
  ],
}

export function AppNavigator() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const role = (user?.role ?? 'student') as UserRole
  const tabs = TAB_CONFIGS[role]

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.tabBarBorder,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={22}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  )
}
