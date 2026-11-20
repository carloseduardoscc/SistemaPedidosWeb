import { useCallback, useEffect, useRef, useState } from 'react'
// @ts-ignore
import './css/popup-informacao-compacto.css'

export type PopupInformacaoCompactoProps = {
    titulo: string
    descricao?: string
    corBackground?: string
    corFonte?: string
    duracaoMs?: number
    onClose?: () => void
}

export default function PopupInformacaoCompacto({
    titulo,
    descricao,
    corBackground="var(--color-success)",
    corFonte="var(--color-white)",
    duracaoMs = 5000,
    onClose,
}: PopupInformacaoCompactoProps) {
    const [isClosing, setIsClosing] = useState(false)
    const isClosingRef = useRef(false)
    const autoCloseTimeout = useRef<number | undefined>(undefined)
    const removeTimeout = useRef<number | undefined>(undefined)

    const handleClose = useCallback(() => {
        if (isClosingRef.current) return

        isClosingRef.current = true
        setIsClosing(true)
        removeTimeout.current = window.setTimeout(() => {
            onClose?.()
        }, 250)
    }, [onClose])

    useEffect(() => {
        autoCloseTimeout.current = window.setTimeout(handleClose, duracaoMs)

        return () => {
            window.clearTimeout(autoCloseTimeout.current)
            window.clearTimeout(removeTimeout.current)
        }
    }, [duracaoMs, handleClose])

    return (
        <aside
            className={`info-toast${isClosing ? ' info-toast--closing' : ''}`}
            role="status"
            aria-live="polite"
            style={{ backgroundColor: corBackground, color: corFonte }}
        >
            <div className="info-toast__content">
                <h2 className="info-toast__title">{titulo}</h2>
                {descricao && <p className="info-toast__description">{descricao}</p>}
            </div>
            <button
                className="info-toast__close"
                type="button"
                aria-label="Fechar notificação"
                onClick={handleClose}
            >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" />
                </svg>
            </button>
        </aside>
    )
}
