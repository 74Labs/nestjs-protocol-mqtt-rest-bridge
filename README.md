# NestJS Protocol MQTT/REST Bridge

NestJS abstraction layer for buliding any protocol to MQTT and/or REST bridges.

## Configuration

Bridge module expects configuration provided via ConfigModule with following configuration keys (with default values):

```typescript
CONFIG_MQTT_CLIENT_ID: string = 'mqtt.clientId'
CONFIG_MQTT_HOST: string = 'mqtt.host'
CONFIG_MQTT_PORT: string = 'mqtt.port'

DEFAULT_MQTT_CLIENT_ID: string = 'protocol-gateway'
DEFAULT_MQTT_HOST: string = 'localhost'
DEFAULT_MQTT_PORT: number = 1883
```

Example:

```typescript
{
  mqtt: {
    clientId: 'protocol-gateway',
    host: 'localhost',
    port: 1883
  }
}
```

Bridge performs MQTT publisher only connection initialization with options like this:

```typescript
{
  clientId: cfg.get<string>(CONFIG_MQTT_CLIENT_ID, DEFAULT_MQTT_CLIENT_ID) + '-pub',
  host: cfg.get<string>(CONFIG_MQTT_HOST, DEFAULT_MQTT_HOST),
  port: cfg.get<number>(CONFIG_MQTT_PORT, DEFAULT_MQTT_PORT),
  protocolVersion: 5,
  connectTimeout: 5000,
  reconnectPeriod: 1000,
}
```

MQTT client for subscription should be provide in your main.ts like this:

```typescript
const app = await NestFactory.create(AppModule)

const cfg = app.get(ConfigService)

app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.MQTT,
  options: {
    host: cfg.get<string>(CONFIG_MQTT_HOST, DEFAULT_MQTT_HOST),
    port: cfg.get<number>(CONFIG_MQTT_PORT, DEFAULT_MQTT_PORT),
    clientId: cfg.get<string>(CONFIG_MQTT_CLIENT_ID, DEFAULT_MQTT_CLIENT_ID) + '-sub',
    protocolVersion: 5,
    connectTimeout: 5000,
    reconnectPeriod: 1000,
  },
});
```

## Implementation

Create your own protocol module

```typescript
@Module({
  imports: [
    ProtocolMqttBridgeModule,
  ],
  providers: [
    YourProtocolService
  ],
  controllers: [
    YourProtocolController
  ],
  exports: [
    YourProtocolService
  ]
})
export class YourProtocolModule { }
```

Create your own protocol service

```typescript

import { ProtocolReadVariableConfig, ProtocolService, ProtocolWriteVariableConfig } from '@74labs/nestjs-protocol-mqtt-bridge'

export type YourProtocolConnection = any
export type YourProtocolVariableId = string

@Injectable()
export class YourProtocolService extends ProtocolService<YourProtocolConnection, YourProtocolVariableId> implements OnModuleDestroy {

  constructor(private config: ConfigService) {
    super('MY-PROTO')
    // Create connection for all devices that you want to bridge
    this.config.get<any[]>('devices', []).forEach(device => this.connect(device.name, device.params))
  }

  // You should override these methods:

  override protocolConnect(params: any): Observable<YourProtocolConnection> {
    // return Observable with your protocol connection
  }

  override protocolConnectionCheck(connection: YourProtocolConnection): boolean {
    // return true if your connection is still healthy
  }

  override protocolRead(connection: YourProtocolConnection, vars: ProtocolReadVariableConfig<YourProtocolVariableId>[]): Observable<any[]> {
    // return Observable with array of values of variables identified via vars param
  }

  override protocolWrite(connection: YourProtocolConnection, vars: ProtocolWriteVariableConfig<YourProtocolVariableId>[]): Observable<void> {
    // write variables identified by vars param with provided values
  }

  override protocolDisconnect(connection: YourProtocolConnection): Observable<void> {
    // disconnect provided connection
  }

}
```