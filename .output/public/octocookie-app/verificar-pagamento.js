// netlify/functions/verificar-pagamento.js
//
// Confirma se existe um pagamento APROVADO no Mercado Pago para um
// determinado CPF, dentro de uma janela de tempo recente.
//
// Por quê assim:
// - O MP_ACCESS_TOKEN só existe aqui (variável de ambiente do servidor),
//   nunca é enviado ao navegador.
// - Usamos o endpoint oficial /v1/payments/search (histórico de
//   transações da própria conta Mercado Pago) como fonte da verdade —
//   não existe (nem deveria existir) uma forma de "ler o extrato
//   bancário" de um CPF alheio sem o consentimento do titular via
//   Open Finance. Isso não é implementado aqui de propósito.
//
// Configurar em Netlify → Site configuration → Environment variables:
//   MP_ACCESS_TOKEN = TEST-xxxxxxxx (ou credencial de produção)

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return resposta(405, { erro: "Método não permitido. Use POST." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return resposta(400, { erro: "JSON inválido no corpo da requisição." });
  }

  const cpf = String(payload.cpf || "").replace(/\D/g, "");
  if (cpf.length !== 11) {
    return resposta(400, { erro: "CPF inválido. Envie 11 dígitos." });
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return resposta(500, {
      erro: "MP_ACCESS_TOKEN não configurado no servidor (variável de ambiente ausente).",
    });
  }

  try {
    // Busca pagamentos recentes da conta (últimos 30 dias), paginando
    // até encontrar o CPF ou esgotar os resultados. Para volumes muito
    // altos de vendas, o ideal em produção é substituir esta varredura
    // por um webhook (IPN) que já salva payer + status num banco de
    // dados no momento da aprovação — mais rápido e sem paginação manual.
    const LIMITE_POR_PAGINA = 50;
    const MAX_PAGINAS = 6; // até 300 pagamentos recentes
    let pagamentoEncontrado = null;

    for (let pagina = 0; pagina < MAX_PAGINAS && !pagamentoEncontrado; pagina++) {
      const params = new URLSearchParams({
        sort: "date_created",
        criteria: "desc",
        range: "date_created",
        begin_date: "NOW-30DAYS",
        end_date: "NOW",
        limit: String(LIMITE_POR_PAGINA),
        offset: String(pagina * LIMITE_POR_PAGINA),
      });

      const mpRes = await fetch(
        `https://api.mercadopago.com/v1/payments/search?${params.toString()}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!mpRes.ok) {
        const detalhe = await mpRes.text();
        return resposta(502, {
          erro: "Falha ao consultar a API do Mercado Pago.",
          detalhe,
        });
      }

      const dados = await mpRes.json();
      const resultados = dados.results || [];

      pagamentoEncontrado = resultados.find((p) => {
        const idNumero = p?.payer?.identification?.number;
        const cpfDoPagamento = String(idNumero || "").replace(/\D/g, "");
        return p.status === "approved" && cpfDoPagamento === cpf;
      });

      // Se essa página veio incompleta, não há mais páginas a buscar.
      if (resultados.length < LIMITE_POR_PAGINA) break;
    }

    if (!pagamentoEncontrado) {
      return resposta(200, { confirmado: false });
    }

    return resposta(200, {
      confirmado: true,
      pagamentoId: pagamentoEncontrado.id,
      dataAprovacao: pagamentoEncontrado.date_approved,
      valor: pagamentoEncontrado.transaction_amount,
      metodo: pagamentoEncontrado.payment_method_id,
    });
  } catch (err) {
    return resposta(500, { erro: "Erro interno ao verificar pagamento.", detalhe: err.message });
  }
};

function resposta(statusCode, corpo) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  };
}
