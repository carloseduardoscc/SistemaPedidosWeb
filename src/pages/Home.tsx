import { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowRight,
    faBoxOpen,
    faMagnifyingGlass,
    faStore,
    faTruckFast,
} from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiBuscarProdutos } from '../service/produtoService'
import type { ProdutoDTO } from '../types/ProdutoDTO'
import formatarMoeda from '../util/Formatador'
import LoadingSpinner from '../components/LoadingSpinner'
// @ts-ignore
import './css/home.css'

const roleCopy = {
    CLIENTE: {
        eyebrow: 'SEU PRÓXIMO PEDIDO COMEÇA AQUI',
        title: 'Escolhas boas,',
        highlight: 'entrega tranquila.',
        description: 'Encontre seus favoritos, monte seu carrinho e acompanhe cada etapa do pedido.',
        primary: 'Explorar produtos',
        path: '/produtos',
    },
    LOJISTA: {
        eyebrow: 'PAINEL DA SUA LOJA',
        title: 'Sua loja em movimento,',
        highlight: 'seus pedidos no ritmo.',
        description: 'Cuide do catálogo e acompanhe os pedidos que precisam da sua atenção.',
        primary: 'Ver pedidos',
        path: '/pedidos',
    },
    ENTREGADOR: {
        eyebrow: 'CENTRAL DE ENTREGAS',
        title: 'Cada pedido,',
        highlight: 'um destino.',
        description: 'Acesse suas entregas e mantenha cada cliente por dentro do caminho.',
        primary: 'Ver entregas',
        path: '/pedidos',
    },
    ADMIN: {
        eyebrow: 'VISÃO GERAL',
        title: 'Operação organizada,',
        highlight: 'do início ao fim.',
        description: 'Acesse o fluxo de pedidos e o catálogo em um só lugar.',
        primary: 'Acompanhar pedidos',
        path: '/pedidos',
    },
}

export default function Home() {
    const navigate = useNavigate()
    const { userData } = useAuth()
    const [produtos, setProdutos] = useState<ProdutoDTO[]>([])
    const [busca, setBusca] = useState('')
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState(false)
    const [tentativa, setTentativa] = useState(0)
    const roleContent = userData ? roleCopy[userData.role] : null

    useEffect(() => {
        const controller = new AbortController()

        async function carregarProdutos() {
            setCarregando(true)
            setErro(false)
            try {
                const pagina = await apiBuscarProdutos(controller.signal)
                setProdutos(pagina.content)
            } catch {
                if (!controller.signal.aborted) setErro(true)
            } finally {
                if (!controller.signal.aborted) setCarregando(false)
            }
        }

        carregarProdutos()
        return () => controller.abort()
    }, [tentativa])

    const produtosFiltrados = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase('pt-BR')
        return produtos
            .filter(produto => produto.nome.toLocaleLowerCase('pt-BR').includes(termo))
            .slice(0, 4)
    }, [busca, produtos])

    return (
        <main className="home-page">
            <section className="home-hero" aria-labelledby="home-title">
                <div className="home-hero__copy">
                    <span className="home-eyebrow">
                        <span className="home-eyebrow__dot" />
                        {roleContent?.eyebrow ?? 'UM JEITO MAIS SIMPLES DE PEDIR'}
                    </span>
                    <h1 id="home-title">
                        {roleContent?.title ?? 'O que você precisa,'}
                        <span>{roleContent?.highlight ?? 'a um pedido de distância.'}</span>
                    </h1>
                    <p className="home-hero__description">
                        {roleContent?.description ?? 'Descubra o catálogo, escolha seus produtos e acompanhe seu pedido do começo à entrega.'}
                    </p>
                    <div className="home-hero__actions">
                        <button
                            className="home-button home-button--primary"
                            type="button"
                            onClick={() => navigate(roleContent?.path ?? '/produtos')}
                        >
                            {roleContent?.primary ?? 'Ver produtos'}
                            <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                        </button>
                        {!userData ? (
                            <button
                                className="home-button home-button--text"
                                type="button"
                                onClick={() => navigate('/cadastrar-usuario')}
                            >
                                Criar minha conta
                            </button>
                        ) : userData.role === 'CLIENTE' ? (
                            <button
                                className="home-button home-button--text"
                                type="button"
                                onClick={() => navigate('/pedidos')}
                            >
                                Acompanhar pedidos
                            </button>
                        ) : userData.role === 'LOJISTA' || userData.role === 'ADMIN' ? (
                            <button
                                className="home-button home-button--text"
                                type="button"
                                onClick={() => navigate('/produtos')}
                            >
                                Ver catálogo
                            </button>
                        ) : null}
                    </div>
                </div>

                <div className="home-hero__visual" aria-hidden="true">
                    <div className="home-orbit home-orbit--outer" />
                    <div className="home-orbit home-orbit--inner" />
                    <div className="home-package">
                        <span className="home-package__icon">
                            <FontAwesomeIcon icon={faBoxOpen} />
                        </span>
                        <span className="home-package__label">PEDIDO EM ANDAMENTO</span>
                        <strong>Da escolha à entrega.</strong>
                        <span className="home-package__track">
                            <span className="home-package__track-fill" />
                        </span>
                        <span className="home-package__footer">
                            <span><FontAwesomeIcon icon={faStore} /> Loja</span>
                            <span><FontAwesomeIcon icon={faTruckFast} /> Entrega</span>
                        </span>
                    </div>
                    <span className="home-hero__spark home-hero__spark--one">✳</span>
                    <span className="home-hero__spark home-hero__spark--two">✳</span>
                </div>
            </section>

            {userData?.role === "CLIENTE" ?
                <section className="home-catalog" aria-labelledby="home-catalog-title">
                    <div className="home-section-heading">
                        <div>
                            <span className="home-section-kicker">ESCOLHA COM CALMA</span>
                            <h2 id="home-catalog-title">Destaques do catálogo</h2>
                            <p>Encontre algo que combine com o seu dia.</p>
                        </div>
                        <label className="home-search">
                            <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
                            <input
                                type="search"
                                value={busca}
                                onChange={event => setBusca(event.target.value)}
                                placeholder="Buscar produto"
                                aria-label="Buscar produto no catálogo"
                            />
                        </label>
                    </div>

                    {carregando ? (
                        <LoadingSpinner />
                    ) : erro ? (
                        <div className="home-feedback home-feedback--error" role="alert">
                            <span>Não foi possível carregar os produtos agora.</span>
                            <button type="button" onClick={() => setTentativa(valor => valor + 1)}>
                                Tentar novamente
                            </button>
                        </div>
                    ) : produtosFiltrados.length === 0 ? (
                        <p className="home-feedback">
                            {busca ? 'Nenhum produto encontrado com esse nome.' : 'Ainda não há produtos no catálogo.'}
                        </p>
                    ) : (
                        <div className="home-product-grid">
                            {produtosFiltrados.map((produto, index) => (
                                <button
                                    className={`home-product home-product--${index + 1}`}
                                    key={produto.id}
                                    type="button"
                                    onClick={() => navigate(`/produtos/${produto.id}`)}
                                >
                                    <span className="home-product__number">{String(index + 1).padStart(2, '0')}</span>
                                    <span className="home-product__name">{produto.nome}</span>
                                    <strong>{formatarMoeda(produto.precoUnitario)}</strong>
                                    <span className="home-product__action">
                                        Ver produto <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        className="home-catalog__link"
                        type="button"
                        onClick={() => navigate('/produtos')}
                    >
                        Ver catálogo completo <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                    </button>
                </section>
            : <></>}
        </main>

    )
}
