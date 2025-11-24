import React, { useState, useEffect } from "react";

// Recebemos a prop 'usuario' para saber quem é o professor logado
export default function PaginaProfessor({ usuario }) {
  /* Telas: "menu" | "datas" | "lista" | "liberar" */
  const [tela, setTela] = useState("menu");

  /* Estados de Lógica Real */
  const [sessaoId, setSessaoId] = useState(null); // ID da aula no banco de dados
  const [senhaSala, setSenhaSala] = useState(""); // A senha visual (ex: 849201)
  
  /* Dados */
  const [datas, setDatas] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [listaPresenca, setListaPresenca] = useState([]); // Lista que vem do Banco

  /* Modais */
  const [modalAluno, setModalAluno] = useState(false);
  const [alunoBusca, setAlunoBusca] = useState("");
  const [modalLiberarApp, setModalLiberarApp] = useState(false);

  // --- EFEITO: Polling (Busca automática) ---
  // A cada 3 segundos, se tiver uma aula aberta, busca a lista no servidor
  useEffect(() => {
    if (!sessaoId) return;

    const intervalo = setInterval(async () => {
      try {
        const resposta = await fetch(`http://localhost:3000/api/presencas/${sessaoId}`);
        const dados = await resposta.json();
        
        if (dados.sucesso) {
          // Mapeia os dados do banco para o formato que sua tela espera
          const listaFormatada = dados.presencas.map(p => ({
            nome: p.nomeAluno,
            status: p.status,
            horario: p.horario
          }));
          setListaPresenca(listaFormatada);
        }
      } catch (err) {
        console.error("Erro ao buscar lista:", err);
      }
    }, 3000);

    return () => clearInterval(intervalo);
  }, [sessaoId]);

  /* --- FUNÇÕES --- */

  // 1. Iniciar Aula (Conecta no Backend)
  async function handleIniciar() {
    if (!usuario) {
      alert("Erro: Usuário não identificado. Faça login novamente.");
      return;
    }

    try {
      const resposta = await fetch('http://localhost:3000/api/abrir-sala', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professorId: usuario.id })
      });

      const dados = await resposta.json();
      
      setSenhaSala(dados.senha);     // Mostra a senha na tela
      setSessaoId(dados.sessaoId);   // Guarda o ID para buscar a lista depois
      
      // Já joga o professor para a tela de lista para ver os alunos entrando
      setTela("lista");
      setDataSelecionada("Aula Atual (Ao Vivo)"); 

    } catch (error) {
      console.error("Erro ao abrir sala:", error);
      alert("Erro ao conectar com o servidor.");
    }
  }

  function handleGerenciarPresenca() {
    setTela("datas");
  }

  function handleSelecionarData(d) {
    setDataSelecionada(d);
    // Aqui no futuro você buscaria o histórico do banco
    setListaPresenca([]); 
    setTela("lista");
  }

  function handleAbrirBuscaAluno() {
    setAlunoBusca("");
    setModalAluno(true);
  }

  function handleAtualizarStatusAluno(status) {
    if (!alunoBusca) return;
    
    // Atualiza visualmente (No futuro: enviar PUT para API)
    setListaPresenca(prev => {
      if (!prev || prev.length === 0) return prev;
      return prev.map(a =>
        a.nome && a.nome.toLowerCase() === alunoBusca.toLowerCase()
          ? { ...a, status }
          : a
      );
    });
    setModalAluno(false);
  }

  function handleFinalizarSessao() {
    setSenhaSala("");
    setSessaoId(null);
    setDataSelecionada(null);
    setListaPresenca([]);
    setTela("menu");
  }

  function handleDisponibilizarApp() {
    setModalLiberarApp(true);
  }

  function handleSalvarPresenca() {
    // Apenas fecha a visualização por enquanto
    setTela("menu");
  }

  /* --- RENDERIZAÇÃO (Seu Layout Original) --- */
  return (
    <div className="w-full min-h-screen flex bg-white text-black">
      {/* SIDEBAR */}
      <aside className="w-64 bg-red-600 p-6 flex flex-col justify-between rounded-r-xl">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl">👤</div>
            <div className="text-white">
              <div className="font-bold">{usuario ? usuario.nome : "Professor"}</div>
              <div className="text-xs opacity-80">Perfil</div>
            </div>
          </div>

          <button
            className="text-sm underline text-white hover:text-gray-200"
            onClick={handleFinalizarSessao}
          >
            finalizar sessão
          </button>
        </div>

        <div className="flex justify-center">
          <button
            className="bg-white text-black px-4 py-3 rounded-xl w-full text-center font-bold hover:bg-gray-100 transition"
            onClick={handleDisponibilizarApp}
          >
            disponibilizar app
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-6">
        <header className="flex items-center justify-between mb-6">
          <div className="flex gap-3">
            <button
              className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition"
              onClick={handleIniciar}
            >
              Iniciar
            </button>

            <button
              className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition"
              onClick={handleGerenciarPresenca}
            >
              Gerenciar presença
            </button>
          </div>

          {/* Logo Placeholder */}
          <div className="flex flex-col items-end">
             <h1 className="text-2xl font-bold text-red-600">Presença360</h1>
             <span className="text-xs text-gray-500">Sistema Escolar</span>
          </div>
        </header>

        <section className="flex gap-4 mb-6 items-center">
          <button className="bg-red-400 text-black px-6 py-2 rounded-xl font-bold">
            Lista de presença
          </button>

          <div className="bg-red-400 text-black px-6 py-2 rounded-xl font-bold flex items-center gap-2">
            <span>SENHA:</span>
            {senhaSala ? (
               <span className="font-mono text-2xl bg-white px-2 rounded">{senhaSala}</span>
            ) : (
               <span className="font-mono">---</span>
            )}
          </div>
        </section>

        {/* ÁREA DINÂMICA (TELAS) */}
        <section className="bg-gray-50 rounded-xl min-h-[400px] border border-gray-200">
          
          {tela === "menu" && (
            <div className="flex flex-col items-center justify-center h-full p-10 text-gray-400">
              <span className="text-4xl mb-4">🏫</span>
              <p>Clique em "Iniciar" para abrir uma nova aula</p>
              <p>ou "Gerenciar presença" para ver históricos.</p>
            </div>
          )}

          {tela === "datas" && (
            <div className="p-8">
              <h3 className="font-bold text-xl mb-4 text-red-600">Histórico de Aulas</h3>
              <div className="flex flex-col gap-2 max-w-md">
                <button className="text-left border bg-white p-3 rounded shadow-sm hover:bg-gray-50" onClick={() => handleSelecionarData("10/10/2023")}>
                  📅 10/10/2023 - Matemática
                </button>
                <button className="text-left border bg-white p-3 rounded shadow-sm hover:bg-gray-50" onClick={() => handleSelecionarData("12/10/2023")}>
                  📅 12/10/2023 - Matemática
                </button>
                
                <button className="mt-4 text-sm text-gray-500 underline" onClick={() => setTela("menu")}>
                  Voltar ao menu
                </button>
              </div>
            </div>
          )}

          {tela === "lista" && (
            <div className="p-6">
              <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-lg">DATA: {dataSelecionada || "Hoje"}</h3>
                   {sessaoId && <span className="bg-green-400 text-green-900 text-xs px-2 py-1 rounded font-bold animate-pulse">AO VIVO</span>}
                </div>

                <div className="bg-white text-black p-3 rounded-lg max-h-96 overflow-y-auto shadow-inner">
                  {listaPresenca.length === 0 ? (
                    <div className="text-gray-500 py-10 text-center flex flex-col items-center">
                        <span className="text-2xl mb-2">⏳</span>
                        <p>Aguardando alunos entrarem...</p>
                    </div>
                  ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs text-gray-400 border-b">
                                <th className="pb-2">NOME</th>
                                <th className="pb-2">HORÁRIO</th>
                                <th className="pb-2 text-right">STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listaPresenca.map((a, i) => (
                                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="py-3 font-medium">{a.nome}</td>
                                <td className="py-3 text-sm text-gray-500">
                                    {a.horario ? new Date(a.horario).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                                </td>
                                <td className="py-3 text-right">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        a.status === 'Presente' ? 'bg-green-100 text-green-700' : 
                                        a.status === 'Falta' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {a.status}
                                    </span>
                                </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  )}
                </div>

                <div className="mt-4 flex gap-3 flex-wrap">
                  <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-500 transition" onClick={handleAbrirBuscaAluno}>
                    🔍 Buscar/Editar
                  </button>

                  <button className="bg-green-500 text-white px-4 py-2 rounded-lg ml-auto font-bold hover:bg-green-600 transition" onClick={handleSalvarPresenca}>
                    💾 Salvar Lista
                  </button>
                </div>
              </div>
            </div>
          )}

          {tela === "liberar" && (
            <div className="p-10 flex flex-col items-center">
              <h3 className="font-bold text-xl mb-4">Liberar Aplicativo</h3>
              <p className="text-gray-500 mb-6 text-center max-w-sm">
                Isso permitirá que os alunos baixem ou atualizem o aplicativo na rede interna.
              </p>
              <button 
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition"
                onClick={() => setModalLiberarApp(true)}
              >
                Liberar Acesso Agora
              </button>
              <button className="mt-6 text-gray-500 underline" onClick={() => setTela("menu")}>
                Cancelar
              </button>
            </div>
          )}
        </section>
      </main>

      {/* MODAL ALUNO */}
      {modalAluno && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-2xl animate-fade-in">
            <h4 className="font-bold text-lg mb-4 text-gray-800">Gerenciar Aluno</h4>
            <input
              value={alunoBusca}
              onChange={e => setAlunoBusca(e.target.value)}
              placeholder="Digite o nome do aluno..."
              className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />

            <div className="grid grid-cols-3 gap-2 mb-4">
              <button className="py-2 bg-green-100 text-green-700 font-bold rounded hover:bg-green-200" onClick={() => handleAtualizarStatusAluno("Presente")}>Presente</button>
              <button className="py-2 bg-red-100 text-red-700 font-bold rounded hover:bg-red-200" onClick={() => handleAtualizarStatusAluno("Falta")}>Falta</button>
              <button className="py-2 bg-yellow-100 text-yellow-700 font-bold rounded hover:bg-yellow-200" onClick={() => handleAtualizarStatusAluno("Justificado")}>Atestado</button>
            </div>

            <button className="w-full py-2 bg-gray-100 text-gray-600 rounded font-medium hover:bg-gray-200" onClick={() => setModalAluno(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* MODAL LIBERAR APP */}
      {modalLiberarApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 text-center shadow-2xl">
            <div className="text-5xl mb-4">🚀</div>
            <h4 className="font-bold text-lg mb-2">App Liberado!</h4>
            <p className="text-gray-500 mb-6">O link para download foi enviado para a rede interna.</p>
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700" onClick={() => setModalLiberarApp(false)}>OK, Entendido</button>
          </div>
        </div>
      )}
    </div>
  );
}