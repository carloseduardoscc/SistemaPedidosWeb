const numberFormatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    })

export default function formatarMoeda(valor: number){
    return numberFormatter.format(valor)
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'medium',
        timeStyle: 'short',
    })

export function formatarData(data: string) {
    if (!data) return null
    return dateFormatter.format(new Date(data))
}