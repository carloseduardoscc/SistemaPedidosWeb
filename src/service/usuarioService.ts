import { UsuarioDTO } from "../types/UsuarioDTO"
import type { Pagina } from "../types/PageType"
import apiFetch from "./apiClient"

export async function apiListarUsuarios(signal: AbortSignal, nome: string, email: string, page: number, size: number): Promise<Pagina<UsuarioDTO>> {
    console.log("usuarioService - Realizando requisição de listagem de usuários")
    const parametros = new URLSearchParams({ nome, email, page: String(page), size: String(size) })
    const response = await apiFetch(`/usuarios?${parametros}`, {
        credentials: "include",
        signal
    })
    return response.json()
}

export async function apiMe(signal?: AbortSignal) {
    console.log("usuarioService - Realizando requisição me")
    const response = await apiFetch(`/usuarios/me`, {
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        signal
    })
    const body = await response.json()
    return body
}

export async function apiBuscarUsuario(id: string, signal?: AbortSignal): Promise<UsuarioDTO> {
    console.log("usuarioService - Realizando requisição de busca de usuário")
    const response = await apiFetch(`/usuarios/${id}`, {
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        signal
    })
    const body = await response.json()
    return body
}

type AtualizarDadosUsuarioDTO = {
    nome: string
}
export async function apiAtualizarUsuario(signal: AbortSignal, dadosUsuario: AtualizarDadosUsuarioDTO, usuarioId: string) {
    console.log("authService - Realizando requisição de atualização dos dados de usuário")
    await apiFetch(`/usuarios/${usuarioId}`, {
        credentials: "include",
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosUsuario),
        signal
    })
}

export async function apiAbrirNovoPedido(signal: AbortSignal, usuarioId: string): Promise<string> {
    console.log("authService - Realizando requisição de abertura de um novo pedido")
    const response = await apiFetch(`/usuarios/${usuarioId}/pedidos`, {
        credentials: "include",
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        signal
    })
    const body = await response.json()
    const pedidoId = body.id
    return pedidoId
}

export async function apiDesativarUsuario(signal: AbortSignal, usuarioId: string) {
    console.log("authService - Realizando requisição de desativação de usuário")
    await apiFetch(`/usuarios/${usuarioId}/desativar`, {
        credentials: "include",
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json'
        },
        signal
    })
}

export async function apiAtivarUsuario(signal: AbortSignal, usuarioId: string) {
    console.log("authService - Realizando requisição de ativação de usuário")
    await apiFetch(`/usuarios/${usuarioId}/ativar`, {
        credentials: "include",
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json'
        },
        signal
    })
}