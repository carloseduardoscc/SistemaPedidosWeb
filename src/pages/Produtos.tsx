import { Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { AdicionarItemPedidoDTO, apiAdicionarItemAoPedido, apiAtualizarProduto, apiBuscarProduto, apiBuscarProdutos, apiCadastrarProduto, apiDeletarProduto } from '../service/produtoService'
import { useEffect, useState, type FormEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
// @ts-ignore
import './css/produtos.css'
import ProtectedRoute from '../app/ProtectedComponent'
import formatarMoeda from '../util/Formatador'
import { apiBuscarMeusPedidos } from '../service/pedidoService'
import ProtectedComponent from '../app/ProtectedComponent'
import { ProdutoDTO } from '../types/ProdutoDTO'
import { apiAbrirNovoPedido } from '../service/usuarioService'
import { useAuth } from '../contexts/AuthContext'
import { addPopup } from '../app/InfoLayer'
import { ErroResumido } from '../service/errorLauncher'

function Produto({ produtoData }: { produtoData: ProdutoDTO }) {
    const [quantidade, setQuantidade] = useState(1)
    const [wasAdicionarAoCarrinhoClicked, setWasAdicionarAoCarrinhoClicked] = useState(false)
    const total = Number(produtoData.precoUnitario) * quantidade
    const totalFormatado = formatarMoeda(total)
    const { userData } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const controller = new AbortController()
        async function _() {
            if (!wasAdicionarAoCarrinhoClicked) return
            const dados: AdicionarItemPedidoDTO = {
                produtoId: produtoData.id,
                quantidade: quantidade
            }
            const pagina = await apiBuscarMeusPedidos(controller.signal)
            const pedidoPendente = pagina.content.find(p => p.status === "PENDENTE")
            if (!userData) throw Error("userData nulo")
            let pedidoId: string
            if (pedidoPendente?.id) {
                pedidoId = pedidoPendente.id
            } else {
                // Caso o usuário ainda não tenha um pedido aberto, abre um novo para adicionar o primeiro item
                pedidoId = await apiAbrirNovoPedido(controller.signal, userData.id)
            }
            try {
                await apiAdicionarItemAoPedido(controller.signal, pedidoId, dados)
                addPopup({
                    titulo: `${quantidade}X ${produtoData.nome} Adicionado${quantidade !== 1 ? 's' : ''} ao carrinho com sucesso!`
                })
                navigate("/carrinho")
            } catch (error: any) {
                error = await error
                if (!error.mensagem) throw error
                const erroResumido: ErroResumido = error
                if (erroResumido.mensagem !== 'Total do pedido ultrapassou R$ 10.000,00') throw error
                if (!erroResumido.mensagem) throw Error("erroResumido.mensagem está undefined")
                addPopup({
                    titulo: erroResumido.mensagem,
                    corBackground: "var(--color-error)",
                    corFonte: "var(--color-white)"
                })
            } finally {
                setWasAdicionarAoCarrinhoClicked(false)
            }
        }
        _()
        return () => { controller.abort() }
    }, [wasAdicionarAoCarrinhoClicked])
    function handleAdicionarAoCarrinho() {
        setWasAdicionarAoCarrinhoClicked(true)
    }

    return (
        <div className="produto-card" key={produtoData.id} data-id={produtoData.id}>
            <h2>{produtoData.nome}</h2>
            <p>Preço: {formatarMoeda(total)}</p>
            <ProtectedComponent
                allowed={['CLIENTE']}
            >
                <div className="produto-carrinho">
                    <span className="produto-carrinho__label">Quantidade</span>
                    <div className="produto-carrinho__actions">
                        <div className="produto-quantidade">
                            <button
                                type="button"
                                onClick={() => setQuantidade(valor => Math.max(1, valor - 1))}
                                disabled={quantidade <= 1}
                            >
                                -
                            </button>
                            <output aria-live="polite">{quantidade}</output>
                            <button
                                type="button"
                                onClick={() => setQuantidade(valor => valor + 1)}
                            >
                                +
                            </button>
                        </div>
                        <button
                            className="produto-adicionar-carrinho"
                            type="button"
                            onClick={handleAdicionarAoCarrinho}
                        >
                            Adicionar ao carrinho
                        </button>
                    </div>
                    <p className="produto-carrinho__total" aria-live="polite">
                        Total: <strong>{totalFormatado}</strong>
                    </p>
                </div>
            </ProtectedComponent>
        </div>
    )
}

function ProdutoDetalhe() {
    const { id } = useParams();
    const [produto, setProduto] = useState<ProdutoDTO | null>(null);
    const [editando, setEditando] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const navigate = useNavigate()

    useEffect(() => {
        const controller = new AbortController();
        if (id === undefined) throw Error("Id está como undefined")
        apiBuscarProduto(controller.signal, id)
            .then(result => setProduto(result));
        return () => { controller.abort() }
    }, [id]);

    async function excluirProduto() {
        if (!produto) return
        setExcluindo(true)
        const controller = new AbortController()
        try {
            await apiDeletarProduto(controller.signal, produto.id)
            addPopup({ titulo: 'Produto excluído com sucesso.' })
            navigate('/produtos')
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
            setExcluindo(false)
        }
    }

    return (
        <div className="produto-detalhe">
            <button
                className="produto-voltar"
                type="button"
                onClick={() => window.history.back()}
                title="Voltar para a lista de produtos"
            >
                <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
            </button>
            <div className="produto-detalhe__heading">
                <span className="produto-kicker">Catálogo</span>
                <h2>Detalhe do produto</h2>
            </div>
            <div className="produto-detalhe__content">
                {produto && String(produto.id) === String(id)
                    ? editando
                        ? <EditarProduto
                            produtoData={produto}
                            onCancelar={() => setEditando(false)}
                            onAtualizado={produtoAtualizado => {
                                setProduto(produtoAtualizado)
                                setEditando(false)
                            }}
                        />
                        : <>
                            <Produto produtoData={produto} />
                            <ProtectedComponent allowed={['LOJISTA', 'ADMIN']}>
                                <div className="produto-detalhe__acoes">
                                    <button
                                        className="produto-adicionar-carrinho"
                                        type="button"
                                        onClick={() => setEditando(true)}
                                    >
                                        Editar produto
                                    </button>
                                    <button
                                        className="produto-deletar"
                                        type="button"
                                        disabled={excluindo}
                                        onClick={() => addPopup({
                                            tipo: 'modal',
                                            titulo: 'Excluir produto?',
                                            descricao: 'Tem certeza de que deseja excluir este produto? Esta ação não pode ser desfeita.',
                                            botoes: [
                                                { nome: 'Sim, excluir produto', acao: excluirProduto },
                                                { nome: 'Cancelar', acao: () => { } }
                                            ]
                                        })}
                                    >
                                        {excluindo ? 'Excluindo...' : 'Deletar produto'}
                                    </button>
                                </div>
                            </ProtectedComponent>
                        </>
                    : <span className="produto-loading">Carregando produto...</span>}
            </div>
        </div>
    )
}

function EditarProduto({ produtoData, onCancelar, onAtualizado }: {
    produtoData: ProdutoDTO
    onCancelar: () => void
    onAtualizado: (produto: ProdutoDTO) => void
}) {
    const [nome, setNome] = useState(produtoData.nome)
    const [precoUnitario, setPrecoUnitario] = useState(String(produtoData.precoUnitario))

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const controller = new AbortController()
        const produtoAtualizado = { ...produtoData, nome, precoUnitario: Number(precoUnitario) }
        try {
            await apiAtualizarProduto(controller.signal, produtoAtualizado)
            addPopup({ titulo: 'Produto atualizado com sucesso.' })
            onAtualizado(produtoAtualizado)
        } catch (error) {
            if (!error || typeof error !== 'object') throw error
            const erroResumido = error as ErroResumido
            if (!(erroResumido.tipo || erroResumido.mensagem)) throw error
            addPopup({
                titulo: erroResumido.tipo || '',
                descricao: erroResumido.mensagem,
                corBackground: 'var(--color-error)'
            })
        }
    }

    return (
        <form className="produto-form" onSubmit={handleSubmit}>
            <label>
                Nome
                <input autoFocus value={nome} onChange={event => setNome(event.target.value)} required />
            </label>
            <label>
                Preço
                <input
                    type="number"
                    min="0.00"
                    step="0.01"
                    value={precoUnitario}
                    onChange={event => setPrecoUnitario(event.target.value)}
                    required
                />
            </label>
            <button className="produto-adicionar-carrinho" type="submit">
                Salvar alterações
            </button>
            <button className="produto-adicionar-carrinho" type="button" onClick={onCancelar}>
                Cancelar
            </button>
        </form>
    )
}

function ItemProduto({ produtoData }: { produtoData: ProdutoDTO }) {
    const navigate = useNavigate();
    return (
        <li className="produto-item">
            <button
                type="button"
                className="produto-item__link"
                onClick={() => navigate(`/produtos/${produtoData.id}`)}
            >
                <span className="produto-item__nome">{produtoData.nome}</span>
                <strong className="produto-item__preco">{formatarMoeda(produtoData.precoUnitario)}</strong>
                <span className="produto-item__acao">Ver detalhes</span>
            </button>
        </li>
    )
}

function ListaProdutos() {
    const [produtos, setProdutos]: [ProdutoDTO[], any] = useState([]);
    const navigate = useNavigate()

    useEffect(() => {
        const controller = new AbortController();
        apiBuscarProdutos(controller.signal)
            .then(
                pagina => setProdutos(pagina.content)
            )
        return () => {
            controller.abort();
        }
    }, []);

    return (
        <div className="produtos-lista">
            <div className="produtos-page__actions">
                <ProtectedRoute allowed={['LOJISTA', 'ADMIN']}>
                    <button type="button" className="produtos-page__cta" onClick={() => navigate(`/produtos/cadastrar`)}>
                        Cadastrar produto
                    </button>
                </ProtectedRoute>
            </div>
            <div className="produtos-lista__heading">
                <span className="produto-kicker">Catálogo</span>
                <h2>Lista de produtos</h2>
                <p>Escolha um produto para ver mais detalhes.</p>
            </div>
            <ul className="produtos-lista__items">
                {produtos.map(produto => (
                    <ItemProduto key={produto.id} produtoData={produto} />
                ))}
            </ul>
        </div>
    )
}

function CadastrarProduto() {
    const [nome, setNome] = useState('')
    const [precoUnitario, setPrecoUnitario] = useState('')
    const navigate = useNavigate()

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const controller = new AbortController()
        try {
            await apiCadastrarProduto(controller.signal, {
                id: null,
                nome,
                precoUnitario: Number(precoUnitario)
            })
            addPopup({
                tipo: 'modal',
                botoes: [{ nome: 'Voltar para produtos', acao: () => navigate('/produtos') }],
                titulo: 'Produto cadastrado!',
                descricao: `Produto ${nome} cadastrado com sucesso.`
            })
        } catch (error) {
            if (!error || typeof error !== 'object') throw error
            const erroResumido = error as ErroResumido
            if (!(erroResumido.tipo || erroResumido.mensagem)) throw error
            addPopup({
                titulo: erroResumido.tipo || '',
                descricao: erroResumido.mensagem,
                corBackground: 'var(--color-error)'
            })
        }
    }

    return (
        <section className="produto-detalhe produto-cadastro" aria-labelledby="produto-cadastro-title">
            <button
                className="produto-voltar"
                type="button"
                onClick={() => navigate('/produtos')}
                title="Voltar para a lista de produtos"
            >
                <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
            </button>
            <div className="produto-detalhe__heading">
                <span className="produto-kicker">Catálogo</span>
                <h2 id="produto-cadastro-title">Cadastrar produto</h2>
            </div>
            <form className="produto-form" onSubmit={handleSubmit}>
                <label>
                    Nome
                    <input autoFocus value={nome} onChange={event => setNome(event.target.value)} required />
                </label>
                <label>
                    Preço
                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={precoUnitario}
                        onChange={event => setPrecoUnitario(event.target.value)}
                        required
                    />
                </label>
                <button className="produto-adicionar-carrinho" type="submit">
                    Cadastrar produto
                </button>
            </form>
        </section>
    )
}

export default function Produtos() {
    const navigate = useNavigate()

    return (
        <main className="produtos-page">
            <header className="produtos-page__header">
                <div className="produtos-page__title-wrap">
                    <h1>Produtos</h1>
                    <p>Encontre o que você precisa no nosso catálogo.</p>
                </div>
            </header>

            <Routes>
                <Route index element={<ListaProdutos />} />
                <Route path=":id" element={<ProdutoDetalhe />} />
                <Route path="cadastrar" element={<CadastrarProduto />} />
            </Routes>

            <ProtectedComponent
                allowed={['ANONYMOUS']}
            >
                <h4>Para poder começar suas compras realize <a onClick={() => navigate("/login")}>login como cliente</a> ou <a onClick={() => navigate("/login")}>registre uma nova conta</a>!</h4>
            </ProtectedComponent>
        </main>
    )
}