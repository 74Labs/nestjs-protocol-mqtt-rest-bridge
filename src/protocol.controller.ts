import { Logger } from '@nestjs/common';
import { Ctx, MqttContext, MqttRecordBuilder } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MqttService } from './mqtt.service';
import { ProtocolReadVariableConfig, ProtocolService, ProtocolWriteVariableConfig } from './protocol.service';

export type ProtocolBridgeReadRequest<ID> = ProtocolReadVariableConfig<ID>[]
export type ProtocolBridgeWriteRequest<ID> = ProtocolWriteVariableConfig<ID>[]

export abstract class ProtocolBridgeController<CONN, ID> {

  private bridgeLogger: Logger = new Logger(ProtocolBridgeController.name)

  private mqttBuilder: MqttRecordBuilder<any> = new MqttRecordBuilder()

  protected abstract get mqttService(): MqttService

  protected abstract get protocolService(): ProtocolService<CONN, ID>

  protected async read(connection: string, req: ProtocolBridgeReadRequest<ID>, ctx: MqttContext) {

    this.bridgeLogger.verbose(`Incoming request for ${this.protocolService.getProtocolName()} variables reading`)
    const responseTopic: string = this.getResponseTopic(ctx)
    this.bridgeLogger.debug(`Response topic: ${responseTopic}`)

    const timestamp: number = Date.now()

    try {
      const response = await firstValueFrom(this.protocolService.read(connection, req))
      this.sendReadResponse(responseTopic, response, timestamp)
    } catch (err) {
      this.bridgeLogger.error(err.toString())
      this.sendError(
        responseTopic,
        (process.env.NODE_ENV || 'development') ? err.toString() : `Internal ${this.protocolService.getProtocolName()} protocol bridge reading error`,
        timestamp
      )
      throw err
    }
  }

  protected async write(connection: string, req: ProtocolBridgeWriteRequest<ID>, ctx: MqttContext) {

    this.bridgeLogger.verbose(`Incoming request for ${this.protocolService.getProtocolName()} variables writing`)
    const responseTopic: string = this.getResponseTopic(ctx, false)
    this.bridgeLogger.debug(`Response topic: ${responseTopic}`)

    const timestamp: number = Date.now()

    try {
      const response = await firstValueFrom(this.protocolService.write(connection, req))
      if (responseTopic) this.sendWriteResponse(responseTopic, timestamp)
    } catch (err: any) {
      this.bridgeLogger.error(err.toString())
      this.sendError(
        responseTopic,
        (process.env.NODE_ENV || 'development') ? err.toString() : `Internal ${this.protocolService.getProtocolName()} protocol bridge writing error`,
        timestamp
      )
      throw err
    }
  }

  protected getTopicParam(topic: string, idx: number) {
    const parts: string[] = topic.split('/')
    return parts[idx]
  }

  private getResponseTopic(ctx: MqttContext, required: boolean = true): string {
    const responseTopic: string | undefined = ctx.getPacket()?.properties?.responseTopic
    if (!responseTopic && required) {
      this.bridgeLogger.error('No responseTopic provided')
      throw new Error('No responseTopic provided')
    }
    return responseTopic
  }

  private sendReadResponse(topic: string, values: any[], timestamp: number) {
    this.bridgeLogger.verbose(`Values ${JSON.stringify(values)}`)
    const payload: any[] = values.map(v => { return { ...{ timestamp }, ...{ value: v } } })
    this.bridgeLogger.verbose(`Sending: ${JSON.stringify(payload)}`)
    const record = this.mqttBuilder
      .setData(payload)
      .setQoS(0)
      .setRetain(true)
      .build()
    this.mqttService.client.emit(topic, record)
  }

  private sendWriteResponse(topic: string, timestamp: number) {
    const payload: any = {
      timestamp
    }
    const record = this.mqttBuilder
      .setData(payload)
      .setQoS(0)
      .setRetain(true)
      .build()
    this.mqttService.client.emit(topic, record)
  }

  private sendError(topic: string, message: string, timestamp: number) {
    const payload: any = {
      timestamp,
      message
    }
    const record = this.mqttBuilder
      .setData(payload)
      .setQoS(0)
      .setRetain(false)
      .build()
    this.mqttService.client.emit(`${topic}/errors`, record)
  }

  protected logProcessingTime(start: number) {
    this.bridgeLogger.verbose(`Request processing time: ${this.formatProcessingTime(start)}ms`)
  }

  protected formatProcessingTime(startTime: number): string {
    const millis = Date.now() - startTime
    return millis.toString()
  }

}
