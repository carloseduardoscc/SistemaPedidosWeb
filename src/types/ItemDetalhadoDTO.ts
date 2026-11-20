import { ProdutoDTO } from "./ProdutoDTO"

export type ItemDetalhadoDTO = {
    id: string
    pedidoId: string
    produto: ProdutoDTO
    nomeProduto: string
    valorTotal: number
    quantidade: number
}