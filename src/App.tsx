import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AccountProvider } from "@/contexts/AccountProvider";
import { ChatProvider } from "@/contexts/ChatContext";
import { store } from "@/store";
import Layout from "@/components/Layout";
import AgentLayout from "@/components/AgentLayout";
import Home from "@/pages/Home";
import UnifiedDashboard from "@/pages/UnifiedDashboard";
import Marketplace from "@/pages/Marketplace";
import Workflow from "@/pages/Workflow";
import SellerDashboard from "@/pages/SellerDashboard";
import SellerInfo from "@/pages/SellerInfo";
import Auth from "@/pages/Auth";
import SellerDashboardNew from "@/pages/SellerDashboardNew";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AgentBuilder from "@/pages/AgentBuilder";
import UnifiedSettings from "@/pages/UnifiedSettings";
import AuthCallback from "@/pages/AuthCallback";
import AuthTest from "@/pages/AuthTest";
import MarketplaceListingWizard from "@/pages/MarketplaceListingWizard";
import MarketplaceItemEdit from "@/pages/MarketplaceItemEdit";
import MarketplaceItemConfig from "@/pages/MarketplaceItemConfigRefactored";
import Privacy from "@/pages/Privacy";
import TermsAndConditions from "@/pages/TermsAndConditions";

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="system" storageKey="bloxable-ui-theme">
        <AuthProvider>
          <AccountProvider>
            <ChatProvider>
              <Router>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <Layout>
                        <Home />
                      </Layout>
                    }
                  />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/auth/test" element={<AuthTest />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <UnifiedDashboard />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/marketplace"
                    element={
                      <Layout>
                        <Marketplace />
                      </Layout>
                    }
                  />
                  <Route
                    path="/workflow/:id"
                    element={
                      <Layout>
                        <Workflow />
                      </Layout>
                    }
                  />
                  <Route
                    path="/seller"
                    element={
                      <Layout>
                        <SellerInfo />
                      </Layout>
                    }
                  />
                  <Route path="/seller/auth" element={<Auth />} />
                  <Route
                    path="/seller/dashboard"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <SellerDashboardNew />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/workflows"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <SellerDashboard />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/create-listing"
                    element={
                      <ProtectedRoute>
                        <MarketplaceListingWizard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/edit-listing/:id"
                    element={
                      <ProtectedRoute>
                        <MarketplaceItemEdit />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/config-listing/:id"
                    element={
                      <ProtectedRoute>
                        <MarketplaceItemConfig />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <Layout>
                        <UnifiedSettings />
                      </Layout>
                    }
                  />
                  <Route
                    path="/privacy"
                    element={
                      <Layout>
                        <Privacy />
                      </Layout>
                    }
                  />
                  <Route
                    path="/terms-and-conditions"
                    element={
                      <Layout>
                        <TermsAndConditions />
                      </Layout>
                    }
                  />
                  {import.meta.env.VITE_SHOW_AI_FEATURES === "true" && (
                    <Route
                      path="/agent/:sessionId?"
                      element={
                        <AgentLayout>
                          <AgentBuilder />
                        </AgentLayout>
                      }
                    />
                  )}
                </Routes>
              </Router>
            </ChatProvider>
          </AccountProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
