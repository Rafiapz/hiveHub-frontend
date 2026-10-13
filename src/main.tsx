import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { store } from "./store/store.tsx";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <React.StrictMode>
      <Provider store={store}>
        <GoogleOAuthProvider clientId="855944358734-cqop8tmu2emlmhsu03ue61ubgbb6olkg.apps.googleusercontent.com">
          <App />
        </GoogleOAuthProvider>
      </Provider>
    </React.StrictMode>
  </BrowserRouter>
);
