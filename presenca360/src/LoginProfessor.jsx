import React, { useState } from "react";

export default function LoginProfessor({ onLogin }) {
  // 1. Estados para guardar o texto digitado
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  // Função disparada ao clicar no botão
  const handleEntrar = async (e) => {
    e.preventDefault(); // Impede a página de recarregar
    setErro(""); // Limpa mensagens de erro antigas

    try {
      // 2. Conecta com o SEU servidor Node.js
      const resposta = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });

      const dados = await resposta.json();

      if (dados.sucesso) {
        // 3. Se o servidor disser "OK", avisa o App.jsx para trocar a tela
        // e passa os dados do professor (nome, id)
        onLogin(dados.usuario);
      } else {
        // Se a senha estiver errada
        setErro("Email ou senha incorretos!");
      }

    } catch (error) {
      console.error("Erro no login:", error);
      setErro("Erro ao conectar com o servidor. O backend está rodando?");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row">
      {/* Imagem lateral (Mantivemos igual) */}
      <div className="hidden md:flex w-1/2 bg-red-600 items-center justify-center relative">
        <img src="img/paginainicial.png" alt="Computador" className="w-3/4 rounded-lg" />
        <h1 className="absolute top-10 left-10 text-white text-4xl font-extrabold bg-red-800 px-4 py-1 rounded-md">
          SENAI
        </h1>
      </div>

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-white">
        <img src="img/logo.png" alt="Presença 360" className="w-40 mb-6" />

        <div className="bg-white border rounded-2xl shadow-md p-6 w-80 flex flex-col items-center">
          <form className="w-full flex flex-col gap-3">
            
            {/* Mensagem de Erro (Só aparece se errar a senha) */}
            {erro && <p className="text-red-500 text-sm font-bold text-center">{erro}</p>}

            <label className="text-sm font-semibold text-center">Endereço de Email</label>
            <input 
              type="email" 
              className="w-full rounded-full border px-3 py-2 text-sm" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: prof@senai.br"
            />

            <label className="text-sm font-semibold text-center">Senha</label>
            <input 
              type="password" 
              className="w-full rounded-full border px-3 py-2 text-sm" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            {/* O campo "Nome" foi removido pois no login só se pede email e senha */}

            <button 
              onClick={handleEntrar}
              className="mt-3 bg-red-600 text-white font-semibold rounded-full py-2 text-center hover:bg-red-700 transition"
            >
              entrar
            </button>
          </form>
        </div>

        <button className="mt-4 text-sm underline">Esqueci a senha</button>
      </div>
    </div>
  );
}