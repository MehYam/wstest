import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import World from './World.tsx'
import './index.css'

createRoot(document.getElementById('root')!)
  .render(<StrictMode><World /></StrictMode>);
