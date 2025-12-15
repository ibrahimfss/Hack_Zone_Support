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
   IN-MEMORY STORES
   (Vercel-safe per instance)
===================== */
const openTickets = new Map();          // userId -> true
const replyMap = new Map();             // adminMsgId -> userChatId

/* =====================
   START
===================== */
bot.start((ctx) => {
  ctx.reply(
    `👋 *Welcome to Official Support Bot*

📢 *Official Channel*: @hack_zone_ai

Click *START* to continue`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        Markup.button.callback("▶️ START", "OPEN_QUERIES")
      ])
    }
  );
});

/* =====================
   MAIN MENU
===================== */
bot.action("OPEN_QUERIES", async (ctx) => {
  await ctx.editMessageText(
    `❓ *Please select your query*`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback("💸 WITHDRAW", "WITHDRAW"),
          Markup.button.callback("💳 DEPOSIT", "DEPOSIT")
        ],
        [
          Markup.button.callback("🎁 BONUS CODE", "BONUS"),
          Markup.button.callback("🎟️ VOUCHER", "VOUCHER")
        ],
        [Markup.button.callback("🧑‍💻 SUPPORT", "SUPPORT_OPEN")],
        [Markup.button.callback("🤖 PREDICTOR BOTS", "PREDICTORS")],
        [Markup.button.url("📢 OFFICIAL CHANNEL", "https://t.me/hack_zone_ai")]
      ])
    }
  );
});

/* =====================
   SUPPORT OPEN
===================== */
bot.action("SUPPORT_OPEN", async (ctx) => {
  openTickets.set(ctx.from.id, true);

  await ctx.editMessageText(
    `🧑‍💻 *LIVE SUPPORT OPEN*

Please type your message.
Admin will reply shortly.`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("❌ Close Ticket", "SUPPORT_CLOSE")],
        [Markup.button.callback("⬅️ Back", "OPEN_QUERIES")]
      ])
    }
  );
});

/* =====================
   SUPPORT CLOSE
===================== */
bot.action("SUPPORT_CLOSE", async (ctx) => {
  openTickets.delete(ctx.from.id);

  await ctx.editMessageText(
    `✅ *Support Ticket Closed*

If you need help again, open a new ticket.`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("⬅️ Back to Menu", "OPEN_QUERIES")]
      ])
    }
  );
});

/* =====================
   USER → ADMIN FORWARD
===================== */
bot.on("message", async (ctx) => {
  // ignore admin messages here
  if (ctx.from.id === ADMIN_ID) return;

  if (!openTickets.get(ctx.from.id)) return;

  const forwarded = await ctx.forwardMessage(ADMIN_ID);

  replyMap.set(forwarded.message_id, ctx.chat.id);
});

/* =====================
   ADMIN → USER DIRECT REPLY (STYLISH PANEL)
===================== */
bot.on("message", async (ctx, next) => {
  if (ctx.from.id !== ADMIN_ID) return next();

  const replyTo = ctx.message.reply_to_message;
  if (!replyTo) return;

  const userChatId = replyMap.get(replyTo.message_id);
  if (!userChatId) return;

  await bot.telegram.sendMessage(
    userChatId,
    `🧑‍💻 *Support Team Reply*

━━━━━━━━━━━━━━
${ctx.message.text}
━━━━━━━━━━━━━━

If you need more help, keep chatting or close the ticket.`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("❌ Close Ticket", "SUPPORT_CLOSE")]
      ])
    }
  );
});

/* =====================
   WITHDRAW
===================== */
bot.action("WITHDRAW", (ctx) =>
  ctx.editMessageText(
    `💸 *WITHDRAWAL PROCESS (1WIN)*

1️⃣ Login  
2️⃣ Withdrawal section  
3️⃣ Select method  
4️⃣ Confirm  

⚠️ KYC required`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("💸 WITHDRAW NOW", "https://1win.com/withdrawal")],
        [Markup.button.callback("⬅️ Back", "OPEN_QUERIES")]
      ])
    }
  )
);

/* =====================
   DEPOSIT
===================== */
bot.action("DEPOSIT", (ctx) =>
  ctx.editMessageText(
    `💳 *MAKE A DEPOSIT*

Use promocode *OGGY*
🎁 Get *500% Bonus*`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("💳 DEPOSIT NOW", "https://1win.com/deposit")],
        [Markup.button.callback("⬅️ Back", "OPEN_QUERIES")]
      ])
    }
  )
);

/* =====================
   BONUS
===================== */
bot.action("BONUS", (ctx) =>
  ctx.editMessageText(
    `🎁 *EXCLUSIVE BONUS*

Code: *OGGY*
✅ 500% Bonus
✅ 250 Free Spins`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("🔥 CLAIM BONUS", "https://1win.com/bonus")],
        [Markup.button.callback("⬅️ Back", "OPEN_QUERIES")]
      ])
    }
  )
);

/* =====================
   VOUCHER
===================== */
bot.action("VOUCHER", (ctx) =>
  ctx.editMessageText(
    `🎟️ *GET EXCLUSIVE VOUCHERS*

Join our official channel`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("🎟️ GET VOUCHER", "https://t.me/hack_zone_ai")],
        [Markup.button.callback("⬅️ Back", "OPEN_QUERIES")]
      ])
    }
  )
);

/* =====================
   PREDICTOR BOTS
===================== */
bot.action("PREDICTORS", (ctx) =>
  ctx.editMessageText(
    `🤖 *PREDICTOR BOTS*`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("✈️ Aviator Hack", "https://t.me/Aviator")],
        [Markup.button.url("💣 Mines Hack", "https://t.me/mines")],
        [Markup.button.url("👑 King Thimbes", "https://t.me/king")],
        [Markup.button.url("🐔 Chicken Road", "https://t.me/chicken")],
        [Markup.button.url("💎 Mines VIP", "https://t.me/vipmines")],
        [Markup.button.url("🚀 Aviator Pro", "https://t.me/Aviatorpro")],
        [Markup.button.url("🎯 Lucky Jet", "https://t.me/lucky")],
        [Markup.button.url("👑 Rocket Queen", "https://t.me/rocket")],
        [Markup.button.url("📊 Predictor", "https://t.me/prediction")],
        [Markup.button.callback("⬅️ Back", "OPEN_QUERIES")]
      ])
    }
  )
);

/* =====================
   VERCEL HANDLER
===================== */
export default async function handler(req, res) {
  try {
    await bot.handleUpdate(req.body);
  } catch (err) {
    console.error(err);
  }
  res.status(200).send("OK");
         }
