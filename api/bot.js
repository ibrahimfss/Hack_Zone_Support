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
===================== */
const openTickets = new Map();      // userId -> true
const adminReplyTarget = new Map(); // adminId -> userId

/* =====================
   START
===================== */
bot.start((ctx) => {
  ctx.reply(
    `👋 *Welcome to HACK ZONE SUPPORT*

📢 *Official Channel*: @hack_zone_ai

Click *START* to continue`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        Markup.button.callback("▶️ START", "OPEN_MENU")
      ])
    }
  );
});

/* =====================
   MAIN MENU
===================== */
bot.action("OPEN_MENU", async (ctx) => {
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
        [Markup.button.callback("🧑‍💻 LIVE SUPPORT", "SUPPORT_OPEN")],
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
        [Markup.button.callback("⬅️ Back", "OPEN_MENU")]
      ])
    }
  );
});

/* =====================
   SUPPORT CLOSE (USER)
===================== */
bot.action("SUPPORT_CLOSE", async (ctx) => {
  openTickets.delete(ctx.from.id);

  await ctx.editMessageText(
    `✅ *Support Ticket Closed*

You can open a new ticket anytime.`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("⬅️ Back to Menu", "OPEN_MENU")]
      ])
    }
  );
});

/* =====================
   USER → ADMIN MESSAGE
===================== */
bot.on("message", async (ctx) => {
  if (ctx.from.id === ADMIN_ID) return;
  if (!openTickets.get(ctx.from.id)) return;

  await bot.telegram.sendMessage(
    ADMIN_ID,
    `📩 *New Support Ticket*

👤 *User:* ${ctx.from.first_name || "User"}
🆔 *User ID:* ${ctx.from.id}

━━━━━━━━━━━━━━
${ctx.message.text}
━━━━━━━━━━━━━━`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback(
            "✍️ Reply to User",
            `ADMIN_REPLY_${ctx.from.id}`
          ),
          Markup.button.callback(
            "❌ Close Ticket",
            `ADMIN_CLOSE_${ctx.from.id}`
          )
        ]
      ])
    }
  );
});

/* =====================
   ADMIN CLICK → REPLY
===================== */
bot.action(/^ADMIN_REPLY_(\d+)$/, async (ctx) => {
  const userId = Number(ctx.match[1]);
  adminReplyTarget.set(ctx.from.id, userId);

  await ctx.reply(
    `✍️ *Type your reply for User ID:* ${userId}`,
    {
      parse_mode: "Markdown",
      reply_markup: { force_reply: true }
    }
  );
});

/* =====================
   ADMIN CLICK → CLOSE
===================== */
bot.action(/^ADMIN_CLOSE_(\d+)$/, async (ctx) => {
  const userId = Number(ctx.match[1]);
  openTickets.delete(userId);

  await bot.telegram.sendMessage(
    userId,
    `❌ *Your support ticket has been closed by admin.*

If you need more help, open a new ticket.`,
    { parse_mode: "Markdown" }
  );

  await ctx.reply("✅ Ticket closed successfully.");
});

/* =====================
   ADMIN SEND MESSAGE
===================== */
bot.on("message", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const userId = adminReplyTarget.get(ctx.from.id);
  if (!userId) return;

  await bot.telegram.sendMessage(
    userId,
    `🧑‍💻 *Support Team Reply*

━━━━━━━━━━━━━━
${ctx.message.text}
━━━━━━━━━━━━━━

You may continue chatting or close the ticket.`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("❌ Close Ticket", "SUPPORT_CLOSE")]
      ])
    }
  );

  adminReplyTarget.delete(ctx.from.id);
});

/* =====================
   INFO SECTIONS
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
        [Markup.button.callback("⬅️ Back", "OPEN_MENU")]
      ])
    }
  )
);

bot.action("DEPOSIT", (ctx) =>
  ctx.editMessageText(
    `💳 *MAKE A DEPOSIT*

Use promocode *OGGY*
🎁 Get *500% Bonus*`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("💳 DEPOSIT NOW", "https://1win.com/deposit")],
        [Markup.button.callback("⬅️ Back", "OPEN_MENU")]
      ])
    }
  )
);

bot.action("BONUS", (ctx) =>
  ctx.editMessageText(
    `🎁 *EXCLUSIVE BONUS*

Code: *OGGY*
500% Bonus + 250 Free Spins`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("🔥 CLAIM BONUS", "https://1win.com/bonus")],
        [Markup.button.callback("⬅️ Back", "OPEN_MENU")]
      ])
    }
  )
);

bot.action("VOUCHER", (ctx) =>
  ctx.editMessageText(
    `🎟️ *GET EXCLUSIVE VOUCHERS*

Join our official channel`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("🎟️ GET VOUCHER", "https://t.me/hack_zone_ai")],
        [Markup.button.callback("⬅️ Back", "OPEN_MENU")]
      ])
    }
  )
);

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
        [Markup.button.callback("⬅️ Back", "OPEN_MENU")]
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
  } catch (e) {
    console.error(e);
  }
  res.status(200).send("OK");
           }
