import React, { useState, useMemo, useRef, useEffect } from "react";
import "./App.css";
import {
  initialClientes, initialContatos, initialOrcamentos,
  statusColor, funilEtapas, vendasPeriodo, origemContatos
} from "./data";

// ===================== HELPERS =====================
const badgeClass = (status) => "badge badge-" + (statusColor[status] || "gray");
const formatBR = (dateStr) => { const [y, m, d] = dateStr.split("-"); return `${d}/${m}/${y}`; };
const formatMoney = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const todayISO = () => new Date().toISOString().slice(0, 10);

// ===================== ÍCONES ===================== (inline, sem dependências)
const Icon = ({ path, size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);
const icons = {
  home: <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8.5Z" />,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><circle cx="17.5" cy="9" r="2.5" /><path d="M15.2 14.2c2.9.3 5.3 2.4 5.3 5.3" /></>,
  contatos: <><path d="M4 4h13l3 3v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" /><path d="M7 9h9M7 13h9M7 17h5" /></>,
  file: <><path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v5h5M8 13h8M8 17h5" /></>,
  funil: <path d="M3 4h18l-6.5 8v6l-5 2v-8L3 4Z" />,
  relatorios: <><path d="M4 20V10M11 20V4M18 20v-7" /><path d="M2 20h20" /></>,
  config: <><circle cx="12" cy="12" r="3" /><path d="M19.4 13a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V19a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 17.36a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.64 13 1.7 1.7 0 0 0 3.09 12H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.64 7a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 2.64 1.7 1.7 0 0 0 10 1.09V1a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.36 7a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  upload: <><path d="M12 3v12m0 0-4-4m4 4 4-4" /><path d="M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></>,
  copy: <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
  more: <><circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  chat: <path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1Z" />,
  crown: <path d="M2 19h20l-1.6-8.5-4.2 3.3L12 6l-4.2 7.8-4.2-3.3L2 19z" fill="currentColor" stroke="none" />,
};
const Butterfly = () => (
  <svg viewBox="0 0 24 24" className="logo-butterfly" title="borboleta">
    <path d="M12 12c-1.5-4-6-6-8-4.5-1.6 1.2-1 5 2.3 6.8C9 15.8 12 13.5 12 12zm0 0c1.5-4 6-6 8-4.5 1.6 1.2 1 5-2.3 6.8C15 15.8 12 13.5 12 12z" fill="currentColor" />
    <line x1="12" y1="9" x2="12" y2="16" stroke="currentColor" strokeWidth="0.8" />
  </svg>
);

// ===================== DONUT =====================
function Donut({ data, centerLabel, centerSub }) {
  const total = data.reduce((a, b) => a + b.valor, 0) || 1;
  let acc = 0;
  const stops = data.map((d) => {
    const start = (acc / total) * 360; acc += d.valor; const end = (acc / total) * 360;
    return `${d.cor} ${start}deg ${end}deg`;
  }).join(",");
  return (
    <div className="donut-row">
      <div className="donut" style={{ background: `conic-gradient(${stops})` }}>
        <div className="donut-center"><b>{centerLabel}</b><span>{centerSub}</span></div>
      </div>
      <div className="legend">
        {data.map((d, i) => (
          <div className="legend-item" key={i}>
            <span className="legend-dot" style={{ background: d.cor }}></span>
            <span className="legend-label">{d.nome}</span>
            <span className="legend-pct">{Math.round((d.valor / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===================== TOAST =====================
function useToast() {
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);
  const timer = useRef(null);
  const fire = (text) => {
    setMsg(text); setShow(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), 2200);
  };
  return { msg, show, fire };
}

function copyRow(obj, fire) {
  const text = Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join("\n");
  navigator.clipboard.writeText(text)
    .then(() => fire("Dados copiados!"))
    .catch(() => fire("Não foi possível copiar."));
}

// ===================== APP =====================
export default function App() {
  const [page, setPage] = useState("inicio");
  const [clientes, setClientes] = useState(initialClientes);
  const [contatos, setContatos] = useState(initialContatos);
  const [orcamentos, setOrcamentos] = useState(initialOrcamentos);
  const toast = useToast();

  // filtros
  const [fCli, setFCli] = useState({ search: "", status: "", from: "", to: "" });
  const [fCon, setFCon] = useState({ search: "", status: "", origem: "" });
  const [fOrc, setFOrc] = useState({ search: "", status: "", from: "", to: "" });

  // importação
  const [importOpen, setImportOpen] = useState(false);
  const [importTarget, setImportTarget] = useState(null);
  const [importRows, setImportRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
  }, []);

  const todayLabel = new Date()
    .toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })
    .replace(/^\w/, (c) => c.toUpperCase());

  // ---------- listas filtradas ----------
  const clientesFiltrados = useMemo(() => clientes.filter((c) => {
    const s = fCli.search.toLowerCase();
    const okSearch = !s || c.nome.toLowerCase().includes(s) || c.telefone.includes(s) || c.cidade.toLowerCase().includes(s);
    const okStatus = !fCli.status || c.status === fCli.status;
    const okFrom = !fCli.from || c.ultimoContato >= fCli.from;
    const okTo = !fCli.to || c.ultimoContato <= fCli.to;
    return okSearch && okStatus && okFrom && okTo;
  }), [clientes, fCli]);

  const contatosFiltrados = useMemo(() => contatos.filter((c) => {
    const s = fCon.search.toLowerCase();
    const okSearch = !s || c.nome.toLowerCase().includes(s) || c.telefone.includes(s) || c.origem.toLowerCase().includes(s);
    const okStatus = !fCon.status || c.status === fCon.status;
    const okOrigem = !fCon.origem || c.origem === fCon.origem;
    return okSearch && okStatus && okOrigem;
  }), [contatos, fCon]);

  const orcamentosFiltrados = useMemo(() => orcamentos.filter((o) => {
    const s = fOrc.search.toLowerCase();
    const okSearch = !s || o.cliente.toLowerCase().includes(s) || o.produto.toLowerCase().includes(s) || o.numero.includes(s);
    const okStatus = !fOrc.status || o.status === fOrc.status;
    const okFrom = !fOrc.from || o.data >= fOrc.from;
    const okTo = !fOrc.to || o.data <= fOrc.to;
    return okSearch && okStatus && okFrom && okTo;
  }), [orcamentos, fOrc]);

  // ---------- estatísticas ----------
  const emAtendimento = clientes.filter((c) => c.status === "Em atendimento").length;
  const orcEnviados = orcamentos.filter((o) => o.status === "Enviado").length;
  const vendasFechadas = orcamentos.filter((o) => o.status === "Aprovado").length;
  const metaAlvo = 20;

  const resumoVendas = [
    { nome: "Fechadas", valor: vendasFechadas, cor: "#D4A537" },
    { nome: "Em negociação", valor: clientes.filter((c) => c.status === "Em negociação").length, cor: "#4FA3F7" },
    { nome: "Proposta", valor: clientes.filter((c) => c.status === "Proposta").length, cor: "#B694F5" },
    { nome: "Sem retorno", valor: Math.max(clientes.filter((c) => c.status === "Sem retorno").length, 0.001), cor: "#4A4E5C" },
  ];

  const fechadasFunil = funilEtapas[funilEtapas.length - 1].valor;
  const inicialFunil = funilEtapas[0].valor;
  const maxFunil = funilEtapas[0].valor;

  const totalVendasRel = orcamentos.filter((o) => o.status === "Aprovado").reduce((a, b) => a + b.valor, 0);
  const aprovadosCount = orcamentos.filter((o) => o.status === "Aprovado").length || 1;
  const maxVendasPeriodo = Math.max(...vendasPeriodo.map((v) => v.valor));

  // ---------- opções únicas p/ filtros ----------
  const statusClientesOpts = [...new Set(clientes.map((c) => c.status))];
  const statusContatosOpts = [...new Set(contatos.map((c) => c.status))];
  const origemContatosOpts = [...new Set(contatos.map((c) => c.origem))];
  const statusOrcamentosOpts = [...new Set(orcamentos.map((o) => o.status))];

  // ---------- importar ----------
  const openImport = (target) => {
    setImportTarget(target); setImportRows([]); setFileName(""); setImportOpen(true);
  };

  const handleFile = (file) => {
    setFileName(file.name);
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "csv" || ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = window.XLSX.read(e.target.result, { type: "binary" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = window.XLSX.utils.sheet_to_json(sheet, { defval: "" });
        setImportRows(json);
      };
      reader.readAsBinaryString(file);
    } else if (ext === "pdf") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const pdf = await window.pdfjsLib.getDocument({ data: e.target.result }).promise;
          let lines = [];
          for (let p = 1; p <= pdf.numPages; p++) {
            const page = await pdf.getPage(p);
            const content = await page.getTextContent();
            const text = content.items.map((i) => i.str).join(" ");
            lines.push(...text.split(/\n|(?<=\.)\s{2,}/).filter(Boolean));
          }
          setImportRows(lines.filter((l) => l.trim()).map((l) => ({ texto: l.trim() })));
        } catch (err) {
          setImportRows([]);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const confirmImport = () => {
    if (!importRows.length) return;
    if (importTarget === "clientes") {
      const novos = importRows.map((r) => ({
        nome: r.Nome || r.nome || r.texto || "Sem nome",
        telefone: r.Telefone || r.telefone || "-",
        cidade: r.Cidade || r.cidade || "-",
        status: r.Status || r.status || "Contato inicial",
        ultimoContato: todayISO(),
      }));
      setClientes((prev) => [...prev, ...novos]);
    } else if (importTarget === "contatos") {
      const novos = importRows.map((r) => ({
        nome: r.Nome || r.nome || r.texto || "Sem nome",
        telefone: r.Telefone || r.telefone || "-",
        origem: r.Origem || r.origem || "Site",
        status: r.Status || r.status || "Novo contato",
      }));
      setContatos((prev) => [...prev, ...novos]);
    } else if (importTarget === "orcamentos") {
      const novos = importRows.map((r, i) => ({
        numero: r.Numero || r.numero || String(orcamentos.length + i + 1).padStart(4, "0"),
        cliente: r.Cliente || r.cliente || r.texto || "Sem cliente",
        produto: r.Produto || r.produto || "-",
        valor: Number(r.Valor || r.valor || 0),
        status: r.Status || r.status || "Enviado",
        data: todayISO(),
      }));
      setOrcamentos((prev) => [...prev, ...novos]);
    }
    setImportOpen(false);
    toast.fire(`${importRows.length} registro(s) adicionado(s)!`);
  };

  // ===================== RENDER =====================
  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-badge">
            <Icon path={icons.crown} size={30} />
            <Butterfly />
          </div>
          <div className="logo-text">
            <span className="logo-title">CRM</span>
            <span className="logo-sub">VENDAS</span>
          </div>
        </div>
        <nav className="nav">
          {[
            ["inicio", "Início", icons.home],
            ["clientes", "Clientes", icons.users],
            ["contatos", "Contatos", icons.contatos],
            ["orcamentos", "Orçamentos", icons.file],
            ["funil", "Funil de Vendas", icons.funil],
            ["relatorios", "Relatórios", icons.relatorios],
          ].map(([key, label, path]) => (
            <button key={key} className={"nav-link" + (page === key ? " active" : "")} onClick={() => setPage(key)}>
              <Icon path={path} size={17} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <button className={"nav-link nav-config" + (page === "config" ? " active" : "")} onClick={() => setPage("config")}>
          <Icon path={icons.config} size={17} /><span>Configurações</span>
        </button>
      </aside>

      {/* MAIN */}
      <main className="main">

        {/* ---------- INÍCIO ---------- */}
        {page === "inicio" && (
          <section className="page active">
            <header className="page-head">
              <div><h1>Olá, Yasmin!</h1><p className="sub">Aqui está um resumo do seu dia.</p></div>
              <div className="head-right"><div className="date-chip">{todayLabel}</div></div>
            </header>

            <div className="stat-grid">
              <StatCard label="Total de Clientes" value={clientes.length} change="+12%" icon={icons.users} />
              <StatCard label="Em Atendimento" value={emAtendimento} change="+3%" icon={icons.chat} />
              <StatCard label="Orçamentos Enviados" value={orcEnviados} change="+25%" icon={icons.file} />
              <StatCard label="Vendas Fechadas" value={vendasFechadas} change="+50%" icon={icons.check} />
            </div>

            <div className="grid-2">
              <div className="card">
                <h3>Resumo de Vendas</h3>
                <Donut data={resumoVendas} centerLabel={vendasFechadas} centerSub="fechadas" />
              </div>
              <div className="card">
                <h3>Meta do Mês</h3>
                <div className="meta-numbers"><b>{vendasFechadas} / {metaAlvo}</b><span>{Math.round((vendasFechadas / metaAlvo) * 100)}%</span></div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${(vendasFechadas / metaAlvo) * 100}%` }}></div></div>
                <div className="meta-quote"><Icon path={icons.crown} size={18} />Disciplina hoje, vendas amanhã.</div>
              </div>
            </div>
          </section>
        )}

        {/* ---------- CLIENTES ---------- */}
        {page === "clientes" && (
          <section className="page active">
            <header className="page-head">
              <div><h1>Clientes</h1><p className="sub">Gerencie seus clientes e acompanhe o histórico de cada um.</p></div>
              <div className="head-right">
                <button className="btn btn-outline" onClick={() => openImport("clientes")}><Icon path={icons.upload} size={15} />Importar PDF/Excel</button>
                <button className="btn btn-gold"><Icon path={icons.plus} size={15} />Novo Cliente</button>
              </div>
            </header>

            <div className="toolbar">
              <div className="search"><Icon path={icons.search} size={16} /><input placeholder="Buscar por nome, telefone ou cidade..." value={fCli.search} onChange={(e) => setFCli({ ...fCli, search: e.target.value })} /></div>
              <select value={fCli.status} onChange={(e) => setFCli({ ...fCli, status: e.target.value })}>
                <option value="">Todos</option>
                {statusClientesOpts.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="date-range">
                <label>De <input type="date" value={fCli.from} onChange={(e) => setFCli({ ...fCli, from: e.target.value })} /></label>
                <label>Até <input type="date" value={fCli.to} onChange={(e) => setFCli({ ...fCli, to: e.target.value })} /></label>
              </div>
            </div>

            <div className="card table-card">
              <table>
                <thead><tr><th>Nome</th><th>Telefone</th><th>Cidade</th><th>Status</th><th>Último contato</th><th>Ações</th></tr></thead>
                <tbody>
                  {clientesFiltrados.map((c, i) => (
                    <tr key={i}>
                      <td>{c.nome}</td><td>{c.telefone}</td><td>{c.cidade}</td>
                      <td><span className={badgeClass(c.status)}>{c.status}</span></td>
                      <td>{formatBR(c.ultimoContato)}</td>
                      <td className="row-actions">
                        <button className="btn-icon" title="Copiar dados" onClick={() => copyRow(c, toast.fire)}><Icon path={icons.copy} size={14} /></button>
                        <button className="btn-icon" title="Editar"><Icon path={icons.edit} size={14} /></button>
                        <button className="btn-icon" title="Mais"><Icon path={icons.more} size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  {clientesFiltrados.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-3)", padding: 26 }}>Nenhum cliente encontrado.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ---------- CONTATOS ---------- */}
        {page === "contatos" && (
          <section className="page active">
            <header className="page-head">
              <div><h1>Contatos</h1><p className="sub">Todos os seus contatos em um só lugar.</p></div>
              <div className="head-right">
                <button className="btn btn-outline" onClick={() => openImport("contatos")}><Icon path={icons.upload} size={15} />Importar PDF/Excel</button>
                <button className="btn btn-gold"><Icon path={icons.plus} size={15} />Novo Contato</button>
              </div>
            </header>

            <div className="toolbar">
              <div className="search"><Icon path={icons.search} size={16} /><input placeholder="Buscar por nome, telefone ou origem..." value={fCon.search} onChange={(e) => setFCon({ ...fCon, search: e.target.value })} /></div>
              <select value={fCon.status} onChange={(e) => setFCon({ ...fCon, status: e.target.value })}>
                <option value="">Todos</option>
                {statusContatosOpts.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={fCon.origem} onChange={(e) => setFCon({ ...fCon, origem: e.target.value })}>
                <option value="">Origem</option>
                {origemContatosOpts.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="card table-card">
              <table>
                <thead><tr><th>Nome</th><th>Telefone</th><th>Origem</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                  {contatosFiltrados.map((c, i) => (
                    <tr key={i}>
                      <td>{c.nome}</td><td>{c.telefone}</td><td>{c.origem}</td>
                      <td><span className={badgeClass(c.status)}>{c.status}</span></td>
                      <td className="row-actions">
                        <button className="btn-icon" title="Copiar dados" onClick={() => copyRow(c, toast.fire)}><Icon path={icons.copy} size={14} /></button>
                        <button className="btn-icon" title="Editar"><Icon path={icons.edit} size={14} /></button>
                        <button className="btn-icon" title="Mais"><Icon path={icons.more} size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  {contatosFiltrados.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-3)", padding: 26 }}>Nenhum contato encontrado.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ---------- ORÇAMENTOS ---------- */}
        {page === "orcamentos" && (
          <section className="page active">
            <header className="page-head">
              <div><h1>Orçamentos</h1><p className="sub">Acompanhe e gerencie todos os orçamentos enviados.</p></div>
              <div className="head-right">
                <button className="btn btn-outline" onClick={() => openImport("orcamentos")}><Icon path={icons.upload} size={15} />Importar PDF/Excel</button>
                <button className="btn btn-gold"><Icon path={icons.plus} size={15} />Novo Orçamento</button>
              </div>
            </header>

            <div className="toolbar">
              <div className="search"><Icon path={icons.search} size={16} /><input placeholder="Buscar por cliente, produto ou número..." value={fOrc.search} onChange={(e) => setFOrc({ ...fOrc, search: e.target.value })} /></div>
              <select value={fOrc.status} onChange={(e) => setFOrc({ ...fOrc, status: e.target.value })}>
                <option value="">Todos</option>
                {statusOrcamentosOpts.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="date-range">
                <label>De <input type="date" value={fOrc.from} onChange={(e) => setFOrc({ ...fOrc, from: e.target.value })} /></label>
                <label>Até <input type="date" value={fOrc.to} onChange={(e) => setFOrc({ ...fOrc, to: e.target.value })} /></label>
              </div>
            </div>

            <div className="card table-card">
              <table>
                <thead><tr><th>Nº</th><th>Cliente</th><th>Produto/Serviço</th><th>Valor</th><th>Status</th><th>Data</th><th>Ações</th></tr></thead>
                <tbody>
                  {orcamentosFiltrados.map((o, i) => (
                    <tr key={i}>
                      <td>{o.numero}</td><td>{o.cliente}</td><td>{o.produto}</td><td>{formatMoney(o.valor)}</td>
                      <td><span className={badgeClass(o.status)}>{o.status}</span></td>
                      <td>{formatBR(o.data)}</td>
                      <td className="row-actions">
                        <button className="btn-icon" title="Copiar dados" onClick={() => copyRow(o, toast.fire)}><Icon path={icons.copy} size={14} /></button>
                        <button className="btn-icon" title="Editar"><Icon path={icons.edit} size={14} /></button>
                        <button className="btn-icon" title="Mais"><Icon path={icons.more} size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  {orcamentosFiltrados.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-3)", padding: 26 }}>Nenhum orçamento encontrado.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ---------- FUNIL ---------- */}
        {page === "funil" && (
          <section className="page active">
            <header className="page-head">
              <div><h1>Funil de Vendas</h1><p className="sub">Visualize em qual etapa estão seus leads e oportunidades.</p></div>
              <div className="head-right"><select><option>Este mês</option><option>Mês passado</option><option>Este ano</option></select></div>
            </header>

            <div className="grid-funil">
              <div className="card">
                <div className="funnel">
                  {funilEtapas.map((e, i) => (
                    <div className="funnel-stage" key={i} style={{ width: `${40 + (e.valor / maxFunil) * 55}%` }}>
                      {e.nome}<small>{e.valor} &nbsp;·&nbsp; {Math.round((e.valor / maxFunil) * 100)}%</small>
                    </div>
                  ))}
                </div>
              </div>
              <div className="funil-side">
                <div className="card">
                  <h3>Taxa de Conversão</h3>
                  <Donut
                    data={[{ nome: "Convertidos", valor: fechadasFunil, cor: "#D4A537" }, { nome: "Não convertidos", valor: inicialFunil - fechadasFunil, cor: "#232838" }]}
                    centerLabel={`${Math.round((fechadasFunil / inicialFunil) * 100)}%`}
                    centerSub={`${fechadasFunil} de ${inicialFunil} leads viraram vendas`}
                  />
                </div>
                <div className="card">
                  <h3>Média do Mês</h3>
                  <div className="meta-numbers"><b>{fechadasFunil} / 20</b><span>{Math.round((fechadasFunil / 20) * 100)}%</span></div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${(fechadasFunil / 20) * 100}%` }}></div></div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ---------- RELATÓRIOS ---------- */}
        {page === "relatorios" && (
          <section className="page active">
            <header className="page-head">
              <div><h1>Relatórios</h1><p className="sub">Acompanhe seu desempenho com dados e gráficos.</p></div>
              <div className="head-right">
                <div className="date-range"><label>De <input type="date" /></label><label>Até <input type="date" /></label></div>
                <select><option>Este mês</option><option>Mês passado</option><option>Este ano</option></select>
              </div>
            </header>

            <div className="stat-grid">
              <StatCard label="Vendas" value={formatMoney(totalVendasRel)} change="+28%" />
              <StatCard label="Orçamentos" value={orcamentos.length} change="+25%" />
              <StatCard label="Clientes Novos" value={clientes.length} change="+43%" />
              <StatCard label="Ticket Médio" value={formatMoney(totalVendasRel / aprovadosCount)} change="+16%" />
            </div>

            <div className="grid-2">
              <div className="card">
                <h3>Vendas por período</h3>
                <div className="bars">
                  {vendasPeriodo.map((v, i) => (
                    <div className="bar-col" key={i}>
                      <div className="bar" style={{ height: `${(v.valor / maxVendasPeriodo) * 100}%` }}></div>
                      <div className="bar-label">{v.dia}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3>Origem dos contatos</h3>
                <Donut data={origemContatos} centerLabel={`${origemContatos[0].valor}%`} centerSub={origemContatos[0].nome} />
              </div>
            </div>
          </section>
        )}

        {/* ---------- CONFIGURAÇÕES ---------- */}
        {page === "config" && (
          <section className="page active">
            <header className="page-head">
              <div><h1>Configurações</h1><p className="sub">Personalize o sistema do seu jeito.</p></div>
            </header>

            <div className="grid-2">
              <div className="card">
                <h3>Perfil</h3>
                <div className="perfil-row">
                  <div><div className="perfil-label">Nome</div><div className="perfil-value">Yasmin</div></div>
                  <div><div className="perfil-label">E-mail</div><div className="perfil-value">yasmin@email.com</div></div>
                  <button className="btn btn-gold">Editar perfil</button>
                </div>
              </div>
              <div className="card">
                <h3>Preferências</h3>
                <ToggleRow label="Notificações por e-mail" />
                <ToggleRow label="Notificações no WhatsApp" />
                <ToggleRow label="Tema escuro" />
              </div>
            </div>

            <div className="card">
              <h3>Sobre o sistema</h3>
              <p className="sub">CRM Vendas v1.00<br />Feito para impulsionar suas vendas!</p>
            </div>
          </section>
        )}
      </main>

      {/* MODAL IMPORTAR */}
      {importOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-head">
              <h3>Importar arquivo</h3>
              <button className="modal-close" onClick={() => setImportOpen(false)}>&times;</button>
            </div>
            <p className="sub">Envie um arquivo <strong>.xlsx</strong>, <strong>.csv</strong> ou <strong>.pdf</strong> para extrair os dados automaticamente.</p>
            <label className="dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}>
              <Icon path={icons.upload} size={20} />
              <span>{fileName || "Clique para escolher um arquivo ou arraste aqui"}</span>
              <input type="file" ref={fileRef} hidden accept=".csv,.xlsx,.xls,.pdf"
                onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
            </label>
            {importRows.length > 0 && (
              <div id="import-preview">
                <table>
                  <thead><tr>{Object.keys(importRows[0]).map((c) => <th key={c}>{c}</th>)}</tr></thead>
                  <tbody>
                    {importRows.slice(0, 8).map((r, i) => (
                      <tr key={i}>{Object.keys(importRows[0]).map((c) => <td key={c}>{String(r[c])}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
                <p className="sub" style={{ marginTop: 8 }}>{importRows.length} registro(s) encontrado(s){importRows.length > 8 ? " — mostrando 8" : ""}.</p>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setImportOpen(false)}>Cancelar</button>
              <button className="btn btn-gold" disabled={!importRows.length} onClick={confirmImport}>Adicionar registros</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      <div className={"toast" + (toast.show ? " show" : "")}>{toast.msg}</div>
    </div>
  );
}

function StatCard({ label, value, change, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-top">{icon && <div className="stat-icon"><Icon path={icon} size={17} /></div>}{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-change">▲ {change}</div>
    </div>
  );
}

function ToggleRow({ label }) {
  const [on, setOn] = useState(true);
  return (
    <div className="toggle-row">
      <span>{label}</span>
      <label className="switch">
        <input type="checkbox" checked={on} onChange={() => setOn(!on)} />
        <span className="slider"></span>
      </label>
    </div>
  );
}
