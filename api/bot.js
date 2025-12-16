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
   IMAGES (CHANGE LATER)
===================== */
const IMAGES = {
  WELCOME: "https://i.imghippo.com/files/cGqm1124Upo.jpg",
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
`👋 *WELCOME, {{first_name}}!*

You have successfully reached *HACK ZONE SUPPORT* 🛠️  
Our team is here to assist you with all official support-related queries.

━━━━━━━━━━━━━━━━━━
📢 *href="https://t.me/hack_zone_ai">OFFICIAL CHANNEL<*
━━━━━━━━━━━━━━━━━━

To continue and access support options, please click the *CONTINUE* button below.

⚠️ *Important:*
• Trust only official updates 
• Support replies may take some time.`,
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("▶️ CONTINUE", "MENU")],
        [Markup.button.url("📢 OFFICIAL CHANNEL", "https://t.me/hack_zone_ai")]
      ])
    }
  );
});

/* =====================
   MAIN MENU (EDIT MEDIA)
===================== */
bot.action("MENU", async (ctx) => {
  await ctx.editMessageMedia(
    {
      type: "photo",
      media: IMAGES.MENU,
      caption: `❓ *PLEASE SELECT YOUR QUERY*`,
      parse_mode: "Markdown"
    },
    {
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
   SUPPORT OPEN
===================== */
bot.action("SUPPORT_OPEN", async (ctx) => {
  openTickets.set(ctx.from.id, true);

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: IMAGES.SUPPORT,
      caption:
`🧑‍💻 *LIVE SUPPORT OPEN*

SEND YOUR MESSAGE (TEXT / PHOTO / VIDEO).
OUR SUPPORT TEAM WILL REPLY SOON.`,
      parse_mode: "Markdown"
    },
    {
      ...Markup.inlineKeyboard([
        [Markup.button.callback("❌ CLOSE TICKET", "SUPPORT_CLOSE")],
        [Markup.button.callback("⬅️ BACK", "MENU")],
        [Markup.button.url("📢 OFFICIAL CHANNEL", "https://t.me/hack_zone_ai")]
      ])
    }
  );
});

/* =====================
   SUPPORT CLOSE
===================== */
bot.action("SUPPORT_CLOSE", async (ctx) => {
  openTickets.delete(ctx.from.id);

  await ctx.editMessageCaption(
    `✅ *YOUR SUPPORT TICKET HAS BEEN CLOSED.*

YOU CAN OPEN A NEW TICKET ANYTIME.`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("⬅️ BACK TO MENU", "MENU")],
        [Markup.button.url("📢 OFFICIAL CHANNEL", "https://t.me/hack_zone_ai")]
      ])
    }
  );
});

/* =====================
   ADMIN REPLY BUTTON
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

/* =====================
   SINGLE MESSAGE HANDLER
===================== */
bot.on("message", async (ctx) => {

  /* ADMIN MESSAGE */
  if (ctx.from.id === ADMIN_ID) {
    const targetUser = adminReplyTarget.get(ctx.from.id);
    if (!targetUser) return;

    await ctx.copyMessage(targetUser);
    adminReplyTarget.delete(ctx.from.id);
    return;
  }

  /* USER MESSAGE */
  if (!openTickets.get(ctx.from.id)) return;

  await ctx.copyMessage(ADMIN_ID, {
    caption:
`📩 *NEW SUPPORT MESSAGE*

👤 USER: ${ctx.from.first_name || "USER"}
🆔 ID: ${ctx.from.id}`
  });

  await bot.telegram.sendMessage(
    ADMIN_ID,
    `⚙️ *SELECT ACTION*`,
    {
      parse_mode: "Markdown",
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

PLEASE BE PATIENT. OUR SUPPORT TEAM WILL REPLY SOON.`,
    { parse_mode: "Markdown" }
  );
});

/* =====================
   INFO SECTIONS (EDIT MEDIA)
===================== */
bot.action("WITHDRAW", (ctx) =>
  ctx.editMessageMedia(
    {
      type: "photo",
      media: IMAGES.WITHDRAW,
      caption: `💸 *WITHDRAWAL PROCESS*\nLOGIN → WITHDRAW → CONFIRM`,
      parse_mode: "Markdown"
    },
    {
      ...Markup.inlineKeyboard([
        [Markup.button.url("WITHDRAW NOW", "https://1win.com/withdrawal")],
        [Markup.button.callback("⬅️ BACK", "MENU")],
        [Markup.button.url("📢 OFFICIAL CHANNEL", "https://t.me/hack_zone_ai")]
      ])
    }
  )
);

bot.action("DEPOSIT", (ctx) =>
  ctx.editMessageMedia(
    {
      type: "photo",
      media: IMAGES.DEPOSIT,
      caption: `💳 *MAKE A DEPOSIT*\nUSE PROMO CODE *OGGY*`,
      parse_mode: "Markdown"
    },
    {
      ...Markup.inlineKeyboard([
        [Markup.button.url("DEPOSIT NOW", "https://1win.com/deposit")],
        [Markup.button.callback("⬅️ BACK", "MENU")],
        [Markup.button.url("📢 OFFICIAL CHANNEL", "https://t.me/hack_zone_ai")]
      ])
    }
  )
);

bot.action("BONUS", (ctx) =>
  ctx.editMessageMedia(
    {
      type: "photo",
      media: IMAGES.BONUS,
      caption: `🎁 *BONUS INFORMATION*\nUSE BONUS CODE *OGGY*`,
      parse_mode: "Markdown"
    },
    {
      ...Markup.inlineKeyboard([
        [Markup.button.url("CLAIM BONUS", "https://1win.com/bonus")],
        [Markup.button.callback("⬅️ BACK", "MENU")],
        [Markup.button.url("📢 OFFICIAL CHANNEL", "https://t.me/hack_zone_ai")]
      ])
    }
  )
);

bot.action("VOUCHER", (ctx) =>
  ctx.editMessageMedia(
    {
      type: "photo",
      media: IMAGES.VOUCHER,
      caption: `🎟 *GET VOUCHERS*\nJOIN OUR OFFICIAL CHANNEL`,
      parse_mode: "Markdown"
    },
    {
      ...Markup.inlineKeyboard([
        [Markup.button.url("GET VOUCHER", "https://t.me/hack_zone_ai")],
        [Markup.button.callback("⬅️ BACK", "MENU")],
        [Markup.button.url("📢 OFFICIAL CHANNEL", "https://t.me/hack_zone_ai")]
      ])
    }
  )
);

/* =====================
   PREDICTOR BOTS
===================== */
bot.action("PREDICTORS", (ctx) =>
  ctx.editMessageMedia(
    {
      type: "photo",
      media: IMAGES.PREDICTORS,
      caption: `🤖 *PREDICTOR BOTS*`,
      parse_mode: "Markdown"
    },
    {
      ...Markup.inlineKeyboard([
        [Markup.button.url("✈️ AVIATOR HACK", "https://t.me/Aviator")],
        [Markup.button.url("💣 MINES HACK", "https://t.me/mines")],
        [Markup.button.url("👑 KING THIMBLES", "https://t.me/king")],
        [Markup.button.callback("⬅️ BACK", "MENU")],
        [Markup.button.url("📢 OFFICIAL CHANNEL", "https://t.me/hack_zone_ai")]
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
