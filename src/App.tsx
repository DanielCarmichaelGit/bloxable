import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { store } from "@/store";
import Layout from "@/components/Layout";
import AgentLayout from "@/components/AgentLayout";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Marketplace from "@/pages/Marketplace";
import Workflow from "@/pages/Workflow";
import SellerDashboard from "@/pages/SellerDashboard";
import SellerInfo from "@/pages/SellerInfo";
import SellerAuth from "@/pages/SellerAuth";
import SellerDashboardNew from "@/pages/SellerDashboardNew";
import SellerProtectedRoute from "@/components/auth/SellerProtectedRoute";
import AgentBuilder from "@/pages/AgentBuilder";
import Settings from "@/pages/Settings";

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="system" storageKey="bloxable-ui-theme">
        <AuthProvider>
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
                <Route
                  path="/dashboard"
                  element={
                    <Layout>
                      <Dashboard />
                    </Layout>
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
                <Route path="/seller/auth" element={<SellerAuth />} />
                <Route
                  path="/seller/dashboard"
                  element={
                    <SellerProtectedRoute>
                      <Layout>
                        <SellerDashboardNew />
                      </Layout>
                    </SellerProtectedRoute>
                  }
                />
                <Route
                  path="/seller/workflows"
                  element={
                    <SellerProtectedRoute>
                      <Layout>
                        <SellerDashboard />
                      </Layout>
                    </SellerProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <Layout>
                      <Settings />
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
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
