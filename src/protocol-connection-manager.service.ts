// import { Logger } from "@nestjs/common"
// import { Protocol } from "./protocol.class"
// import { catchError } from "rxjs"

// export interface ProcotolConnection<CONN> {
//   name: string,
//   params: any,
//   connection: CONN,
//   online: boolean
// }

// export class ProtocolConnectionManager<CONN> {

//   private logger: Logger = new Logger(ProtocolConnectionManager.name)

//   private connections: ProcotolConnection<CONN>[] = []

//   constructor(private readonly protocol: Protocol<CONN, any>) { }

//   connect(name: string, params: any) {
//     this.logger.log(`Trying to create ${name} connection`)
//     const existingConnection: ProcotolConnection<CONN> | undefined = this.get(name)
//     if (existingConnection !== undefined) throw new Error(`Device connection ${name} already exists`)
//     this.protocol.connect(params).pipe(
//       catchError(err => {
//         this.logger.error(err.toString())
//         throw err;
//       })
//     ).subscribe((conn) => {
//       this.logger.log(`Device connection ${name} created`)
//       this.add(name, conn, params)
//     })
//   }

//   private add(name: string, connection: CONN, params: any) {
//     this.connections.push({ name, connection, params, online: false })
//   }

//   reconnect(name: string) {
//     const idx = this.getIndex(name)
//     this.connections[idx].online = false
//     this.connections[idx].connection = undefined
//     const connection: CONN = this.protocol.connect(this.connections[idx].params)
//     const connectionParams: any =
//       delete this.connections[existingConnectionIndex]
//     this.connections.splice(existingConnectionIndex, 1)
//     this.connect(connectionName, connectionParams)
//   }

//   disconnect(name: string) {
//     const connection: ProcotolConnection<CONN> = this.get(name)
//     if (connection !== undefined) {
//       this.protocol.disconnect(connection.connection)
//     }
//   }

//   disconnectAll() {
//     this.connections.forEach((conn: ProcotolConnection<CONN>) => this.disconnect(conn.name))
//   }

//   get(name: string): ProcotolConnection<CONN> | undefined {
//     return this.connections.find((connection: ProcotolConnection<CONN>) => connection.name === name)
//   }

//   private getIndex(name: string): number {
//     return this.connections.findIndex((connection: ProcotolConnection<CONN>) => connection.name === name)
//   }

// }