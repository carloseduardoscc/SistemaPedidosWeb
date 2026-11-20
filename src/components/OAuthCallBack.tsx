import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setUsuarioLogadoTrue } from "../service/authService"

export default function OAuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        console.log("OAuthCallBack - callback recebido e usuário logado")
        navigate("/", { replace: true });
        setUsuarioLogadoTrue()
    }, [navigate]);

    return <p>Autenticando usuário...</p>;
}