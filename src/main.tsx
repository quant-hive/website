import { createRoot } from "react-dom/client";
import App from "./App";
import { watchPerformance } from "./lib/perf";
import { startSmoothScroll } from "./lib/smoothScroll";
import { loadWebFonts } from "./lib/webFonts";
import "./styles/tokens.css";
import "./styles/fonts.css";
import "./styles/glass.css";
import "./styles/liquid-glass.css";
import "./styles/global.css";

watchPerformance();
loadWebFonts();

const container = document.getElementById("root")!;
createRoot(container).render(<App />);
startSmoothScroll();
