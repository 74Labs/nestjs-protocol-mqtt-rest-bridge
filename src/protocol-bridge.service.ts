// import { Injectable, Logger } from "@nestjs/common";
// import { ProtocolService } from "./protocol.service";
// import { ProcotolConnection, ProtocolConnectionManager } from "./protocol-connection-manager.service";
// import { Protocol, ProtocolReadVariableConfig, ProtocolWriteVariableConfig } from "./protocol.class";
// import { catchError, Observable } from "rxjs";

// @Injectable()
// export class ProtocolBridgeService<CONN, ID> {

//   private readonly bridgeLogger: Logger = new Logger(ProtocolBridgeService.name)

//   private readonly connectionManager: ProtocolConnectionManager<CONN>

//   constructor(private readonly protocol: Protocol<CONN, ID>) {
//     this.connectionManager = new ProtocolConnectionManager(protocol)
//   }

//   public get protocolName(): string {
//     return this.protocol.name
//   }

//   protected connect(connectionName: string, connectionParams: any): void {
//     this.connectionManager.connect(connectionName, connectionParams)
//   }

//   private prepare(connectionName: string): CONN {
//     const existingConnection: ProcotolConnection<CONN> | undefined = this.connectionManager.get(connectionName)
//     if (existingConnection === undefined) throw new Error(`Device ${connectionName} is not defined for ${this.protocolName} protocol bridge`)
//     if (!this.protocol.check(existingConnection.connection)) {
//       this.connectionManager.reconnect(connectionName)
//       // this.reconnect(existingConnection.name, existingConnection.params)
//       throw new Error(`Device ${connectionName} connection is broken, trying to reconnect...`)
//     } else {
//       return existingConnection.connection
//     }
//   }

//   public read(connectionName: string, variables: ProtocolReadVariableConfig<ID>[]): Observable<any[]> {
//     const conn: CONN = this.prepare(connectionName)
//     return this.protocol.read(conn, variables)
//   }

//   public write(connectionName: string, variables: ProtocolWriteVariableConfig<ID>[]): Observable<void> {
//     const conn: CONN = this.prepare(connectionName)
//     return this.protocol.write(conn, variables)
//   }

//   protected reconnect(connectionName: string, connectionParams: any) {
//     this.connectionManager.reconnect(connectionName)
//   }

//   public onModuleDestroy() {
//     this.connectionManager.disconnectAll()
//   }

// }