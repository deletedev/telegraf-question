import { EventEmitter } from 'events'
import { UserModel } from '../models'

export class TelegrafQuestion {
  private emitter: EventEmitter
  private shouldBeText: string

  constructor(options: { shouldBeText?: string }) {
    const EventEmitter = require('events'),
      emitter = new EventEmitter()

    this.emitter = emitter

    if (options.shouldBeText) {
      this.shouldBeText = options.shouldBeText
    }
  }

  middleware() {
    return async (ctx, next) => {
      ctx.setSession = async ({ stage, question }) => {
        const user = await UserModel.findOne({ telegramId: ctx.from.id })
        user.session.stage = stage
        user.session.question = question

        await user.save()
      }

      ctx.getSession = async () => {
        const user = await UserModel.findOne({ telegramId: ctx.from.id })
        return user.session
      }

      ctx.question = async (
        text: string,
        options: {
          ttl?: number
        } = {},
      ) => {
        await ctx.reply(text)
        await ctx.setSession({ stage: text, question: true })

        return new Promise((res, rej) => {
          this.emitter.on(String(ctx.from.id), async (v, user, stage) => {
            if (stage !== text || ctx.from.id !== user) {
              return
            }

            res(v)
            this.emitter.removeAllListeners(String(ctx.from.id))
          })

          if (options.ttl) {
            setTimeout(() => {
              rej('TelegrafQuestion: Event has expired')
              this.emitter.removeAllListeners(String(ctx.from.id))
            }, options.ttl)
          }
        })
      }

      if (ctx.dbuser.session.question) {
        if (ctx?.message?.text) {
          this.emitter.emit(
            String(ctx.from.id),
            ctx.message.text,
            ctx.from.id,
            ctx.dbuser.session.stage,
          )

          await ctx.setSession({ stage: 'default', question: false })
        } else {
          if (this.shouldBeText) {
            await ctx.reply(this.shouldBeText)
          }
        }

        return
      }

      next()
    }
  }
}
