import { Pagina } from "../types/PageType"
import { PedidoDTO } from "../types/PedidoDTOType"
import { PedidoDetalhadoDTO } from "../types/PedidoDetalhadoDTO"
import apiFetch from "./apiClient"

export async function apiBuscarMeusPedidos(signal?: AbortSignal): Promise<Pagina<PedidoDTO>> {
    console.log("usuarioService - Realizando requisição buscando pedidos do usuário autenticado")
    const response = await apiFetch(`/pedidos/meus-pedidos`, {
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        signal
    })
    const body  = await response.json()
    return body
}

export async function apiBuscarPedidos(signal?: AbortSignal): Promise<Pagina<PedidoDTO>> {
    console.log("usuarioService - Realizando requisição pesquisando pedidos")
    const response = await apiFetch(`/pedidos`, {
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        signal
    })
    const body  = await response.json()
    return body
}

export async function apiBuscarPedidoDetalhado(signal: AbortSignal, id: string): Promise<PedidoDetalhadoDTO> {
    const response = await apiFetch(`/pedidos/${id}`, {
        credentials: "include",
        signal
    })
    return response.json()
}

export async function apiTornarPedidoPago(id: string, signal?: AbortSignal) {
    console.log("usuarioService - Realizando requisição de pagamento de confirmação de compra de pedido")
    const response = await apiFetch(`/pedidos/${id}/pagar`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        signal
    })
}

export async function apiCancelarPedido(id: string, signal?: AbortSignal) {
    console.log("pedidoService - Realizando requisição de cancelamento de pedido")
    await apiFetch(`/pedidos/${id}/cancelar`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        signal
    })
}

export async function apiTornarPedidoEnviado(id: string, signal?: AbortSignal) {
    console.log("pedidoService - Realizando requisição para tornar pedido enviado")
    await apiFetch(`/pedidos/${id}/enviar`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        signal
    })
}

export async function apiTornarPedidoEntregue(id: string, signal?: AbortSignal) {
    console.log("pedidoService - Realizando requisição para tornar pedido entregue")
    await apiFetch(`/pedidos/${id}/tornar-entregue`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        signal
    })
}
