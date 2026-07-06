import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { GoogleMapsProvider } from "./context/GoogleMapsContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <GoogleMapsProvider>
          <QueryClientProvider client={queryClient}>
            <App />
            <Toaster richColors position="top-right" />
          </QueryClientProvider>
        </GoogleMapsProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);