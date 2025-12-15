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
   MEMORY STORES
===================== */
const openTickets = new Map();        // userId -> true
const adminReplyTarget = new Map();   // adminId -> userId

/* =====================
   START
===================== */
bot.start((ctx) => {
  ctx.reply(
    `👋 *Welcome to HACK ZONE SUPPORT*

📢 Official Channel: @hack_zone_ai

Click START to continue`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        Markup.button.callback("▶️ START", "MENU")
      ])
    }
  );
});

/* =====================
   MAIN MENU
===================== */
bot.action("MENU", async (ctx) => {
  await ctx.editMessageText(
    `❓ *Please select your query*`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback("💸 Withdraw", "WITHDRAW"),
          Markup.button.callback("💳 Deposit", "DEPOSIT")
        ],
        [
          Markup.button.callback("🎁 Bonus", "BONUS"),
          Markup.button.callback("🎟 Voucher", "VOUCHER")
        ],
        [Markup.button.callback("🧑‍💻 Live Support", "SUPPORT_OPEN")],
        [Markup.button.url("📢 Official Channel", "https://t.me/hack_zone_ai")]
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
        [Markup.button.callback("⬅️ Back", "MENU")]
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
    `✅ *Support ticket closed*

You can open a new ticket anytime.`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("⬅️ Back to Menu", "MENU")]
      ])
    }
  );
});

/* =====================
   ADMIN BUTTONS
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

bot.action(/^ADMIN_CLOSE_(\d+)$/, async (ctx) => {
  const userId = Number(ctx.match[1]);
  openTickets.delete(userId);

  await bot.telegram.sendMessage(
    userId,
    `❌ *Your support ticket has been closed by admin.*

If you need help again, open a new ticket.`,
    { parse_mode: "Markdown" }
  );

  await ctx.reply("✅ Ticket closed successfully.");
});

/* =====================
   SINGLE MESSAGE HANDLER (CRITICAL)
===================== */
bot.on("message", async (ctx) => {

  /* ===== ADMIN MESSAGE ===== */
  if (ctx.from.id === ADMIN_ID) {
    const targetUser = adminReplyTarget.get(ctx.from.id);
    if (!targetUser) return;

    await bot.telegram.sendMessage(
      targetUser,
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
    return;
  }

  /* ===== USER MESSAGE ===== */
  if (!openTickets.get(ctx.from.id)) return;

  await bot.telegram.sendMessage(
    ADMIN_ID,
    `📩 *New Support Ticket*

👤 User: ${ctx.from.first_name || "User"}
🆔 User ID: ${ctx.from.id}

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
   INFO SECTIONS
===================== */
bot.action("WITHDRAW", (ctx) =>
  ctx.editMessageText(
    `💸 *Withdrawal Process*

Login → Withdrawal → Select method → Confirm`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("Withdraw Now", "https://1win.com/withdrawal")],
        [Markup.button.callback("⬅️ Back", "MENU")]
      ])
    }
  )
);

bot.action("DEPOSIT", (ctx) =>
  ctx.editMessageText(
    `💳 *Deposit Funds*

Use promo code *OGGY*
Get 500% Bonus`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("Deposit Now", "https://1win.com/deposit")],
        [Markup.button.callback("⬅️ Back", "MENU")]
      ])
    }
  )
);

bot.action("BONUS", (ctx) =>
  ctx.editMessageText(
    `🎁 *Bonus Offer*

Use code *OGGY*
500% Bonus + Free Spins`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("Claim Bonus", "https://1win.com/bonus")],
        [Markup.button.callback("⬅️ Back", "MENU")]
      ])
    }
  )
);

bot.action("VOUCHER", (ctx) =>
  ctx.editMessageText(
    `🎟 *Get Vouchers*

Join our official channel`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("Get Voucher", "https://t.me/hack_zone_ai")],
        [Markup.button.callback("⬅️ Back", "MENU")]
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
