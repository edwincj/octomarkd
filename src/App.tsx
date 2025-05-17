import RouteContainer from "@/routes/routeContainer";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouteContainer />
    </ThemeProvider>
  );
}

export default App;
