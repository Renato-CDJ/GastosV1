# Configuração do Firebase - Regras de Segurança

Este documento explica como configurar as regras de segurança do Firestore para o aplicativo de controle de gastos.

## Passo 1: Acessar o Console do Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto: **gastos-e6367**

## Passo 2: Configurar Regras do Firestore

1. No menu lateral, clique em **Firestore Database**
2. Clique na aba **Regras** (Rules)
3. Copie todo o conteúdo do arquivo `firestore.rules` deste projeto
4. Cole no editor de regras do Firebase Console
5. Clique em **Publicar** (Publish)

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
- **Leitura/Listagem**: Apenas parcelamentos onde `userId` é igual ao usuário autenticado
- **Criação**: Deve definir `userId` igual ao usuário autenticado
- **Edição/Exclusão**: Apenas o dono pode modificar

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

Após publicar as regras, teste o aplicativo:

1. Faça login com uma conta existente
2. Tente adicionar um gasto pessoal
3. Tente adicionar um gasto familiar
4. Verifique se não há mais erros de permissão no console

## Solução de Problemas

### Erro: "Missing or insufficient permissions"
- **IMPORTANTE**: Verifique se você publicou as regras do arquivo `firestore.rules` no Firebase Console
- As regras devem ser copiadas e publicadas exatamente como estão no arquivo
- Após publicar, aguarde alguns segundos para as regras serem aplicadas
- Recarregue a página do aplicativo após publicar as regras

### Erro: "auth/email-already-in-use"
- Este é um comportamento esperado ao tentar registrar com um email já cadastrado
- Use a opção de login ou um email diferente

### Erro de conexão
- Verifique sua conexão com a internet
- Verifique se as credenciais do Firebase estão corretas no arquivo `lib/firebase.ts`

## Comandos Úteis

Para testar as regras localmente (opcional):
\`\`\`bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase emulators:start
\`\`\`

## Segurança


As regras implementadas garantem:
- ✅ Usuários autenticados podem listar dados, mas a filtragem é feita no cliente
- ✅ Apenas o dono pode criar/editar dados pessoais
- ✅ Dados familiares podem ser gerenciados por qualquer usuário autenticado
- ✅ Usuários não autenticados não têm acesso a nenhum dado
- ✅ Validação rigorosa de propriedade em operações de escrita
- ✅ Parcelamentos são sempre privados ao usuário que os criou

## Nota Importante sobre Performance

As regras atuais permitem que usuários autenticados listem todas as coleções principais (expenses, budgets, salary) para evitar erros de permissão. A filtragem entre dados pessoais e familiares é feita no lado do cliente. Esta abordagem:

- ✅ Evita erros de "permission-denied" em queries
- ✅ Mantém a segurança nas operações de escrita
- ✅ Permite que o app funcione corretamente com dados compartilhados
- ⚠️ Requer que todos os usuários do app sejam confiáveis (ambiente familiar/empresarial)

Se você precisar de isolamento mais rigoroso entre usuários, considere implementar queries com cláusulas `where` específicas e ajustar as regras de acordo.
