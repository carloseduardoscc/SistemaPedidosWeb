import apiFetch, { apiUrl } from "./apiClient";

export async function apiLogin(signal: AbortSignal, email: string, password: string) {
    console.log("authService - Realizando requisição de login")
    await apiFetch(`/auth/login`, {
        credentials: "include",
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "username": email,
            "password": password
        }),
        signal
    })
    setUsuarioLogadoTrue();
}

let sharedRefreshPromise: Promise<any> | undefined
export async function apiRefreshToken() {
    console.log("authService - Realizando requisição de rotação de token")
    let thisPromise: Promise<any>
    if (sharedRefreshPromise) {
        thisPromise = sharedRefreshPromise
    } else {
        thisPromise = apiFetch(`/auth/refresh`, {
            credentials: "include",
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            }
        })
        sharedRefreshPromise = thisPromise
    }
    await thisPromise
    setUsuarioLogadoTrue();
}

export async function apiLogout(): Promise<void> {
    console.log("authService - Realizando requisição de logout")
    await apiFetch(`/auth/logout`, {
        credentials: "include",
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
    })
    setUsuarioLogadoFalse()
}

export interface CadastrarUsuarioDTO {
    nome: string,
    email: string,
    senha: string,
    role: string
}
export async function apiCadastrar(signal: AbortSignal, cadastrarUsuarioDTO: CadastrarUsuarioDTO): Promise<void> {
    console.log("authService - Realizando requisição de cadastro")
    const response = await apiFetch(`/auth/cadastrar`, {
        credentials: "include",
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cadastrarUsuarioDTO),
        signal: signal
    })
}

export function apiLoginWithGoogle() {
    window.location.assign(`${apiUrl}/oauth2/authorization/google`)
}

export function setUsuarioLogadoTrue() {
    console.log("authService - setando usuario como logado")
    localStorage.setItem("is_user_logged", "true")
}

export function setUsuarioLogadoFalse() {
    console.log("authService - setando usuário como deslogado")
    localStorage.removeItem("is_user_logged")
}

export function isUsuarioLogado() {
    return localStorage.getItem("is_user_logged") === "true"
}