# MesaConnect — ESP32 de referência

Configuração e pareamento na aba **Dispositivos**, exclusiva do administrador geral. O código é um ponto de partida para ESP32 DevKit clássica, não um hardware homologado. Não foi ensaiado fisicamente nesta revisão.

1. Monte botão entre GPIO 27 e GND com INPUT_PULLUP. Verifique o pinout da sua placa e alimentação. GPIOs trabalham em 3,3 V; não aplicar 5 V à entrada. LED externo precisa de resistor; adapte LED_PIN e polaridade.
2. Disponibilize rede Wi-Fi 2,4 GHz com internet, DNS, NTP e HTTPS. ESP32 clássico não usa a rede 5 GHz. Evite captive portal. Distância, paredes e interferência exigem teste de cobertura.
3. Pareie uma mesa no painel e copie uid/token. Faça cada placa ter um pareamento próprio.
4. Copie secrets.h.example para secrets.h e preencha os dados. Para ROOT_CA, use o certificado raiz correspondente à cadeia TLS do domínio de produção, em formato PEM. Atualize-o quando houver mudança da cadeia; não desative validação TLS.
5. Instale PlatformIO pelo canal oficial. Abra esta pasta, conecte USB e execute **Build**, depois **Upload** e **Monitor**. As versões da plataforma e do ArduinoJson estão fixadas no platformio.ini. Para Arduino IDE, use as mesmas bibliotecas e adapte a pasta/caminho de secrets.h.
6. Teste botão → fila/Tela → aceite → conclusão → convite para avaliação. O LED confirma estado por resposta e heartbeat; atualização sem botão pode levar até 30 segundos.

A API recebe POST HTTPS em /api/device/events, com Authorization: Bearer TOKEN. CALL inclui event_id UUID estável entre tentativas; o servidor lembra eventos entregues e evita um novo chamado após uma resposta perdida, mesmo que o anterior já tenha sido concluído. Sem event_id, a compatibilidade antiga só reaproveita o chamado ainda ativo.

O firmware captura o botão por interrupção, faz debounce, reconecta Wi-Fi e tenta novamente com espera crescente. Guarda um CALL pendente em RAM. Não garante persistência após desligamento nem fila de múltiplos acionamentos. Não enfileira cada heartbeat. Sem sinal recente há 90 segundos, a Tela alerta; um chamado ativo permanece na fila.

Antes do piloto: compilar na versão/placa adotada, verificar certificação da fonte/caixa, medir latência, testar certificados, cobertura e queda de energia. Para produto final, adicionar provisionamento local seguro, armazenamento cifrado/persistente, watchdog e atualização assinada.

Referências oficiais: [Wi-Fi Espressif](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/wifi.html), [TLS Espressif](https://github.com/espressif/arduino-esp32/tree/master/libraries/NetworkClientSecure), [PlatformIO ESP32](https://docs.platformio.org/en/latest/boards/espressif32/esp32dev.html).
