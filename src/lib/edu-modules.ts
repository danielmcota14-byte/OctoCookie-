/**
 * Módulos educativos "leves" do ecossistema OctoCookie (antigos sites
 * Finance e Start, agora páginas do mesmo sistema).
 * O prompt de sistema fica SÓ no servidor (api/edu-chat.ts usa EDU_SYSTEM).
 */
export type EduModuleId = "finance" | "start";

export type EduModuleConfig = {
  id: EduModuleId;
  /** Nome curto mostrado no cabeçalho */
  name: string;
  topbar: string;
  logo: string;
  accent: string;
  welcomeTitle: string;
  welcome: string;
  placeholder: string;
  hint: string;
  suggestions: { label: string; question: string }[];
};

export const EDU_MODULES: Record<EduModuleId, EduModuleConfig> = {
  finance: {
    id: "finance",
    name: "OctoCookie Finance",
    topbar: "Educação Financeira",
    logo: "OC",
    accent: "#2563eb",
    welcomeTitle: "Bem-vindo ao OctoCookie Finance",
    welcome:
      "Aprenda sobre orçamento, juros compostos, investimentos e gestão de riscos — sem promessas de enriquecimento rápido.",
    placeholder: "Pergunte sobre finanças...",
    hint: "Conteúdo educacional • Não é conselho financeiro personalizado",
    suggestions: [
      { label: "Orçamento mensal", question: "Como criar um orçamento mensal simples?" },
      { label: "Juros compostos", question: "Explique juros compostos com exemplo prático" },
      { label: "Renda fixa", question: "Diferença entre poupança, CDB e Tesouro Direto" },
      { label: "Investir com pouco", question: "Como começar a investir com pouco dinheiro?" },
      { label: "Gestão de riscos", question: "Principais riscos financeiros que as pessoas ignoram" },
      { label: "Sair das dívidas", question: "Como organizar e sair das dívidas?" },
    ],
  },
  start: {
    id: "start",
    name: "OctoCookie Start",
    topbar: "Empreendedorismo Digital",
    logo: "ST",
    accent: "#7c3aed",
    welcomeTitle: "Bem-vindo ao OctoCookie Start",
    welcome:
      "Explore criação digital, produtos, modelos de negócio e validação de ideias — sem promessas de sucesso garantido.",
    placeholder: "Pergunte sobre empreendedorismo...",
    hint: "Conteúdo educacional • Foque em aprendizado e experimentação",
    suggestions: [
      {
        label: "Primeiros passos",
        question: "Quais são os primeiros passos para criar um produto digital?",
      },
      { label: "Modelos de negócio", question: "Explique modelos de negócio digitais simples" },
      { label: "Validar ideia", question: "Como validar uma ideia com pouco dinheiro?" },
      { label: "Ferramentas no-code", question: "Ferramentas gratuitas para criar site ou app" },
      { label: "Conseguir clientes", question: "Como conseguir os primeiros clientes?" },
      {
        label: "Erros comuns",
        question: "Erros comuns de quem começa a empreender digitalmente",
      },
    ],
  },
};
