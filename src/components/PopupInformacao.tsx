import { MouseEventHandler, useEffect, useId, useRef } from 'react'
// @ts-ignore
import './css/popup-informacao.css'

export type PopupInformacaoBotao = {
    nome: string
    acao: MouseEventHandler<HTMLButtonElement>
}
export type PopupInformacaoProps = {
    titulo: string
    descricao: string
    botoes: PopupInformacaoBotao[]
    corBackground?: string
    corFonte?: string
    onClose?: () => void
}

export default function PopupInformacao({
    titulo,
    descricao,
    botoes,
    corBackground = 'var(--color-info)',
    corFonte = '#c2c3ff',
    onClose,
}: PopupInformacaoProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const titleId = useId()
    const descriptionId = useId()

    function handleButtonClick(
        botao: PopupInformacaoBotao,
        event: React.MouseEvent<HTMLButtonElement>,
    ) {
        try {
            botao.acao(event)
        } finally {
            onClose?.()
        }
    }

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        dialog.showModal()

        return () => {
            if (dialog.open) dialog.close()
            document.body.style.overflow = previousOverflow
        }
    }, [])

    return (
        <dialog
            ref={dialogRef}
            className="info-popup"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            style={{ backgroundColor: corBackground }}
            onCancel={event => {
                event.preventDefault()
                onClose?.()
            }}
        >
            <h2 id={titleId} className="info-popup__title">{titulo}</h2>
            <p id={descriptionId} className="info-popup__description" style={{color: corFonte}}>{descricao}</p>
            <div className="info-popup__buttons">
                {botoes.map((botao, index) => (
                    <button
                        key={`${botao.nome}-${index}`}
                        className="info-popup__button"
                        onClick={event => handleButtonClick(botao, event)}
                    >
                        {botao.nome}
                    </button>
                ))}
            </div>
        </dialog>
    )
}
