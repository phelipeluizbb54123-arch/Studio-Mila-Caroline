
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido."
    });
  }

  try {
    const {
      nome,
      telefone,
      servico,
      data,
      horario
    } = req.body || {};

    if (
      typeof nome !== "string" ||
      typeof telefone !== "string" ||
      typeof servico !== "string" ||
      typeof data !== "string" ||
      typeof horario !== "string"
    ) {
      return res.status(400).json({
        error: "Preencha todos os campos."
      });
    }

    if (
      nome.trim().length < 2 ||
      nome.length > 100 ||
      !/^[0-9()+\s-]{10,20}$/.test(telefone) ||
      !servico.trim() ||
      servico.length > 120 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data) ||
      !/^\d{2}:\d{2}$/.test(horario)
    ) {
      return res.status(400).json({
        error: "Dados do agendamento inválidos."
      });
    }

    const hora = Number(horario.slice(0, 2));
    const minuto = Number(horario.slice(3, 5));

    const dia = new Date(data + "T12:00:00Z");

    if (
      !Number.isFinite(dia.getTime()) ||
      dia.toISOString().slice(0, 10) !== data ||
      hora < 8 ||
      hora > 22 ||
      ![0, 30].includes(minuto) ||
      (hora === 22 && minuto !== 0)
    ) {
      return res.status(400).json({
        error: "Data ou horário inválido."
      });
    }

    const url = process.env.SUPABASE_URL;
    const secret = process.env.SUPABASE_SECRET_KEY;

    if (!url || !secret) {
      return res.status(503).json({
        error: "Sistema ainda não configurado."
      });
    }

    const response = await fetch(
      url + "/rest/v1/appointments",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": secret,
          "Authorization": "Bearer " + secret,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          client_name: nome.trim(),
          client_phone: telefone.trim(),
          service_name: servico.trim(),
          appointment_date: data,
          appointment_time: horario,
          status: "pending"
        })
      }
    );

    if (!response.ok) {
      return res.status(500).json({
        error: "Não foi possível registrar o pedido."
      });
    }

    return res.status(201).json({
      success: true,
      message: "Pedido enviado para confirmação."
    });

  } catch (error) {
    return res.status(500).json({
      error: "Erro ao processar o agendamento."
    });
  }
}
