import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// @ts-ignore
import './css/carrinho.css'
import formatarMoeda from '../util/Formatador'
import { PedidoDetalhadoDTO } from '../types/PedidoDetalhadoDTO'
import { apiBuscarMeusPedidos, apiBuscarPedidoDetalhado, apiTornarPedidoPago } from '../service/pedidoService'
import { addPopup } from '../app/InfoLayer'
import { ItemDetalhadoDTO } from '../types/ItemDetalhadoDTO'
import { apiAtualizarItem, apiDeletarItem } from '../service/itemService'
import { recarregarPagina } from '../util/Navegacao'
import { ErroResumido } from '../service/errorLauncher'

function ItemCarrinho({
    item,
    aoExcluir,
    aoAlterarQuantidade,
}: {
    item: PedidoDetalhadoDTO['itens'][number]
    aoExcluir: (id: string) => void
    aoAlterarQuantidade: (id: string, quantidade: number) => void
}) {
    const navigate = useNavigate()

    return (
        <li className="carrinho-item">
            <button
                className="carrinho-item__produto"
                type="button"
                onClick={() => navigate(`/produtos/${item.produto.id}`)}
            >
                <span className="carrinho-item__nome">{item.nomeProduto}</span>
                <span className="carrinho-item__preco">
                    Valor unitário: {formatarMoeda(item.precoUnitario)}
                </span>
                <span className="carrinho-item__preco">
                    Valor Total: {formatarMoeda(item.quantidade * item.precoUnitario)}
                </span>
            </button>
            <div className="carrinho-item__acoes">
                <div className="carrinho-quantidade" aria-label={`Quantidade de ${item.nomeProduto}`}>
                    <button
                        type="button"
                        aria-label={`Diminuir quantidade de ${item.nomeProduto}`}
                        onClick={() => aoAlterarQuantidade(item.itemId, item.quantidade - 1)}
                        disabled={item.quantidade <= 1}
                    >
                        -
                    </button>
                    <output aria-live="polite">{item.quantidade}</output>
                    <button
                        type="button"
                        aria-label={`Aumentar quantidade de ${item.nomeProduto}`}
                        onClick={() => aoAlterarQuantidade(item.itemId, item.quantidade + 1)}
                    >
                        +
                    </button>
                </div>
                <button
                    className="carrinho-item__excluir"
                    type="button"
                    onClick={() => aoExcluir(item.itemId)}
                >
                    Excluir
                </button>
            </div>
        </li>
    )
}

export default function Carrinho() {
    const [pedido, setPedido] = useState<PedidoDetalhadoDTO | null>(null)
    const [carregando, setCarregando] = useState(true)
    const navigate = useNavigate();
    const itens = pedido?.itens ?? []

    useEffect(() => {
        const controller = new AbortController()
        async function carregarPedido() {
            try {
                const pagina = await apiBuscarMeusPedidos(controller.signal)
                const pedidoPendente = pagina.content.find(item => item.status === 'PENDENTE')
                if (!pedidoPendente) return
                const pedidoDetalhado = await apiBuscarPedidoDetalhado(controller.signal, pedidoPendente.id)
                if (!controller.signal.aborted) setPedido(pedidoDetalhado)
            } catch (error: any) {
                // tratar erro
                throw error
            } finally {
                setCarregando(false)
            }
        }
        carregarPedido()
        return () => controller.abort()
    }, [])

    function atualizarItens(itensAtualizados: ItemDetalhadoDTO[]) {
        setPedido(pedidoAtual => pedidoAtual ? {
            ...pedidoAtual,
            itens: itensAtualizados,
            totalItens: itensAtualizados.reduce((total, item) => total + item.quantidade, 0),
            valorTotal: itensAtualizados.reduce((total, item) => total + item.valorTotal, 0)
        } : pedidoAtual)
    }

    async function alterarQuantidade(id: string, quantidade: number) {
        atualizarItens(itens.map(item =>
            item.itemId === id ? { ...item, quantidade: Math.max(1, quantidade) } : item
        ))
        const item = itens.find(i => i.itemId === id)
        if (!item) throw Error("Item undefined!")
        await apiAtualizarItem({ quantidade: quantidade }, id)
    }

    function excluirItem(itemId: string) {
        apiDeletarItem(itemId)
            .then(() => {
                atualizarItens(itens.filter(item => item.itemId !== itemId))
            })
    }

    function confirmarCompra() {
        if (!pedido) throw new Error("Pedido null")
        apiTornarPedidoPago(pedido.id)
            .then(()=>{
                addPopup({
                    tipo: 'modal',
                    titulo: 'Seu pedido foi pago com sucesso!',
                    descricao: 'Ele está sendo preparado para entrega por um dos nossos lojistas. Veja o andamento dele em pedidos',
                    botoes: [{
                        nome: 'Ver meu pedido',
                        acao: () => navigate("/pedidos?foco="+pedido.id)
                    }, {
                        nome: 'mais tarde',
                        acao: () => recarregarPagina()
                    }]
                })
            })
    }

    return (
        <main className="carrinho-page">
            <header className="carrinho-page__header">
                <span className="carrinho-kicker">Meu App</span>
                <h1>Carrinho</h1>
                <p>Confira os itens antes de confirmar sua compra.</p>
            </header>

            <section className="carrinho-card" aria-label="Itens do carrinho">
                {carregando ? (
                    <p className="carrinho-vazio">Carregando carrinho...</p>
                ) : itens.length === 0 ? (
                    <p className="carrinho-vazio">Seu carrinho está vazio.</p>
                ) : (
                    <ul className="carrinho-lista">
                        {itens.map(item => (
                            <ItemCarrinho
                                key={item.itemId}
                                item={item}
                                aoExcluir={id => excluirItem(id)}
                                aoAlterarQuantidade={alterarQuantidade}
                            />
                        ))}
                    </ul>
                )}

                <div className="carrinho-resumo">
                    <p className="carrinho-total" aria-live="polite">
                        Valor total: <strong>{pedido ? formatarMoeda(pedido.itens.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0)) : ""}</strong>
                    </p>
                    <button
                        className="carrinho-confirmar"
                        type="button"
                        disabled={carregando || itens.length === 0}
                        onClick={() => {
                            addPopup({
                                tipo: 'modal',
                                titulo: 'Confirmação de compra',
                                descricao: 'Deseja confirmar a compra com os itens selecionados?',
                                botoes: [
                                    {
                                        nome: 'Confirmar compra',
                                        acao: confirmarCompra
                                    }, {
                                        nome: 'Cancelar',
                                        acao: () => { }
                                    }
                                ]
                            })
                        }}
                    >
                        Confirmar compra
                    </button>
                </div>
            </section>
        </main>
    )
}