import { AtualizacoesDeStatus } from "./AtualizacoesDeStatus"
import { ItemDetalhadoDTO } from "./ItemDetalhadoDTO"
import { ItemResumoDTO } from "./ItemResumoDTO"
import { StatusPedido } from "./StatusPedido"
import { UsuarioDTO } from "./UsuarioDTO"

export type PedidoDetalhadoDTO = {
    id: string
    dataHoraPedido: string
    status: StatusPedido
    atualizacoesDeStatus: AtualizacoesDeStatus[]
    totalItens: number
    valorTotal: number
    responsavel: UsuarioDTO
    cliente: UsuarioDTO
    itens: ItemDetalhadoDTO[]
}