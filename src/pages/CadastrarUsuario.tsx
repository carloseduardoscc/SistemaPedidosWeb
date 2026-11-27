import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
// @ts-ignore
import './css/cadastrar-usuario.css'
import { apiCadastrar, apiLoginWithGoogle, CadastrarUsuarioDTO } from '../service/authService'
import PopupInformacao from '../components/PopupInformacao'
import { addPopup } from '../app/InfoLayer'
import { ErroResumido } from '../service/errorLauncher'
import LoadingSpinner from '../components/LoadingSpinner'

export default function CadastrarUsuario() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [submitMessage, setSubmitMessage] = useState('')
    const [submitRequested, setSubmitRequested] = useState(false)
    const [submitSucessful, setSubmitSucessful] = useState(false)
    const navigate = useNavigate()

    function handleSubmit(event: any) {
        event.preventDefault()
        setSubmitRequested(true)
    }

    useEffect(() => {
        if (!submitSucessful) return
        addPopup({
            tipo: 'modal',
            botoes: [{
                nome: "Ir para login",
                acao: () => navigate("/login")
            }],
            titulo: 'Cadastro concluído!',
            descricao: `Usuário ${email} cadastrado com sucesso, agora faça login e use sua nova conta no nosso site!`
        })
    }, [submitSucessful])

    useEffect(() => {
        if (!submitRequested) return
        const controller = new AbortController()
        async function _() {
            try {
                const cadastrarUsuarioDTO: CadastrarUsuarioDTO = {
                    nome: name,
                    email: email,
                    senha: password,
                    role: "CLIENTE"
                }
                await apiCadastrar(controller.signal, cadastrarUsuarioDTO)
                setSubmitSucessful(true)
            } catch (error: any) {
                error = await error
                if (!(error.tipo || error.mensagem)) throw error
                const erroResumido: ErroResumido = error
                addPopup({
                    titulo: erroResumido.tipo || '',
                    descricao: erroResumido.mensagem,
                    corBackground: "var(--color-error)"
                })
            } finally {
                setSubmitRequested(false)
            }
        }
        _()
        return () => controller.abort()
    }, [submitRequested])

    return (
        <main className="register-page">
            <section className="register-card" aria-labelledby="register-title">
                <header className="register-card__header">
                    <p className="register-kicker">Sistema pedidos</p>
                    <h1 id="register-title">Criar sua conta</h1>
                    <p>Preencha seus dados para se cadastrar.</p>
                </header>

                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="register-field">
                        <label htmlFor="register-name">Nome</label>
                        <input
                            id="register-name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            placeholder="Seu nome"
                            minLength={2}
                            maxLength={100}
                            value={name}
                            onChange={event => setName(event.target.value)}
                            required
                        />
                    </div>

                    <div className="register-field">
                        <label htmlFor="register-email">E-mail</label>
                        <input
                            id="register-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="seuemail@exemplo.com"
                            value={email}
                            onChange={event => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div className="register-field">
                        <label htmlFor="register-password">Senha</label>
                        <div className="register-password-control">
                            <input
                                id="register-password"
                                name="password"
                                type={passwordVisible ? 'text' : 'password'}
                                autoComplete="new-password"
                                placeholder="Crie uma senha"
                                minLength={6}
                                maxLength={300}
                                value={password}
                                onChange={event => setPassword(event.target.value)}
                                required
                            />
                            <button
                                className="register-password-toggle"
                                type="button"
                                aria-label={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                                aria-pressed={passwordVisible}
                                onClick={() => setPasswordVisible(visible => !visible)}
                            >
                                <FontAwesomeIcon
                                    icon={passwordVisible ? faEyeSlash : faEye}
                                    aria-hidden="true"
                                />
                            </button>
                        </div>
                    </div>

                    <button className="register-button" type="submit" disabled={submitRequested}>
                        {submitRequested ? <LoadingSpinner /> : 'Cadastrar'}
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
                    {submitMessage && (
                        <p className="register-message" role="status">
                            {submitMessage}
                        </p>
                    )}
                </form>

                <p className="register-login-prompt">
                    Já tem uma conta?{' '}
                    <button type="button" onClick={() => navigate('/login')}>
                        Entrar
                    </button>
                </p>
            </section>
        </main>
    )
}
