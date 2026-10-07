"use client";
import { useEffect, useState } from "react";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { createClient } from "@/lib/supabase/client";
import { DevicePairing } from "@/components/settings/DevicePairing";
import { PageHeader } from "@/components/ui/PageHeader";
type Device = {
  device_uid: string;
  last_seen: string | null;
  table_id: string | null;
};
export default function DevicesPage() {
  const w = useWorkspace();
  const [error, setError] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  useEffect(() => {
    if (!w.platformAdmin) return;
    let active = true;
    void createClient()
      .from("devices")
      .select(
        "device_uid,last_seen,table_id,table:tables!devices_table_id_fkey!inner(restaurant_id)",
      )
      .eq("table.restaurant_id", w.restaurant.id)
      .then(({ data, error }) => {
        if (active) {
          setDevices(data || []);
          setError(error ? "Não foi possível consultar os dispositivos." : "");
        }
      });
    return () => {
      active = false;
    };
  }, [w.platformAdmin, w.restaurant.id]);
  if (!w.platformAdmin)
    return <p>Esta configuração é exclusiva do administrador geral.</p>;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispositivos"
        description="Configuração do ESP32, da rede Wi-Fi e do botão de cada mesa."
      />
      {error && <p role="alert">{error}</p>}
      <section className="surface">
        <h2>Integração passo a passo</h2>
        <ol className="hardware-steps">
          <li>
            <strong>Prepare a placa:</strong> use uma ESP32 DevKit clássica para
            o exemplo. Confira os pinos e a alimentação da sua versão. O botão
            liga GPIO 27 a GND; a entrada utiliza pull-up de 3,3 V. Para o LED,
            use o pino configurado e um resistor adequado.
          </li>
          <li>
            <strong>Prepare o Wi-Fi:</strong> rede de 2,4 GHz no ESP32 clássico,
            com internet, WPA2 e acesso HTTPS à aplicação. Evite rede de
            convidados que exige login em uma página. Crie uma rede própria para
            os equipamentos.
          </li>
          <li>
            <strong>Pareie a mesa abaixo:</strong> copie o identificador e o
            token uma única vez. Cada placa tem seu próprio token; renovar
            invalida o anterior.
          </li>
          <li>
            <strong>Configure o firmware:</strong> no repositório, copie{" "}
            <code>firmware/mesaconnect-esp32/secrets.h.example</code> para{" "}
            <code>secrets.h</code>. Preencha SSID, senha do Wi-Fi, endereço
            HTTPS, identificador, token e certificado raiz válido do domínio.
            Nunca use a chave administrativa do Supabase.
          </li>
          <li>
            <strong>Grave:</strong> abra a pasta no PlatformIO e use a
            configuração fornecida. O exemplo envia CALL com identificador único
            e HEARTBEAT a cada 30 segundos. O LED acompanha o estado recebido do
            servidor.
          </li>
          <li>
            <strong>Teste o fluxo:</strong> pressione o botão, veja o chamado na
            Tela, assuma com o login de um garçom e conclua. Teste queda e volta
            do Wi-Fi e renove o token para conferir a revogação.
          </li>
        </ol>
        <p className="section-description">
          O exemplo deve ser compilado e ensaiado na sua placa antes do piloto.
          A fila em RAM não sobrevive a falta de energia; o próximo passo para
          equipamentos finais é provisionamento seguro e armazenamento
          persistente.
        </p>
        <a
          className="action-outline"
          href="https://github.com/vwnnicius/mesaconnect/tree/main/firmware/mesaconnect-esp32"
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir firmware e guia ↗
        </a>
      </section>
      <DevicePairing />
      <section className="surface">
        <h2>Última comunicação</h2>
        <p className="section-description">
          Sem heartbeat há mais de 90 segundos indica possível perda de conexão.
          Chamados pendentes continuam visíveis.
        </p>
        <ul className="activity-feed">
          {devices.map((d) => (
            <li key={d.device_uid}>
              <span>{d.device_uid}</span>
              <time>
                {d.last_seen
                  ? new Date(d.last_seen).toLocaleString("pt-BR")
                  : "Aguardando primeiro sinal"}
              </time>
            </li>
          ))}
        </ul>
        {!devices.length && <p>Nenhum dispositivo visível neste acesso.</p>}
      </section>
    </div>
  );
}
