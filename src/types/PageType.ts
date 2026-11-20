type StatusPedido = "PENDENTE" | "CONFIRMADO" | "CANCELADO"

type PedidoResumo = {
    id: string
    dataHoraPedido: string
    status: StatusPedido
}

type Ordenacao = {
    empty: boolean
    sorted: boolean
    unsorted: boolean
}

type Pageable = {
    offset: number
    pageNumber: number
    pageSize: number
    paged: boolean
    sort: Ordenacao
    unpaged: boolean
}

export type Pagina<T> = {
    content: T[]
    empty: boolean
    first: boolean
    last: boolean
    number: number
    numberOfElements: number
    pageable: Pageable
    size: number
    sort: Ordenacao
    totalElements: number
    totalPages: number
}

type PaginaPedidos = Pagina<PedidoResumo>