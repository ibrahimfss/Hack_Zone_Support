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
  WELCOME: "AgACAgUAAxkBAAE_WPJpQlcRHHCFBKbXeo4mOMx5E59GgwACEwxrG4RIEVaxzAABBCYIytgBAAMCAAN3AAM2BA",
  MENU: "AgACAgUAAxkBAAE_V7JpQisvyupOWN12rCB5KISHqdpYqgACoAtrG4RIEVYZJFfTHbvZywEAAwIAA3cAAzYE",
  BONUS: "https://t.me/hostvideobotm/5",
  VOUCHER: "AgACAgUAAxkBAAE_V_RpQjU-ysbhZR86qF66G6wPmExXQgACtwtrG4RIEVZjwbr-ZJWTbQEAAwIAA3cAAzYE",
  SUPPORT: "AgACAgUAAxkBAAE_WCZpQjxEMKZY_iWH6aXWHahe3K3D0QACwwtrG4RIEVa44l5Q-wFxEwEAAwIAA3cAAzYE",
  PREDICTORS: "AgACAgUAAxkBAAE_WPtpQlgaup56XKvp6TYhUETn2wyMogACFAxrG4RIEVavGP0sC4AIfAEAAwIAA3cAAzYE"
};
const VIDEOS = {
  WITHDRAW: "BAACAgUAAxkBAAE_TZBpQQZc-sMNBCXlke1YOu7qzG8JiQACrxsAArK4CFbi5xvH1oAHUzYE",
  DEPOSIT: "BAACAgUAAxkBAAE_TaJpQQmxESqpxdndUCAAAW9klvnE1SwAArAbAAKyuAhW21yLxSAAARvyNgQ"
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
  const firstName = ctx.from.first_name || "User";

  await ctx.replyWithPhoto(
    IMAGES.WELCOME,
    {
      caption:
`👋 *WELCOME, ${firstName}!*

You have successfully reached *HACK ZONE SUPPORT* 🛠️  
Our team is here to assist you with all official support-related queries.

━━━━━━━━━━━━━━━━━━
📢 *https://t.me/+rOuALeM_WaQzODU1*
━━━━━━━━━━━━━━━━━━

To continue and access support options, please click the *CONTINUE* button below.

⚠️ *Important Notes:*
• Only trust updates from our official channel  
• Support replies may take some time — please be patient.`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "▶️ CONTINUE", callback_data: "MENU" }],
          [{ text: "📢 OFFICIAL CHANNEL", url: "https://t.me/hack_zone_ai" }]
        ]
      }
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
      media: IMAGES.SUPPORT, // ✅ SUPPORT IMAGE WILL SHOW NOW
      caption:
`👨‍💻 <b>LIVE SUPPORT IS NOW OPEN</b>

<i>You can send your message below.</i>  
<i>Supported formats: Text, Photo, Video.</i>

━━━━━━━━━━━━━━━━━━
📌 <b>WHAT HAPPENS NEXT</b>
━━━━━━━━━━━━━━━━━━
• <i>Your message has been received by our support system</i>  
• <i>A support agent will review your request</i>  
• <i>You will receive a reply as soon as possible</i>

━━━━━━━━━━━━━━━━━━
⚠️ <b>IMPORTANT NOTES</b>
━━━━━━━━━━━━━━━━━━
• <i>Please describe your issue clearly for faster assistance</i>  
• <i>Do not send duplicate messages</i>  
• <i>Response time may vary depending on queue volume</i>

<b>To end this session, click <u>CLOSE TICKET</u>.</b>`,
      parse_mode: "HTML"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "❌ CLOSE TICKET", callback_data: "SUPPORT_CLOSE" }],
          [{ text: "⬅️ BACK", callback_data: "MENU" }]
        ]
      }
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
   ADMIN CLOSE TICKET
===================== */
bot.action(/^ADMIN_CLOSE_(\d+)$/, async (ctx) => {
  const userId = Number(ctx.match[1]);

  // Remove ticket from memory
  openTickets.delete(userId);

  // Notify user
  await bot.telegram.sendMessage(
    userId,
`❌ <b>YOUR SUPPORT TICKET HAS BEEN CLOSED BY SUPPORT TEAM</b>

<i>If you need more help, you can open a new ticket anytime.</i>`,
    { parse_mode: "HTML" }
  );

  // Confirm to admin
  await ctx.editMessageText(
    `✅ <b>TICKET CLOSED SUCCESSFULLY</b>\n\nUser ID: <code>${userId}</code>`,
    { parse_mode: "HTML" }
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
      type: "video",
      media: VIDEOS.WITHDRAW,
      caption:
`💸 *WITHDRAWAL INFORMATION*

━━━━━━━━━━━━━━━━━━
📌 *IMPORTANT WITHDRAWAL RULES*
━━━━━━━━━━━━━━━━━━
• Withdrawal is available only after completing account verification  
• The minimum withdrawal amount depends on the selected payment method  
• Ensure your payment details are correct before submitting a request  

━━━━━━━━━━━━━━━━━━
⏳ *PROCESSING TIME*
━━━━━━━━━━━━━━━━━━
• E-wallets / UPI: Usually within 
5–30 minutes  
• Bank transfer: Up to 24 hours

━━━━━━━━━━━━━━━━━━
⚠️ *IMPORTANT NOTICE*
━━━━━━━━━━━━━━━━━━
• Use only your own payment details  
• Do not attempt multiple withdrawals at the same time  
• Any violation of 1win terms may result in withdrawal delay or rejection

_If your withdrawal is pending, please remain patient._

Click *WITHDRAW NOW* to proceed.`,
      parse_mode: "Markdown"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "💸 WITHDRAW NOW", url: "https://lkxw.cc/6706" }],
          [{ text: "⬅️ BACK", callback_data: "MENU" }],
          [{ text: "📢 OFFICIAL CHANNEL", url: "https://t.me/hack_zone_ai" }]
        ]
      }
    }
  )
);

bot.action("DEPOSIT", (ctx) =>
  ctx.editMessageMedia(
    {
      type: "video",
      media: VIDEOS.DEPOSIT,
      caption: 
`‎💳 *1WIN DEPOSIT INFORMATION*
‎
‎━━━━━━━━━━━━━━━━━━
‎📌 *IMPORTANT DEPOSIT RULES*
‎━━━━━━━━━━━━━━━━━━
‎• Deposits must be made only from your own payment method  
‎• The minimum deposit amount depends on the selected payment option  
‎• Always check the deposit amount before confirming payment 
‎
‎━━━━━━━━━━━━━━━━━━
‎⚡ *DEPOSIT PROCESSING TIME*
‎━━━━━━━━━━━━━━━━━━
‎• UPI / E-wallets: Instant to a few minutes  
‎• Bank transfer: May take up to 15–30 minutes 
‎
‎━━━━━━━━━━━━━━━━━━
‎🎁 *BONUS & PROMOCODE*
‎━━━━━━━━━━━━━━━━━━
‎• Enter the correct *promocode* \`OGGY\` during Registration to receive *600% deposit bonuses*  
‎• Bonuses are subject to wagering requirements  
‎• Incorrect or missing promocode may void the bonus
‎
‎━━━━━━━━━━━━━━━━━━
‎⚠️ *IMPORTANT NOTICE*
‎━━━━━━━━━━━━━━━━━━
‎_• Do not close the app or refresh the page during payment  
‎• Save the transaction ID until the balance is credited  
‎• For failed deposits, contact official 1win support only_
‎
‎Click *DEPOSIT NOW* to proceed.`,
      parse_mode: "Markdown"
    },
    {
      ...Markup.inlineKeyboard([
        [Markup.button.url("DEPOSIT NOW", "https://lkxw.cc/6706")],
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
      caption: `‎🎁 *EXCLUSIVE DEPOSIT BONUS*
‎
‎_Use the special promocode below during registration & deposit to unlock your bonus:_
‎
‎━━━━━━━━━━━━━━━━━━
‎🎯 *PROMOCODE:* \`OGGY\`
‎💥 *BONUS: GET UP TO 600%*\n+500 Free Spins
‎━━━━━━━━━━━━━━━━━━
‎
‎📌 *IMPORTANT:*
‎• Promocode must be entered before confirming the registration or deposit 
‎• Bonus is applicable on eligible deposits only  
‎• Bonus funds are subject to wagering requirements  
‎• One bonus per user / per account
‎
‎Deposit now and maximize your winning potential.
‎
‎Click *CLAIM BONUS* to proceed.`,
      parse_mode: "Markdown"
    },
    {
      ...Markup.inlineKeyboard([
        [Markup.button.url("CLAIM BONUS", "https://lkxw.cc/6706")],
        [Markup.button.callback("⬅️ BACK", "MENU")],
        [Markup.button.url("📢 OFFICIAL CHANNEL", "https://t.me/hack_zone_ai")]
      ])
    }
  )
);

bot.action("VOUCHER", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: IMAGES.VOUCHER, // ✅ THIS FIXES THE ISSUE
      caption:
`🎟️ <b>1WIN VOUCHERS & PROMO CODES</b>

<i>Get exclusive 1win voucher codes to boost your balance and maximize rewards.</i>

━━━━━━━━━━━━━━━━━━
📌 <b>HOW TO GET DAILY VOUCHERS</b>
━━━━━━━━━━━━━━━━━━
• Join our <a href="https://t.me/hack_zone_ai"><b>Official Telegram Channel</b></a>  
• Daily voucher codes are shared only in the channel  
• Vouchers are limited and available for a short time  
• Codes are valid for eligible users only  

━━━━━━━━━━━━━━━━━━
⚠️ <b>IMPORTANT NOTICE</b>
━━━━━━━━━━━━━━━━━━
• Vouchers are provided by <a href="https://t.me/hack_zone_ai"><b>Official Channel</b></a> sources only  
• Each voucher may have specific terms and conditions  
• Expired or already-used vouchers cannot be reused  

Join the <a href="https://t.me/hack_zone_ai"><b>Official Channel</b></a> now to receive daily voucher codes.

Click <b>GET VOUCHER</b> to proceed.`,
      parse_mode: "HTML"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🎟️ GET VOUCHER", url: "https://t.me/hack_zone_ai" }],
          [{ text: "⬅️ BACK", callback_data: "MENU" }],
          [{ text: "📢 OFFICIAL CHANNEL", url: "https://t.me/hack_zone_ai" }]
        ]
      }
    }
  );
});

/* =====================
   PREDICTOR BOTS
===================== */
bot.action("PREDICTORS", (ctx) =>
  ctx.editMessageMedia(
    {
      type: "photo",
      media: IMAGES.PREDICTORS,
      caption: `🤖 *Boost your earnings by using the Predictor & Hack bots below and increase your winning chances*.`,
      parse_mode: "Markdown"
    },
    {
      ...Markup.inlineKeyboard([
        [Markup.button.url("✈️ AVIATOR HACK", "https://t.me/aviator_predict_vipbot?start=ar1465380042")],
        [Markup.button.url("💣 MINES HACK", "https://t.me/Mines_hacke_bot?start=ar1465380042")],
        [Markup.button.url("👑 KING THIMBLES", "https://t.me/King_thimblesbot?start=ar1465380042")],
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
