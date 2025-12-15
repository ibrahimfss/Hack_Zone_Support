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
    `👋 *WELCOME TO HACK ZONE SUPPORT*

📢 *OFFICIAL CHANNEL*: @hack_zone_ai

Please click START to continue.`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("▶️ START", "MENU")]
      ])
    }
  );
});

/* =====================
   MAIN MENU
===================== */
bot.action("MENU", async (ctx) => {
  await ctx.editMessageText(
    `❓ *PLEASE SELECT YOUR QUERY*`,
    {
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
        [Markup.button.callback("🧑‍💻 LIVE SUPPORT", "SUPPORT_OPEN")],
        [Markup.button.url("📢 OFFICIAL CHANNEL", "https://t.me/hack_zone_ai")]
      ])
    }
  );
});

/* =====================
   SUPPORT OPEN / CLOSE
===================== */
bot.action("SUPPORT_OPEN", async (ctx) => {
  openTickets.set(ctx.from.id, true);

  await ctx.editMessageText(
    `🧑‍💻 *LIVE SUPPORT IS NOW OPEN*

You may send text, photos, videos or documents.
Our support team will assist you shortly.`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("❌ CLOSE TICKET", "SUPPORT_CLOSE")],
        [Markup.button.callback("⬅️ BACK", "MENU")]
      ])
    }
  );
});

bot.action("SUPPORT_CLOSE", async (ctx) => {
  openTickets.delete(ctx.from.id);

  await ctx.editMessageText(
    `✅ *YOUR SUPPORT TICKET HAS BEEN CLOSED*

You can open a new ticket anytime.`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("⬅️ BACK TO MENU", "MENU")]
      ])
    }
  );
});

/* =====================
   ADMIN ACTION BUTTONS
===================== */
bot.action(/^ADMIN_REPLY_(\d+)$/, async (ctx) => {
  const userId = Number(ctx.match[1]);
  adminReplyTarget.set(ctx.from.id, userId);

  await ctx.reply(
    `✍️ *TYPE YOUR REPLY FOR USER ID:* ${userId}`,
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
    `❌ *YOUR SUPPORT TICKET HAS BEEN CLOSED BY OUR TEAM.*

If you need further assistance, please open a new ticket.`,
    { parse_mode: "Markdown" }
  );

  await ctx.reply("✅ TICKET CLOSED SUCCESSFULLY.");
});

/* =====================
   SINGLE MESSAGE HANDLER
===================== */
bot.on("message", async (ctx) => {

  /* ===== ADMIN MESSAGE ===== */
  if (ctx.from.id === ADMIN_ID) {
    const targetUser = adminReplyTarget.get(ctx.from.id);
    if (!targetUser) return;

    // Admin can send TEXT / PHOTO / VIDEO / DOC
    await ctx.copyMessage(targetUser);

    adminReplyTarget.delete(ctx.from.id);
    return;
  }

  /* ===== USER MESSAGE ===== */
  if (!openTickets.get(ctx.from.id)) return;

  // Forward ANY content to admin
  await ctx.copyMessage(ADMIN_ID, {
    caption: `📩 *NEW SUPPORT MESSAGE*

👤 USER: ${ctx.from.first_name || "User"}
🆔 USER ID: ${ctx.from.id}`
  });

  // Admin action buttons
  await bot.telegram.sendMessage(
    ADMIN_ID,
    `⚙️ *SELECT ACTION*`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback(
            "✍️ REPLY TO USER",
            `ADMIN_REPLY_${ctx.from.id}`
          ),
          Markup.button.callback(
            "❌ CLOSE TICKET",
            `ADMIN_CLOSE_${ctx.from.id}`
          )
        ]
      ])
    }
  );

  // ✅ USER CONFIRMATION MESSAGE
  await ctx.reply(
    `✅ *YOUR MESSAGE HAS BEEN SUCCESSFULLY SENT.*

Please be patient. Our support team will reply as soon as possible.`,
    { parse_mode: "Markdown" }
  );
});

/* =====================
   PREDICTOR BOTS
===================== */
bot.action("PREDICTORS", async (ctx) => {
  await ctx.editMessageText(
    `🤖 *PREDICTOR BOTS*`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("✈️ AVIATOR HACK", "https://t.me/Aviator")],
        [Markup.button.url("💣 MINES HACK", "https://t.me/mines")],
        [Markup.button.url("👑 KING THIMBLES", "https://t.me/king")],
        [Markup.button.url("🐔 CHICKEN ROAD", "https://t.me/chicken")],
        [Markup.button.url("💎 MINES VIP", "https://t.me/vipmines")],
        [Markup.button.url("🚀 AVIATOR PRO", "https://t.me/Aviatorpro")],
        [Markup.button.callback("⬅️ BACK", "MENU")]
      ])
    }
  );
});

/* =====================
   INFO SECTIONS
===================== */
bot.action("WITHDRAW", (ctx) =>
  ctx.editMessageText(
    `💸 *WITHDRAWAL PROCESS*

Login → Withdrawal → Select Method → Confirm`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("WITHDRAW NOW", "https://1win.com/withdrawal")],
        [Markup.button.callback("⬅️ BACK", "MENU")]
      ])
    }
  )
);

bot.action("DEPOSIT", (ctx) =>
  ctx.editMessageText(
    `💳 *MAKE A DEPOSIT*

Use promo code *OGGY* to get maximum bonus.`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("DEPOSIT NOW", "https://1win.com/deposit")],
        [Markup.button.callback("⬅️ BACK", "MENU")]
      ])
    }
  )
);

bot.action("BONUS", (ctx) =>
  ctx.editMessageText(
    `🎁 *BONUS INFORMATION*

Use bonus code *OGGY* during registration.`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("CLAIM BONUS", "https://1win.com/bonus")],
        [Markup.button.callback("⬅️ BACK", "MENU")]
      ])
    }
  )
);

bot.action("VOUCHER", (ctx) =>
  ctx.editMessageText(
    `🎟 *GET VOUCHERS*

Join our official channel to receive vouchers.`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("GET VOUCHER", "https://t.me/hack_zone_ai")],
        [Markup.button.callback("⬅️ BACK", "MENU")]
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
