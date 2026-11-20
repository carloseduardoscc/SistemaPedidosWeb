// @ts-ignore
import './css/tela-erro.css'

export default function TelaErro({ erro, onClose }) {
    console.log(erro)

    return (
        <div className="overlay-erro">
            <div className="modal-erro">
                <h2>Ocorreu um erro</h2>
                <h3>{erro.tipo}</h3>

                <p>{erro.mensagem}</p>

                <button autoFocus onClick={onClose}>
                    Fechar
                </button>
            </div>
        </div>
    );
}