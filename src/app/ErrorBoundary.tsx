import { Component } from 'react'
import { type ReactNode } from 'react'
import TelaErro from '../pages/TelaErro.tsx'
import { ErroResumido } from '../service/errorLauncher.ts'

function formatarErro(erro: ErroResumido | any): ErroResumido | null {
  if (!(erro?.tipo || erro?.name)) {
    // Se o erro veio nulo, retorne nulo
    return null
  }
  const erroFormatado: ErroResumido = {
    tipo: erro.tipo || erro.name,
    mensagem: erro.mensagem || erro.message,
    urlAfterCloseError: erro.urlAfterCloseError
  }
  return erroFormatado
}
type Estado = {
  erro: null | ErroResumido
}

export class ErrorBoundary extends Component<{ children: ReactNode }, Estado> {
  state: { erro: null | ErroResumido } = { erro: null }

  static getDerivedStateFromError(erro: any) {
    return { erro: formatarErro(erro) }
  }

  componentDidMount() {
    window.addEventListener('error', this.handleWindowError)
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection)
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.handleWindowError)
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection)
  }

  componentDidCatch(erro: any, info: any) {
    console.error('Erro não tratado na aplicação:', erro, info)
  }

  handleWindowError = (evento: { error: ErroResumido, message: string }) => {
    this.setState({ erro: formatarErro(evento.error || evento.message) })
  }

  handleUnhandledRejection = async (evento: any) => {
    evento.preventDefault()
    try {
      const erro = await evento.reason
      console.error('ErrorBoundary - Rejeição não tratada na aplicação recebida:', erro)
      this.setState({ erro: formatarErro(erro) })
    } catch (erro) {
      console.error('ErrorBoundary - Rejeição não tratada na aplicação recebida:', erro)
      this.setState({ erro: formatarErro(erro) })
    }
  }

  handleFechar = () => {
    this.setState({ erro: null })
    const urlAfterCloseError = this.state.erro?.urlAfterCloseError
    if (urlAfterCloseError) {
      window.location.assign(urlAfterCloseError)
    }
  }

  render() {
    if (this.state.erro?.tipo) {
      return <TelaErro erro={this.state.erro} onClose={this.handleFechar} />
    }
    return this.props.children
  }
}