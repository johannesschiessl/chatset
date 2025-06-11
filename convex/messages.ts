import { query } from "./_generated/server";

export const getMessages = query({
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").order("asc").take(100);
    return messages;
  },
});
