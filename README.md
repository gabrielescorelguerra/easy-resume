# Gerador de currículo

Aplicação estática em HTML, CSS e JavaScript puro que gera um currículo com
preview em tempo real e exportação para PDF pela impressão do navegador. Os
dados iniciais ficam em `js/data.js`; alterações são salvas localmente e,
opcionalmente, sincronizadas com um bin do [JSONBin.io](https://jsonbin.io).

## Como rodar

Por usar ES Modules, sirva os arquivos por HTTP:

```bash
npx serve .
# ou
python3 -m http.server
```

Abra `http://localhost:3000` ou a porta indicada.

## Configurar o JSONBin na Vercel

1. Crie um bin em [jsonbin.io](https://jsonbin.io).
2. Na Vercel, abra **Settings → Environment Variables**.
3. Crie estas variáveis nos ambientes desejados:

```text
JSONBIN_BIN_ID=seu-id-do-bin
JSONBIN_ACCESS_KEY=sua-chave-de-acesso
```

4. Faça um novo deploy.

O front-end chama `/api/jsonbin`. Essa função serverless lê as credenciais do
ambiente e é a única parte que se comunica com o JSONBin. O app carrega o
currículo ao iniciar e salva alterações automaticamente após uma pequena pausa.
O conteúdo enviado tem este formato:

```json
{
  "resume": {},
  "versions": []
}
```

Quando o JSONBin estiver indisponível, o app usa os dados de `js/data.js` no
primeiro acesso e mantém as alterações no `localStorage`.

## Estrutura

```
index.html            # casca, CSP, CSS e entrypoint
.env.example          # nomes das variáveis de ambiente
api/jsonbin.js        # backend serverless que protege as credenciais
css/                  # estilos da interface, folha e impressão
js/
  data.js             # fonte versionada dos dados iniciais
  defaults.js         # cópia do modelo inicial
  jsonbin.js          # leitura e sincronização com JSONBin
  state.js            # estado, localStorage e versões
  editor.js           # painel de edição
  preview.js          # renderização da folha
  events.js           # eventos da interface
  main.js             # inicialização
```

## Segurança

As credenciais não ficam mais no JavaScript enviado ao navegador. A chave é
usada somente pela função serverless da Vercel. Não faça commit de `.env` e
use uma chave com o menor escopo possível.
