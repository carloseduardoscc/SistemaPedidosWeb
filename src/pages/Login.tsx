import { apiLogin, apiLoginWithGoogle } from '../service/authService';
import { useEffect, useState, type FormEvent } from 'react'
// @ts-ignore
import './css/login.css'
import { useNavigate } from 'react-router-dom';
import { ErroResumido, errorLauncher } from '../service/errorLauncher';
import { addPopup } from '../app/InfoLayer';
import { faL } from '@fortawesome/free-solid-svg-icons';

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loginRequested, setLoginRequested] = useState(false)
    const navigate = useNavigate()

    function handleLogin(event: any) {
        event.preventDefault()
        setLoginRequested(true)
    }

    function handleCadastrar(event: any) {
        event.preventDefault()
        navigate("/cadastrar-usuario")
    }

    useEffect(() => {
        if (!loginRequested) return
        const controller = new AbortController()
        async function _() {
            try {
                await apiLogin(controller.signal, email, password)
                window.location.href = "/"
            } catch (error: any){
                error = await error
                if (!error.mensagem) throw error
                const erroResumido: ErroResumido = error
                if (erroResumido.tipo !== 'Credenciais incorretas') throw error
                if (!erroResumido.mensagem) throw Error("erroResumido.mensagem está undefined")
                addPopup({
                    titulo: erroResumido.mensagem,
                    corBackground: "var(--color-error)"
                })
            } finally {
                setLoginRequested(false)
            }
        }
        _()
        return () => controller.abort()
    }, [loginRequested])

    return (
        <main className="login-page">
            <section className="login-card" aria-labelledby="login-title">
                <header className="login-card__header">
                    <p className="login-kicker">Sistema pedidos</p>
                    <h1 id="login-title">Entrar na sua conta</h1>
                    <p>Informe seus dados para continuar.</p>
                </header>

                <form className="login-form" onSubmit={(event) => handleLogin(event)}>
                    <div className="login-field">
                        <label htmlFor="login-email">E-mail</label>
                        <input
                            id="login-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="seuemail@exemplo.com"
                            value={email}
                            onChange={event => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="login-password">Senha</label>
                        <input
                            id="login-password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Digite sua senha"
                            value={password}
                            onChange={event => setPassword(event.target.value)}
                            required
                        />
                    </div>

                    <button className="login-button" type="submit">
                        Entrar
                    </button>
                </form>

                <div className="login-divider" aria-hidden="true">
                    <span>ou</span>
                </div>

                <button className="cadastrar-button" type="submit" onClick={event => handleCadastrar(event)}>
                    Cadastrar
                </button>

                <button
                    className="login-google-button"
                    type="button"
                    onClick={apiLoginWithGoogle}
                >
                    <svg
                        className="login-google-button__icon"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                    >
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.73 6C44.43 38.08 46.98 31.93 46.98 24.55Z" />
                        <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
                    </svg>
                    Continuar com Google
                </button>
            </section>
        </main>
    )
}