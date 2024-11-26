import { Logger, OnModuleDestroy } from "@nestjs/common";
import { catchError, Observable } from "rxjs";

interface ProcotolConnection<CONN> {
  name: string,
  connection: CONN,
  params: any
}

export interface ProtocolReadVariableConfig<ID> {
  id: ID,
  type?: string
}

export interface ProtocolWriteVariableConfig<ID> {
  id: ID,
  type?: string,
  value: any
}

export abstract class ProtocolService<CONN, ID> implements OnModuleDestroy {

  private readonly bridgeLogger: Logger = new Logger(ProtocolService.name)

  private connections: ProcotolConnection<CONN>[] = []

  private protocolName: string

  protected abstract protocolConnect(params: any): Observable<CONN>

  // protected abstract protocolReconnect(connection: CONN, params: any): Promise<CONN>

  protected abstract protocolConnectionCheck(connection: CONN): boolean

  protected abstract protocolRead(connection: CONN, vars: ProtocolReadVariableConfig<ID>[]): Observable<any[]>

  protected abstract protocolWrite(connection: CONN, vars: ProtocolWriteVariableConfig<ID>[]): Observable<void>

  protected abstract protocolDisconnect(connection: CONN): Observable<void>

  constructor(protocolName: string) {
    this.protocolName = protocolName
  }

  public getProtocolName(): string {
    return this.protocolName
  }

  protected connect(connectionName: string, connectionParams: any): void {
    this.bridgeLogger.log(`Trying to create ${connectionName} connection`)
    const existingConnection: ProcotolConnection<CONN> | undefined = this.getConnection(connectionName)
    if (existingConnection !== undefined) throw new Error(`Device connection ${connectionName} already exists`)
    this.protocolConnect(connectionParams).pipe(
      catchError(err => {
        this.bridgeLogger.error(err.toString())
        throw err;
      })
    ).subscribe((conn) => {
      this.bridgeLogger.log(`Device connection ${connectionName} created`)
      this.connections.push({ name: connectionName, connection: conn, params: connectionParams })
    })
  }

  private prepare(connectionName: string): CONN {
    const existingConnection: ProcotolConnection<CONN> | undefined = this.getConnection(connectionName)
    if (existingConnection === undefined) throw new Error(`Device ${connectionName} is not defined for ${this.protocolName} protocol bridge`)
    if (!this.protocolConnectionCheck(existingConnection.connection)) {
      this.reconnect(existingConnection.name, existingConnection.params)
      throw new Error(`Device ${connectionName} connection is broken, trying to reconnect...`)
    } else {
      return existingConnection.connection
    }
  }

  public read(connectionName: string, variables: ProtocolReadVariableConfig<ID>[]): Observable<any[]> {
    const conn: CONN = this.prepare(connectionName)
    return this.protocolRead(conn, variables)
  }

  public write(connectionName: string, variables: ProtocolWriteVariableConfig<ID>[]): Observable<void> {
    const conn: CONN = this.prepare(connectionName)
    return this.protocolWrite(conn, variables)
  }

  protected reconnect(connectionName: string, connectionParams: any) {
    const existingConnectionIndex: number = this.getConnectionIndex(connectionName)
    delete this.connections[existingConnectionIndex]
    this.connections.splice(existingConnectionIndex, 1)
    this.connect(connectionName, connectionParams)
  }

  private disconnectAll() {
    this.connections.forEach((conn: ProcotolConnection<CONN>) => this.protocolDisconnect(conn.connection))
  }

  private getConnection(name: string): ProcotolConnection<CONN> | undefined {
    return this.connections.find((connection: ProcotolConnection<CONN>) => connection.name === name)
  }

  private getConnectionIndex(name: string): number {
    return this.connections.findIndex((connection: ProcotolConnection<CONN>) => connection.name === name)
  }

  public onModuleDestroy() {
    this.disconnectAll()
  }

}