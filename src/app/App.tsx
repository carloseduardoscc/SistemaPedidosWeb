import { useEffect, useState } from 'react'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import Home from '../pages/Home'
import Produtos from '../pages/Produtos'
import Header from '../components/Header'


import Router from './Router'
import { ErrorBoundary } from './ErrorBoundary'
import InfoLayer from './InfoLayer'
import { AuthProvider, useAuth } from '../contexts/AuthContext'

const componentes = {
  home: Home,
  produtos: Produtos
}

function ConteudoApp() {
  return (
    <div>
      <Header abas={Object.keys(componentes)} />
      <Router />
    </div>
  )
}
export default function App() {
  return (
    <InfoLayer>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <ConteudoApp />
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </InfoLayer>
  )
}