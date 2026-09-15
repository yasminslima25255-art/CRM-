// src/data.js
// Troque estes arrays pelos dados reais do seu CRM (ou pela sua API/planilha)
// quando for integrar. Por enquanto o app funciona 100% com estes dados de exemplo.

export const initialClientes = [
  { nome: "Maria Souza",    telefone: "(51) 99999-1111", cidade: "Osório",         status: "Cliente",         ultimoContato: "2025-08-12" },
  { nome: "Carlos Lima",    telefone: "(51) 98888-2222", cidade: "Tramandaí",      status: "Em negociação",   ultimoContato: "2025-08-11" },
  { nome: "Juliana Alves",  telefone: "(51) 97777-3333", cidade: "Imbé",           status: "Proposta",        ultimoContato: "2025-08-10" },
  { nome: "Roberto Silva",  telefone: "(51) 96666-4444", cidade: "Osório",         status: "Contato inicial", ultimoContato: "2025-08-09" },
  { nome: "Ana Paula",      telefone: "(51) 95555-5555", cidade: "Tramandaí",      status: "Cliente",         ultimoContato: "2025-08-08" },
  { nome: "Fernando Costa", telefone: "(51) 94444-6666", cidade: "Capão da Canoa", status: "Sem retorno",     ultimoContato: "2025-08-07" },
  { nome: "Beatriz Rocha",  telefone: "(51) 93333-7777", cidade: "Osório",         status: "Em atendimento",  ultimoContato: "2025-08-06" }
];

export const initialContatos = [
  { nome: "Mariana Alves",  telefone: "(51) 98888-1234", origem: "WhatsApp",  status: "Em atendimento" },
  { nome: "Lucas Ferreira", telefone: "(51) 97777-2345", origem: "Instagram", status: "Novo contato" },
  { nome: "Tatiane Souza",  telefone: "(51) 96566-3456", origem: "Ligação",   status: "Retorno agendado" },
  { nome: "Gabriel Martins",telefone: "(51) 95555-4567", origem: "Site",      status: "Orçamento enviado" },
  { nome: "Camila Rocha",   telefone: "(51) 94444-5678", origem: "Indicação", status: "Cliente em potencial" },
  { nome: "Felipe Santos",  telefone: "(51) 93333-6789", origem: "WhatsApp",  status: "Em retorno" },
  { nome: "Bruna Costa",    telefone: "(51) 92222-7890", origem: "Instagram", status: "Em atendimento" }
];

export const initialOrcamentos = [
  { numero: "0012", cliente: "Maria Souza",    produto: "Energia Solar",      valor: 6500, status: "Enviado",       data: "2025-08-12" },
  { numero: "0011", cliente: "Carlos Lima",    produto: "Carregador Veicular",valor: 3200, status: "Em negociação", data: "2025-08-11" },
  { numero: "0010", cliente: "Juliana Alves",  produto: "Energia Solar",      valor: 8900, status: "Aprovado",      data: "2025-08-10" },
  { numero: "0009", cliente: "Roberto Silva",  produto: "Carregador Veicular",valor: 4600, status: "Enviado",       data: "2025-08-09" },
  { numero: "0008", cliente: "Ana Paula",      produto: "Energia Solar",      valor: 7300, status: "Aprovado",      data: "2025-08-08" },
  { numero: "0007", cliente: "Fernando Costa", produto: "Energia Solar",      valor: 5600, status: "Perdido",       data: "2025-08-07" },
  { numero: "0006", cliente: "Beatriz Rocha",  produto: "Carregador Veicular",valor: 4200, status: "Enviado",       data: "2025-08-06" }
];

export const statusColor = {
  "Cliente": "green", "Em atendimento": "blue", "Em negociação": "gold",
  "Proposta": "gold", "Contato inicial": "gray", "Sem retorno": "gray",
  "Novo contato": "gold", "Retorno agendado": "blue", "Orçamento enviado": "gray",
  "Cliente em potencial": "purple", "Em retorno": "gray",
  "Enviado": "blue", "Aprovado": "green", "Perdido": "red"
};

export const funilEtapas = [
  { nome: "Contato Inicial", valor: 18 },
  { nome: "Em Negociação",   valor: 12 },
  { nome: "Proposta",        valor: 8  },
  { nome: "Fechadas",        valor: 6  }
];

export const vendasPeriodo = [
  { dia: "01", valor: 4200 }, { dia: "05", valor: 6800 }, { dia: "10", valor: 5100 },
  { dia: "15", valor: 9200 }, { dia: "20", valor: 7400 }, { dia: "25", valor: 10800 },
  { dia: "31", valor: 8600 }
];

export const origemContatos = [
  { nome: "WhatsApp",  valor: 45, cor: "#D4A537" },
  { nome: "Instagram", valor: 20, cor: "#4FA3F7" },
  { nome: "Ligação",   valor: 15, cor: "#8B8FA3" },
  { nome: "Site",      valor: 10, cor: "#3DDC97" },
  { nome: "Indicação", valor: 10, cor: "#B694F5" }
];
