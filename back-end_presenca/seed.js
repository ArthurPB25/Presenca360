const mongoose = require('mongoose');
const { Usuario } = require('./models');

// Use a mesma string de conexão do server.js
mongoose.connect("mongodb://localhost:27017/presenca360")
  .then(async () => {
    console.log('conectado ao mongo...');
    
    // Cria um professor de teste
    await Usuario.create({
      nome: "Professor Teste",
      email: "prof@senai.br",
      senha: "123", // Em produção, usaríamos criptografia
      tipo: "professor"
    });

    console.log('✅ Professor criado: prof@senai.br / 123');
    process.exit();
  })
  .catch(err => console.log(err));