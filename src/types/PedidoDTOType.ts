import { ItemResumoDTO } from "./ItemResumoDTO"
import { StatusPedido } from "./StatusPedido"

export type PedidoDTO = {
    id: string
    dataHoraPedido: string
    status: StatusPedido
    itens: ItemResumoDTO[]
    nomeCliente: string
}