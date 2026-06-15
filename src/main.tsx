import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './design/globals.css'
import { injectCssVars } from './design/buildCssVars'
import App from './App.tsx'

// Inject all design tokens as :root CSS custom properties before first paint.
injectCssVars()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
