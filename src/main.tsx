import { createRoot } from 'react-dom/client'
import App from './app/App'

const htmlElement = document.getElementById('root')

if (htmlElement !== null){   
    createRoot(htmlElement).render(
        <App />
    )
}