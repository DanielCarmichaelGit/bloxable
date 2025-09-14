import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { store } from "@/store";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Marketplace from "@/pages/Marketplace";
import Workflow from "@/pages/Workflow";
import SellerDashboard from "@/pages/SellerDashboard";
import AgentBuilder from "@/pages/AgentBuilder";

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="system" storageKey="bloxable-ui-theme">
        <AuthProvider>
          <ChatProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/workflow/:id" element={<Workflow />} />
                  <Route path="/seller" element={<SellerDashboard />} />
                  <Route path="/agent/:sessionId?" element={<AgentBuilder />} />
                </Routes>
              </Layout>
            </Router>
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
