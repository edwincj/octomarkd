import RouteContainer from "@/layout/RouteContainer";
import { ThemeProvider } from "@/context/ThemeProvider";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "@/context/AuthProvider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <RouteContainer />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
