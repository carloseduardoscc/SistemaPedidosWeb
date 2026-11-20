import { ReactNode } from "react"
import { useAuth } from "../contexts/AuthContext"
import { UsuarioDTO } from "../types/UsuarioDTO"

type Role = 'CLIENTE' | 'LOJISTA' | 'ENTREGADOR' | 'ADMIN' | 'ANONYMOUS' | 'AUTHENTICATED'
export default function ProtectedComponent({ children, allowed = ['AUTHENTICATED'] }: { children: ReactNode, allowed?: Role[] }) {
    let { userData }: { userData: UsuarioDTO | null } = useAuth()
    const actualRole = userData?.role ? userData.role : 'ANONYMOUS'
    const isAuthenticated: boolean = actualRole !== 'ANONYMOUS'
    if (allowed.includes(actualRole) || (isAuthenticated && allowed.includes('AUTHENTICATED'))) {
        return children
    } else {
        return
    }
}