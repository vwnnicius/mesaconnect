# Benservire

Tecnologia para servir melhor.

## Base preservada

Next.js, Supabase Auth, isolamento por estabelecimento, Realtime compartilhado,
planta editável, permissões por função, avaliações públicas por RPC, API autenticada
de dispositivos e serviços de chamados permanecem na arquitetura existente.
A demo continua explicitamente isolada; o simulador conectado usa os serviços reais.
Não há migração de banco ou mudança de credenciais/domínio de autenticação nesta etapa.

## Identidade

Geist variável local, licenciada sob OFL (public/fonts/Geist-OFL.txt).
Porcelain #F7F6F2, Carbon #181817, Stone #706F6B, Mist #E8E6E0,
Olive #68735A. Estados têm indicadores e texto; mesas disponíveis são neutras.
Tokens, estilos de componentes, variantes claras/escuras e comportamento responsivo
estão centralizados em src/app/benservire.css. globals.css contém as diretivas Tailwind.
Preferências de tema e salão mantêm suas chaves antigas para preservar configurações.

## Administração

Configurações → Logos e fotos permite atualizar logo e capa da unidade selecionada.
O administrador geral também pode enviar fotos para uma galeria por estabelecimento;
a listagem usa a função autenticada, sem ampliar as políticas públicas do Storage.
O administrador geral pode alternar estabelecimentos no cabeçalho.
Uploads existentes permanecem limitados a JPG/PNG/WebP, 2 MB, com as políticas de Storage existentes.

Configurações → Logs de atividade oferece limpeza por estabelecimento ou global.
A função workspace-admin autentica a sessão, verifica perfil ativo e platform_admin
no app_metadata validado pelo servidor. Apenas activity_logs pode ser apagada.
Há prévia da quantidade, frase de confirmação e corte temporal com validade de dez minutos.
Registros posteriores à prévia são preservados. Contas, chamados, avaliações, mesas,
plantas, dispositivos e imagens não são removidos.
Implementar o botão não executa a limpeza: nenhum histórico foi apagado nesta etapa.

## Limites da auditoria

Validação: lint, typecheck, build e 18 testes automatizados passaram.
Login de administrador e garçom, chamado → aceite → conclusão com atualização
em outra tela, avaliação pública e fluxo da demonstração foram verificados.
As permissões do gerente negam limpeza de logs e listagem administrativa de fotos.
O envio de arquivo acima de 2 MB foi rejeitado; upload válido da nova galeria
ainda requer confirmação de uso. Nenhum teste executou exclusão de logs.

O hardware ESP32 ainda depende de teste físico de rede, energia e firmware.
Comparações entre períodos e demanda por mesa exigem métricas reais; não há números
comparativos fictícios na interface. Os Insights usam os relatórios existentes.
Identidade personalizada enviada pelos estabelecimentos não é substituída pela marca da plataforma.
