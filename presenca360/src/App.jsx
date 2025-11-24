import React, { useState } from 'react';
import LoginProfessor from './LoginProfessor';
import PaginaProfessor from './PaginaProfessor';

export default function App() {
  // Estado para controlar se está logado ou não
  const [logado, setLogado] = useState(false);
  
  // NOVO: Estado para guardar QUEM é o professor (ID, Nome, Email)
  const [usuario, setUsuario] = useState(null);

  // Função chamada quando o LoginProfessor tiver sucesso
  const handleLoginSucesso = (dadosUsuario) => {
    console.log("Login realizado com sucesso!", dadosUsuario);
    setUsuario(dadosUsuario); // Salva os dados do professor
    setLogado(true);          // Troca a tela
  };

  return (
    <div>
      {/* Tela de Login */}
      {!logado && (
        <LoginProfessor onLogin={handleLoginSucesso} />
      )}

      {/* Tela do Professor (Agora passamos o objeto 'usuario') */}
      {logado && (
        <PaginaProfessor usuario={usuario} />
      )}
    </div>
  );
}