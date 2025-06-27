# LinkedIn Easy MCP Server v2.0.0

Um servidor MCP (Model Context Protocol) modernizado para gerenciar sua conta do LinkedIn usando OpenID Connect e as APIs mais recentes (2024/2025).

## 🚀 Novidades da v2.0.0

- ✅ **OpenID Connect**: Autenticação moderna e segura
- ✅ **API LinkedIn v2024.04**: Versão mais recente 
- ✅ **Upload de Imagens**: Posts com imagens diretamente
- ✅ **Melhor UX**: Mensagens de erro mais claras
- ✅ **Rate Limiting**: Informações atualizadas sobre limites
- ✅ **TypeScript**: Code completamente tipado

## 🎯 Funcionalidades Disponíveis

### ✅ Sempre Funcionam (Token Básico)
- **`test_connection`**: Testar conexão com LinkedIn API
- **`get_profile`**: Obter informações do perfil via OpenID Connect
- **`validate_token`**: Verificar se token é válido
- **`get_token_info`**: Detalhes sobre token e scopes

### ⚠️ Requer Scope `w_member_social`
- **`create_text_post`**: Criar posts de texto
- **`create_article_post`**: Criar posts com artigos/URLs  
- **`create_image_post`**: Criar posts com imagens

### ❌ Requer Parceria LinkedIn (Não Disponível)
- **`get_connections`**: Listar conexões
- **`search_people`**: Buscar pessoas
- **`send_message`**: Enviar mensagens
- **`like_post`**: Curtir posts
- **`comment_on_post`**: Comentar posts
- **`get_profile_views`**: Analytics do perfil

## 📋 Pré-requisitos

- Node.js 18+
- Token de acesso LinkedIn com OpenID Connect
- Aplicação LinkedIn configurada no Developer Portal

## 🛠️ Instalação Rápida

1. **Clone e instale**:
```bash
git clone <repository-url>
cd linkedin-easy-mcp-server
npm install
```

2. **Configure token**:
```bash
cp .env.example .env
# Edite .env e adicione seu LINKEDIN_ACCESS_TOKEN
```

3. **Compile e teste**:
```bash
npm run build
npm run test:connection
```

4. **Execute**:
```bash
npm start
```

## 🔑 Como Obter Token do LinkedIn

**Guia Completo**: Veja [LINKEDIN_SETUP.md](./LINKEDIN_SETUP.md) para instruções detalhadas.

**Resumo Rápido**:
1. Crie app no [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Adicione produtos: "Sign In with LinkedIn using OpenID Connect" + "Share on LinkedIn"
3. Configure scopes: `openid`, `profile`, `email`, `w_member_social`
4. Use fluxo OAuth 2.0 para obter token

## 🎯 Uso

### Como Servidor MCP

1. **Inicie o servidor**:
```bash
npm start
```

2. **Configure no Claude Desktop** (`claude_desktop_config.json`):
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

### Exemplos de Uso

**Testar conexão**:
```bash
# Via npm script
npm run test:connection

# Via MCP
{
  "tool": "test_connection",
  "arguments": {}
}
```

**Criar post de texto**:
```json
{
  "tool": "create_text_post",
  "arguments": {
    "text": "Hello LinkedIn! 🚀",
    "visibility": "PUBLIC"
  }
}
```

**Post com artigo**:
```json
{
  "tool": "create_article_post", 
  "arguments": {
    "text": "Confira este artigo interessante!",
    "articleUrl": "https://example.com/artigo",
    "articleTitle": "Título do Artigo",
    "articleDescription": "Descrição do artigo"
  }
}
```

**Post com imagem**:
```json
{
  "tool": "create_image_post",
  "arguments": {
    "text": "Olha essa imagem!",
    "imagePath": "/caminho/para/imagem.jpg",
    "imageTitle": "Minha Foto"
  }
}
```

## 📊 Rate Limits (2024/2025)

| Endpoint | Limite |
|----------|--------|
| OpenID Connect | 500 requests/day por membro |
| Share API | 150 requests/day por membro |
| Application Total | 100,000 requests/day |

## 🔧 Scripts Disponíveis

```bash
npm run build          # Compila TypeScript
npm run dev            # Modo desenvolvimento (watch)
npm start              # Inicia servidor MCP  
npm run test:connection # Testa conexão LinkedIn
```

## 🛠️ Ferramentas Disponíveis

### ✅ Sempre Disponíveis

#### `test_connection`
Testa conexão com LinkedIn API e mostra informações do token.

#### `get_profile`
Obtém informações do perfil via OpenID Connect.

#### `validate_token` 
Verifica se o token de acesso é válido.

#### `get_token_info`
Retorna informações detalhadas sobre token e scopes.

### ⚠️ Requer Scope `w_member_social`

#### `create_text_post`
Cria um post de texto no LinkedIn.
- **text**: Texto do post
- **visibility**: `PUBLIC` ou `CONNECTIONS`

#### `create_article_post`
Cria um post com artigo/URL.
- **text**: Texto do post
- **articleUrl**: URL do artigo
- **articleTitle** (opcional): Título do artigo
- **articleDescription** (opcional): Descrição do artigo
- **visibility**: `PUBLIC` ou `CONNECTIONS`

#### `create_image_post`
Cria um post com imagem.
- **text**: Texto do post
- **imagePath**: Caminho local para a imagem
- **imageTitle** (opcional): Título da imagem
- **imageDescription** (opcional): Descrição da imagem
- **visibility**: `PUBLIC` ou `CONNECTIONS`

### ❌ Funcionalidades Restritas

As seguintes funcionalidades estão **disponíveis no código** mas requerem **aprovação especial do LinkedIn**:

- `get_connections` - Listar conexões
- `search_people` - Buscar pessoas
- `send_message` - Enviar mensagens
- `like_post` - Curtir posts
- `comment_on_post` - Comentar posts
- `get_profile_views` - Analytics do perfil

## ⚠️ Limitações Importantes

### O que mudou na API do LinkedIn (2024/2025)

1. **Acesso Restrito**: Maioria das APIs requer parceria comercial
2. **OpenID Connect**: Nova forma padrão de autenticação
3. **Rate Limits**: Limites mais baixos para aplicações básicas
4. **Scopes Limitados**: Menos permissões disponíveis

### Estratégias Alternativas

Para funcionalidades não disponíveis, considere:

- **Web Scraping**: Use bibliotecas como Puppeteer (cuidado com ToS)
- **Integração Manual**: Interfaces para ações manuais
- **APIs Terceirizadas**: Serviços como RapidAPI para LinkedIn
- **LinkedIn Sales Navigator**: Para empresas com necessidades avançadas

## 🚨 Troubleshooting

### Erro: "Token expirado"
```bash
# Gere um novo token seguindo LINKEDIN_SETUP.md
# Tokens LinkedIn expiram em 60 dias
```

### Erro: "Scope insuficiente"  
```bash
# Verifique se adicionou w_member_social para posts
# Configure produtos no LinkedIn Developer Portal
```

### Erro: "Rate limit excedido"
```bash
# Aguarde reset (24h) ou implemente retry com backoff
# Monitore uso via test_connection
```

## 📚 Recursos

- [🔧 LINKEDIN_SETUP.md](./LINKEDIN_SETUP.md) - Guia completo de configuração
- [📖 LinkedIn API Docs](https://docs.microsoft.com/en-us/linkedin/)
- [🔐 OpenID Connect Guide](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2)
- [📝 Share API Guide](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`  
5. Abra um Pull Request

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## ⭐ Suporte

Se este projeto foi útil, considere dar uma ⭐!

Para suporte:
- 🐛 Issues: Reporte bugs e sugestões
- 💬 Discussions: Perguntas e ideias
- 📧 Email: Para questões privadas

---

**Aviso**: Este projeto não é oficialmente afiliado ao LinkedIn. Use com responsabilidade e respeite os termos de uso do LinkedIn.
