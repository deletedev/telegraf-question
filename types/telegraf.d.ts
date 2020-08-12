import { ExtraReplyMessage, Message } from 'telegraf/typings/telegram-types'

interface questionOptions {
  ttl?: number
  extra: ExtraReplyMessage
}

declare module 'telegraf' {
  export class Context {
    question: (text: string, options?: questionOptions) => Promise<Message>
    setSession: any
    getSession: an
  }
}
