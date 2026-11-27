// @ts-ignore
import './css/header.css'
import ProtectedComponent from '../app/ProtectedComponent'
import { useEffect, useState } from 'react'
import { apiLogout, isUsuarioLogado } from '../service/authService'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import LoadingSpinner from '../components/LoadingSpinner'
import {
    faMotorcycle,
    faStore,
    faUser,
    faUserShield,
} from '@fortawesome/free-solid-svg-icons'
import { apiMe } from '../service/usuarioService'

const roleDetails = {
    CLIENTE: { label: 'Cliente', icon: faUser },
    LOJISTA: { label: 'Lojista', icon: faStore },
    ENTREGADOR: { label: 'Entregador', icon: faMotorcycle },
    ADMIN: { label: 'Administrador', icon: faUserShield },
}

function ItemHeader({ nome, path }: { nome: string, path: string }) {
    const navigate = useNavigate()
    return (
        <li>
            <button onClick={() => navigate(path)}>
                {nome.charAt(0).toUpperCase() + nome.slice(1)}
            </button>
        </li>
    )
}

export default function Header({ abas }: { abas: Array<string> }) {
    const [actionedLogoff, setActionedLogout] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const navigate = useNavigate()
    const { userData, setUserData } = useAuth()
    const roleInfo = roleDetails[userData?.role as keyof typeof roleDetails]
    useEffect(() => {
        if (!actionedLogoff) return
        setLoggingOut(true)
        apiLogout().finally(() => setLoggingOut(false))
        setActionedLogout(false)
        setUserData(null)
    }, [actionedLogoff])

    const [carregandoUsuario, setCarregandoUsuario] = useState(false)
    useEffect(() => {
        const controller = new AbortController
        if (isUsuarioLogado()) {
            setCarregandoUsuario(true)
            try {
                apiMe(controller.signal)
                    .then(dados => {
                        if (dados !== undefined && JSON.stringify(dados) !== JSON.stringify(userData)) {
                            setUserData(dados)
                        }
                    })
                    .finally(() => setCarregandoUsuario(false))
            } catch (e) {
                console.log(e)
                setCarregandoUsuario(false)
            }
        } else {
            setUserData(null)
        }

        return () => {
            controller.abort
        }
    }, [])

    return (
        <header className="app-header">
            <h1 className="app-header__title" onClick={() => navigate("/home")}>
                Sistema pedidos
            </h1>
            <nav className="app-header__nav">
                <ul className="app-header__nav-list">
                    <ProtectedComponent allowed={['CLIENTE', 'ANONYMOUS', 'ADMIN', 'LOJISTA']}>
                        <ItemHeader
                            nome="Produtos"
                            path="produtos"
                        />
                    </ProtectedComponent>
                    <ProtectedComponent allowed={['CLIENTE']}>
                        <ItemHeader
                            nome="Carrinho"
                            path="carrinho"
                        />
                    </ProtectedComponent>

                    <ProtectedComponent allowed={['CLIENTE', 'LOJISTA', 'ENTREGADOR', 'ADMIN']}>

                        <ItemHeader
                            nome="Pedidos"
                            path="pedidos"
                        />
                    </ProtectedComponent>
                    <ProtectedComponent allowed={['ADMIN']}>
                        <ItemHeader
                            nome="Usuários"
                            path="/usuarios"
                        />
                    </ProtectedComponent>
                    <ProtectedComponent allowed={['ANONYMOUS']}>
                        <ItemHeader
                            nome="Login"
                            path="login"
                        />
                        <ItemHeader
                            nome="Cadastrar"
                            path="cadastrar-usuario"
                        />
                    </ProtectedComponent>
                </ul>
            </nav>
            <ProtectedComponent >
                {
                    carregandoUsuario ?
                    <LoadingSpinner /> :
                    <div className="app-header__user">
                        <a className="app-header__user-name" onClick={() => navigate("/usuarios#me")}>
                            {userData?.nome}
                            {userData?.role !== "CLIENTE" ? ` - ${userData?.role}` : ""}
                            {roleInfo && (
                                <FontAwesomeIcon
                                    className={`app-header__role-icon app-header__role-icon--${userData?.role.toLowerCase()}`}
                                    icon={roleInfo.icon}
                                    aria-label={roleInfo.label}
                                />
                            )}
                        </a>
                        <button
                            type="button"
                            className="app-header__logout"
                            disabled={loggingOut}
                            onClick={() => {
                                setActionedLogout(true)
                                navigate("/")
                            }}
                            style={{ color: "#a85e5e" }}
                        >
                            {loggingOut ? <LoadingSpinner /> : 'Sair'}
                        </button>
                    </div>
                }
            </ProtectedComponent>
        </header>
    )
}