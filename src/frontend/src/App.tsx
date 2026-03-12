import { Toaster } from "@/components/ui/sonner";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRootRoute, createRoute } from "@tanstack/react-router";
import Layout from "./components/layout/Layout";
import UploadManager from "./components/upload/UploadManager";
import { AuthProvider } from "./context/AuthContext";
import { UploadProvider } from "./context/UploadContext";
import AuthPage from "./pages/AuthPage";
import ChannelPage from "./pages/ChannelPage";
import ExplorePage from "./pages/ExplorePage";
import HomePage from "./pages/HomePage";
import LibraryPage from "./pages/LibraryPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import UploadPage from "./pages/UploadPage";
import VideoPage from "./pages/VideoPage";

const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <UploadProvider>
        <Layout />
        <UploadManager />
        <Toaster />
      </UploadProvider>
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
