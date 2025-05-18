import RouteContainer from "@/layout/RouteContainer"
import { ThemeProvider } from "@/context/ThemeProvider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouteContainer />
    </ThemeProvider>
  );
}

export default App;