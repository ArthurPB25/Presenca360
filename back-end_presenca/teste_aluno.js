const mqtt = require('mqtt');

// ==========================================================
// ⚙️ CONFIGURAÇÃO DO ROBÔ (MUDE AQUI)
// ==========================================================

// 1. Endereço IP do Computador onde está o Broker (Mosquitto)
// IMPORTANTE: Se o Broker estiver neste mesmo PC, pode usar 'localhost'.
// Se estiver em outro PC, coloque o IP dele (ex: '192.168.0.15').
const BROKER_HOST = '192.168.0.101'; 

// 2. A SENHA da sala que está aberta AGORA no site do professor
// (Olhe para o navegador e copie o número que apareceu lá)
const SENHA_DA_SALA = '993018'; 

// 3. Dados do Aluno Falso (Pode mudar o nome se quiser testar outros)
const ALUNO_SIMULADO = {
  id: "aluno_robot_01",
  nome: "João Teste da Silva", // O nome que vai aparecer na lista
  ip: "192.168.0.99"           // IP falso simulando um celular
};

// ==========================================================
// 🤖 CÓDIGO DO ROBÔ (NÃO PRECISA MEXER)
// ==========================================================

const topicoEnvio = 'presenca360/registrar';

console.log(`🤖 Robô Iniciado!`);
console.log(`🔌 Tentando conectar em: ${BROKER_HOST}...`);

const client = mqtt.connect(`mqtt://${BROKER_HOST}:1883`);

client.on('connect', () => {
  console.log('✅ Conectado ao Wi-Fi da Escola (Broker MQTT)!');

  // Cria o pacote de dados igual ao que o App Android enviaria
  const payload = JSON.stringify({
    alunoId: ALUNO_SIMULADO.id,
    nomeAluno: ALUNO_SIMULADO.nome,
    senhaDigitada: SENHA_DA_SALA,
    ip: ALUNO_SIMULADO.ip
  });

  // Envia a presença
  console.log(`📤 Enviando presença...`);
  console.log(`   Aluno: ${ALUNO_SIMULADO.nome}`);
  console.log(`   Senha: ${SENHA_DA_SALA}`);

  client.publish(topicoEnvio, payload, () => {
    console.log("🚀 Enviado com sucesso!");
    
    // Espera um pouco para ver se recebe confirmação (opcional) e desliga
    setTimeout(() => {
      console.log("👋 Robô desconectando.");
      client.end();
      process.exit();
    }, 3000);
  });
});

client.on('error', (erro) => {
  console.error(`❌ Erro de conexão: ${erro.message}`);
  console.log(`👉 Dica: Verifique se o IP '${BROKER_HOST}' está correto e se o Firewall do outro PC está liberado.`);
  client.end();
});