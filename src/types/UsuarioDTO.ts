import { Role } from "./Role"

export type UsuarioDTO = {
    id: string
    nome: string
    email: string
    role: Role
    ativo: boolean
}