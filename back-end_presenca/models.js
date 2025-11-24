const mongoose = require('mongoose');

// 1. Modelo de Usuário (Serve para Professor e Aluno)
const UsuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true }, // Em produção, usar hash (bcrypt)
  tipo: { type: String, enum: ['professor', 'aluno'], required: true },
  matricula: { type: String }, // Apenas para alunos
  turma: { type: String },     // Apenas para alunos
  criadoEm: { type: Date, default: Date.now }
});

// 2. Modelo de Sessão de Aula (A "Sala" que o professor abre)
const SessaoSchema = new mongoose.Schema({
  codigoSenha: { type: String, required: true }, // A senha ex: "482910"
  professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  ativa: { type: Boolean, default: true },
  dataInicio: { type: Date, default: Date.now },
  dataFim: { type: Date },
  
  // Lista de alunos que registraram presença nesta aula
  presencas: [{
    alunoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    nomeAluno: String,
    horario: Date,
    ipConexao: String, // Para segurança (validar rede)
    status: { type: String, enum: ['Presente', 'Atrasado'], default: 'Presente' }
  }]
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);
const Sessao = mongoose.model('Sessao', SessaoSchema);

module.exports = { Usuario, Sessao };