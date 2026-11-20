import type { Pagina } from "../types/PageType";
import type { ProdutoDTO } from "../types/ProdutoDTO";
import apiFetch from "./apiClient";

export type { ProdutoDTO } from "../types/ProdutoDTO";

export async function apiBuscarProduto(signal: AbortSignal, id: string) {
        console.log("produtoService - Realizando requisição de buscar produto")
        const response = await apiFetch(`/produtos/${id}`, {
            credentials: "include",
            signal
        })
        if (!response.ok) throw response

        const body = await response.json();
        return body
}

export async function apiBuscarProdutos(signal: AbortSignal): Promise<Pagina<ProdutoDTO>> {
    console.log("produtoService - Realizando requisição de buscar produtos")
    const response = await apiFetch(`/produtos`, {
        credentials: "include",
        signal
    })
    const body = await response.json();
    return body;
}

export type AdicionarItemPedidoDTO = {
    produtoId: string
    quantidade: number
}
export async function apiAdicionarItemAoPedido(signal: AbortSignal, idPedido: string, adicionarItemPedidoDTO: AdicionarItemPedidoDTO) {
    console.log("authService - Realizando requisição de adicionar item ao pedido")
    await apiFetch(`/pedidos/${idPedido}/itens-pedido`, {
        credentials: "include",
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(adicionarItemPedidoDTO),
        signal
    })
} 

export type CadastrarProdutoDTO = Omit<ProdutoDTO, "id"> & {
    id: null
}
export async function apiCadastrarProduto(signal: AbortSignal, produtoDTO: CadastrarProdutoDTO) {
    console.log("authService - Realizando requisição de cadastro de produto")
    await apiFetch(`/produtos`, {
        credentials: "include",
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(produtoDTO),
        signal
    })
} 

export async function apiAtualizarProduto(signal: AbortSignal, produtoDTO: ProdutoDTO) {
    console.log("authService - Realizando requisição de atualização de produto")
    await apiFetch(`/produtos/${produtoDTO.id}`, {
        credentials: "include",
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(produtoDTO),
        signal
    })
} 
export async function apiDeletarProduto(signal: AbortSignal, id: string) {
    console.log("authService - Realizando requisição de deletar produto")
    await apiFetch(`/produtos/${id}`, {
        credentials: "include",
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json'
        },
        signal
    })
} 