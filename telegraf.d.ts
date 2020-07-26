declare module 'telegraf' {
  export class Context {
    question: (text: string, options?: questionOptions) => Promise<string>
  }
}
