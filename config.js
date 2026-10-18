module.exports = {
  BOT_NAME: "DEAN-ULTRA",
  VERSION: "1.0.0",
  PLATFORM: "Panel",
  OWNER_NAME: process.env.OWNER_NAME || "Theo",

  // The bot asks for the WhatsApp phone number at first connection.
  // Do not store a bot phone number here.

  // Optional owner number. Set OWNER_NUMBER in the environment if using private mode.
  // No WhatsApp number is hard-coded in this package.
  OWNER_NUMBER: process.env.OWNER_NUMBER || "",

  PREFIX: ".",

  // public = everyone can use commands
  // private = only OWNER_NUMBER can use commands
  // groups = commands work only in groups
  MODE: "public",

  ANTILINK_DEFAULT: false,

  // Music files larger than this may fail because of WhatsApp limits.
  MAX_MUSIC_MB: 95,

  // WolfXapis music-download API key supplied by the owner.
  // Keep this ZIP private because it contains a credential.
  MUSIC_API_KEY: process.env.MUSIC_API_KEY || "wxa_u_539dc23597",
  MUSIC_API_BASE: process.env.MUSIC_API_BASE || "https://apis.xwolf.space"
};
