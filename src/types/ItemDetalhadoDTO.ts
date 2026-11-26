import { ProdutoDTO } from "./ProdutoDTO"

export type ItemDetalhadoDTO = {
    itemId: string
    pedidoId: string
    produto: ProdutoDTO
    nomeProduto: string
    valorTotal: number
    quantidade: number
    precoUnitario: number
}