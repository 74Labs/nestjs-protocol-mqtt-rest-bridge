import { ReadPacket, MqttRecord, MqttRecordOptions, ClientMqtt } from '@nestjs/microservices';

export const MQTT_CLIENT_INJECT_TOKEN: string = 'MQTT_CLIENT'

export class MqttClient extends ClientMqtt {

  protected dispatchEvent(packet: ReadPacket): Promise<any> {

    const pattern = this.normalizePattern(packet.pattern);
    const serializedPacket: ReadPacket & Partial<MqttRecord> = this.serializer.serialize(packet);

    const options = serializedPacket.options;
    delete serializedPacket.options;

    const mergedOptions = this.mergePacketOptions(options)

    return new Promise<void>((resolve, reject) =>
      this.mqttClient.publish(
        pattern,
        JSON.stringify(serializedPacket.data),
        mergedOptions,
        (err: any) => (err ? reject(err) : resolve()),
      ),
    );

  }

  protected mergePacketOptions(
    requestOptions?: MqttRecordOptions,
  ): MqttRecordOptions | undefined {
    if (!requestOptions && !this.options?.userProperties) {
      return undefined;
    }

    return {
      ...requestOptions,
      properties: {
        ...requestOptions?.properties,
        // userProperties: {
        //   ...this.options?.userProperties,
        //   ...requestOptions?.properties?.userProperties,
        // },
      },
    };
  }
}