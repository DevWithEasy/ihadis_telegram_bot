const { Markup } = require("telegraf");
const axios = require("axios");

class Command {
  constructor(bot) {
    this.bot = bot;
  }
  start() {
    this.bot.start((ctx) => {
      ctx.replyWithPhoto(
        "https://play-lh.googleusercontent.com/mE9iTJt2xvDoJB2xvbUYxz5t50GAnEq-tnnWbu3mP5EwPocSFAc7IH-JIlUdJowYhQ", // Image URL
        {
          caption: `🕮 আল হাদিস\nহাদিস খুঁজুন খুব সহজেই।\n২৯ টির বেশি হাদিস বইয়ের বড় সংগ্রহশালা।`,
          reply_markup: {
            inline_keyboard: [
              [
                { text: "হাদিসের বই সমূহ", callback_data: "hadis_books" }
              ],
              [
                { text: "হাদিস খুঁজুন", callback_data: "hadis_find" }
              ],
              [
                { text: "অ্যাপ চালু করুন", web_app: { url: 'https://ihadis.vercel.app/' }},
                { text: "ব্যবহার বিধি", callback_data: "bot_help" },
                { text: "বট সম্পর্কে", callback_data: "bot_info" }
              ],
            ],
          },
        }
      );
    });
  }

  restart() {
    this.bot.action('start',(ctx) => {
      return ctx.replyWithPhoto(
        "https://play-lh.googleusercontent.com/mE9iTJt2xvDoJB2xvbUYxz5t50GAnEq-tnnWbu3mP5EwPocSFAc7IH-JIlUdJowYhQ", // Image URL
        {
          caption: `আল হাদিস\nহাদিস খুঁজুন খুব সহজেই।\n৪০ টির বেশি হাদিস বইয়ের বড় সংগ্রহশালা।`,
          reply_markup: {
            inline_keyboard: [
              [
                { text: "হাদিসের বই সমূহ", callback_data: "hadis_books" }
              ],
              [
                { text: "হাদিস খুঁজুন", callback_data: "hadis_find" }
              ],
              [
                { text: "অ্যাপ চালু করুন", web_app: { url: 'https://ihadis.vercel.app/' }},
                { text: "ব্যবহার বিধি", callback_data: "bot_help" },
                { text: "বট সম্পর্কে", callback_data: "bot_info" }
              ]
            ],
          },
        }
      );
    });
  }

  botHelp(){
    this.bot.action('bot_help',(ctx)=>{
        ctx.reply(`✔️হাদিস খোঁজার সহজ উপায় হিসাবে আপনি আমাকে ব্যবহার করতে পারেন।\nহাদিস খোঁজার এই ভাবে কিছু লিখুন\n\n  "/find,book_no,hadith_no".\n\n✔️অথবা হাদিস খুঁজুন বাটনে ক্লিক করে আপনাকে জিজ্ঞাসিত\n\n-বই নং এবং \n-হাদিস নং \n\n এই দুইটির উত্তর দিলেই হাদিস খুজে দিবে ইনশাল্লাহ।`)
    })
  }

  help() {
    this.bot.help((ctx) => {
      ctx.reply(`বট পুনরায় চালু করতে - /start\nব্যবহার বিধি জানতে - /bot_help`);
    });
  }

  books() {
    this.bot.action("hadis_books", async (ctx) => {
    const findingMessage = await ctx.reply("🔍 হাদিসের বই গুলো খোঁজা হচ্ছে...");
      try {
        const { data } = await axios.get(
          "https://ihadis.vercel.app/api/book"
        );
        if (data.data.books) {
          const booksReply = data.data.books.map((book,i) => {
            return {
              text: `🕮 ${book.id} - ${book.title}`,
              callback_data: book.book_name,
            };
          });
          const buttons = [];
          booksReply.forEach((reply) => {
            if (buttons.length === 0) {
              buttons.push([reply]);
            } else if (buttons[buttons.length - 1].length === 1) {
              buttons[buttons.length - 1].push(reply);
            } else if (buttons[buttons.length - 1].length === 2) {
              buttons.push([reply]);
            }
          });

          await ctx.deleteMessage(findingMessage.message_id)
          ctx.reply(`হাদিসের বই সমূহঃ `, {
            reply_markup: {
              inline_keyboard: [
                ...buttons,
                [
                  { text: "হাদিস খুঁজুন", callback_data: "find_hadis" },
                  { text: "শুরুতে যান", callback_data: "start" }
                ],
              ],
            },
          });
        }
      } catch (error) {
        await ctx.deleteMessage(findingMessage.message_id)
        ctx.reply("সার্ভারের সমস্যাজনিত কারনে দুঃখিত। পুনরায় চেষ্টা করুন।");
      }
    });
  }

  find() {
    this.bot.command("find", async (ctx) => {
      let inputArray = ctx.message.text.split(",");
      console.log(inputArray);

      if (inputArray.length === 1) {
        return ctx.reply(
          'আপনি সার্চের জন্য কিছু লিখেন নি. অনুগ্রহ করে হাদিস খোঁজার এই ভাবে কিছু লিখুন\n\n  "/find,book_no,hadith_no".'
        );
      } else if (inputArray.length < 3) {
        return ctx.reply(
          'আপনি সার্চের জন্য বই নং ও হাদিস নং সঠিকভাবে লিখেন নি. অনুগ্রহ করে হাদিস খোঁজার এই ভাবে কিছু লিখুন\n\n  "/find,book_no,hadith_no".'
        );
      } else {
        let bookNo = inputArray[1];
        let hadithNo = inputArray[2];
        const findingMessage = await ctx.reply("🔍 খোঁজা হচ্ছে...");
        try {
          const data = await axios.get(
            `https://ihadis.vercel.app/api/book/hadith/find/${bookNo}/${hadithNo}`
          );
          if (data.data.message === "Hadiths found") {
            await ctx.deleteMessage(findingMessage.message_id);
            const { chapter, section, hadith } = data.data.data;
            return ctx.reply(
              `হাদিসের বইঃ  ${hadith?.book_name}
হাদিসের মানঃ  ${hadith?.grade}
অধ্যায়ঃ  ${chapter?.title}
হাদিস নংঃ  ${hadith?.hadith_id}
হাদিস বর্ণনাকারীঃ  ${hadith?.narrator}

আরবীঃ  
${hadith?.ar}

বাংলাঃ 
 ${hadith?.bn}

হাদিসের ব্যাখাঃ 
${section?.preface}
`,
              {
                reply_markup: {
                  inline_keyboard: [
                    [
                      { text: "শুরুতে যান", callback_data: "start" },
                      { text: "হাদিসে বই সমূহ", callback_data: "hadis_books" },
                    ],
                  ],
                },
              }
            );
          } else {
            await ctx.deleteMessage(findingMessage.message_id);
            return ctx.reply(
              "এই হাদিস নাম্বারের কোনো হাদিস পাওয়া যায়নি।\nঅনুগ্রহ করে পুনরায় চেষ্টা করুন।\nরেফারেন্স হাদিসের বই নং ও হাদিসের নাম্বার সঠিক ভাবে লিখুন।",
              {
                reply_markup: {
                  inline_keyboard: [
                    [
                      { text: "শুরুতে যান", callback_data: "start" },
                      { text: "হাদিসে বই সমূহ", callback_data: "hadis_books" },
                    ],
                  ],
                },
              }
            );
          }
        } catch (error) {
          await ctx.deleteMessage(findingMessage.message_id);
          ctx.reply("সার্ভারের সমস্যাজনিত কারনে দুঃখিত। পুনরায় চেষ্টা করুন।", {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "শুরুতে যান", callback_data: "start" },
                  { text: "হাদিসে বই সমূহ", callback_data: "hadis_books" },
                ],
              ],
            },
          });
        }
      }
    });
  }

  hadis_find(){
    this.bot.action("hadis_find", async (ctx) => {
      await ctx.reply(
        '✔️হাদিস খোঁজার সহজ উপায় হিসাবে আপনি আমাকে ব্যবহার করতে পারেন।\nহাদিস খোঁজার এই ভাবে কিছু লিখুন\n\n  "/find,book_no,hadith_no".\n\n আরো সহজেই ক্লিক করে জানতে নিচের বাটন গুলো অনুসরণ করুন।',
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "হাদিস বই নং জানতে", callback_data: "hadis_books" },
                { text: "হাদিস বই নং জানি", callback_data: "find_hadis" }
              ]
            ],
          },
        }
      );
    });
  }

  findByAns() {
    const userAnswers = {};
    this.bot.action("find_hadis", async (ctx) => {
      // Ask for book number first
      await ctx.reply("হাদিস বই নং লিখুনঃ");

      // Set step to "book"
      userAnswers[ctx.from.id] = { step: "book" };
    });

    this.bot.on("text", async (ctx) => {
      const userId = ctx.from.id;

      // Check what step the user is on
      if (userAnswers[userId] && userAnswers[userId].step === "book") {
        // Store the book number
        userAnswers[userId].bookNo = ctx.message.text;
        userAnswers[userId].step = "hadith"; // Move to next step

        // Ask for hadith number
        await ctx.reply("হাদিস নং লিখুনঃ");
      } else if (userAnswers[userId] && userAnswers[userId].step === "hadith") {
        // Store the hadith number
        const hadithNo = ctx.message.text;
        const bookNo = userAnswers[userId].bookNo;

        // Send the final response with bookNo and hadithNo
        const findingMessage = await ctx.reply("🔍 খোঁজা হচ্ছে...");
        try {
          const data = await axios.get(
            `https://ihadis.vercel.app/api/book/hadith/find/${bookNo}/${hadithNo}`
          );
          if (data.data.message === "Hadiths found") {
            await ctx.deleteMessage(findingMessage.message_id);
            const { chapter, section, hadith } = data.data.data;
            return ctx.reply(
              `হাদিসের বইঃ  ${hadith?.book_name}
হাদিসের মানঃ  ${hadith?.grade}
অধ্যায়ঃ  ${chapter?.title}
হাদিস নংঃ  ${hadith?.hadith_id}
হাদিস বর্ণনাকারীঃ  ${hadith?.narrator}

আরবীঃ  
${hadith?.ar}

বাংলাঃ 
 ${hadith?.bn}

হাদিসের ব্যাখাঃ 
${section?.preface}
`,
              {
                reply_markup: {
                  inline_keyboard: [
                    [
                      { text: "শুরুতে যান", callback_data: "start" },
                      { text: "হাদিসে বই সমূহ", callback_data: "hadis_books" },
                    ],
                  ],
                },
              }
            );
          } else {
            await ctx.deleteMessage(findingMessage.message_id);
            return ctx.reply(
              "এই হাদিস নাম্বারের কোনো হাদিস পাওয়া যায়নি।\nঅনুগ্রহ করে পুনরায় চেষ্টা করুন।\nরেফারেন্স হাদিসের বই নং ও হাদিসের নাম্বার সঠিক ভাবে লিখুন।",
              {
                reply_markup: {
                  inline_keyboard: [
                    [
                      { text: "শুরুতে যান", callback_data: "start" },
                      { text: "হাদিসে বই সমূহ", callback_data: "hadis_books" },
                    ],
                  ],
                },
              }
            );
          }
        } catch (error) {
          await ctx.deleteMessage(findingMessage.message_id);
          ctx.reply("সার্ভারের সমস্যাজনিত কারনে দুঃখিত। পুনরায় চেষ্টা করুন।", {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "শুরুতে যান", callback_data: "start" },
                  { text: "হাদিসে বই সমূহ", callback_data: "hadis_books" },
                ],
              ],
            },
          });
        }

        // Reset the user state
        delete userAnswers[userId];
      }
    });
  }

  aboutBook(){
    this.bot.on('callback_query',(query)=>{
      console.log(query)
    })
  }

  // ====================================
  // call all action inside this function
  // ====================================
  init() {
    this.start();
    this.help();
    this.books();
    this.find();
    this.findByAns();
    this.botHelp();
    this.restart();
    this.hadis_find();
    this.aboutBook();
  }
}

module.exports = Command;
