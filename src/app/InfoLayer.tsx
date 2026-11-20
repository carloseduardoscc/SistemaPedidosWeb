import { useCallback, useSyncExternalStore, type ReactNode } from 'react'
import PopupInformacaoCompacto, {
    type PopupInformacaoCompactoProps,
} from '../components/PopupInformacaoCompacto'
import PopupInformacao, {
    type PopupInformacaoProps,
} from '../components/PopupInformacao'

type CompactPopupOptions = Omit<PopupInformacaoCompactoProps, 'onClose'>
type ModalPopupOptions = Omit<PopupInformacaoProps, 'onClose'>

export type PopupOptions =
    | (CompactPopupOptions & { tipo?: 'compacto' })
    | (ModalPopupOptions & { tipo: 'modal' })

type Popup = {
    id: number
    props: PopupOptions
}

let popups: Popup[] = []
let nextPopupId = 0
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

function notify() {
    listeners.forEach(listener => listener())
}

export function addPopup(props: PopupOptions) {
    const id = nextPopupId++
    popups = [...popups, { id, props }]
    notify()
    return id
}

export function removePopup(id: number) {
    popups = popups.filter(popup => popup.id !== id)
    notify()
}

function PopupEntry({ id, props }: Popup) {
    const handleClose = useCallback(() => removePopup(id), [id])

    return props.tipo === 'modal'
        ? <PopupInformacao {...props} onClose={handleClose} />
        : <PopupInformacaoCompacto {...props} onClose={handleClose} />
}

export default function InfoLayer({ children }: { children: ReactNode }) {
    const currentPopups = useSyncExternalStore(subscribe, () => popups, () => [])

    return (
        <>
            {children}
            {currentPopups.map(popup => <PopupEntry key={popup.id} {...popup} />)}
        </>
    )
}
