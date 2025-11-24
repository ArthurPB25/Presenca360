require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mqtt = require('mqtt'); 
const { Usuario, Sessao } = require('./models');

const app = express();
app.use(express.json());
app.use(cors()); 

// --- CONFIGURAÇÃO MONGODB ---
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/presenca360";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Conectado!'))
  .catch(err => console.error('❌ Erro no MongoDB:', err));

// ==========================================================
// 📡 CONFIGURAÇÃO MQTT (Backend <-> Broker Outro PC)
// ==========================================================

// ⚠️ SUBSTITUA PELO IP DO OUTRO COMPUTADOR (ONDE ESTÁ O MOSQUITTO)
const BROKER_HOST = '192.168.0.101'; // <--- MUDE AQUI

// O Backend se conecta via TCP padrão (porta 1883)
console.log(`🔌 Tentando conectar ao Broker em: ${BROKER_HOST}...`);
const mqttClient = mqtt.connect(`mqtt://${BROKER_HOST}:1883`);

mqttClient.on('connect', () => {
  console.log(`✅ Backend CONECTADO ao Broker MQTT!`);
  
  // O servidor assina o tópico para ouvir os alunos
  mqttClient.subscribe('presenca360/registrar');
});

mqttClient.on('error', (err) => {
  console.log(`❌ Erro MQTT: ${err.message}. Verifique o IP ou Firewall.`);
});

// Quando chega uma mensagem do aluno (ou do robô de teste)
mqttClient.on('message', async (topic, message) => {
  if (topic === 'presenca360/registrar') {
    try {
      const dados = JSON.parse(message.toString());
      console.log(`📩 Recebido de: ${dados.nomeAluno} | Senha: ${dados.senhaDigitada}`);

      // 1. Busca sessão ativa com a senha informada
      const sessao = await Sessao.findOne({ 
        codigoSenha: dados.senhaDigitada, 
        ativa: true 
      });

      if (sessao) {
        // Verifica se o aluno já marcou presença
        const jaRegistrou = sessao.presencas.some(p => p.nomeAluno === dados.nomeAluno);

        if (!jaRegistrou) {
          // 2. Registra no Banco
          sessao.presencas.push({
            alunoId: dados.alunoId, 
            nomeAluno: dados.nomeAluno,
            horario: new Date(),
            ipConexao: dados.ip,
            status: 'Presente'
          });
          await sessao.save();
          console.log(`✅ Presença salva no banco: ${dados.nomeAluno}`);
        } else {
          console.log(`⚠️ ${dados.nomeAluno} já estava na lista.`);
        }

        // 3. Avisa o ALUNO (Confirmação)
        const respostaAluno = JSON.stringify({ sucesso: true, mensagem: "Presença Registrada!" });
        mqttClient.publish(`presenca360/confirmacao/${dados.alunoId}`, respostaAluno);

      } else {
        console.log(`❌ Senha inválida enviada por ${dados.nomeAluno}: ${dados.senhaDigitada}`);
        const erroMsg = JSON.stringify({ sucesso: false, erro: "Senha Inválida" });
        mqttClient.publish(`presenca360/confirmacao/${dados.alunoId}`, erroMsg);
      }

    } catch (err) {
      console.error("Erro ao processar mensagem MQTT:", err);
    }
  }
});

// ==========================================================
// 🌐 ROTAS HTTP (Frontend <-> Backend)
// ==========================================================

// Rota 1: Login
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  const user = await Usuario.findOne({ email, senha });
  
  if (!user) {
    return res.status(401).json({ erro: "Credenciais inválidas" });
  }

  res.json({ 
    sucesso: true, 
    usuario: { id: user._id, nome: user.nome, tipo: user.tipo } 
  });
});

// Rota 2: Abrir Sala (Gera Senha)
app.post('/api/abrir-sala', async (req, res) => {
  const { professorId } = req.body;
  // Gera senha de 6 dígitos
  const novaSenha = Math.floor(100000 + Math.random() * 900000).toString();

  const novaSessao = await Sessao.create({
    codigoSenha: novaSenha,
    professorId: professorId,
    ativa: true
  });

  console.log(`🔓 Sala aberta: ${novaSenha} (Prof: ${professorId})`);
  res.json({ senha: novaSenha, sessaoId: novaSessao._id });
});

// Rota 3: Buscar Presenças (Polling do Frontend)
app.get('/api/presencas/:sessaoId', async (req, res) => {
  try {
    const sessao = await Sessao.findById(req.params.sessaoId);
    if (!sessao) return res.json({ sucesso: false });
    
    res.json({ 
      sucesso: true, 
      presencas: sessao.presencas 
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar" });
  }
});

// --- INICIAR SERVIDOR ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor HTTP rodando na porta ${PORT}`);
  console.log(`📡 Aguardando MQTT...`);
});