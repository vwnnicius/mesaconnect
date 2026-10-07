#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <esp_system.h>
#include <time.h>
#include "../secrets.h"

// Um evento CALL por pressionamento; interrupção captura o botão durante HTTP.
volatile bool pressed = false;
volatile uint32_t lastPress = 0;
portMUX_TYPE buttonMux = portMUX_INITIALIZER_UNLOCKED;
bool pending = false;
String eventId;
String status = "OFFLINE";
uint32_t retryAt = 0, lastHeartbeat = 0, lastWiFi = 0;
uint32_t retryDelay = 1000;
void IRAM_ATTR onPress() {
  uint32_t at = millis();
  portENTER_CRITICAL_ISR(&buttonMux);
  if (at - lastPress >= 80) { pressed = true; lastPress = at; }
  portEXIT_CRITICAL_ISR(&buttonMux);
}
String uuid() {
  char out[37];
  uint32_t a=esp_random(), b=esp_random(), c=esp_random(), d=esp_random();
  snprintf(out,sizeof(out),"%08lx-%04lx-%04lx-%04lx-%04lx%08lx",
    (unsigned long)a,(unsigned long)(b>>16),(unsigned long)((b&0x0fff)|0x4000),
    (unsigned long)((c>>16&0x3fff)|0x8000),(unsigned long)(c&0xffff),(unsigned long)d);
  return String(out);
}
bool sendEvent(const char* event, bool identified) {
  if(WiFi.status()!=WL_CONNECTED || time(nullptr)<1700000000) return false;
  WiFiClientSecure client;
  client.setCACert(ROOT_CA); // Nunca usar setInsecure().
  HTTPClient http;
  http.setConnectTimeout(5000);
  http.setTimeout(8000);
  if(!http.begin(client,API_URL)) return false;
  http.addHeader("Content-Type","application/json");
  http.addHeader("Authorization",String("Bearer ")+DEVICE_TOKEN);
  StaticJsonDocument<256> body;
  body["device_uid"]=DEVICE_UID; body["event_type"]=event;
  if(identified) body["event_id"]=eventId;
  String payload; serializeJson(body,payload);
  int code=http.POST(payload);
  bool ok=false;
  if(code==200) {
    StaticJsonDocument<1024> result;
    if(!deserializeJson(result,http.getString()) && result["success"]==true) {
      status=result["table_status"].as<String>(); ok=true;
    }
  }
  // Não registrar senha, token ou corpo da resposta no monitor serial.
  Serial.printf("Evento %s: HTTP %d\n",event,code);
  http.end();
  return ok;
}
void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN,INPUT_PULLUP); pinMode(LED_PIN,OUTPUT);
  attachInterrupt(digitalPinToInterrupt(BUTTON_PIN),onPress,FALLING);
  WiFi.mode(WIFI_STA); WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID,WIFI_PASSWORD);
  configTime(0,0,"pool.ntp.org","time.google.com");
}
void loop() {
  uint32_t now=millis();
  bool tapped=false;
  portENTER_CRITICAL(&buttonMux); tapped=pressed; pressed=false; portEXIT_CRITICAL(&buttonMux);
  if(tapped && !pending) { pending=true; eventId=uuid(); retryAt=now; retryDelay=1000; }
  if(WiFi.status()!=WL_CONNECTED) {
    if(now-lastWiFi>=10000) { WiFi.reconnect(); lastWiFi=now; }
    digitalWrite(LED_PIN,(now/1000)%2); delay(10); return;
  }
  if(pending && (int32_t)(now-retryAt)>=0) {
    if(sendEvent("CALL",true)) { pending=false; retryDelay=1000; }
    else { retryAt=millis()+retryDelay; retryDelay=min((uint32_t)30000,retryDelay*2); }
  } else if(!pending && now-lastHeartbeat>=30000) {
    sendEvent("HEARTBEAT",false); lastHeartbeat=millis();
  }
  // LED simples: lento aguardando, fixo em atendimento, apagado disponível.
  digitalWrite(LED_PIN,pending || status=="CALLING" ? (millis()/500)%2 : status=="ACKNOWLEDGED");
  delay(10);
}
