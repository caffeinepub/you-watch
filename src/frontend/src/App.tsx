import { Toaster } from "@/components/ui/sonner";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRootRoute, createRoute } from "@tanstack/react-router";
import Layout from "./components/layout/Layout";
import UploadManager from "./components/upload/UploadManager";
import { AuthProvider } from "./context/AuthContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { UploadProvider } from "./context/UploadContext";
import AIAssistantPage from "./pages/AIAssistantPage";
import AuthPage from "./pages/AuthPage";
import ChannelPage from "./pages/ChannelPage";
import CreatorDashboardPage from "./pages/CreatorDashboardPage";
import DraftsPage from "./pages/DraftsPage";
import ExplorePage from "./pages/ExplorePage";
import HistoryPage from "./pages/HistoryPage";
import HomePage from "./pages/HomePage";
import LibraryPage from "./pages/LibraryPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import SettingsPage from "./pages/SettingsPage";
import StoragePage from "./pages/StoragePage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import UploadPage from "./pages/UploadPage";
import VideoPage from "./pages/VideoPage";

const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <NotificationsProvider>
        <UploadProvider>
          <Layout />
          <UploadManager />
          <Toaster />
        </UploadProvider>
      </NotificationsProvider>
    </AuthProvider>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/explore",
  component: ExplorePage,
});
const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/upload",
  component: UploadPage,
});
const subscriptionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subscriptions",
  component: SubscriptionsPage,
});
const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/library",
  component: LibraryPage,
});
const videoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/video/$id",
  component: VideoPage,
});
const channelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/channel/$userId",
  component: ChannelPage,
});
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});
const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  component: SearchPage,
});
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});
const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: HistoryPage,
});
const storageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/storage",
  component: StoragePage,
});
const draftsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/drafts",
  component: DraftsPage,
});
const creatorDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/creator-dashboard",
  component: CreatorDashboardPage,
});
const aiAssistantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai-assistant",
  component: AIAssistantPage,
});
const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notifications",
  component: NotificationsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  exploreRoute,
  uploadRoute,
  subscriptionsRoute,
  libraryRoute,
  videoRoute,
  channelRoute,
  profileRoute,
  searchRoute,
  authRoute,
  settingsRoute,
  historyRoute,
  storageRoute,
  draftsRoute,
  creatorDashboardRoute,
  aiAssistantRoute,
  notificationsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
