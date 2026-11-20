import { errorLauncher } from "./errorLauncher"

export const apiUrl = import.meta.env.VITE_API_URL

export default async function apiFetch(url: string, options: Partial<RequestInit> = {}): Promise<Response> {

    const begintimestamp = Date.now()

    try {
        console.log("apiClient - Requisitando " + (options?.method || "GET") + " em " + url + "...")

        const response: Response = await fetch(`${apiUrl}${url}`, {
            ...options,
            credentials: "include"
        })

        if (!response.ok) throw response

        console.log(`apiClient - Sucesso em ${(options?.method || "GET")} em ${url}! A requisição durou ${(Date.now() - begintimestamp)} milisegundos`)

        return response

    } catch (error: any) {

        if (error?.name === 'AbortError') {
            console.error(`apiClient - Requisição em ${url} abortada`);
        } else {
            console.error(`apiClient - Erro ao realizar requisição, ela durou ${(Date.now() - begintimestamp)} milisegundos` + url);
        }

        throw errorLauncher(error)

    } finally {

    }
}

