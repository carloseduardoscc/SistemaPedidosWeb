import apiFetch from "./apiClient"

export type AtualizarItemCommand = {
    quantidade: number
}
export async function apiAtualizarItem(AtualizarItemCommand: AtualizarItemCommand, itemId: string, signal?: AbortSignal ) {
    console.log("itemService - Realizando requisição de atualização de um item")
    await apiFetch(`/itens-pedido/${itemId}`, {
        credentials: "include",
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(AtualizarItemCommand),
        signal
    })
}

export async function apiDeletarItem(itemId: string, signal?: AbortSignal ) {
    console.log("itemService - Realizando requisição para deletar um item")
    await apiFetch(`/itens-pedido/${itemId}`, {
        credentials: "include",
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json'
        },
        signal
    })
}