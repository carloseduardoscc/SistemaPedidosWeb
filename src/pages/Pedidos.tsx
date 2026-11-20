import { useEffect, useRef, useState } from 'react'
import { Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
// @ts-ignore
import './css/pedidos.css'
import { PedidoDTO } from '../types/PedidoDTOType'
import { PedidoDetalhadoDTO } from '../types/PedidoDetalhadoDTO'
import { StatusPedido } from '../types/StatusPedido'
import { apiBuscarMeusPedidos, apiBuscarPedidoDetalhado, apiBuscarPedidos, apiCancelarPedido, apiTornarPedidoEntregue, apiTornarPedidoEnviado } from '../service/pedidoService'
import formatarMoeda, { formatarData } from '../util/Formatador'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { addPopup } from '../app/InfoLayer'
import { useAuth } from '../contexts/AuthContext'
import { UsuarioDTO } from '../types/UsuarioDTO'
import ProtectedComponent from '../app/ProtectedComponent'

const statusLabels: Record<StatusPedido, string> = {
    CANCELADO: 'Cancelado',
    ENTREGUE: 'Entregue',
    ENVIADO: 'Enviado',
    PAGO: 'Pago',
    PENDENTE: 'Pendente',
}

function PedidoNaLista({ pedido }: { pedido: PedidoDTO }) {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const buttonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (searchParams.get('foco') === pedido.id) {
            buttonRef.current?.focus()
            buttonRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            })
        }
    }, [pedido.id, searchParams])

    return (
        <li className="pedido-lista__item">
            <button
                ref={buttonRef}
                type="button"
                className="pedido-lista__link"
                onClick={() => navigate(`/pedidos/${pedido.id}`)}
            >
                <span className="pedido-lista__resumo">
                    <strong>Pedido de {pedido.itens.slice(0, 3).map(i => i.nomeProduto).join(", ")}</strong>
                    <span>{`Última atualização: ${statusLabels[pedido.status]} em ${formatarData(pedido.dataHoraPedido)}`}</span>
                    <ProtectedComponent allowed={['ADMIN', 'ENTREGADOR']}>
                        <span>{'Cliente: ' + pedido.nomeCliente}</span>
                    </ProtectedComponent>
                </span>
                <span className={`pedido-status pedido-status--${pedido.status.toLowerCase()}`}>
                    {statusLabels[pedido.status]}
                </span>
            </button>
        </li>
    )
}

function ListaPedidos() {
    const [pedidos, setPedidos] = useState<PedidoDTO[]>([])
    const [carregando, setCarregando] = useState(true)
    const { userData } = useAuth()

    useEffect(() => {
        const controller = new AbortController()

        async function carregarPedidos() {
            try {
                const pagina = userData?.role === 'ADMIN' ? await apiBuscarPedidos() : await apiBuscarMeusPedidos(controller.signal)

                const pedidos = pagina.content.filter(p => p.status !== "PENDENTE")
                const pedidosOrdenados = pedidos.sort((a, b) => new Date(b.dataHoraPedido).getTime() - new Date(a.dataHoraPedido).getTime())
                setPedidos(pedidosOrdenados)
            } finally {
                setCarregando(false)
            }
        }

        carregarPedidos()
        return () => controller.abort()
    }, [])

    return (
        <section className="pedidos-card" aria-labelledby="pedidos-lista-titulo">
            <div className="pedidos-card__heading">
                <h2 id="pedidos-lista-titulo">
                    {userData?.role === 'ADMIN' ? 'Pedidos' : 'Seus pedidos'}
                </h2>
                <p>Selecione um pedido para acompanhar os itens e atualizações.</p>
            </div>
            {carregando ? (
                <p className="pedidos-mensagem" role="status">Carregando pedidos...</p>
            ) : pedidos.length === 0 ? (
                <p className="pedidos-mensagem">Você ainda não fez nenhum pedido.</p>
            ) : (
                <ul className="pedido-lista" >
                    {pedidos.map(pedido => <PedidoNaLista key={pedido.id} pedido={pedido} />)}
                </ul>
            )}
        </section>
    )
}

function DetalhePedido() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { userData } = useAuth()

    const [pedido, setPedido] = useState<PedidoDetalhadoDTO | null>(null)
    const [carregando, setCarregando] = useState(true)
    useEffect(() => {
        const controller = new AbortController()
        async function carregarPedido() {
            try {
                if (!id) return
                const resultado = await apiBuscarPedidoDetalhado(controller.signal, id.toString())
                setPedido(resultado)
            } finally {
                setCarregando(false)
            }
        }

        carregarPedido()
        return () => controller.abort()
    }, [id])

    const [cancelamentoSolicitado, setCancelamentoSolicitado] = useState(false)
    const [cancelando, setCancelando] = useState(false)
    useEffect(() => {
        if (!cancelamentoSolicitado || !pedido) return

        const controller = new AbortController()
        async function cancelarPedido() {
            setCancelando(true)
            try {
                await apiCancelarPedido(pedido!.id, controller.signal)
                const pedidoAtualizado = await apiBuscarPedidoDetalhado(controller.signal, pedido!.id)
                setPedido(pedidoAtualizado)
                addPopup({ titulo: 'Pedido cancelado com sucesso!' })
            } finally {
                if (!controller.signal.aborted) {
                    setCancelando(false)
                    setCancelamentoSolicitado(false)
                }
            }
        }

        cancelarPedido()
        return () => controller.abort()
    }, [cancelamentoSolicitado])

    const [envioSolicitado, setEnvioSolicitado] = useState(false)
    const [enviando, setEnviando] = useState(false)
    useEffect(() => {
        if (!envioSolicitado || !pedido) return

        const controller = new AbortController()
        async function tornarPedidoEnviado() {
            setEnviando(true)
            try {
                await apiTornarPedidoEnviado(pedido!.id, controller.signal)
                const pedidoAtualizado = await apiBuscarPedidoDetalhado(controller.signal, pedido!.id)
                setPedido(pedidoAtualizado)
                addPopup({ titulo: 'Pedido marcado como enviado com sucesso!' })
                navigate('../')
            } finally {
                if (!controller.signal.aborted) {
                    setEnviando(false)
                    setEnvioSolicitado(false)
                }
            }
        }

        tornarPedidoEnviado()
        return () => controller.abort()
    }, [envioSolicitado])

    const [entregaSolicitada, setEntregaSolicitada] = useState(false)
    const [entregando, setEntregando] = useState(false)
    useEffect(() => {
        if (!entregaSolicitada || !pedido) return

        const controller = new AbortController()
        async function tornarPedidoEntregue() {
            setEntregando(true)
            try {
                await apiTornarPedidoEntregue(pedido!.id, controller.signal)
                const pedidoAtualizado = await apiBuscarPedidoDetalhado(controller.signal, pedido!.id)
                setPedido(pedidoAtualizado)
                addPopup({ titulo: 'Pedido marcado como entregue com sucesso!' })
                navigate('../')
            } finally {
                if (!controller.signal.aborted) {
                    setEntregando(false)
                    setEnvioSolicitado(false)
                }
            }
        }

        tornarPedidoEntregue()
        return () => controller.abort()
    }, [entregaSolicitada])

    return (
        <section className="pedidos-card pedido-detalhe" aria-labelledby="pedido-detalhe-titulo">
            <button
                className="pedido-detalhe__voltar"
                type="button"
                onClick={() => navigate('../')}
            >
                <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
            </button>
            {carregando ? (
                <p className="pedidos-mensagem" role="status">Carregando pedido...</p>
            ) : pedido ? (
                <>
                    <header className="pedido-detalhe__heading">
                        <div>
                            <h2 id="pedido-detalhe-titulo">Detalhes do pedido</h2>
                            <p>{statusLabels[pedido.status]} em {formatarData(pedido.dataHoraPedido)}</p>
                        </div>
                        <span className={`pedido-status pedido-status--${pedido.status.toLowerCase()}`}>
                            {statusLabels[pedido.status]}
                        </span>
                    </header>
                    <div className="pedido-detalhe__acoes">
                        <div className='pedido-acoes'>
                            <ProtectedComponent
                                allowed={['CLIENTE', 'ADMIN']}
                            >
                                <button
                                    className="pedido-cancelar"
                                    type="button"
                                    disabled={cancelando || pedido.status !== "PAGO" }
                                    onClick={
                                        () => addPopup({
                                            tipo: 'modal',
                                            titulo: 'Cancelar pedido?',
                                            descricao: 'Tem certeza de que deseja cancelar este pedido? Esta ação não pode ser desfeita.',
                                            botoes: [
                                                {
                                                    nome: 'Sim, cancelar pedido',
                                                    acao: () => setCancelamentoSolicitado(true),
                                                },
                                                {
                                                    nome: 'Voltar',
                                                    acao: () => { },
                                                },
                                            ],
                                        })
                                    }
                                >
                                    {cancelando ? 'Cancelando...' : 'Cancelar pedido'}
                                </button>
                            </ProtectedComponent>
                            <ProtectedComponent
                                allowed={['LOJISTA', 'ADMIN']}
                            >
                                <button
                                    className="pedido-enviar"
                                    type="button"
                                    disabled={enviando || pedido.status !== "PAGO"}
                                    onClick={
                                        () => addPopup({
                                            tipo: 'modal',
                                            titulo: 'Marcar pedido como enviado?',
                                            descricao: 'Confirme se o pedido foi separado e retirado pelo entregador',
                                            botoes: [
                                                {
                                                    nome: 'Sim, o pedido foi retirado',
                                                    acao: () => setEnvioSolicitado(true),
                                                },
                                                {
                                                    nome: 'Ainda não',
                                                    acao: () => { },
                                                },
                                            ],
                                        })
                                    }
                                >
                                    {enviando ? 'Tornando pedido enviado...' : 'Tornar pedido enviado'}
                                </button>
                            </ProtectedComponent>
                            <ProtectedComponent
                                allowed={['ENTREGADOR', 'ADMIN']}
                            >
                                <button
                                    className="pedido-entregar"
                                    type="button"
                                    disabled={entregando || pedido.status !== "ENVIADO"}
                                    onClick={
                                        () => addPopup({
                                            tipo: 'modal',
                                            titulo: 'O pedido foi entregue?',
                                            descricao: 'Confirme se o pedido foi entregue no endereço do cliente',
                                            botoes: [
                                                {
                                                    nome: 'Sim, o pedido foi entregue!',
                                                    acao: () => setEntregaSolicitada(true),
                                                },
                                                {
                                                    nome: 'Ainda não',
                                                    acao: () => { },
                                                },
                                            ],
                                        })
                                    }
                                >
                                    {enviando ? 'Tornando pedido enviado...' : 'Tornar pedido entregue'}
                                </button>
                            </ProtectedComponent>
                        </div>
                    </div>
                    <dl className="pedido-detalhe__resumo">
                        {pedido.responsavel ?
                            <div>
                                <dt>Responsável</dt>
                                <dd>{pedido.responsavel.nome}</dd>
                            </div> : null
                        }
                        <div>
                            <dt>Total de itens</dt>
                            <dd>{pedido.totalItens}</dd>
                        </div>
                        <div>
                            <dt>Valor total</dt>
                            <dd>{formatarMoeda(pedido.valorTotal)}</dd>
                        </div>
                        {userData?.role === 'ADMIN' ?
                            <div>
                                <dt>Cliente</dt>
                                <dd>{`${pedido.cliente.nome} - ${pedido.cliente.email}`}</dd>
                            </div> : null}
                    </dl>

                    <section className="pedido-detalhe__secao" aria-labelledby="pedido-itens-titulo">
                        <h3 id="pedido-itens-titulo">Itens do pedido</h3>
                        {pedido.itens.length === 0 ? (
                            <p className="pedidos-mensagem">Este pedido não possui itens.</p>
                        ) : (
                            <ul className="pedido-itens">
                                {pedido.itens.map(item => (
                                    <li className="pedido-itens__item" key={item.id}>
                                        <div>
                                            <strong><a onClick={() => navigate("/produtos/" + item.produto.id)}>{item.nomeProduto}</a></strong>
                                            <span>Quantidade: {item.quantidade}</span>
                                            <span>Preço un.: {formatarMoeda(item.produto.precoUnitario)}</span>
                                        </div>
                                        <strong>{formatarMoeda(item.valorTotal)}</strong>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="pedido-detalhe__secao" aria-labelledby="pedido-atualizacoes-titulo">
                        <h3 id="pedido-atualizacoes-titulo">Atualizações</h3>
                        {pedido.atualizacoesDeStatus.length === 0 ? (
                            <p className="pedidos-mensagem">Ainda não há atualizações de status.</p>
                        ) : (
                            <ol className="pedido-atualizacoes">
                                {pedido.atualizacoesDeStatus.map((atualizacao, index) => (
                                    <li key={`${atualizacao.dataHora}-${index}`}>
                                        <span className={`pedido-status pedido-status--${atualizacao.status.toLowerCase()}`}>
                                            {statusLabels[atualizacao.status]}
                                        </span>
                                        <time dateTime={atualizacao.dataHora}>{formatarData(atualizacao.dataHora)}</time>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </section>
                </>
            ) : null}
        </section>
    )
}

export default function Pedidos() {
    let { userData }: { userData: UsuarioDTO | null } = useAuth()
    return (
        <main className="pedidos-page">
            <header className="pedidos-page__header">
                <h1>Pedidos</h1>
                <p>{
                    userData?.role === 'CLIENTE' ? 'Acompanhe o histórico e os detalhes das suas compras.'
                        : userData?.role === 'LOJISTA' ? 'Acompanhe os pedidos pendentes de separação'
                            : userData?.role === 'ENTREGADOR' ? 'Acompanhe os pedidos pendentes de entrega'
                                : userData?.role === 'ADMIN' ? 'Acompanhe todos os pedidos aqui'
                                    : 'o histórico e os detalhes dos pedidos'
                }</p>
            </header>
            <Routes>
                <Route index element={<ListaPedidos />} />
                <Route path=":id" element={<DetalhePedido />} />
            </Routes>
        </main>
    )
}
