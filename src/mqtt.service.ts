import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { MQTT_CLIENT_INJECT_TOKEN } from "./mqtt-client.class";


@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {

  constructor(@Inject(MQTT_CLIENT_INJECT_TOKEN) public readonly client: ClientProxy) { }

  onModuleDestroy() {
    this.client.close()
  }

  onModuleInit() {
    this.client.connect()
  }


} 