export interface questionOptions {
  ttl?: number
}

declare module 'telegraf' {
  export class Context {
    question: (text: string, options?: questionOptions) => Promise<string>
  }
}
