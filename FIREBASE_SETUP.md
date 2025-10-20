# Configuração do Firebase - Guia Completo

Este documento explica como configurar o Firebase para o aplicativo de controle de gastos.

## Passo 1: Acessar o Console do Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto: **gastos-e6367**

## Passo 2: Configurar Regras do Firestore

### 2.1 Publicar as Regras de Segurança

1. No menu lateral, clique em **Firestore Database**
2. Clique na aba **Regras** (Rules)
3. Copie todo o conteúdo do arquivo `firestore.rules` deste projeto
4. Cole no editor de regras do Firebase Console
5. Clique em **Publicar** (Publish)
6. **IMPORTANTE**: Aguarde alguns segundos para as regras serem aplicadas
7. Recarregue a página do aplicativo

### 2.2 Configurar o Documento do Usuário Administrador

Para ter acesso completo ao sistema, você precisa configurar seu usuário como administrador:

1. No Firebase Console, vá em **Firestore Database**
2. Clique na aba **Dados** (Data)
3. Localize a coleção `users`
4. Encontre o documento com seu email: **renato.calixto@email.com**
   - Se não existir, faça login no app primeiro para criar o documento
5. Clique no documento para editá-lo
6. Certifique-se de que os seguintes campos existem e têm os valores corretos:
   \`\`\`
   email: "renato.calixto@email.com"
   role: "admin"
   hasFamilyAccess: true
   \`\`\`
7. Se os campos não existirem ou estiverem incorretos:
   - Clique em **Adicionar campo** (Add field)
   - Adicione `role` com valor `admin` (tipo: string)
   - Adicione `hasFamilyAccess` com valor `true` (tipo: boolean)
8. Clique em **Salvar** (Save)
9. **Faça logout e login novamente** no aplicativo para as mudanças terem efeito

## Passo 3: Configurar Autenticação

1. No menu lateral, clique em **Authentication**
2. Clique na aba **Sign-in method**
3. Certifique-se de que **Email/Password** está habilitado
4. Se não estiver, clique em **Email/Password** e habilite

## Estrutura das Regras

As regras configuradas permitem:

### Coleção `users`
- **Leitura**: Todos os usuários autenticados podem ler
- **Escrita**: Apenas o próprio usuário pode editar seus dados

### Coleção `expenses` (Gastos)
- **Leitura/Listagem**: Todos os usuários autenticados podem listar e ler gastos
  - A filtragem entre gastos pessoais e familiares é feita no cliente
- **Criação**: 
  - Gastos pessoais devem ter `userId` igual ao usuário autenticado
  - Gastos familiares não devem ter `userId` ou deve ser `null`
- **Edição/Exclusão**: Apenas para gastos próprios ou gastos familiares

### Coleção `budgets` (Orçamentos)
- **Leitura/Listagem**: Todos os usuários autenticados podem listar e ler orçamentos
  - A filtragem entre orçamentos pessoais e familiares é feita no cliente
- **Escrita**: 
  - Orçamentos pessoais devem ter `userId` igual ao usuário autenticado
  - Orçamentos familiares não devem ter `userId` ou deve ser `null`

### Coleção `installments` (Parcelamentos)
- **Leitura/Listagem**: Todos os usuários autenticados podem listar e ler parcelamentos
  - A filtragem entre parcelamentos pessoais e familiares é feita no cliente
- **Criação**: 
  - Parcelamentos pessoais devem ter `userId` igual ao usuário autenticado
  - Parcelamentos familiares não devem ter `userId` ou deve ser `null`
- **Edição/Exclusão**: Apenas para parcelamentos próprios ou parcelamentos familiares

### Coleção `salary` (Salários)
- **Leitura/Listagem**: Todos os usuários autenticados podem listar e ler salários
  - A filtragem entre salários pessoais e familiares é feita no cliente
- **Escrita**: 
  - Salários pessoais devem ter `userId` igual ao usuário autenticado
  - Salários familiares não devem ter `userId` ou deve ser `null`

### Coleção `familyMembers` (Membros da Família)
- Todos os usuários autenticados podem ler e gerenciar

### Coleção `userCategories` (Categorias Personalizadas)
- Apenas o dono pode gerenciar suas categorias

## Verificação

Após publicar as regras e configurar o usuário administrador, teste o aplicativo:

1. **Faça logout e login novamente** com suas credenciais:
   - Email: renato.calixto@email.com
   - Senha: rp2129
2. Verifique se o botão "Admin" aparece na página inicial
3. Tente adicionar um gasto pessoal
4. Tente adicionar um gasto familiar
5. Tente adicionar um parcelamento pessoal
6. Tente adicionar um parcelamento familiar
7. Verifique se não há mais erros de permissão no console

## Solução de Problemas

### Erro: "Missing or insufficient permissions"
1. **Verifique as regras do Firestore**:
   - Certifique-se de que você publicou as regras do arquivo `firestore.rules` no Firebase Console
   - As regras devem ser copiadas e publicadas exatamente como estão no arquivo
   - Após publicar, aguarde alguns segundos para as regras serem aplicadas

2. **Verifique o documento do usuário**:
   - Vá em Firestore Database > Data > users
   - Encontre seu documento de usuário
   - Certifique-se de que `role: "admin"` e `hasFamilyAccess: true`
   - Se não estiver correto, edite manualmente

3. **Faça logout e login novamente**:
   - As permissões são carregadas no login
   - Após alterar o documento do usuário, você precisa fazer logout e login novamente

4. **Recarregue a página**:
   - Após publicar as regras, recarregue a página do aplicativo

### Erro: "auth/email-already-in-use"
- Este é um comportamento esperado ao tentar registrar com um email já cadastrado
- Use a opção de login ou um email diferente

### Erro de conexão
- Verifique sua conexão com a internet
- Verifique se as credenciais do Firebase estão corretas no arquivo `lib/firebase.ts`

### Botão "Admin" não aparece
- Verifique se o campo `role` no documento do usuário está definido como `"admin"`
- Faça logout e login novamente
- Verifique o console do navegador para mensagens de erro

## Resumo dos Passos Críticos

1. ✅ Publicar as regras do arquivo `firestore.rules` no Firebase Console
2. ✅ Configurar o documento do usuário com `role: "admin"` e `hasFamilyAccess: true`
3. ✅ Fazer logout e login novamente no aplicativo
4. ✅ Verificar se o botão "Admin" aparece e se não há erros de permissão

## Segurança

As regras implementadas garantem:
- ✅ Usuários autenticados podem listar dados, mas a filtragem é feita no cliente
- ✅ Apenas o dono pode criar/editar dados pessoais
- ✅ Dados familiares podem ser gerenciados por qualquer usuário autenticado com permissão
- ✅ Usuários não autenticados não têm acesso a nenhum dado
- ✅ Validação rigorosa de propriedade em operações de escrita
- ✅ Parcelamentos podem ser pessoais ou familiares, assim como gastos

## Nota Importante sobre Performance

As regras atuais permitem que usuários autenticados listem todas as coleções principais (expenses, budgets, salary, installments) para evitar erros de permissão. A filtragem entre dados pessoais e familiares é feita no lado do cliente. Esta abordagem:

- ✅ Evita erros de "permission-denied" em queries
- ✅ Mantém a segurança nas operações de escrita
- ✅ Permite que o app funcione corretamente com dados compartilhados
- ⚠️ Requer que todos os usuários do app sejam confiáveis (ambiente familiar/empresarial)

Se você precisar de isolamento mais rigoroso entre usuários, considere implementar queries com cláusulas `where` específicas e ajustar as regras de acordo.
