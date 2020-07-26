# telegraf-question (webhook ONLY)
Example:

```javascript
import Telegraf from 'telegraf'
import { TelegrafQuestion } from './helpers/question'

const bot = new Telegraf(process.env.BOT_TOKEN, {
  telegram: { webhookReply: false },
})

const question = new TelegrafQuestion({
  shouldBeText: 'Вы должны прислать текст!'
})
bot.use(question.middleware())

bot.command('name', async (ctx) => {
  const name = await ctx.question('Назовите ваше имя:')
  await ctx.reply(`Ваше имя: ${name}`)
})

```

```javascript
const question = new TelegrafQuestion({...params})
```

Параметры:

- shouldBeText: если задан, строка переданная в параметре отправится юзеру, если он в ответ на вопрос пришлет сообщение, не содержащее текст
