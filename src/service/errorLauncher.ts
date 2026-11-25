import { apiLogout, apiRefreshToken, setUsuarioLogadoFalse } from "./authService"

export interface ErroResumido {
    tipo: string | undefined
    mensagem: string | undefined
    urlAfterCloseError?: string | undefined
}

interface CampoErro {
    campo: string
    mensagem: string
}

interface ErroResposta {
    status: number
    mensagem: string
    erros: CampoErro[]
}

function isErroResposta(erro: any): boolean {
    return typeof erro.json === 'function' && erro.status
}

function montarMensagemUnprocessableEntity(erros: CampoErro[]): string {
    return erros
        .map(erro => `${erro?.campo || 'Campo'}: ${erro?.mensagem || 'Valor inválido'}`)
        .join('\n')
}

export async function errorLauncher(erro: any): Promise<ErroResumido | null> {
    console.error("errorLauncher - Tratando erro recebido")
    const erroResumido: ErroResumido = { tipo: undefined, mensagem: undefined }
    if (isErroResposta(erro)) {
        // Trata erros do servidor
        const erroResposta: ErroResposta = await erro.json()
        if (erroResposta.status === 401 && (erroResposta.mensagem === 'Access token inválido' || erroResposta.mensagem === 'Não autenticado / autenticação falhou')) {
            // Trata erro de autenticação
            try {
                console.error("errorLauncher - Erro de autenticação identificado, tentando renovar sessão...")
                // Tenta renovar a sessão
                await apiRefreshToken()
                // Caso renove a sessão com sucesso cancela o lançamento do erro
                window.location.href = window.location.href
                console.error("errorLauncher - Sessão expirada foi renovada, nulificando erro")
                erroResumido.tipo = undefined
                erroResumido.mensagem = undefined
                return erroResumido
            } catch (error: any) {
                try {
                    //Trata falha tentando renovar, fazendo logout e pedindo login novamente
                    await apiLogout()
                    erroResumido.tipo = "Sua sessão expirou!"
                    erroResumido.mensagem = "Faça login novamente"
                    erroResumido.urlAfterCloseError = "/login"
                    console.error("errorLauncher - Renovação de sessão expirada falhou, redirecionando para login")
                    return erroResumido
                } catch (error: any) {
                    // Trata erro ao falhar tentanto fazer logout
                    error = await error
                    erroResumido.tipo = "Erro ao realizar logout!"
                    erroResumido.mensagem = error?.mensagem ?? error
                    console.error("errorLauncher - Falha ao realizar logout")
                    return erroResumido
                }
            }
        } else if (erroResposta.status === 422) {
            // Trata erro com status 422
            erroResumido.tipo = erroResposta.mensagem;
            erroResumido.mensagem = montarMensagemUnprocessableEntity(erroResposta.erros) ?? '';
            console.error("errorLauncher - Tratado como erro de validação retornado pelo servidor: " + erroResumido.mensagem)
            return erroResumido
        } else {
            if (erroResposta.status === 401 && (erroResposta.mensagem === 'Não encontrado' || erroResposta.mensagem === 'Credenciais incorretas')) {
                apiLogout()
            }
            // Trata erro com qualquer outro status 4xx
            erroResumido.tipo = erroResposta.mensagem;
            erroResumido.mensagem = erroResposta.erros[0]?.mensagem ?? '';
            console.error("errorLauncher - Tratado como código de erro retornado pelo servidor: " + erroResposta.status)
            return erroResumido
        }
    } else if (erro.name === 'AbortError') {
        console.error("errorLauncher - Tratado como erro de aborto, nulificando erro")
        return null
    } else if (erro.message === 'Failed to fetch') {
        // Trata erro de conexão com o servidor
        erroResumido.tipo = 'Falha na conexão com o servidor'
        erroResumido.mensagem = 'Não foi possível interagir com o servidor no momento, tente novamente mais tarde.'
        erroResumido.urlAfterCloseError = "/"
        console.error("errorLauncher - Tratado como falha de conexão com servidor")
        return erroResumido
    } else {
        // Trata qualquer outro erro
        erroResumido.tipo = erro?.name || 'Erro'
        erroResumido.mensagem = erro?.message || (typeof erro === 'string' ? erro : 'Ocorreu um erro inesperado.')
        console.error("errorLauncher - Tratado como erro diverso")
        return erroResumido
    }
}