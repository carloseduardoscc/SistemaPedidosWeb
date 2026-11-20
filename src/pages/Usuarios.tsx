import { FormEvent, useEffect, useState } from 'react'
import { Route, Routes, useAsyncValue, useLocation, useNavigate, useParams } from 'react-router-dom'
// @ts-ignore
import './css/me.css'
import { apiAtivarUsuario, apiAtualizarUsuario, apiBuscarUsuario, apiDesativarUsuario, apiListarUsuarios } from '../service/usuarioService'
import { addPopup } from '../app/InfoLayer'
import { useAuth } from '../contexts/AuthContext'
import { recarregarPagina } from '../util/Navegacao'
import { apiLogout } from '../service/authService'
import { UsuarioDTO } from '../types/UsuarioDTO'
import { Pagina } from '../types/PageType'
import { ErroResumido } from '../service/errorLauncher'

type Usuario = {
    nome: string
    email: string
    id: string
}

function EditarUsuario() {
    const navigate = useNavigate()
    const [usuario, setUsuario]: [usuario: UsuarioDTO | undefined, setUsuario: Function] = useState()
    const { id } = useParams()
    const [nome, setNome] = useState(usuario?.nome ?? '')
    const [isSubmitRequested, setIsSubmitRequested] = useState(false)

    useEffect(() => {
        const controller = new AbortController()
        if (usuario) return
        async function _() {
            if (!id) throw new Error("user id param undefined")
            const usuario = await apiBuscarUsuario(id, controller.signal)
            setUsuario(usuario)
        }
        _()
        return () => controller.abort()
    }, [])

    useEffect(() => {
        setNome(usuario?.nome ?? '')
    }, [usuario?.nome, usuario?.email])

    useEffect(() => {
        if (!isSubmitRequested || usuario === null) return
        if (!id) return
        const usuarioAtualizado = { nome }
        const controller = new AbortController()
        apiAtualizarUsuario(controller.signal, usuarioAtualizado, id)
            .then(() => {
                addPopup({
                    titulo: 'Dados atualizados com sucesso!',
                    corBackground: 'var(--color-success)',
                })
                navigate("./")
                recarregarPagina()
            })

        return () => { controller.abort }
    }, [isSubmitRequested])

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsSubmitRequested(true)
    }

    return (
        <>
            <header className="me-card__header">
                <p className="me-kicker">Minha conta</p>
                <h1 id="me-title">Editar dados</h1>
            </header>

            <form className="me-edit-form" onSubmit={handleSubmit}>
                <div className="me-edit-field">
                    <label htmlFor="me-edit-name">Nome</label>
                    <input
                        id="me-edit-name"
                        name="nome"
                        type="text"
                        autoComplete="name"
                        minLength={2}
                        maxLength={100}
                        value={nome}
                        onChange={event => setNome(event.target.value)}
                        required
                    />
                </div>
                <div className="me-actions">
                    <button className="me-button me-button--primary" type="submit">
                        Atualizar
                    </button>
                    <button
                        className="me-button me-button--secondary"
                        type="button"
                        onClick={() => navigate('./')}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </>
    )
}

export function DetalhesUsuario() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { userData, setUserData } = useAuth()
    const location = useLocation()
    const [usuario, setUsuario]: [usuario: UsuarioDTO | undefined, setUsuario: React.Dispatch<React.SetStateAction<UsuarioDTO | undefined>>] = useState()
    const [desativandoConta, setDesativandoConta] = useState(false)
    const [ativandoConta, setAtivandoConta] = useState(false)
    const [solicitadoDesativarConta, setSolicitadoDesativarConta] = useState(false)

    useEffect(() => {
        const controller = new AbortController()
        if (usuario) return
        async function _() {
            if (!id) throw new Error("user id param undefined")
            const usuario = await apiBuscarUsuario(id, controller.signal)
            setUsuario(usuario)
        }
        _()
        return () => controller.abort()
    }, [])

    useEffect(() => {
        if (location.hash === '#editar') return
        if (!solicitadoDesativarConta) return

        const controller = new AbortController
        async function desativarConta() {
            setDesativandoConta(true)
            if (!solicitadoDesativarConta) return
            if (!usuario) throw Error("usuario null")
            await apiDesativarUsuario(controller.signal, usuario.id)
            addPopup({
                titulo: `A conta de ${usuario.email} foi desativada com sucesso`
            })
            setDesativandoConta(false)
            setSolicitadoDesativarConta(false)
            // @ts-ignore
            setUsuario(usuario => ({...usuario, ativo: false}))
            if (usuario.id !== userData?.id) return
            await apiLogout()
            await navigate('/home')
            recarregarPagina()
        }
        desativarConta()
        return () => controller.abort()
    }, [location.hash, solicitadoDesativarConta])

    function handleDesativarConta() {
        addPopup({
            tipo: 'modal',
            titulo: 'Tem certeza que deseja desativar sua conta?',
            descricao: 'Essa ação é irreversível...',
            botoes: [{
                nome: 'Desativar minha conta',
                acao: () => setSolicitadoDesativarConta(true)
            }, {
                nome: 'Cancelar',
                acao: () => { }
            }]
        })
    }

    function handleAtivarConta() {
        if (!usuario) return
        addPopup({
            tipo: 'modal',
            titulo: 'Ativar conta?',
            descricao: 'Tem certeza que deseja ativar esta conta?',
            botoes: [{
                nome: 'Ativar conta',
                acao: async () => {
                    const controller = new AbortController()
                    setAtivandoConta(true)
                    try {
                        await apiAtivarUsuario(controller.signal, usuario.id)
                        setUsuario({ ...usuario, ativo: true })
                        addPopup({ titulo: `A conta de ${usuario.email} foi desativada com sucesso!` })
                    } catch (error) {
                        if (!error || typeof error !== 'object') throw error
                        const erroResumido = error as ErroResumido
                        if (!(erroResumido.tipo || erroResumido.mensagem)) throw error
                        addPopup({
                            titulo: erroResumido.tipo || '',
                            descricao: erroResumido.mensagem,
                            corBackground: 'var(--color-error)'
                        })
                    } finally {
                        setAtivandoConta(false)
                    }
                }
            }, {
                nome: 'Cancelar',
                acao: () => { }
            }]
        })
    }

    return (
        <main className="me-page">
            {usuario ?
                <section className="me-card" aria-labelledby="me-title">
                    {location.hash === "#editar" ? <EditarUsuario /> :
                        <>
                            <header className="me-card__header">
                                <p className="me-kicker">Minha conta</p>
                                <h1 id="me-title">Dados do usuário</h1>
                            </header>

                            <dl className="me-details">
                                <div className="me-detail">
                                    <dt>Nome</dt>
                                    <dd>{usuario?.nome || 'Não informado'}</dd>
                                </div>
                                <div className="me-detail">
                                    <dt>E-mail</dt>
                                    <dd>{usuario?.email || 'Não informado'}</dd>
                                </div>
                            </dl>

                            <div className="me-actions">
                                <button
                                    className="me-button me-button--primary"
                                    type="button"
                                    onClick={() => navigate('#editar')}
                                >
                                    Editar dados
                                </button>
                                {usuario.ativo
                                    ? <button
                                        className="me-button me-button--danger"
                                        type="button"
                                        disabled={desativandoConta}
                                        onClick={handleDesativarConta}
                                    >
                                        Desativar conta
                                    </button>
                                    : <button
                                        className="me-button me-button--primary"
                                        type="button"
                                        disabled={ativandoConta}
                                        onClick={handleAtivarConta}
                                    >
                                        {ativandoConta ? 'Ativando conta...' : 'Ativar conta'}
                                    </button>}
                            </div>

                            {desativandoConta && "Desativando conta deste usuário..."}
                        </>
                    }
                </section>
                : "Carregando usuário"}
        </main>
    )
}

function ListaUsuarios() {
    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [pesquisa, setPesquisa] = useState({ nome: '', email: '', page: 0 })
    const [pagina, setPagina] = useState<Pagina<UsuarioDTO> | null>(null)
    const [carregando, setCarregando] = useState(true)
    const navigate = useNavigate()
    const tamanhoPagina = 10

    useEffect(() => {
        const controller = new AbortController()
        let ativo = true
        setCarregando(true)
        apiListarUsuarios(controller.signal, pesquisa.nome, pesquisa.email, pesquisa.page, tamanhoPagina)
            .then(resultado => {
                if (ativo) setPagina(resultado)
            })
            .catch(error => {
                if (!ativo || error === null) return
                if (typeof error !== 'object') throw error
                const erroResumido = error as ErroResumido
                if (!(erroResumido.tipo || erroResumido.mensagem)) throw error
                addPopup({
                    titulo: erroResumido.tipo || '',
                    descricao: erroResumido.mensagem,
                    corBackground: 'var(--color-error)'
                })
            })
            .finally(() => {
                if (ativo) setCarregando(false)
            })
        return () => {
            ativo = false
            controller.abort()
        }
    }, [pesquisa])

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setPesquisa({ nome, email, page: 0 })
    }

    return (
        <div className="me-page">
            <section className="me-card usuarios-card" aria-labelledby="usuarios-title">
                <header className="me-card__header">
                    <p className="me-kicker">Administração</p>
                    <h1 id="usuarios-title">Usuários</h1>
                </header>
                <form className="usuarios-search" onSubmit={handleSubmit}>
                    <div className="me-edit-field">
                        <label htmlFor="usuarios-nome">Nome</label>
                        <input id="usuarios-nome" value={nome} onChange={event => setNome(event.target.value)} />
                    </div>
                    <div className="me-edit-field">
                        <label htmlFor="usuarios-email">E-mail</label>
                        <input id="usuarios-email" value={email} onChange={event => setEmail(event.target.value)} />
                    </div>
                    <button className="me-button me-button--primary" type="submit">Pesquisar</button>
                </form>
                {carregando ? <p className="me-message" role="status">Carregando usuários...</p> : pagina?.content.length
                    ? <>
                        <ul className="usuarios-lista">
                            {pagina.content.map(usuario => (
                                <li key={usuario.id}>
                                    <button type="button" className="usuarios-lista__item" onClick={() => navigate(`/usuarios/${usuario.id}`)}>
                                        <strong>{usuario.nome}</strong>
                                        <span>{usuario.email}</span>
                                        <span>{usuario.role}</span>
                                        {usuario.ativo ?
                                            <strong style={{ color: "green" }} >Ativo</strong> :
                                            <strong style={{ color: "red" }} >Desativado</strong>
                                        }
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="me-actions usuarios-paginacao">
                            <button
                                className="me-button me-button--secondary"
                                type="button"
                                disabled={pagina.first}
                                onClick={() => setPesquisa(atual => ({ ...atual, page: atual.page - 1 }))}
                            >
                                Anterior
                            </button>
                            <span>Página {pagina.number + 1} de {pagina.totalPages}</span>
                            <button
                                className="me-button me-button--secondary"
                                type="button"
                                disabled={pagina.last}
                                onClick={() => setPesquisa(atual => ({ ...atual, page: atual.page + 1 }))}
                            >
                                Próxima
                            </button>
                        </div>
                    </>
                    : <p className="me-message">Nenhum usuário encontrado.</p>}
            </section>
        </div>
    )
}

export default function Usuarios() {
    const location = useLocation()
    const { userData, setUserData } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (userData && location.hash === '#me') {
            navigate(`${userData.id}`, { replace: true })
        }
    }, [location.hash])

    return (
        <main>
            <Routes>
                <Route index element={<ListaUsuarios />} />
                <Route path=":id" element={<DetalhesUsuario />} />
            </Routes>
        </main>
    )
}