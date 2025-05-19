import RouteContainer from "@/layout/RouteContainer";
import { ThemeProvider } from "@/context/ThemeProvider";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "@/context/AuthProvider";
import { BookMarkProvider } from "./context/BookMarkProvider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <BookMarkProvider>
            <RouteContainer />
          </BookMarkProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
