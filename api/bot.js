import { Telegraf, Markup } from "telegraf";

/* =====================
   ENV VARIABLES
===================== */
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID);

if (!BOT_TOKEN) throw new Error("BOT_TOKEN missing");

const bot = new Telegraf(BOT_TOKEN);

/* =====================
   START COMMAND
===================== */
bot.start((ctx) => {
  ctx.reply(
    `👋 *Welcome to Official Support Bot*

📢 *Official Channel*: @hack_zone_ai

Click START to continue`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        Markup.button.callback("▶️ START", "OPEN_QUERIES")
      ])
    }
  );
});

/* =====================
   QUERIES MENU
===================== */
bot.action("OPEN_QUERIES", (ctx) => {
  ctx.editMessageText(
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
        [Markup.button.callback("🧑‍💻 SUPPORT", "SUPPORT")],
        [Markup.button.callback("🤖 PREDICTOR BOTS", "PREDICTORS")],
        [Markup.button.url("📢 OFFICIAL CHANNEL", "https://t.me/hack_zone_ai")]
      ])
    }
  );
});

/* =====================
   WITHDRAW
===================== */
bot.action("WITHDRAW", (ctx) => {
  ctx.editMessageText(
    `💸 *WITHDRAWAL PROCESS (1WIN)*

1️⃣ Login to your account  
2️⃣ Go to Withdrawal  
3️⃣ Select payment method  
4️⃣ Confirm withdrawal  

⚠️ KYC must be completed`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("💸 WITHDRAW NOW", "https://1win.com/withdrawal")],
        [Markup.button.callback("⬅️ Back", "OPEN_QUERIES")]
      ])
    }
  );
});

/* =====================
   DEPOSIT
===================== */
bot.action("DEPOSIT", (ctx) => {
  ctx.editMessageText(
    `💳 *MAKE A DEPOSIT*

Use promocode *OGGY*

🎁 Get *500% Deposit Bonus*`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("💳 DEPOSIT NOW", "https://1win.com/deposit")],
        [Markup.button.callback("⬅️ Back", "OPEN_QUERIES")]
      ])
    }
  );
});

/* =====================
   BONUS
===================== */
bot.action("BONUS", (ctx) => {
  ctx.editMessageText(
    `🎁 *EXCLUSIVE BONUS*

Use bonus code *OGGY*

✅ 500% Bonus  
✅ 250 Free Spins`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("🔥 CLAIM BONUS", "https://1win.com/bonus")],
        [Markup.button.callback("⬅️ Back", "OPEN_QUERIES")]
      ])
    }
  );
});

/* =====================
   VOUCHER
===================== */
bot.action("VOUCHER", (ctx) => {
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
  );
});

/* =====================
   SUPPORT
===================== */
bot.action("SUPPORT", async (ctx) => {
  await ctx.editMessageText(
    `🧑‍💻 *LIVE SUPPORT*

Type your message below.
Admin will reply shortly.`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("⬅️ Back", "OPEN_QUERIES")]
      ])
    }
  );

  ctx.session = { support: true };
});

/* =====================
   FORWARD USER MESSAGE TO ADMIN
===================== */
bot.on("message", async (ctx) => {
  if (ctx.session?.support) {
    await ctx.forwardMessage(ADMIN_ID);
  }
});

/* =====================
   PREDICTOR BOTS
===================== */
bot.action("PREDICTORS", (ctx) => {
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
  );
});

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
