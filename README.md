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

## Configurar o JSONBin

1. Crie um bin em [jsonbin.io](https://jsonbin.io).
2. Copie `config.example.js` para `js/config.js`.
3. Preencha `JSONBIN_BIN_ID` com o ID do bin e `JSONBIN_ACCESS_KEY` com uma
   chave de acesso que possa ler e atualizar o bin.
4. Sirva o projeto novamente.

Com a configuração preenchida, o app carrega o currículo do JSONBin ao iniciar
e salva alterações automaticamente após uma pequena pausa. O conteúdo enviado
tem este formato:

```json
{
  "resume": {},
  "versions": []
}
```

Sem configuração ou quando o JSONBin estiver indisponível, o app usa os dados
de `js/data.js` no primeiro acesso e mantém as alterações no `localStorage`.

## Estrutura

```
index.html            # casca, CSP, CSS e entrypoint
config.example.js     # template da configuração do JSONBin
css/                  # estilos da interface, folha e impressão
js/
  config.js           # credenciais locais (gitignorado)
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

Não coloque chaves administrativas ou segredos de alto privilégio no
front-end. O `JSONBIN_ACCESS_KEY` será enviado pelo navegador para a API do
JSONBin; use uma chave com o menor escopo possível e regras de acesso
adequadas ao bin.
