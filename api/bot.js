import { Telegraf, Markup } from "telegraf";

/* =====================
   ENV
===================== */
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID);

if (!BOT_TOKEN || !ADMIN_ID) {
  throw new Error("BOT_TOKEN or ADMIN_ID missing");
}

const bot = new Telegraf(BOT_TOKEN);

/* =====================
   IMAGES
===================== */
const IMAGES = {
  WELCOME: "https://i.imgur.com/8Km9tLL.jpg",
  MENU: "https://i.imgur.com/zYIlgBl.jpg",
  WITHDRAW: "https://i.imgur.com/9ZQ3R0T.jpg",
  DEPOSIT: "https://i.imgur.com/5rXkZ6K.jpg",
  BONUS: "https://i.imgur.com/6L89KkP.jpg",
  VOUCHER: "https://i.imgur.com/8QfGxwS.jpg",
  SUPPORT: "https://i.imgur.com/2nCt3Sb.jpg",
  PREDICTORS: "https://i.imgur.com/XpK8ZxU.jpg"
};

/* =====================
   MEMORY
===================== */
const openTickets = new Map();
const adminReplyTarget = new Map();

/* =====================
   START
===================== */
bot.start(async (ctx) => {
  await ctx.replyWithPhoto(
    IMAGES.WELCOME,
    {
      caption:
`👋 *WELCOME TO HACK ZONE SUPPORT*

📢 *OFFICIAL CHANNEL*: @hack_zone_ai

Click CONTINUE to proceed.`,
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("▶️ CONTINUE", "MENU")]
      ])
    }
  );
});

/* =====================
   MAIN MENU
===================== */
bot.action("MENU", async (ctx) => {
  await ctx.replyWithPhoto(
    IMAGES.MENU,
    {
      caption: `❓ *PLEASE SELECT YOUR QUERY*`,
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback("💸 WITHDRAW", "WITHDRAW"),
          Markup.button.callback("💳 DEPOSIT", "DEPOSIT")
        ],
        [
          Markup.button.callback("🎁 BONUS", "BONUS"),
          Markup.button.callback("🎟 VOUCHER", "VOUCHER")
        ],
        [Markup.button.callback("🤖 PREDICTOR BOTS", "PREDICTORS")],
        [Markup.button.callback("🧑‍💻 LIVE SUPPORT", "SUPPORT_OPEN")]
      ])
    }
  );
});

/* =====================
   SUPPORT OPEN / CLOSE
===================== */
bot.action("SUPPORT_OPEN", async (ctx) => {
  openTickets.set(ctx.from.id, true);

  await ctx.replyWithPhoto(
    IMAGES.SUPPORT,
    {
      caption:
`🧑‍💻 *LIVE SUPPORT OPEN*

Send your message (text, photo or video).
Our support team will reply shortly.`,
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("❌ CLOSE TICKET", "SUPPORT_CLOSE")]
      ])
    }
  );
});

bot.action("SUPPORT_CLOSE", async (ctx) => {
  openTickets.delete(ctx.from.id);

  await ctx.reply(
    `✅ *YOUR SUPPORT TICKET HAS BEEN CLOSED.*`,
    { parse_mode: "Markdown" }
  );
});

/* =====================
   ADMIN BUTTONS
===================== */
bot.action(/^ADMIN_REPLY_(\d+)$/, async (ctx) => {
  const userId = Number(ctx.match[1]);
  adminReplyTarget.set(ctx.from.id, userId);

  await ctx.reply(
    `✍️ *TYPE YOUR REPLY FOR USER ID:* ${userId}`,
    { parse_mode: "Markdown", reply_markup: { force_reply: true } }
  );
});

/* =====================
   MESSAGE HANDLER
===================== */
bot.on("message", async (ctx) => {

  /* ADMIN MESSAGE */
  if (ctx.from.id === ADMIN_ID) {
    const userId = adminReplyTarget.get(ctx.from.id);
    if (!userId) return;

    await ctx.copyMessage(userId);
    adminReplyTarget.delete(ctx.from.id);
    return;
  }

  /* USER MESSAGE */
  if (!openTickets.get(ctx.from.id)) return;

  await ctx.copyMessage(ADMIN_ID, {
    caption:
`📩 *NEW SUPPORT MESSAGE*

👤 USER: ${ctx.from.first_name || "User"}
🆔 ID: ${ctx.from.id}`
  });

  await bot.telegram.sendMessage(
    ADMIN_ID,
    "⚙️ SELECT ACTION",
    {
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback("✍️ REPLY TO USER", `ADMIN_REPLY_${ctx.from.id}`),
          Markup.button.callback("❌ CLOSE TICKET", `ADMIN_CLOSE_${ctx.from.id}`)
        ]
      ])
    }
  );

  await ctx.reply(
    `✅ *YOUR MESSAGE HAS BEEN SUCCESSFULLY SENT.*

Please be patient. Our support team will reply soon.`,
    { parse_mode: "Markdown" }
  );
});

/* =====================
   WITHDRAW / DEPOSIT / BONUS / VOUCHER
===================== */
bot.action("WITHDRAW", (ctx) =>
  ctx.replyWithPhoto(IMAGES.WITHDRAW, {
    caption: `💸 *WITHDRAWAL PROCESS*\nLogin → Withdraw → Confirm`,
    parse_mode: "Markdown"
  })
);

bot.action("DEPOSIT", (ctx) =>
  ctx.replyWithPhoto(IMAGES.DEPOSIT, {
    caption: `💳 *DEPOSIT FUNDS*\nUse promo code *OGGY*`,
    parse_mode: "Markdown"
  })
);

bot.action("BONUS", (ctx) =>
  ctx.replyWithPhoto(IMAGES.BONUS, {
    caption: `🎁 *BONUS INFORMATION*\nUse bonus code *OGGY*`,
    parse_mode: "Markdown"
  })
);

bot.action("VOUCHER", (ctx) =>
  ctx.replyWithPhoto(IMAGES.VOUCHER, {
    caption: `🎟 *GET VOUCHERS*\nJoin our official channel`,
    parse_mode: "Markdown"
  })
);

/* =====================
   PREDICTOR BOTS
===================== */
bot.action("PREDICTORS", (ctx) =>
  ctx.replyWithPhoto(IMAGES.PREDICTORS, {
    caption: `🤖 *PREDICTOR BOTS*`,
    parse_mode: "Markdown",
    ...Markup.inlineKeyboard([
      [Markup.button.url("✈️ AVIATOR HACK", "https://t.me/Aviator")],
      [Markup.button.url("💣 MINES HACK", "https://t.me/mines")],
      [Markup.button.url("👑 KING THIMBLES", "https://t.me/king")]
    ])
  })
);

/* =====================
   VERCEL HANDLER
===================== */
export default async function handler(req, res) {
  try {
    await bot.handleUpdate(req.body);
  } catch (e) {
    console.error(e);
  }
  res.status(200).send("OK");
   }
