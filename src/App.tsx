import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Plus,
  Search,
  X,
  Copy,
  Phone,
  Mail,
  MapPin,
  Building2,
  Flame,
  Sun,
  Snowflake,
  Pencil,
  Trash2,
  Check,
  Clock,
  UserPlus,
  Eye,
  FileText,
  CalendarClock,
  AlertTriangle,
  Menu as MenuIcon,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

if(typeof window!=="undefined"&&!window.storage){window.storage={get:async(key)=>{try{const v=localStorage.getItem(key);return v?{key,value:v}:null;}catch(e){return null;}},set:async(key,value)=>{try{localStorage.setItem(key,value);return{key,value};}catch(e){return null;}},delete:async(key)=>{try{localStorage.removeItem(key);return{key,deleted:true};}catch(e){return null;}}};}

const STORAGE_PREFIX = "crm-vendas-data";

const EMPRESAS = [
  { id: "emp1", nome: "Nury Energia" },
  { id: "emp2", nome: "Litoral Materiais" },
];

const VENDEDORES = [
  { id: "v1", nome: "Ana Ribeiro" },
  { id: "v2", nome: "Bruno Alves" },
  { id: "v3", nome: "Carla Souza" },
];

const STAGES = [
  { id: "novo_contato", label: "Novo contato" },
  { id: "em_contato", label: "Em contato" },
  { id: "orcamento_enviado", label: "Orçamento enviado" },
  { id: "negociacao", label: "Negociação" },
  { id: "fechado", label: "Fechado" },
  { id: "perdido", label: "Perdido" },
];

const TEMP_CONFIG = {
  frio: { label: "Frio", color: "sky", icon: Snowflake },
  morno: { label: "Morno", color: "amber", icon: Sun },
  quente: { label: "Quente", color: "rose", icon: Flame },
};

const ORIGENS = [
  "Indicação",
  "Site",
  "Redes sociais",
  "Feira/Evento",
  "Ligação ativa",
  "Outro",
];

const MOTIVOS_PERDA = [
  "Preço",
  "Concorrente",
  "Desistência",
  "Sem resposta",
  "Prazo",
  "Sem orçamento",
  "Outro",
];

const TIPOS_ATIVIDADE = ["Reunião", "Ligação", "Retorno", "Cobrança", "Outro"];

const STATUS_ORCAMENTO = [
  "Rascunho",
  "Enviado",
  "Negociação",
  "Aprovado",
  "Recusado",
];

const PERIODOS_META = ["Diário", "Semanal", "Mensal", "Anual"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function formatBRL(v) {
  return (Number(v) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateBR(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function vendedorNome(id) {
  return VENDEDORES.find((v) => v.id === id)?.nome || "—";
}

function stageLabel(id) {
  return (
    STAGES.find((s) => s.id === id)?.label ||
    (id === "banco" ? "Banco de leads" : id)
  );
}

function mockLeads() {
  const base = [
    [
      "Marcos Teixeira",
      "Teixeira Materiais",
      "novo_contato",
      "morno",
      8500,
      "Site",
    ],
    [
      "Fernanda Lima",
      "Lima Construções",
      "em_contato",
      "quente",
      15200,
      "Indicação",
    ],
    [
      "Roberto Cunha",
      "Cunha & Filhos",
      "orcamento_enviado",
      "quente",
      22000,
      "Feira/Evento",
    ],
    [
      "Juliana Prado",
      "Prado Comércio",
      "orcamento_enviado",
      "morno",
      9800,
      "Redes sociais",
    ],
    [
      "Eduardo Nunes",
      "Nunes Serviços",
      "negociacao",
      "quente",
      31000,
      "Ligação ativa",
    ],
    [
      "Patricia Gomes",
      "Gomes Distribuidora",
      "fechado",
      "quente",
      18500,
      "Indicação",
    ],
    ["Sergio Barros", "Barros Ltda", "perdido", "frio", 4200, "Site"],
    ["Camila Duarte", "Duarte & Cia", "banco", "frio", 3000, "Redes sociais"],
    [
      "Vinicius Rocha",
      "Rocha Empreendimentos",
      "banco",
      "morno",
      12000,
      "Feira/Evento",
    ],
    ["Larissa Melo", "Melo Comercial", "banco", "frio", 5400, "Outro"],
  ];
  return base.map(([nome, empresa, etapa, temperatura, valor, origem], i) => ({
    id: uid(),
    nome,
    empresa,
    telefone:
      "(51) 99" +
      (1000 + i * 37).toString().slice(0, 4) +
      "-" +
      (2000 + i * 91).toString().slice(0, 4),
    whatsapp:
      "(51) 99" +
      (1000 + i * 37).toString().slice(0, 4) +
      "-" +
      (2000 + i * 91).toString().slice(0, 4),
    email: nome.toLowerCase().replace(/ /g, ".") + "@email.com",
    cidade: ["Osório", "Torres", "Capão da Canoa", "Porto Alegre"][i % 4],
    origem,
    vendedorId: VENDEDORES[i % VENDEDORES.length].id,
    temperatura,
    valor,
    etapa,
    proximoContato:
      etapa === "fechado" || etapa === "perdido" ? "" : addDays((i % 5) + 1),
    observacoes: "",
    motivoPerda: etapa === "perdido" ? "Preço" : "",
    createdAt: addDays(-((i * 3) % 40)),
    historico: [{ data: todayISO(), texto: "Lead cadastrado no sistema." }],
  }));
}

function mockOrcamentos(leads) {
  const alvo = leads.filter((l) =>
    ["orcamento_enviado", "negociacao", "fechado"].includes(l.etapa)
  );
  return alvo.map((l, i) => ({
    id: uid(),
    numero: i + 1,
    clienteId: l.id,
    vendedorId: l.vendedorId,
    data: addDays(-i * 2),
    validade: addDays(15 - i * 2),
    itens: [
      {
        id: uid(),
        produto: "Pacote de serviços",
        quantidade: 1,
        valorUnitario: l.valor,
      },
    ],
    desconto: 0,
    observacoes: "",
    status: l.etapa === "fechado" ? "Aprovado" : "Enviado",
  }));
}

function mockAtividades(leads) {
  return leads.slice(0, 6).map((l, i) => ({
    id: uid(),
    tipo: TIPOS_ATIVIDADE[i % TIPOS_ATIVIDADE.length],
    data: addDays(i - 2),
    hora: `${9 + i}:00`,
    responsavelId: l.vendedorId,
    observacao: `${TIPOS_ATIVIDADE[i % TIPOS_ATIVIDADE.length]} com ${l.nome}`,
    status: i < 2 ? "concluido" : "pendente",
    clienteId: l.id,
  }));
}

function mockMetas() {
  return VENDEDORES.map((v, i) => ({
    id: uid(),
    vendedorId: v.id,
    periodo: "Mensal",
    valor: 20000 + i * 5000,
  }));
}

function buildInitialState() {
  const leads = mockLeads();
  return {
    leads,
    orcamentos: mockOrcamentos(leads),
    atividades: mockAtividades(leads),
    metas: mockMetas(),
    nextOrcamento: mockOrcamentos(leads).length + 1,
  };
}

function TempBadge({ temperatura, size = "sm" }) {
  const cfg = TEMP_CONFIG[temperatura] || TEMP_CONFIG.frio;
  const Icon = cfg.icon;
  const pad = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-${cfg.color}-100 text-${cfg.color}-700 ${pad} font-medium`}
    >
      <Icon size={size === "sm" ? 12 : 14} />
      {cfg.label}
    </span>
  );
}

function StatCard({ label, value, sub, tone = "slate" }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span
        className={`text-2xl font-semibold text-${tone}-900`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
    </div>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">
      {message}
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-40 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${
          wide ? "max-w-2xl" : "max-w-md"
        } max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 sticky top-0 bg-white">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-600 font-medium">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500";

function LeadFormModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(
    initial || {
      nome: "",
      empresa: "",
      telefone: "",
      whatsapp: "",
      email: "",
      cidade: "",
      origem: ORIGENS[0],
      vendedorId: VENDEDORES[0].id,
      temperatura: "morno",
      valor: "",
      proximoContato: "",
      observacoes: "",
    }
  );
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal
      title={initial ? "Editar cliente/lead" : "Novo cliente/lead"}
      onClose={onClose}
      wide
    >
      <form
        className="grid grid-cols-2 gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.nome.trim()) return;
          onSave(form);
        }}
      >
        <Field label="Nome">
          <input
            className={inputCls}
            value={form.nome}
            onChange={set("nome")}
            required
          />
        </Field>
        <Field label="Empresa">
          <input
            className={inputCls}
            value={form.empresa}
            onChange={set("empresa")}
          />
        </Field>
        <Field label="Telefone">
          <input
            className={inputCls}
            value={form.telefone}
            onChange={set("telefone")}
          />
        </Field>
        <Field label="WhatsApp">
          <input
            className={inputCls}
            value={form.whatsapp}
            onChange={set("whatsapp")}
          />
        </Field>
        <Field label="E-mail">
          <input
            className={inputCls}
            type="email"
            value={form.email}
            onChange={set("email")}
          />
        </Field>
        <Field label="Cidade">
          <input
            className={inputCls}
            value={form.cidade}
            onChange={set("cidade")}
          />
        </Field>
        <Field label="Origem do lead">
          <select
            className={inputCls}
            value={form.origem}
            onChange={set("origem")}
          >
            {ORIGENS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Vendedor responsável">
          <select
            className={inputCls}
            value={form.vendedorId}
            onChange={set("vendedorId")}
          >
            {VENDEDORES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Temperatura">
          <select
            className={inputCls}
            value={form.temperatura}
            onChange={set("temperatura")}
          >
            {Object.entries(TEMP_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Valor da oportunidade (R$)">
          <input
            className={inputCls}
            type="number"
            min="0"
            step="0.01"
            value={form.valor}
            onChange={set("valor")}
          />
        </Field>
        <Field label="Próximo contato">
          <input
            className={inputCls}
            type="date"
            value={form.proximoContato}
            onChange={set("proximoContato")}
          />
        </Field>
        <div />
        <div className="col-span-2">
          <Field label="Observações internas">
            <textarea
              className={inputCls}
              rows={3}
              value={form.observacoes}
              onChange={set("observacoes")}
            />
          </Field>
        </div>
        <div className="col-span-2 flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-lg bg-teal-700 text-white hover:bg-teal-800"
          >
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
}

function LeadDetailModal({
  lead,
  onClose,
  onEdit,
  onCopy,
  onChangeStage,
  onAddToFunnel,
}) {
  if (!lead) return null;
  return (
    <Modal title={lead.nome} onClose={onClose} wide>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <TempBadge temperatura={lead.temperatura} />
        <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-1 font-medium">
          {stageLabel(lead.etapa)}
        </span>
        <span className="text-xs bg-teal-50 text-teal-800 rounded-full px-2.5 py-1 font-medium">
          {formatBRL(lead.valor)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className="flex items-center gap-2 text-slate-600">
          <Building2 size={14} />
          {lead.empresa || "—"}
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin size={14} />
          {lead.cidade || "—"}
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Phone size={14} />
          {lead.telefone || "—"}
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <MessageCircle size={14} />
          {lead.whatsapp || "—"}
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Mail size={14} />
          {lead.email || "—"}
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          Vendedor: {vendedorNome(lead.vendedorId)}
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          Origem: {lead.origem}
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          Próximo contato: {formatDateBR(lead.proximoContato)}
        </div>
      </div>
      {lead.observacoes && (
        <div className="mb-4 text-sm">
          <p className="text-slate-500 font-medium mb-1">
            Observações internas
          </p>
          <p className="text-slate-700 bg-slate-50 rounded-lg p-3">
            {lead.observacoes}
          </p>
        </div>
      )}
      {lead.motivoPerda && (
        <div className="mb-4 text-sm flex items-center gap-2 text-rose-700 bg-rose-50 rounded-lg p-3">
          <AlertTriangle size={14} /> Motivo da perda: {lead.motivoPerda}
        </div>
      )}
      <div className="mb-4">
        <p className="text-slate-500 font-medium mb-1 text-sm">
          Histórico de atividades
        </p>
        <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
          {(lead.historico || [])
            .slice()
            .reverse()
            .map((h, i) => (
              <li key={i} className="text-slate-600 flex gap-2">
                <span className="text-slate-400 shrink-0">
                  {formatDateBR(h.data)}
                </span>
                <span>{h.texto}</span>
              </li>
            ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-2 justify-between items-center pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Etapa:</span>
          <select
            className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
            value={lead.etapa}
            onChange={(e) => onChangeStage(lead, e.target.value)}
          >
            <option value="banco">Banco de leads</option>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          {lead.etapa === "banco" && (
            <button
              onClick={() => onAddToFunnel(lead)}
              className="px-3 py-1.5 text-xs rounded-lg bg-teal-700 text-white hover:bg-teal-800 flex items-center gap-1"
            >
              <ArrowRight size={13} /> Adicionar ao funil
            </button>
          )}
          <button
            onClick={() => onCopy(lead)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 flex items-center gap-1"
          >
            <Copy size={13} /> Copiar informações
          </button>
          <button
            onClick={() => onEdit(lead)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 flex items-center gap-1"
          >
            <Pencil size={13} /> Editar
          </button>
        </div>
      </div>
    </Modal>
  );
}

function LossReasonModal({ onClose, onConfirm }) {
  const [motivo, setMotivo] = useState(MOTIVOS_PERDA[0]);
  return (
    <Modal title="Motivo da perda" onClose={onClose}>
      <p className="text-sm text-slate-500 mb-3">
        Selecione o motivo pelo qual essa oportunidade foi perdida.
      </p>
      <select
        className={inputCls + " w-full mb-4"}
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
      >
        {MOTIVOS_PERDA.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          onClick={() => onConfirm(motivo)}
          className="px-4 py-2 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700"
        >
          Confirmar perda
        </button>
      </div>
    </Modal>
  );
}

function AtividadeFormModal({
  onClose,
  onSave,
  clientes,
  presetClienteId,
  presetTipo,
}) {
  const presetCliente = clientes.find((c) => c.id === presetClienteId);
  const [form, setForm] = useState({
    tipo: presetTipo || TIPOS_ATIVIDADE[0],
    data: todayISO(),
    hora: "09:00",
    responsavelId: presetCliente?.vendedorId || VENDEDORES[0].id,
    observacao: presetCliente ? `Retorno para ${presetCliente.nome}` : "",
    clienteId: presetClienteId || "",
    status: "pendente",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <Modal title="Nova atividade" onClose={onClose}>
      <form
        className="grid grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
      >
        <Field label="Tipo">
          <select className={inputCls} value={form.tipo} onChange={set("tipo")}>
            {TIPOS_ATIVIDADE.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cliente/lead">
          <select
            className={inputCls}
            value={form.clienteId}
            onChange={set("clienteId")}
          >
            <option value="">Nenhum</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Data">
          <input
            className={inputCls}
            type="date"
            value={form.data}
            onChange={set("data")}
            required
          />
        </Field>
        <Field label="Horário">
          <input
            className={inputCls}
            type="time"
            value={form.hora}
            onChange={set("hora")}
            required
          />
        </Field>
        <Field label="Responsável">
          <select
            className={inputCls}
            value={form.responsavelId}
            onChange={set("responsavelId")}
          >
            {VENDEDORES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            className={inputCls}
            value={form.status}
            onChange={set("status")}
          >
            <option value="pendente">Pendente</option>
            <option value="concluido">Concluído</option>
          </select>
        </Field>
        <div className="col-span-2">
          <Field label="Observação">
            <textarea
              className={inputCls}
              rows={2}
              value={form.observacao}
              onChange={set("observacao")}
            />
          </Field>
        </div>
        <div className="col-span-2 flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-lg bg-teal-700 text-white hover:bg-teal-800"
          >
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
}

function OrcamentoFormModal({
  onClose,
  onSave,
  clientes,
  numero,
  presetClienteId,
}) {
  const [clienteId, setClienteId] = useState(
    presetClienteId || clientes[0]?.id || ""
  );
  const [vendedorId, setVendedorId] = useState(
    clientes.find((c) => c.id === (presetClienteId || clientes[0]?.id))
      ?.vendedorId || VENDEDORES[0].id
  );
  const [data, setData] = useState(todayISO());
  const [validade, setValidade] = useState(addDays(15));
  const [desconto, setDesconto] = useState(0);
  const [observacoes, setObservacoes] = useState("");
  const [itens, setItens] = useState([
    { id: uid(), produto: "", quantidade: 1, valorUnitario: 0 },
  ]);

  const total = useMemo(() => {
    const soma = itens.reduce(
      (s, i) =>
        s + (Number(i.quantidade) || 0) * (Number(i.valorUnitario) || 0),
      0
    );
    return Math.max(soma - (Number(desconto) || 0), 0);
  }, [itens, desconto]);

  const updateItem = (id, key, value) =>
    setItens((its) =>
      its.map((i) => (i.id === id ? { ...i, [key]: value } : i))
    );
  const addItem = () =>
    setItens((its) => [
      ...its,
      { id: uid(), produto: "", quantidade: 1, valorUnitario: 0 },
    ]);
  const removeItem = (id) =>
    setItens((its) => (its.length > 1 ? its.filter((i) => i.id !== id) : its));

  return (
    <Modal
      title={`Novo orçamento — #${String(numero).padStart(6, "0")}`}
      onClose={onClose}
      wide
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!clienteId) return;
          onSave({
            clienteId,
            vendedorId,
            data,
            validade,
            desconto: Number(desconto) || 0,
            observacoes,
            itens,
            valorTotal: total,
            status: "Rascunho",
          });
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Cliente">
            <select
              className={inputCls}
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              required
            >
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Vendedor">
            <select
              className={inputCls}
              value={vendedorId}
              onChange={(e) => setVendedorId(e.target.value)}
            >
              {VENDEDORES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Data">
            <input
              className={inputCls}
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </Field>
          <Field label="Validade">
            <input
              className={inputCls}
              type="date"
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
            />
          </Field>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-600 mb-2">
            Produtos / serviços
          </p>
          <div className="flex flex-col gap-2">
            {itens.map((item) => (
              <div
                key={item.id}
                className="grid gap-2 items-center"
                style={{ gridTemplateColumns: "1fr 80px 120px 90px 28px" }}
              >
                <input
                  className={inputCls}
                  placeholder="Produto ou serviço"
                  value={item.produto}
                  onChange={(e) =>
                    updateItem(item.id, "produto", e.target.value)
                  }
                />
                <input
                  className={inputCls}
                  type="number"
                  min="1"
                  value={item.quantidade}
                  onChange={(e) =>
                    updateItem(item.id, "quantidade", e.target.value)
                  }
                />
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.valorUnitario}
                  onChange={(e) =>
                    updateItem(item.id, "valorUnitario", e.target.value)
                  }
                />
                <span className="text-sm text-slate-600 text-right">
                  {formatBRL(
                    (Number(item.quantidade) || 0) *
                      (Number(item.valorUnitario) || 0)
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-2 text-xs text-teal-700 font-medium flex items-center gap-1 hover:text-teal-800"
          >
            <Plus size={13} /> Adicionar item
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Desconto (R$)">
            <input
              className={inputCls}
              type="number"
              min="0"
              step="0.01"
              value={desconto}
              onChange={(e) => setDesconto(e.target.value)}
            />
          </Field>
          <div className="flex flex-col justify-end items-end">
            <span className="text-xs text-slate-500">Valor total</span>
            <span className="text-xl font-semibold text-teal-800">
              {formatBRL(total)}
            </span>
          </div>
        </div>

        <Field label="Observações">
          <textarea
            className={inputCls}
            rows={2}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-lg bg-teal-700 text-white hover:bg-teal-800"
          >
            Salvar orçamento
          </button>
        </div>
      </form>
    </Modal>
  );
}

function MetaFormModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    vendedorId: VENDEDORES[0].id,
    periodo: "Mensal",
    valor: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <Modal title="Nova meta" onClose={onClose}>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.valor) return;
          onSave(form);
        }}
      >
        <Field label="Vendedor">
          <select
            className={inputCls}
            value={form.vendedorId}
            onChange={set("vendedorId")}
          >
            {VENDEDORES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Período">
          <select
            className={inputCls}
            value={form.periodo}
            onChange={set("periodo")}
          >
            {PERIODOS_META.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Valor da meta (R$)">
          <input
            className={inputCls}
            type="number"
            min="0"
            step="0.01"
            value={form.valor}
            onChange={set("valor")}
            required
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-lg bg-teal-700 text-white hover:bg-teal-800"
          >
            Salvar meta
          </button>
        </div>
      </form>
    </Modal>
  );
}

const NAV = [
  { id: "dashboard", label: "Dashboard", emoji: "🏠" },
  { id: "kanban", label: "Funil", emoji: "📊" },
  { id: "clientes", label: "Clientes", emoji: "👥" },
  { id: "banco", label: "Banco de Leads", emoji: "🗄️" },
  { id: "agenda", label: "Agenda", emoji: "📅" },
  { id: "orcamentos", label: "Orçamentos", emoji: "📄" },
  { id: "metas", label: "Metas", emoji: "🎯" },
];

export default function CRMApp() {
  const [empresaId, setEmpresaId] = useState(EMPRESAS[0].id);
  const [page, setPage] = useState("dashboard");
  const [data, setDataState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const [leadModal, setLeadModal] = useState(null);
  const [detailLead, setDetailLead] = useState(null);
  const [lossPending, setLossPending] = useState(null);
  const [atividadeModal, setAtividadeModal] = useState(null);
  const [orcamentoModal, setOrcamentoModal] = useState(null);
  const [metaModalOpen, setMetaModalOpen] = useState(false);
  const [bancoModalOpen, setBancoModalOpen] = useState(false);

  const [searchClientes, setSearchClientes] = useState("");
  const [searchBanco, setSearchBanco] = useState("");
  const [filterOrigem, setFilterOrigem] = useState("");
  const [filterOrcamento, setFilterOrcamento] = useState("");

  const storageKey = `${STORAGE_PREFIX}:${empresaId}`;
  const loadedRef = useRef({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await window.storage.get(storageKey, false);
        if (!cancelled) {
          if (res && res.value) {
            setDataState(JSON.parse(res.value));
          } else {
            const initial = buildInitialState();
            setDataState(initial);
          }
        }
      } catch (e) {
        if (!cancelled) setDataState(buildInitialState());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!data || loading) return;
    const key = storageKey;
    (async () => {
      try {
        await window.storage.set(key, JSON.stringify(data), false);
      } catch (e) {}
    })();
  }, [data, storageKey, loading]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  function updateLeads(fn) {
    setDataState((d) => ({ ...d, leads: fn(d.leads) }));
  }

  function handleSaveLead(form) {
    if (leadModal.mode === "edit") {
      updateLeads((leads) =>
        leads.map((l) =>
          l.id === leadModal.lead.id
            ? { ...l, ...form, valor: Number(form.valor) || 0 }
            : l
        )
      );
      showToast("Cliente atualizado.");
    } else {
      const novo = {
        id: uid(),
        ...form,
        valor: Number(form.valor) || 0,
        etapa: leadModal.mode === "banco" ? "banco" : "novo_contato",
        motivoPerda: "",
        createdAt: todayISO(),
        historico: [{ data: todayISO(), texto: "Lead cadastrado no sistema." }],
      };
      updateLeads((leads) => [novo, ...leads]);
      showToast("Lead cadastrado.");
    }
    setLeadModal(null);
  }

  function applyStageChange(lead, novaEtapa) {
    if (novaEtapa === "perdido") {
      setLossPending({ lead, novaEtapa });
      return;
    }
    updateLeads((leads) =>
      leads.map((l) =>
        l.id === lead.id
          ? {
              ...l,
              etapa: novaEtapa,
              historico: [
                ...(l.historico || []),
                {
                  data: todayISO(),
                  texto: `Movido para "${stageLabel(novaEtapa)}".`,
                },
              ],
            }
          : l
      )
    );
    setDetailLead((d) =>
      d && d.id === lead.id ? { ...d, etapa: novaEtapa } : d
    );
  }

  function confirmLoss(motivo) {
    const { lead } = lossPending;
    updateLeads((leads) =>
      leads.map((l) =>
        l.id === lead.id
          ? {
              ...l,
              etapa: "perdido",
              motivoPerda: motivo,
              historico: [
                ...(l.historico || []),
                {
                  data: todayISO(),
                  texto: `Marcado como perdido — motivo: ${motivo}.`,
                },
              ],
            }
          : l
      )
    );
    setLossPending(null);
    setDetailLead(null);
    showToast("Oportunidade marcada como perdida.");
  }

  function addToFunnel(lead) {
    updateLeads((leads) =>
      leads.map((l) =>
        l.id === lead.id
          ? {
              ...l,
              etapa: "novo_contato",
              historico: [
                ...(l.historico || []),
                { data: todayISO(), texto: "Adicionado ao funil de vendas." },
              ],
            }
          : l
      )
    );
    setDetailLead(null);
    setBancoModalOpen(false);
    showToast("Lead adicionado ao funil.");
  }

  function copyLead(lead) {
    const texto = [
      `Nome: ${lead.nome}`,
      `Empresa: ${lead.empresa || "-"}`,
      `Telefone: ${lead.telefone || "-"}`,
      `WhatsApp: ${lead.whatsapp || "-"}`,
      `E-mail: ${lead.email || "-"}`,
      `Cidade: ${lead.cidade || "-"}`,
      `Origem: ${lead.origem}`,
      `Vendedor: ${vendedorNome(lead.vendedorId)}`,
      `Temperatura: ${TEMP_CONFIG[lead.temperatura]?.label}`,
      `Valor da oportunidade: ${formatBRL(lead.valor)}`,
      `Etapa atual: ${stageLabel(lead.etapa)}`,
      `Próximo contato: ${formatDateBR(lead.proximoContato)}`,
      `Observações: ${lead.observacoes || "-"}`,
    ].join("\n");
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(texto)
        .then(() => showToast("Informações copiadas."));
    }
  }

  function deleteLead(id) {
    updateLeads((leads) => leads.filter((l) => l.id !== id));
    showToast("Removido.");
  }

  function saveAtividade(form) {
    setDataState((d) => ({
      ...d,
      atividades: [{ id: uid(), ...form }, ...d.atividades],
    }));
    setAtividadeModal(null);
    showToast("Atividade agendada.");
  }

  function toggleAtividade(id) {
    setDataState((d) => ({
      ...d,
      atividades: d.atividades.map((a) =>
        a.id === id
          ? {
              ...a,
              status: a.status === "concluido" ? "pendente" : "concluido",
            }
          : a
      ),
    }));
  }

  function saveOrcamento(form) {
    setDataState((d) => ({
      ...d,
      orcamentos: [
        { id: uid(), numero: d.nextOrcamento, ...form },
        ...d.orcamentos,
      ],
      nextOrcamento: d.nextOrcamento + 1,
    }));
    setOrcamentoModal(null);
    showToast(
      `Orçamento #${String(data.nextOrcamento).padStart(6, "0")} criado.`
    );
  }

  function updateOrcamentoStatus(id, status) {
    setDataState((d) => ({
      ...d,
      orcamentos: d.orcamentos.map((o) => (o.id === id ? { ...o, status } : o)),
    }));
  }

  function saveMeta(form) {
    setDataState((d) => ({
      ...d,
      metas: [
        {
          id: uid(),
          vendedorId: form.vendedorId,
          periodo: form.periodo,
          valor: Number(form.valor) || 0,
        },
        ...d.metas,
      ],
    }));
    setMetaModalOpen(false);
    showToast("Meta cadastrada.");
  }

  function deleteMeta(id) {
    setDataState((d) => ({ ...d, metas: d.metas.filter((m) => m.id !== id) }));
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400 text-sm">
        Carregando…
      </div>
    );
  }

  const clientesFunil = data.leads.filter((l) => l.etapa !== "banco");
  const bancoLeads = data.leads.filter((l) => l.etapa === "banco");

  return (
    <div
      className="w-full min-h-[600px] bg-slate-50 text-slate-800"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        :root { --font-display: 'Sora', sans-serif; --font-body: 'Inter', sans-serif; }
        .crm-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .crm-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .crm-sidebar { display: flex; flex-direction: column; gap: 4px; width: 224px; }
        .crm-nav-btn { display: flex; flex-direction: row; width: 100%; text-align: left; }
        @media (max-width: 640px) {
          .crm-sidebar { width: 64px; }
          .crm-sidebar-empresa { display: none; }
          .crm-nav-btn { justify-content: center; padding-left: 0; padding-right: 0; }
          .crm-nav-label { display: none; }
        }
      `}</style>

      <Toast message={toast} />

      {leadModal && (
        <LeadFormModal
          initial={leadModal.mode === "edit" ? leadModal.lead : null}
          onClose={() => setLeadModal(null)}
          onSave={handleSaveLead}
        />
      )}
      {detailLead && (
        <LeadDetailModal
          lead={data.leads.find((l) => l.id === detailLead.id) || detailLead}
          onClose={() => setDetailLead(null)}
          onEdit={(l) => {
            setDetailLead(null);
            setLeadModal({ mode: "edit", lead: l });
          }}
          onCopy={copyLead}
          onChangeStage={applyStageChange}
          onAddToFunnel={addToFunnel}
        />
      )}
      {lossPending && (
        <LossReasonModal
          onClose={() => setLossPending(null)}
          onConfirm={confirmLoss}
        />
      )}
      {atividadeModal && (
        <AtividadeFormModal
          onClose={() => setAtividadeModal(null)}
          onSave={saveAtividade}
          clientes={data.leads}
          presetClienteId={atividadeModal.clienteId}
          presetTipo={atividadeModal.tipo}
        />
      )}
      {orcamentoModal && (
        <OrcamentoFormModal
          onClose={() => setOrcamentoModal(null)}
          onSave={saveOrcamento}
          clientes={data.leads}
          numero={data.nextOrcamento}
          presetClienteId={orcamentoModal.clienteId}
        />
      )}
      {metaModalOpen && (
        <MetaFormModal
          onClose={() => setMetaModalOpen(false)}
          onSave={saveMeta}
        />
      )}

      <div className="flex">
        {/* Sidebar — sempre vertical */}
        <aside className="crm-sidebar shrink-0 bg-slate-900 text-slate-300 min-h-[600px] py-5 px-3">
          <div className="crm-sidebar-empresa mb-6">
            <select
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
              className="w-full bg-slate-800 text-white text-sm rounded-lg px-2 py-2 border border-slate-700"
            >
              {EMPRESAS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome}
                </option>
              ))}
            </select>
          </div>
          {NAV.map((n) => {
            const active = page === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                className={`crm-nav-btn flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-teal-700 text-white"
                    : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <span className="text-base leading-none">{n.emoji}</span>
                <span className="crm-nav-label">{n.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 md:p-6">
          {page === "dashboard" && <Dashboard data={data} />}

          {page === "kanban" && (
            <Kanban
              leads={clientesFunil}
              onDropStage={applyStageChange}
              onOpen={setDetailLead}
              onNew={() => setLeadModal({ mode: "novo" })}
            />
          )}

          {page === "clientes" && (
            <ClientesList
              leads={clientesFunil}
              search={searchClientes}
              setSearch={setSearchClientes}
              onOpen={setDetailLead}
              onNew={() => setLeadModal({ mode: "novo" })}
              onEdit={(l) => setLeadModal({ mode: "edit", lead: l })}
              onDelete={deleteLead}
              onCopy={copyLead}
              onCreateOrcamento={(l) => setOrcamentoModal({ clienteId: l.id })}
              onScheduleRetorno={(l) =>
                setAtividadeModal({ clienteId: l.id, tipo: "Retorno" })
              }
            />
          )}

          {page === "banco" && (
            <BancoLeads
              leads={bancoLeads}
              search={searchBanco}
              setSearch={setSearchBanco}
              filterOrigem={filterOrigem}
              setFilterOrigem={setFilterOrigem}
              onOpen={setDetailLead}
              onNew={() => setLeadModal({ mode: "banco" })}
              onEdit={(l) => setLeadModal({ mode: "edit", lead: l })}
              onDelete={deleteLead}
              onAddToFunnel={addToFunnel}
            />
          )}

          {page === "agenda" && (
            <Agenda
              atividades={data.atividades}
              leads={data.leads}
              onNew={() => setAtividadeModal({})}
              onToggle={toggleAtividade}
            />
          )}

          {page === "orcamentos" && (
            <Orcamentos
              orcamentos={data.orcamentos}
              leads={data.leads}
              filter={filterOrcamento}
              setFilter={setFilterOrcamento}
              onNew={() => setOrcamentoModal({})}
              onStatusChange={updateOrcamentoStatus}
            />
          )}

          {page === "metas" && (
            <Metas
              metas={data.metas}
              leads={data.leads}
              onNew={() => setMetaModalOpen(true)}
              onDelete={deleteMeta}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function Dashboard({ data }) {
  const { leads, orcamentos, metas } = data;
  const fechados = leads.filter((l) => l.etapa === "fechado");
  const perdidos = leads.filter((l) => l.etapa === "perdido");
  const ativos = leads.filter(
    (l) => !["banco", "fechado", "perdido"].includes(l.etapa)
  );
  const valorAberto = ativos.reduce((s, l) => s + (Number(l.valor) || 0), 0);
  const valorFechado = fechados.reduce((s, l) => s + (Number(l.valor) || 0), 0);
  const startMonth = new Date();
  startMonth.setDate(1);
  const clientesNovos = leads.filter(
    (l) => l.etapa !== "banco" && new Date(l.createdAt) >= startMonth
  ).length;
  const taxaConversao =
    fechados.length + perdidos.length > 0
      ? Math.round(
          (fechados.length / (fechados.length + perdidos.length)) * 100
        )
      : 0;
  const metaMedia =
    metas.length > 0
      ? Math.round(
          metas.reduce((s, m) => {
            const realizado = fechados
              .filter((l) => l.vendedorId === m.vendedorId)
              .reduce((s2, l) => s2 + l.valor, 0);
            return (
              s + (m.valor > 0 ? Math.min(100, (realizado / m.valor) * 100) : 0)
            );
          }, 0) / metas.length
        )
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <h2
        className="text-lg font-semibold text-slate-800"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Dashboard
      </h2>
      <p className="text-sm text-slate-400 -mt-4">
        Resumo geral do período atual.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Vendas"
          value={fechados.length}
          sub={`${fechados.length} fechadas`}
          tone="emerald"
        />
        <StatCard label="Valor vendido" value={formatBRL(valorFechado)} />
        <StatCard
          label="Oportunidades"
          value={ativos.length}
          sub={formatBRL(valorAberto)}
        />
        <StatCard label="Orçamentos" value={orcamentos.length} />
        <StatCard
          label="Clientes novos"
          value={clientesNovos}
          sub="neste mês"
        />
        <StatCard label="Conversão" value={`${taxaConversao}%`} />
        <StatCard
          label="Metas"
          value={`${metaMedia}%`}
          sub={`${metas.length} meta(s) cadastrada(s)`}
          tone="amber"
        />
      </div>
    </div>
  );
}

function KanbanCard({ lead, onOpen }) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/lead-id", lead.id)}
      onClick={() => onOpen(lead)}
      className="bg-white rounded-lg border border-slate-200 p-3 cursor-pointer hover:border-teal-400 hover:shadow-sm transition-all"
    >
      <p className="text-sm font-medium text-slate-800 truncate">{lead.nome}</p>
      <p className="text-xs text-slate-400 truncate mb-2">
        {vendedorNome(lead.vendedorId)}
      </p>
      <div className="flex items-center justify-between">
        <TempBadge temperatura={lead.temperatura} />
        <span className="text-xs font-semibold text-slate-700">
          {formatBRL(lead.valor)}
        </span>
      </div>
    </div>
  );
}

function Kanban({ leads, onDropStage, onOpen, onNew }) {
  const [dragOver, setDragOver] = useState(null);

  function handleDrop(e, stageId) {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData("text/lead-id");
    const lead = leads.find((l) => l.id === id);
    if (lead && lead.etapa !== stageId) onDropStage(lead, stageId);
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h2
          className="text-lg font-semibold text-slate-800"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Funil
        </h2>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 bg-teal-700 text-white text-sm px-3 py-2 rounded-lg hover:bg-teal-800"
        >
          <Plus size={15} /> Novo lead
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto crm-scroll pb-2">
        {STAGES.map((stage) => {
          const items = leads.filter((l) => l.etapa === stage.id);
          const total = items.reduce((s, l) => s + l.valor, 0);
          return (
            <div
              key={stage.id}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(stage.id);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`flex flex-col shrink-0 w-64 rounded-xl p-2 ${
                dragOver === stage.id
                  ? "bg-teal-50 ring-2 ring-teal-300"
                  : "bg-slate-100"
              }`}
            >
              <div className="flex items-center justify-between px-1 pb-2">
                <span className="text-xs font-semibold text-slate-600">
                  {stage.label}
                </span>
                <span className="text-xs text-slate-400">{items.length}</span>
              </div>
              <p className="text-xs text-slate-400 px-1 pb-2">
                {formatBRL(total)}
              </p>
              <div className="flex flex-col gap-2 min-h-[80px]">
                {items.map((lead) => (
                  <KanbanCard key={lead.id} lead={lead} onOpen={onOpen} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClientesList({
  leads,
  search,
  setSearch,
  onOpen,
  onNew,
  onEdit,
  onDelete,
  onCopy,
  onCreateOrcamento,
  onScheduleRetorno,
}) {
  const filtered = leads.filter((l) =>
    (l.nome + l.empresa).toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2
          className="text-lg font-semibold text-slate-800"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Clientes e leads
        </h2>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 bg-teal-700 text-white text-sm px-3 py-2 rounded-lg hover:bg-teal-800"
        >
          <Plus size={15} /> Novo cliente
        </button>
      </div>
      <div className="relative max-w-xs">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          className={inputCls + " pl-9 w-full"}
          placeholder="Buscar por nome ou empresa"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto crm-scroll">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
              <th className="py-2.5 px-4 font-medium">Nome</th>
              <th className="py-2.5 px-4 font-medium">Vendedor</th>
              <th className="py-2.5 px-4 font-medium">Etapa</th>
              <th className="py-2.5 px-4 font-medium">Temperatura</th>
              <th className="py-2.5 px-4 font-medium">Valor</th>
              <th className="py-2.5 px-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr
                key={l.id}
                className="border-b border-slate-50 hover:bg-slate-50"
              >
                <td
                  className="py-2.5 px-4 cursor-pointer"
                  onClick={() => onOpen(l)}
                >
                  <p className="font-medium text-slate-800">{l.nome}</p>
                  <p className="text-xs text-slate-400">{l.empresa}</p>
                </td>
                <td className="py-2.5 px-4 text-slate-600">
                  {vendedorNome(l.vendedorId)}
                </td>
                <td className="py-2.5 px-4 text-slate-600">
                  {stageLabel(l.etapa)}
                </td>
                <td className="py-2.5 px-4">
                  <TempBadge temperatura={l.temperatura} />
                </td>
                <td className="py-2.5 px-4 font-medium text-slate-700">
                  {formatBRL(l.valor)}
                </td>
                <td className="py-2.5 px-4">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => onOpen(l)}
                      title="Visualizar"
                      className="text-slate-400 hover:text-teal-700"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => onEdit(l)}
                      title="Editar"
                      className="text-slate-400 hover:text-teal-700"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onCopy(l)}
                      title="Copiar informações"
                      className="text-slate-400 hover:text-teal-700"
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      onClick={() => onCreateOrcamento(l)}
                      title="Criar orçamento"
                      className="text-slate-400 hover:text-teal-700"
                    >
                      <FileText size={15} />
                    </button>
                    <button
                      onClick={() => onScheduleRetorno(l)}
                      title="Agendar retorno"
                      className="text-slate-400 hover:text-teal-700"
                    >
                      <CalendarClock size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(l.id)}
                      title="Excluir"
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-slate-400 text-sm"
                >
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BancoLeads({
  leads,
  search,
  setSearch,
  filterOrigem,
  setFilterOrigem,
  onOpen,
  onNew,
  onEdit,
  onDelete,
  onAddToFunnel,
}) {
  const filtered = leads.filter(
    (l) =>
      (l.nome + l.empresa).toLowerCase().includes(search.toLowerCase()) &&
      (!filterOrigem || l.origem === filterOrigem)
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2
            className="text-lg font-semibold text-slate-800"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Banco de leads
          </h2>
          <p className="text-xs text-slate-400">
            Leads ainda não inseridos no funil de vendas.
          </p>
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 bg-teal-700 text-white text-sm px-3 py-2 rounded-lg hover:bg-teal-800"
        >
          <UserPlus size={15} /> Adicionar lead
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className={inputCls + " pl-9 w-full"}
            placeholder="Pesquisar leads"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={inputCls}
          value={filterOrigem}
          onChange={(e) => setFilterOrigem(e.target.value)}
        >
          <option value="">Todas as origens</option>
          {ORIGENS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-slate-400">
        Estrutura pronta para importação/exportação futura via CSV/Excel.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((l) => (
          <div
            key={l.id}
            className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-2"
          >
            <div className="flex items-start justify-between">
              <div className="cursor-pointer" onClick={() => onOpen(l)}>
                <p className="font-medium text-slate-800 text-sm">{l.nome}</p>
                <p className="text-xs text-slate-400">{l.empresa}</p>
              </div>
              <TempBadge temperatura={l.temperatura} />
            </div>
            <p className="text-xs text-slate-500">Origem: {l.origem}</p>
            <p className="text-xs text-slate-500">
              Vendedor: {vendedorNome(l.vendedorId)}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
              <span className="text-sm font-semibold text-slate-700">
                {formatBRL(l.valor)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(l)}
                  className="text-slate-400 hover:text-teal-700"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onDelete(l.id)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <button
              onClick={() => onAddToFunnel(l)}
              className="mt-1 text-xs text-teal-700 font-medium flex items-center gap-1 hover:text-teal-800"
            >
              <ArrowRight size={12} /> Adicionar ao funil
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-400 col-span-full text-center py-8">
            Nenhum lead encontrado.
          </p>
        )}
      </div>
    </div>
  );
}

function Agenda({ atividades, leads, onNew, onToggle }) {
  const ordenadas = [...atividades].sort((a, b) =>
    (a.data + a.hora).localeCompare(b.data + b.hora)
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2
          className="text-lg font-semibold text-slate-800"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Agenda
        </h2>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 bg-teal-700 text-white text-sm px-3 py-2 rounded-lg hover:bg-teal-800"
        >
          <Plus size={15} /> Nova atividade
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {ordenadas.map((a) => {
          const cliente = leads.find((l) => l.id === a.clienteId);
          return (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3"
            >
              <button
                onClick={() => onToggle(a.id)}
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  a.status === "concluido"
                    ? "bg-emerald-600 border-emerald-600"
                    : "border-slate-300"
                }`}
              >
                {a.status === "concluido" && (
                  <Check size={12} className="text-white" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
                    {a.tipo}
                  </span>
                  {cliente && (
                    <span className="text-sm text-slate-700 font-medium">
                      {cliente.nome}
                    </span>
                  )}
                </div>
                {a.observacao && (
                  <p className="text-xs text-slate-500 truncate">
                    {a.observacao}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                  <Clock size={11} />
                  {formatDateBR(a.data)} {a.hora}
                </p>
                <p className="text-xs text-slate-400">
                  {vendedorNome(a.responsavelId)}
                </p>
              </div>
            </div>
          );
        })}
        {ordenadas.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">
            Nenhuma atividade agendada.
          </p>
        )}
      </div>
    </div>
  );
}

const STATUS_TONE = {
  Rascunho: "slate",
  Enviado: "sky",
  Negociação: "amber",
  Aprovado: "emerald",
  Recusado: "rose",
};

function Orcamentos({
  orcamentos,
  leads,
  filter,
  setFilter,
  onNew,
  onStatusChange,
}) {
  const filtered = orcamentos.filter((o) => !filter || o.status === filter);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2
          className="text-lg font-semibold text-slate-800"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Orçamentos
        </h2>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 bg-teal-700 text-white text-sm px-3 py-2 rounded-lg hover:bg-teal-800"
        >
          <Plus size={15} /> Novo orçamento
        </button>
      </div>
      <select
        className={inputCls + " max-w-xs"}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="">Todos os status</option>
        {STATUS_ORCAMENTO.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto crm-scroll">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
              <th className="py-2.5 px-4 font-medium">Número</th>
              <th className="py-2.5 px-4 font-medium">Cliente</th>
              <th className="py-2.5 px-4 font-medium">Vendedor</th>
              <th className="py-2.5 px-4 font-medium">Data</th>
              <th className="py-2.5 px-4 font-medium">Validade</th>
              <th className="py-2.5 px-4 font-medium">Valor</th>
              <th className="py-2.5 px-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const cliente = leads.find((l) => l.id === o.clienteId);
              return (
                <tr
                  key={o.id}
                  className="border-b border-slate-50 hover:bg-slate-50"
                >
                  <td className="py-2.5 px-4 font-medium text-slate-700">
                    #{String(o.numero).padStart(6, "0")}
                  </td>
                  <td className="py-2.5 px-4 text-slate-700">
                    {cliente?.nome || "—"}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    {vendedorNome(o.vendedorId)}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    {formatDateBR(o.data)}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    {formatDateBR(o.validade)}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-700">
                    {formatBRL(
                      o.valorTotal ??
                        o.itens?.reduce(
                          (s, i) => s + i.quantidade * i.valorUnitario,
                          0
                        )
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    <select
                      value={o.status}
                      onChange={(e) => onStatusChange(o.id, e.target.value)}
                      className={`text-xs rounded-full px-2 py-1 border-0 bg-${
                        STATUS_TONE[o.status] || "slate"
                      }-100 text-${
                        STATUS_TONE[o.status] || "slate"
                      }-700 font-medium`}
                    >
                      {STATUS_ORCAMENTO.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-slate-400 text-sm"
                >
                  Nenhum orçamento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Metas({ metas, leads, onNew, onDelete }) {
  const fechados = leads.filter((l) => l.etapa === "fechado");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2
          className="text-lg font-semibold text-slate-800"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Metas
        </h2>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 bg-teal-700 text-white text-sm px-3 py-2 rounded-lg hover:bg-teal-800"
        >
          <Plus size={15} /> Nova meta
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {metas.map((m) => {
          const realizado = fechados
            .filter((l) => l.vendedorId === m.vendedorId)
            .reduce((s, l) => s + l.valor, 0);
          const pct = m.valor > 0 ? Math.round((realizado / m.valor) * 100) : 0;
          return (
            <div
              key={m.id}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-slate-800 text-sm">
                    {vendedorNome(m.vendedorId)}
                  </p>
                  <p className="text-xs text-slate-400">
                    Meta {m.periodo.toLowerCase()}
                  </p>
                </div>
                <button
                  onClick={() => onDelete(m.id)}
                  className="text-slate-300 hover:text-rose-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full rounded-full ${
                    pct >= 100 ? "bg-emerald-600" : "bg-teal-600"
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>
                  {formatBRL(realizado)} de {formatBRL(m.valor)}
                </span>
                <span className="font-medium text-slate-700">{pct}%</span>
              </div>
            </div>
          );
        })}
        {metas.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8 col-span-full">
            Nenhuma meta cadastrada.
          </p>
        )}
      </div>
    </div>
  );
}
