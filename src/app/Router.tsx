import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Produtos from "../pages/Produtos";
import Login from "../pages/Login";
import OAuthCallback from "../components/OAuthCallBack";
import CadastrarUsuario from "../pages/CadastrarUsuario";
import Usuarios from "../pages/Usuarios";
import Carrinho from "../pages/Carrinho";
import Pedidos from "../pages/Pedidos";

export default function Router() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/produtos/*" element={<Produtos />} />
            <Route path="/carrinho" element={<Carrinho />} />
            <Route path="/pedidos/*" element={<Pedidos />} />
            <Route path="*" element={<p>Página não encontrada.</p>} />
            <Route path="/login/*" element={<Login />} />
            <Route path="/cadastrar-usuario" element={<CadastrarUsuario />} />
            <Route path="/usuarios/*" element={<Usuarios />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
        </Routes>
    )
}