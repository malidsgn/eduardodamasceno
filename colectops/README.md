# ColectOps Web

Versão web do ColectOps para transcrição de áudio com identificação de falantes usando AssemblyAI.

**Versão privada para uso pessoal** - API key já configurada, protegido por senha.

## ✨ Funcionalidades

- 🔐 Login com senha para acesso
- 📤 Upload de arquivos de áudio (MP3, WAV, M4A)
- 🎯 Transcrição automática com diarização (identificação de falantes)
- 🇧🇷 Suporte ao português brasileiro
- 📋 Copiar transcrição para clipboard
- 📥 Download em formato TXT
- 💾 Sessão de 24h (não precisa fazer login toda vez)

## ⚙️ Configuração

### Alterar a senha de acesso

No arquivo `app.js`, altere a linha:

```javascript
ACCESS_PASSWORD: 'colectops2024',
```

### Alterar a API key (se necessário)

No arquivo `app.js`, altere a linha:

```javascript
API_KEY: 'd6c8896a22b04763ba45176813826a56',
```

## 🚀 Deploy no seu domínio (eduardodamaceno.com.br)

Como você já tem o site hospedado no GitHub Pages, basta adicionar como subpasta.

### Opção 1: Subpasta no repositório existente

1. No repositório do seu site (`eduardodamaceno.com.br`), crie uma pasta `colectops/`
2. Copie os arquivos para dentro dessa pasta:
   - `index.html`
   - `style.css`
   - `app.js`
3. Commit e push

```bash
# No repositório do seu site
mkdir colectops
cp /path/to/colectops_web/* colectops/
git add colectops/
git commit -m "Add ColectOps transcription tool"
git push
```

**URL final:** `https://eduardodamaceno.com.br/colectops/`

### Opção 2: Repositório separado com subdomínio

Se preferir um subdomínio (ex: `colectops.eduardodamaceno.com.br`):

1. Crie um novo repositório `colectops`
2. Adicione os arquivos
3. Configure GitHub Pages
4. No seu DNS, adicione um CNAME apontando para `SEU_USUARIO.github.io`

## 🔒 Segurança

⚠️ **Importante**: Como a API key está exposta no JavaScript, qualquer pessoa com acesso ao código fonte pode ver sua chave. Isso é aceitável para uso pessoal, mas considere:

1. **Senha de acesso** - Já implementada, dificulta uso não autorizado
2. **Monitoramento** - Acompanhe o uso no dashboard da AssemblyAI
3. **Limites** - Configure limites de uso na sua conta AssemblyAI se disponível
4. **noindex** - O `<meta name="robots" content="noindex, nofollow">` evita indexação por buscadores

## 📁 Estrutura

```
colectops/
├── index.html    # Página principal com login
├── style.css     # Estilos (dark theme)
├── app.js        # Lógica + API key + senha
└── README.md     # Este arquivo
```

## 🖥️ Desenvolvimento local

```bash
cd colectops_web
python3 -m http.server 8080
```

Acesse: `http://localhost:8080`

**Senha padrão:** `colectops2024`

## 💰 Custos

| Item | Custo |
|------|-------|
| Hospedagem | Gratuito (GitHub Pages) |
| Domínio | Já pago (eduardodamaceno.com.br) |
| AssemblyAI | ~$0.12/minuto de áudio |

## 🔗 Links úteis

- [AssemblyAI Dashboard](https://www.assemblyai.com/app) - Monitorar uso e créditos
- [Versão Flutter (iOS)](../colectops) - App mobile original
