import { EventEmitter } from 'events'
import { Context, Extra } from 'telegraf'
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types'
import { UserModel } from '../models'

export class TelegrafQuestion {
  private emitter: EventEmitter
  private shouldBeText: string

  constructor(options: { shouldBeText?: string } = {}) {
    const EventEmitter = require('events'),
      emitter = new EventEmitter()

    this.emitter = emitter

    if (options.shouldBeText) {
      this.shouldBeText = options.shouldBeText
    }
  }

  middleware() {
    return async (ctx: Context, next) => {
      ctx.setSession = async ({ quest, question }) => {
        const user = await UserModel.findOne({ telegramId: ctx.from.id })
        user.session.quest = quest
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
          extra?: ExtraReplyMessage
        } = {},
      ) => {
        await ctx.reply(text, options.extra)
        await ctx.setSession({ quest: text, question: true })

        return new Promise((res, rej) => {
          this.emitter.on(String(ctx.from.id), async (v, user, quest) => {
            if (quest !== text || ctx.from.id !== user) {
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
        if (ctx?.message?.text || ctx?.message?.caption) {
          this.emitter.emit(
            String(ctx.from.id),
            ctx.message,
            ctx.from.id,
            ctx.dbuser.session.quest,
          )

          await ctx.setSession({ quest: 'default', question: false })
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
