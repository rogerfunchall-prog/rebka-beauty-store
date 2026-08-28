# Configuração da integração Olist ERP

> As credenciais desta integração devem ser incluídas apenas nas configurações seguras do projeto. Nunca registre chaves, tokens ou segredos neste repositório.

## 1. Preparar os recursos na Olist

Na conta Olist ERP, instale **Gestão de Aplicativos** ou localize **Aplicativos API v3**. Crie um aplicativo para a Rebka Beauty e informe como URL de retorno:

```text
https://www.rebka.com.br/api/olist/oauth/callback
```

Conceda somente os acessos necessários a produtos, preços, estoque, pedidos, contatos, formas de envio e expedição. Registre os valores de **Client ID** e **Client Secret** para inclusão segura no projeto.

Instale também a extensão **Webhooks**. A URL que deverá ser configurada após os segredos estarem cadastrados é:

```text
https://www.rebka.com.br/api/olist/webhooks?token=<TINY_WEBHOOK_SECRET>
```

## 2. Variáveis seguras necessárias

| Variável | Finalidade | Formato |
|---|---|---|
| `TINY_CLIENT_ID` | Identificador público do aplicativo OAuth Olist | Texto fornecido pela Olist |
| `TINY_CLIENT_SECRET` | Segredo do aplicativo OAuth | Texto fornecido pela Olist |
| `TINY_OAUTH_REDIRECT_URI` | URL de retorno registrada na Olist | `https://www.rebka.com.br/api/olist/oauth/callback` |
| `TINY_TOKEN_ENCRYPTION_KEY` | Criptografa os tokens persistidos | 64 caracteres hexadecimais aleatórios |
| `TINY_WEBHOOK_SECRET` | Protege o endpoint de webhook | Texto aleatório forte, com 32+ caracteres |

## 3. Autorizar e sincronizar

Após cadastrar as variáveis, acesse `/admin/olist` com a conta proprietária do projeto. Clique em **Conectar conta Olist**, conclua o consentimento e então use **Sincronizar agora**. A vitrine passa a priorizar o catálogo em cache somente depois de receber produtos ativos da Olist.

O painel também permite publicar produtos simples, registrar lançamentos de estoque, atualizar preços, associar imagens externas e agendar a reconciliação do catálogo. A criação de pedidos é idempotente na camada de servidor; o pagamento seguro deve ser conectado a um provedor financeiro escolhido pelo negócio.

## Referências

- [Autenticação da API v3](https://api-docs.erp.olist.com/documentacao/comecando/autenticacao)
- [Criação de produto](https://api-docs.erp.olist.com/api-reference/produtos/criar-produto)
- [Atualização de estoque](https://api-docs.erp.olist.com/api-reference/estoque/atualizar-o-estoque-de-um-produto)
- [Anexos e imagens de produto](https://api-docs.erp.olist.com/api-reference/produtos/adicionar-anexos-e-imagens-ao-produto)
- [Webhooks](https://api-docs.erp.olist.com/documentacao/webhooks/webhooks)
