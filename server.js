const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// CONFIGURE AQUI
const TOKEN = "SEU_TOKEN";
const INSTANCE = "SUA_INSTANCIA";

let clientes = {};

async function enviar(numero, texto) {
  await axios.post(
    `https://api.z-api.io/instances/${INSTANCE}/token/${TOKEN}/send-text`,
    {
      phone: numero,
      message: texto
    }
  );
}

app.post("/webhook", async (req, res) => {
  const numero = req.body.phone;
  const msg = (req.body.text.message || "").toLowerCase();

  if (!clientes[numero]) clientes[numero] = { etapa: "inicio" };
  let c = clientes[numero];

  if (msg === "oi") {
    c.etapa = "menu";
    await enviar(numero,
`💈 Barbearia

1 Agendar
2 Serviços`);
    return res.sendStatus(200);
  }

  if (c.etapa === "menu") {
    if (msg === "1") {
      c.etapa = "nome";
      await enviar(numero, "Seu nome?");
    }
  }

  if (c.etapa === "nome") {
    c.nome = msg;
    c.etapa = "data";
    await enviar(numero, "Digite a data");
  }

  if (c.etapa === "data") {
    c.data = msg;
    c.etapa = "fim";

    await enviar(numero,
`✅ Agendado!
${c.nome} - ${c.data}`);
  }

  res.sendStatus(200);
});

app.listen(3000, () => console.log("Rodando..."));
