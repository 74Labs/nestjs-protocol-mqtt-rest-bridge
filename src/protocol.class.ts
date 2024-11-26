import { Observable } from "rxjs"

export interface ProtocolReadVariableConfig<ID> {
  id: ID,
  type?: string
}

export interface ProtocolWriteVariableConfig<ID> {
  id: ID,
  type?: string,
  value: any
}

export abstract class Protocol<CONN, ID> {

  private protocolName: string

  public abstract connect(params: any): Observable<CONN>

  public abstract reconnect(connection: CONN, params: any): Observable<CONN>

  public abstract check(connection: CONN): boolean

  public abstract read(connection: CONN, vars: ProtocolReadVariableConfig<ID>[]): Observable<any[]>

  public abstract write(connection: CONN, vars: ProtocolWriteVariableConfig<ID>[]): Observable<void>

  public abstract disconnect(connection: CONN): Observable<void>

  constructor(protocolName: string) {
    this.protocolName = protocolName
  }

  public get name(): string {
    return this.protocolName
  }

}