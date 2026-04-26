import { StrictMode } from 'react' // Ayuda a detectar errores en desarrollo
import { createRoot } from 'react-dom/client' // Crea el punto donde React va a vivir en el HTML

import './index.css' // Importa los estilos globales
import App from './App.jsx' // Importa el componente principal

createRoot(document.getElementById('root')).render( // Busca el elemento con id="root" en index.html
  <StrictMode>
    <App /> 
  </StrictMode>,
) // Dibuja el componente App dentro de root

