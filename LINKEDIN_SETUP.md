# LinkedIn Easy MCP Server v2.0.0 - Guia de Configuração

## 🚀 Novidades da Versão 2.0.0

- ✅ **OpenID Connect**: Nova autenticação padrão do LinkedIn
- ✅ **API v2024.04**: Versão mais recente da API do LinkedIn  
- ✅ **Upload de Imagens**: Suporte para posts com imagens
- ✅ **Melhor Tratamento de Erros**: Mensagens mais claras sobre limitações
- ✅ **Rate Limiting**: Informações atualizadas sobre limites
- ✅ **Múltiplos Tipos de Post**: Texto, artigos/URLs e imagens

## ⚠️ Limitações Importantes da API do LinkedIn (2024/2025)

A API do LinkedIn tem **restrições severas** para aplicações de terceiros. A maioria das funcionalidades requer aprovação especial do LinkedIn.

### 📋 O que funciona com token básico:

| Funcionalidade | Status | Descrição |
|---|---|---|
| ✅ `test_connection` | **Sempre disponível** | Testar conexão e validar token |
| ✅ `get_profile` | **Sempre disponível** | Obter informações básicas do perfil via OpenID Connect |
| ✅ `get_complete_profile` | **Requer permissões especiais** | Obter perfil completo com experiências, educação e habilidades |
| ✅ `validate_token` | **Sempre disponível** | Verificar se o token é válido |
| ✅ `get_token_info` | **Sempre disponível** | Informações detalhadas sobre token e scopes |
| ⚠️ `create_text_post` | **Requer w_member_social** | Criar posts de texto |
| ⚠️ `create_article_post` | **Requer w_member_social** | Criar posts com artigos/URLs |
| ⚠️ `create_image_post` | **Requer w_member_social** | Criar posts com imagens |

### 🚫 O que requer aprovação especial:

| Funcionalidade | Status | Motivo |
|---|---|---|
| ❌ `get_connections` | **Restrito** | Requer parceria com LinkedIn |
| ❌ `search_people` | **Restrito** | Requer parceria com LinkedIn |
| ❌ `send_message` | **Restrito** | Requer parceria com LinkedIn |
| ❌ `like_post` | **Restrito** | Requer parceria com LinkedIn |
| ❌ `comment_on_post` | **Restrito** | Requer parceria com LinkedIn |
| ❌ `get_profile_views` | **Restrito** | Requer parceria com LinkedIn |

## 🔑 Como Obter um Token do LinkedIn (OpenID Connect)

### Método 1: LinkedIn Developer Console (Recomendado)

1. **Acesse**: https://developer.linkedin.com/
2. **Crie uma aplicação**:
   - Clique em "Create app"
   - Preencha nome, empresa associada, etc.
   - Aceite os termos

3. **Configure produtos e permissões**:
   - Na aba "Products", adicione:
     - **"Sign In with LinkedIn using OpenID Connect"** (essencial)
     - **"Share on LinkedIn"** (para posts)
   
4. **Configure scopes na aba "Auth"**:
   - `openid` (obrigatório para OpenID Connect)
   - `profile` (informações básicas do perfil)
   - `email` (endereço de email do usuário)
   - `w_member_social` (para criar posts - opcional)

5. **Configure redirect URI**:
   ```
   http://localhost:3000/callback
   ```

6. **Obtenha as credenciais**:
   - Client ID e Client Secret na aba "Auth"

### Passo a Passo para Gerar Token

1. **URL de autorização** (substitua `SEU_CLIENT_ID`):
   ```
   https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=SEU_CLIENT_ID&redirect_uri=http://localhost:3000/callback&scope=openid%20profile%20email%20w_member_social
   ```

2. **Acesse a URL no navegador** e autorize a aplicação

3. **Pegue o código** da URL de callback (parâmetro `code`)

4. **Troque o código pelo token**:
   ```bash
   curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=authorization_code&code=SEU_CODIGO&client_id=SEU_CLIENT_ID&client_secret=SEU_CLIENT_SECRET&redirect_uri=http://localhost:3000/callback"
   ```

5. **Resposta com o token**:
   ```json
   {
     "access_token": "SEU_ACCESS_TOKEN_AQUI",
     "expires_in": 5184000,
     "scope": "openid,profile,email,w_member_social"
   }
   ```

### Método 2: Usando Postman/Insomnia

1. **POST Request para**: `https://www.linkedin.com/oauth/v2/accessToken`
2. **Headers**: `Content-Type: application/x-www-form-urlencoded`
3. **Body**:
   ```
   grant_type=authorization_code
   code=SEU_CODIGO_DE_AUTORIZACAO
   client_id=SEU_CLIENT_ID
   client_secret=SEU_CLIENT_SECRET
   redirect_uri=http://localhost:3000/callback
   ```

## 🛠️ Configuração do Servidor

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configure o token**:
   ```bash
   # Copie o arquivo de exemplo
   cp .env.example .env
   
   # Edite o arquivo .env
   LINKEDIN_ACCESS_TOKEN=SEU_TOKEN_AQUI
   ```

3. **Compile o TypeScript**:
   ```bash
   npm run build
   ```

4. **Teste a conexão**:
   ```bash
   npm run test:connection
   ```

## 🧪 Testando o Servidor

### Via Linha de Comando
```bash
# Teste completo da conexão
npm run test:connection

# Iniciar servidor MCP
npm start
```

### Via MCP Client (Claude Desktop)

1. **Adicione ao config do Claude**:
   ```json
   {
     "mcpServers": {
       "linkedin": {
         "command": "node",
         "args": ["/caminho/para/linkedin-easy-mcp-server/dist/index.js"],
         "env": {
           "LINKEDIN_ACCESS_TOKEN": "seu_token_aqui"
         }
       }
     }
   }
   ```

2. **Teste ferramentas disponíveis**:
   ```
   test_connection - Testar conexão com LinkedIn
   get_profile - Obter perfil básico do usuário
   get_complete_profile - Obter perfil completo com experiências, educação e habilidades
   create_text_post - Criar post de texto
   validate_token - Validar se token está funcionando
   ```

## 📊 Exemplo de Resposta de Sucesso (OpenID Connect)

```json
{
  "success": true,
  "message": "LinkedIn API connection successful ✅",
  "timestamp": "2024-12-26T15:30:00.000Z",
  "api_version": "202404",
  "user": {
    "sub": "dXJuOmxpOmRldiIsInMiOjE0MTM",
    "name": "João Silva",
    "email": "joao@email.com"
  },
  "available_scopes": ["openid", "profile", "email"],
  "rate_limits": {
    "daily_limit": "Varies by endpoint",
    "note": "Rate limits are enforced per member and per application"
  }
}
```

## 📋 Exemplo de Perfil Completo

A ferramenta `get_complete_profile` retorna um perfil mais detalhado quando as permissões adequadas estão disponíveis:

```json
{
  "basicInfo": {
    "sub": "dXJuOmxpOmRldiIsInMiOjE0MTM",
    "name": "João Silva",
    "given_name": "João",
    "family_name": "Silva",
    "email": "joao@email.com",
    "picture": "https://media.licdn.com/dms/image/..."
  },
  "headline": "Desenvolvedor Full Stack | React | Node.js",
  "summary": "Desenvolvedor com 5+ anos de experiência...",
  "location": "São Paulo, Brasil",
  "industry": "Tecnologia da Informação",
  "experiences": [
    {
      "title": "Senior Developer",
      "companyName": "Tech Corp",
      "description": "Desenvolvimento de aplicações web...",
      "startDate": { "month": 1, "year": 2022 },
      "isCurrent": true,
      "location": "São Paulo, SP"
    }
  ],
  "education": [
    {
      "schoolName": "Universidade de São Paulo",
      "degreeName": "Bacharelado",
      "fieldOfStudy": "Ciência da Computação",
      "startDate": { "month": 2, "year": 2015 },
      "endDate": { "month": 12, "year": 2019 }
    }
  ],
  "skills": [
    "JavaScript",
    "React",
    "Node.js",
    "TypeScript"
  ]
}
```

**Nota importante**: A maioria dos dados do perfil completo (experiências, educação, habilidades) requer permissões especiais da API do LinkedIn que não estão disponíveis para aplicações padrão. A ferramenta tentará obter o máximo de informações possível com as permissões disponíveis.

## 🚨 Troubleshooting

### Erro 400 - Bad Request
- ✅ Verifique se o token não expirou (LinkedIn tokens expiram em 60 dias)
- ✅ Confirme os scopes da aplicação (`openid`, `profile`, `email`)
- ✅ Use a ferramenta `test_connection` para verificar

### Erro 401 - Unauthorized  
- ✅ Token inválido ou expirado
- ✅ Regenere o token seguindo o processo OAuth 2.0
- ✅ Verifique se a aplicação não foi suspensa

### Erro 403 - Forbidden
- ✅ Permissões insuficientes para a operação
- ✅ Funcionalidade requer aprovação especial do LinkedIn
- ✅ Verifique se tem o scope `w_member_social` para posts

### Token Expirado
Os tokens do LinkedIn expiram em **60 dias**. Para renovar:
1. Reimplemente o fluxo OAuth 2.0
2. Use refresh_token se disponível (nem sempre fornecido)
3. Configure renovação automática em produção

### Rate Limits Atingidos
```json
{
  "error": "Too many requests",
  "retry_after": 3600
}
```

**Limites atuais (2024/2025)**:
- **OpenID Connect**: 500 requests/day por membro
- **Share API**: 150 requests/day por membro  
- **Application**: 100,000 requests/day

## 📚 Recursos Úteis

- [LinkedIn API Documentation](https://docs.microsoft.com/en-us/linkedin/)
- [OpenID Connect Guide](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2)
- [Share on LinkedIn](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin)
- [OAuth 2.0 Flow](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)
- [LinkedIn API Terms of Use](https://www.linkedin.com/legal/l/api-terms-of-use)

## 💡 Dicas Importantes

1. **Para desenvolvimento**: Use tokens de teste com vida curta
2. **Para produção**: Implemente refresh token automático  
3. **Monitoring**: Use `test_connection` periodicamente para verificar saúde
4. **Compliance**: Sempre revise os termos de uso do LinkedIn
5. **Rate Limiting**: Implemente retry com backoff exponencial
6. **Error Handling**: Trate erros 429 (rate limit) adequadamente

## 🔒 Segurança

- ❌ **Nunca** commit tokens no repositório
- ✅ Use variáveis de ambiente para tokens
- ✅ Regenere tokens periodicamente
- ✅ Monitore uso de API para detectar anomalias
- ✅ Siga princípio do menor privilégio (minimal scopes)

---

**Nota**: LinkedIn tem políticas rigorosas sobre uso da API. Sempre revise os termos de uso antes de implementar em produção. A maioria das funcionalidades avançadas requer parceria comercial com o LinkedIn.
