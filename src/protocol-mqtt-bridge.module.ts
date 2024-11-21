import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MQTT_CLIENT_INJECT_TOKEN, MqttClient } from './mqtt-client.class';
import { CONFIG_MQTT_CLIENT_ID, DEFAULT_MQTT_CLIENT_ID, CONFIG_MQTT_HOST, DEFAULT_MQTT_HOST, CONFIG_MQTT_PORT, DEFAULT_MQTT_PORT } from './config.const';
import { MqttService } from './mqtt.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MQTT_CLIENT_INJECT_TOKEN,
        imports: [ConfigModule],
        useFactory: async (cfg: ConfigService) => ({
          customClass: MqttClient,
          transport: Transport.MQTT,
          options: {
            clientId: cfg.get<string>(CONFIG_MQTT_CLIENT_ID, DEFAULT_MQTT_CLIENT_ID) + '-pub',
            host: cfg.get<string>(CONFIG_MQTT_HOST, DEFAULT_MQTT_HOST),
            port: cfg.get<number>(CONFIG_MQTT_PORT, DEFAULT_MQTT_PORT),
            protocolVersion: 5,
            connectTimeout: 5000,
            reconnectPeriod: 1000,
          },
        }),
        inject: [ConfigService]
      },
    ]),
  ],
  providers: [
    MqttService
  ],
  exports: [
    MqttService
  ]
})
export class ProtocolMqttBridgeModule { }
