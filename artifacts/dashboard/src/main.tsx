import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initPaddle } from "./lib/paddle";

initPaddle();

createRoot(document.getElementById("root")!).render(<App />);
