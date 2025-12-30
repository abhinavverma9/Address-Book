import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './store'
import './index.css'
import App from './App.jsx'

const GOOGLE_CLIENT_ID = "430685311388-6647dc5g05iofgs1iot0lo48u0tq7gju.apps.googleusercontent.com"; // TODO: Replace with your actual Google Client ID

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <App />
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
