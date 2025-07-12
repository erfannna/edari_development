/**
 * انتخابگر ایموجی برای چت تلگرام
 * این فایل برای اضافه کردن قابلیت انتخاب ایموجی به چت تلگرام استفاده می‌شود
 */

document.addEventListener("DOMContentLoaded", function () {
  //('فایل telegram-emoji-picker.js با موفقیت بارگذاری شد');

  // لیست ایموجی‌های پرکاربرد
  const popularEmojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "☹️",
    "😣",
    "😖",
    "😫",
    "😩",
    "🥺",
    "😢",
    "😭",
    "😤",
    "😠",
    "😡",
    "🤬",
    "🤯",
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "❣️",
    "💕",
    "💞",
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
  ];

  // دسته‌بندی‌های ایموجی
  const emojiCategories = {
    smileys: {
      title: "صورتک‌ها",
      icon: "😀",
      emojis: [
        "😀",
        "😃",
        "😄",
        "😁",
        "😆",
        "😅",
        "😂",
        "🤣",
        "😊",
        "😇",
        "🙂",
        "🙃",
        "😉",
        "😌",
        "😍",
        "🥰",
        "😘",
        "😗",
        "😙",
        "😚",
        "😋",
        "😛",
        "😝",
        "😜",
        "🤪",
        "🤨",
        "🧐",
        "🤓",
        "😎",
        "🤩",
        "🥳",
        "😏",
        "😒",
        "😞",
        "😔",
        "😟",
        "😕",
        "🙁",
        "☹️",
        "😣",
        "😖",
        "😫",
        "😩",
        "🥺",
        "😢",
        "😭",
        "😮‍💨",
        "😤",
        "😠",
        "😡",
        "🤬",
        "🤯",
        "😳",
        "🥵",
        "🥶",
        "😱",
        "😨",
        "😰",
        "😥",
        "😓",
        "🤗",
        "🤔",
        "🤭",
        "🤫",
        "🤥",
        "😶",
        "😐",
        "😑",
        "😬",
        "🙄",
        "😯",
        "😦",
        "😧",
        "😮",
        "😲",
        "🥱",
        "😴",
        "🤤",
        "😪",
        "😵",
        "😵‍💫",
        "🤐",
        "🥴",
        "🤢",
        "🤮",
        "🤧",
        "😷",
        "🤒",
        "🤕",
        "🤑",
        "🤠",
        "😈",
        "👿",
        "👹",
        "👺",
        "🤡",
        "💩",
        "👻",
        "💀",
        "☠️",
        "👽",
        "👾",
        "🤖",
        "🎃",
        "😺",
        "😸",
        "😹",
        "😻",
        "😼",
        "😽",
        "🙀",
        "😿",
        "😾",
        "👶",
        "👧",
        "🧒",
        "👦",
        "👩",
        "🧑",
        "👨",
      ],
    },
    emotions: {
      title: "احساسات",
      icon: "😍",
      emojis: [
        "😏",
        "😒",
        "😞",
        "😔",
        "😟",
        "😕",
        "🙁",
        "☹️",
        "😣",
        "😖",
        "😫",
        "😩",
        "🥺",
        "😢",
        "😭",
        "😤",
        "😠",
        "😡",
        "🤬",
        "🤯",
        "😳",
        "🥵",
        "🥶",
        "😱",
        "😨",
        "😰",
        "😥",
        "😓",
        "🤗",
        "🤔",
        "🤭",
        "🤫",
        "🤥",
        "😶",
        "😐",
        "😑",
        "😬",
        "🙄",
        "😯",
        "😦",
        "😧",
        "😮",
        "😲",
        "🥱",
        "😴",
        "🤤",
        "😪",
        "😵",
        "😵‍💫",
        "🤐",
        "🥴",
        "🤢",
        "🤮",
        "🤧",
        "😷",
        "🤒",
        "🤕",
        "🤑",
        "🤠",
        "😈",
        "👿",
        "👹",
        "👺",
        "🤡",
        "💩",
        "👻",
        "💀",
        "☠️",
        "👽",
        "👾",
      ],
    },
    hearts: {
      title: "قلب‌ها",
      icon: "❤️",
      emojis: [
        "❤️",
        "🧡",
        "💛",
        "💚",
        "💙",
        "💜",
        "🖤",
        "🤍",
        "🤎",
        "❣️",
        "💕",
        "💞",
        "💓",
        "💗",
        "💖",
        "💘",
        "💝",
        "💟",
        "♥️",
        "💌",
        "💔",
        "❤️‍🔥",
        "❤️‍🩹",
        "💋",
        "💯",
        "💢",
        "💥",
        "💫",
        "💦",
        "💨",
        "🕳️",
        "💣",
        "💬",
        "👁️‍🗨️",
        "🗨️",
        "🗯️",
        "💭",
        "💤",
        "🌸",
        "💮",
        "🏵️",
        "🌹",
        "🥀",
        "🌺",
        "🌻",
        "🌼",
        "🌷",
        "🌱",
        "🪴",
        "🌲",
      ],
    },
    hands: {
      title: "دست‌ها",
      icon: "👍",
      emojis: [
        "👍",
        "👎",
        "👌",
        "✌️",
        "🤞",
        "🤟",
        "🤘",
        "🤙",
        "👈",
        "👉",
        "👆",
        "👇",
        "☝️",
        "✋",
        "🤚",
        "🖐️",
        "👋",
        "🤏",
        "✍️",
        "👏",
        "🙌",
        "👐",
        "🤲",
        "🤝",
        "🙏",
        "💅",
        "🤳",
        "💪",
        "🦾",
        "🦿",
        "🦵",
        "🦶",
        "👂",
        "🦻",
        "👃",
        "🧠",
        "🫀",
        "🫁",
        "🦷",
        "🦴",
        "👀",
        "👁️",
        "👅",
        "👄",
        "💋",
        "🩸",
        "👶",
        "👧",
        "🧒",
        "👦",
        "👩",
        "🧑",
        "👨",
        "👩‍🦱",
        "🧑‍🦱",
        "👨‍🦱",
        "👩‍🦰",
        "🧑‍🦰",
        "👨‍🦰",
        "👱‍♀️",
      ],
    },
    animals: {
      title: "حیوانات",
      icon: "🐶",
      emojis: [
        "🐶",
        "🐱",
        "🐭",
        "🐹",
        "🐰",
        "🦊",
        "🐻",
        "🐼",
        "🐻‍❄️",
        "🐨",
        "🐯",
        "🦁",
        "🐮",
        "🐷",
        "🐽",
        "🐸",
        "🐵",
        "🙈",
        "🙉",
        "🙊",
        "🐒",
        "🐔",
        "🐧",
        "🐦",
        "🐤",
        "🐣",
        "🐥",
        "🦆",
        "🦅",
        "🦉",
        "🦇",
        "🐺",
        "🐗",
        "🐴",
        "🦄",
        "🐝",
        "🪱",
        "🐛",
        "🦋",
        "🐌",
        "🐞",
        "🐜",
        "🪰",
        "🪲",
        "🪳",
        "🦟",
        "🦗",
        "🕷️",
        "🕸️",
        "🦂",
        "🐢",
        "🐍",
        "🦎",
        "🦖",
        "🦕",
        "🐙",
        "🦑",
        "🦐",
        "🦞",
        "🦀",
        "🐡",
        "🐠",
        "🐟",
        "🐬",
        "🐳",
        "🐋",
        "🦈",
        "🦭",
        "🐊",
        "🐅",
        "🐆",
        "🦓",
        "🦍",
        "🦧",
        "🦣",
        "🐘",
        "🦛",
        "🦏",
        "🐪",
        "🐫",
        "🦒",
        "🦘",
        "🦬",
        "🐃",
        "🐂",
        "🐄",
        "🐎",
        "🐖",
        "🐏",
        "🐑",
        "🦙",
        "🐐",
        "🦌",
        "🐕",
        "🐩",
        "🦮",
        "🐕‍🦺",
        "🐈",
        "🐈‍⬛",
        "🪶",
      ],
    },
    food: {
      title: "غذا",
      icon: "🍔",
      emojis: [
        "🍏",
        "🍎",
        "🍐",
        "🍊",
        "🍋",
        "🍌",
        "🍉",
        "🍇",
        "🍓",
        "🫐",
        "🍈",
        "🍒",
        "🍑",
        "🥭",
        "🍍",
        "🥥",
        "🥝",
        "🍅",
        "🍆",
        "🥑",
        "🥦",
        "🥬",
        "🥒",
        "🌶️",
        "🫑",
        "🌽",
        "🥕",
        "🫒",
        "🧄",
        "🧅",
        "🥔",
        "🍠",
        "🥐",
        "🥯",
        "🍞",
        "🥖",
        "🥨",
        "🧀",
        "🥚",
        "🍳",
        "🧈",
        "🥞",
        "🧇",
        "🥓",
        "🥩",
        "🍗",
        "🍖",
        "🦴",
        "🌭",
        "🍔",
        "🍟",
        "🍕",
        "🫓",
        "🥪",
        "🥙",
        "🧆",
        "🌮",
        "🌯",
        "🫔",
        "🥗",
        "🥘",
        "🫕",
        "🥫",
        "🍝",
        "🍜",
        "🍲",
        "🍛",
        "🍣",
        "🍱",
        "🥟",
        "🦪",
        "🍤",
        "🍙",
        "🍚",
        "🍘",
        "🍥",
        "🥠",
        "🥮",
        "🍢",
        "🍡",
        "🍧",
        "🍨",
        "🍦",
        "🥧",
        "🧁",
        "🍰",
        "🎂",
        "🍮",
        "🍭",
        "🍬",
        "🍫",
        "🍿",
        "🍩",
        "🍪",
        "🌰",
        "🥜",
        "🍯",
        "🥛",
        "🍼",
        "☕",
      ],
    },
    activities: {
      title: "فعالیت‌ها",
      icon: "⚽",
      emojis: [
        "⚽",
        "🏀",
        "🏈",
        "⚾",
        "🥎",
        "🎾",
        "🏐",
        "🏉",
        "🥏",
        "🎱",
        "🪀",
        "🏓",
        "🏸",
        "🏒",
        "🏑",
        "🥍",
        "🏏",
        "🪃",
        "🥅",
        "⛳",
        "🪁",
        "🏹",
        "🎣",
        "🤿",
        "🥊",
        "🥋",
        "🎽",
        "🛹",
        "🛼",
        "🛷",
        "⛸️",
        "🥌",
        "🎿",
        "⛷️",
        "🏂",
        "🪂",
        "🏋️",
        "🏋️‍♀️",
        "🏋️‍♂️",
        "🤼",
        "🤼‍♀️",
        "🤼‍♂️",
        "🤸",
        "🤸‍♀️",
        "🤸‍♂️",
        "⛹️",
        "⛹️‍♀️",
        "⛹️‍♂️",
        "🤺",
        "🤾",
        "🤾‍♀️",
        "🤾‍♂️",
        "🏌️",
        "🏌️‍♀️",
        "🏌️‍♂️",
        "🏇",
        "🧘",
        "🧘‍♀️",
        "🧘‍♂️",
        "🏄",
        "🏄‍♀️",
        "🏄‍♂️",
        "🏊",
        "🏊‍♀️",
        "🏊‍♂️",
        "🤽",
        "🤽‍♀️",
        "🤽‍♂️",
        "🚣",
        "🚣‍♀️",
        "🚣‍♂️",
        "🧗",
        "🧗‍♀️",
        "🧗‍♂️",
        "🚵",
        "🚵‍♀️",
        "🚵‍♂️",
        "🚴",
        "🚴‍♀️",
        "🚴‍♂️",
      ],
    },
    travel: {
      title: "سفر",
      icon: "🚗",
      emojis: [
        "🚗",
        "🚕",
        "🚙",
        "🚌",
        "🚎",
        "🏎️",
        "🚓",
        "🚑",
        "🚒",
        "🚐",
        "🛻",
        "🚚",
        "🚛",
        "🚜",
        "🦯",
        "🦽",
        "🦼",
        "🛴",
        "🚲",
        "🛵",
        "🏍️",
        "🛺",
        "🚨",
        "🚔",
        "🚍",
        "🚘",
        "🚖",
        "🚡",
        "🚠",
        "🚟",
        "🚃",
        "🚋",
        "🚞",
        "🚝",
        "🚄",
        "🚅",
        "🚈",
        "🚂",
        "🚆",
        "🚇",
        "🚊",
        "🚉",
        "✈️",
        "🛫",
        "🛬",
        "🛩️",
        "💺",
        "🛰️",
        "🚀",
        "🛸",
        "🚁",
        "🛶",
        "⛵",
        "🚤",
        "🛥️",
        "🛳️",
        "⛴️",
        "🚢",
        "⚓",
        "🪝",
        "⛽",
        "🚧",
        "🚦",
        "🚥",
        "🚏",
        "🗺️",
        "🗿",
        "🗽",
        "🗼",
        "🏰",
        "🏯",
        "🏟️",
        "🎡",
        "🎢",
        "🎠",
        "⛲",
        "⛱️",
        "🏖️",
        "🏝️",
        "🏜️",
        "🌋",
        "⛰️",
        "🏔️",
        "🗻",
        "🏕️",
        "⛺",
        "🏠",
        "🏡",
        "🏘️",
        "🏚️",
        "🏗️",
        "🏭",
        "🏢",
        "🏬",
        "🏣",
        "🏤",
        "🏥",
        "🏦",
        "🏨",
        "🏪",
      ],
    },
    objects: {
      title: "اشیاء",
      icon: "💡",
      emojis: [
        "⌚",
        "📱",
        "📲",
        "💻",
        "⌨️",
        "🖥️",
        "🖨️",
        "🖱️",
        "🖲️",
        "🕹️",
        "🗜️",
        "💽",
        "💾",
        "💿",
        "📀",
        "📼",
        "📷",
        "📸",
        "📹",
        "🎥",
        "📽️",
        "🎞️",
        "📞",
        "☎️",
        "📟",
        "📠",
        "📺",
        "📻",
        "🎙️",
        "🎚️",
        "🎛️",
        "🧭",
        "⏱️",
        "⏲️",
        "⏰",
        "🕰️",
        "⌛",
        "⏳",
        "📡",
        "🔋",
        "🔌",
        "💡",
        "🔦",
        "🕯️",
        "🪔",
        "🧯",
        "🛢️",
        "💸",
        "💵",
        "💴",
        "💶",
        "💷",
        "🪙",
        "💰",
        "💳",
        "💎",
        "⚖️",
        "🪜",
        "🧰",
        "🪛",
        "🔧",
        "🔨",
        "⚒️",
        "🛠️",
        "⛏️",
        "🪚",
        "🔩",
        "⚙️",
        "🪤",
        "🧱",
        "⛓️",
        "🧲",
        "🔫",
        "💣",
        "🧨",
        "🪓",
        "🔪",
        "🗡️",
        "⚔️",
        "🛡️",
        "🚬",
        "⚰️",
        "⚱️",
        "🏺",
        "🔮",
        "📿",
        "🧿",
        "💈",
        "⚗️",
        "🔭",
        "🔬",
        "🕳️",
        "🩹",
        "🩺",
        "💊",
        "💉",
        "🩸",
        "🧬",
        "🦠",
        "🧫",
      ],
    },
    symbols: {
      title: "نمادها",
      icon: "🔣",
      emojis: [
        "❤️",
        "🧡",
        "💛",
        "💚",
        "💙",
        "💜",
        "🖤",
        "🤍",
        "🤎",
        "💔",
        "❣️",
        "💕",
        "💞",
        "💓",
        "💗",
        "💖",
        "💘",
        "💝",
        "💟",
        "☮️",
        "✝️",
        "☪️",
        "🕉️",
        "☸️",
        "✡️",
        "🔯",
        "🕎",
        "☯️",
        "☦️",
        "🛐",
        "⛎",
        "♈",
        "♉",
        "♊",
        "♋",
        "♌",
        "♍",
        "♎",
        "♏",
        "♐",
        "♑",
        "♒",
        "♓",
        "🆔",
        "⚛️",
        "🉑",
        "☢️",
        "☣️",
        "📴",
        "📳",
        "🈶",
        "🈚",
        "🈸",
        "🈺",
        "🈷️",
        "✴️",
        "🆚",
        "💮",
        "🉐",
        "㊙️",
        "㊗️",
        "🈴",
        "🈵",
        "🈹",
        "🈲",
        "🅰️",
        "🅱️",
        "🆎",
        "🆑",
        "🅾️",
        "🆘",
        "❌",
        "⭕",
        "🛑",
        "⛔",
        "📛",
        "🚫",
        "💯",
        "💢",
        "♨️",
        "🚷",
        "🚯",
        "🚳",
        "🚱",
        "🔞",
        "📵",
        "🚭",
        "❗",
        "❕",
        "❓",
        "❔",
        "‼️",
        "⁉️",
        "🔅",
        "🔆",
        "〽️",
        "⚠️",
        "🚸",
        "🔱",
        "⚜️",
      ],
    },
    flags: {
      title: "پرچم‌ها",
      icon: "🇮🇷",
      emojis: [
        "🇮🇷",
        "🏁",
        "🚩",
        "🎌",
        "🏴",
        "🏳️",
        "🏳️‍⚧️",
        "🏴‍☠️",
        "🇦🇫",
        "🇦🇽",
        "🇦🇱",
        "🇩🇿",
        "🇦🇸",
        "🇦🇩",
        "🇦🇴",
        "🇦🇮",
        "🇦🇶",
        "🇦🇬",
        "🇦🇷",
        "🇦🇲",
        "🇦🇼",
        "🇦🇺",
        "🇦🇹",
        "🇦🇿",
        "🇧🇸",
        "🇧🇭",
        "🇧🇩",
        "🇧🇧",
        "🇧🇾",
        "🇧🇪",
        "🇧🇿",
        "🇧🇯",
        "🇧🇲",
        "🇧🇹",
        "🇧🇴",
        "🇧🇦",
        "🇧🇼",
        "🇧🇷",
        "🇮🇴",
        "🇻🇬",
        "🇧🇳",
        "🇧🇬",
        "🇧🇫",
        "🇧🇮",
        "🇰🇭",
        "🇨🇲",
        "🇨🇦",
        "🇮🇨",
        "🇨🇻",
        "🇧🇶",
        "🇰🇾",
        "🇨🇫",
        "🇹🇩",
        "🇨🇱",
        "🇨🇳",
        "🇨🇽",
        "🇨🇨",
        "🇨🇴",
        "🇰🇲",
        "🇨🇬",
        "🇨🇩",
        "🇨🇰",
        "🇨🇷",
        "🇨🇮",
        "🇭🇷",
        "🇨🇺",
        "🇨🇼",
        "🇨🇾",
        "🇨🇿",
        "🇩🇰",
        "🇩🇯",
        "🇩🇲",
        "🇩🇴",
        "🇪🇨",
        "🇪🇬",
        "🇸🇻",
        "🇬🇶",
        "🇪🇷",
        "🇪🇪",
        "🇪🇹",
        "🇪🇺",
        "🇫🇰",
        "🇫🇴",
        "🇫🇯",
        "🇫🇮",
        "🇫🇷",
        "🇬🇫",
        "🇵🇫",
        "🇹🇫",
        "🇬🇦",
        "🇬🇲",
        "🇬🇪",
        "🇩🇪",
        "🇬🇭",
        "🇬🇮",
        "🇬🇷",
        "🇬🇱",
        "🇬🇩",
        "🇬🇵",
        "🇬🇺",
      ],
    },
  };

  // ایجاد دکمه ایموجی
  function createEmojiButton() {
    // بررسی وجود کانتینر ورودی
    const inputContainer = document.querySelector(".telegram-input-container");
    if (!inputContainer) {
      console.error("کانتینر ورودی یافت نشد");
      return;
    }

    // بررسی وجود دکمه ارسال
    const sendButton = document.querySelector(".telegram-send-btn");
    if (!sendButton) {
      console.error("دکمه ارسال یافت نشد");
      return;
    }

    // ایجاد دکمه ایموجی
    const emojiButton = document.createElement("button");
    emojiButton.type = "button";
    emojiButton.className = "telegram-emoji-btn";
    emojiButton.id = "emojiPickerBtn";
    emojiButton.title = "افزودن ایموجی";
    emojiButton.innerHTML = '<i class="fa-solid fa-face-smile"></i>';

    // استایل دکمه ایموجی
    emojiButton.style.position = "absolute";
    emojiButton.style.borderRadius = "50%";
    emojiButton.style.top = "20px";
    emojiButton.style.right = "24px";
    emojiButton.style.background = "transparent";
    emojiButton.style.color = "#0F9D58";
    emojiButton.style.border = "none!important";
    emojiButton.style.display = "flex";
    emojiButton.style.alignItems = "center";
    emojiButton.style.justifyContent = "center";
    emojiButton.style.cursor = "pointer";
    emojiButton.style.fontSize = "17px";
    emojiButton.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.2)";
    emojiButton.style.zIndex = "999";

    // افزودن دکمه به کانتینر ورودی
    inputContainer.style.position = "relative";
    inputContainer.appendChild(emojiButton);

    // اضافه کردن افکت hover
    emojiButton.addEventListener("mouseover", function () {
      this.style.transform = "scale(1.05)";
    });

    emojiButton.addEventListener("mouseout", function () {
      this.style.transform = "";
    });

    // ایجاد پنل انتخابگر ایموجی
    createEmojiPanel();

    // اضافه کردن رویداد کلیک به دکمه ایموجی
    emojiButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleEmojiPanel();
    });
  }

  // ایجاد پنل انتخابگر ایموجی
  function createEmojiPanel() {
    // بررسی وجود کانتینر ورودی
    const inputContainer = document.querySelector(".telegram-input-container");
    if (!inputContainer) {
      console.error("کانتینر ورودی یافت نشد");
      return;
    }

    // ایجاد پنل ایموجی
    const emojiPanel = document.createElement("div");
    emojiPanel.className = "telegram-emoji-panel";
    emojiPanel.id = "emojiPanel";
    emojiPanel.style.display = "none";

    // استایل پنل ایموجی
    emojiPanel.style.position = "absolute";
    emojiPanel.style.bottom = "91px";
    emojiPanel.style.left = "0";
    emojiPanel.style.right = "0";
    emojiPanel.style.backgroundColor = "#2C3142";
    emojiPanel.style.padding = "10px";
    emojiPanel.style.borderTop = "1px solid #3A4053";
    emojiPanel.style.zIndex = "999999";
    emojiPanel.style.boxShadow = "0 -2px 5px rgba(0, 0, 0, 0.2)";
    emojiPanel.style.maxHeight = "250px";
    emojiPanel.style.overflowY = "auto";

    // ایجاد تب‌های دسته‌بندی
    const tabsContainer = document.createElement("div");
    tabsContainer.className = "emoji-tabs";
    tabsContainer.style.display = "flex";
    tabsContainer.style.flexWrap = "nowrap";
    tabsContainer.style.overflowX = "auto";
    tabsContainer.style.marginBottom = "10px";
    tabsContainer.style.borderBottom = "1px solid #3A4053";
    tabsContainer.style.paddingBottom = "5px";
    tabsContainer.style.whiteSpace = "nowrap";

    // اضافه کردن استایل برای اسکرول‌بار
    const style = document.createElement("style");
    style.textContent = `
            .emoji-tabs::-webkit-scrollbar {
                height: 5px;
            }
            .emoji-tabs::-webkit-scrollbar-track {
                background: #1e2235;
                border-radius: 5px;
            }
            .emoji-tabs::-webkit-scrollbar-thumb {
                background: #3A4053;
                border-radius: 5px;
            }
            .emoji-tabs::-webkit-scrollbar-thumb:hover {
                background: #4A5063;
            }
        `;
    document.head.appendChild(style);

    // اضافه کردن تب برای ایموجی‌های پرکاربرد
    const frequentTab = document.createElement("div");
    frequentTab.className = "emoji-tab active";
    frequentTab.dataset.category = "frequent";
    frequentTab.innerHTML = "🕒";
    frequentTab.title = "پرکاربرد";
    frequentTab.style.padding = "5px 10px";
    frequentTab.style.cursor = "pointer";
    frequentTab.style.borderRadius = "5px";
    frequentTab.style.backgroundColor = "rgba(15, 157, 88, 0.2)";
    frequentTab.style.marginRight = "5px";
    frequentTab.style.flex = "0 0 auto";
    frequentTab.style.display = "inline-flex";
    frequentTab.style.alignItems = "center";
    frequentTab.style.justifyContent = "center";
    tabsContainer.appendChild(frequentTab);

    // اضافه کردن رویداد کلیک به تب پرکاربرد
    frequentTab.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // حذف کلاس active از همه تب‌ها
      document
        .querySelectorAll(".emoji-tab")
        .forEach((t) => t.classList.remove("active"));
      // اضافه کردن کلاس active به تب کلیک شده
      this.classList.add("active");
      // نمایش ایموجی‌های پرکاربرد
      showEmojiCategory("frequent");

      // تغییر استایل تب فعال
      document.querySelectorAll(".emoji-tab").forEach((t) => {
        t.style.backgroundColor = "";
      });
      this.style.backgroundColor = "rgba(15, 157, 88, 0.2)";
    });

    // اضافه کردن تب‌ها برای هر دسته‌بندی
    for (const category in emojiCategories) {
      const tab = document.createElement("div");
      tab.className = "emoji-tab";
      tab.dataset.category = category;
      tab.innerHTML = emojiCategories[category].icon;
      tab.title = emojiCategories[category].title;
      tab.style.padding = "5px 10px";
      tab.style.cursor = "pointer";
      tab.style.borderRadius = "5px";
      tab.style.marginRight = "5px";
      tab.style.flex = "0 0 auto";
      tab.style.display = "inline-flex";
      tab.style.alignItems = "center";
      tab.style.justifyContent = "center";
      tabsContainer.appendChild(tab);

      // اضافه کردن رویداد کلیک به تب
      tab.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        // حذف کلاس active از همه تب‌ها
        document
          .querySelectorAll(".emoji-tab")
          .forEach((t) => t.classList.remove("active"));
        // اضافه کردن کلاس active به تب کلیک شده
        this.classList.add("active");
        // نمایش ایموجی‌های دسته‌بندی مربوطه
        showEmojiCategory(this.dataset.category);

        // تغییر استایل تب فعال
        document.querySelectorAll(".emoji-tab").forEach((t) => {
          t.style.backgroundColor = "";
        });
        this.style.backgroundColor = "rgba(15, 157, 88, 0.2)";
      });
    }

    // اضافه کردن تب‌ها به پنل
    emojiPanel.appendChild(tabsContainer);

    // ایجاد کانتینر ایموجی‌ها
    const emojisContainer = document.createElement("div");
    emojisContainer.className = "emojis-container";
    emojisContainer.style.display = "flex";
    emojisContainer.style.flexWrap = "wrap";
    emojisContainer.style.gap = "5px";
    emojisContainer.style.maxHeight = "180px";
    emojisContainer.style.overflowY = "auto";
    emojiPanel.appendChild(emojisContainer);

    // اضافه کردن پنل به کانتینر ورودی
    inputContainer.appendChild(emojiPanel);

    // نمایش ایموجی‌های پرکاربرد به صورت پیش‌فرض
    showEmojiCategory("frequent");
  }

  // نمایش ایموجی‌های یک دسته‌بندی
  function showEmojiCategory(category) {
    const emojisContainer = document.querySelector(".emojis-container");
    if (!emojisContainer) return;

    //('نمایش دسته‌بندی:', category);

    // پاک کردن محتوای قبلی
    emojisContainer.innerHTML = "";

    // انتخاب لیست ایموجی‌ها بر اساس دسته‌بندی
    let emojis = [];
    if (category === "frequent") {
      //('نمایش ایموجی‌های پرکاربرد');
      emojis = popularEmojis;
    } else if (emojiCategories[category]) {
      emojis = emojiCategories[category].emojis;
    }

    //('تعداد ایموجی‌ها:', emojis.length);

    // اضافه کردن ایموجی‌ها به کانتینر
    addEmojisToContainer(emojis, emojisContainer);
  }

  // اضافه کردن ایموجی‌ها به کانتینر
  function addEmojisToContainer(emojis, container) {
    emojis.forEach((emoji) => {
      const emojiElement = document.createElement("div");
      emojiElement.className = "emoji-item";
      emojiElement.innerHTML = emoji;
      emojiElement.style.fontSize = "24px";
      emojiElement.style.cursor = "pointer";
      emojiElement.style.width = "36px";
      emojiElement.style.height = "36px";
      emojiElement.style.display = "flex";
      emojiElement.style.alignItems = "center";
      emojiElement.style.justifyContent = "center";
      emojiElement.style.borderRadius = "5px";
      emojiElement.style.transition = "all 0.2s ease";

      // اضافه کردن رویداد hover
      emojiElement.addEventListener("mouseover", function () {
        this.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
        this.style.transform = "scale(1.1)";
      });

      emojiElement.addEventListener("mouseout", function () {
        this.style.backgroundColor = "";
        this.style.transform = "";
      });

      // اضافه کردن رویداد کلیک
      emojiElement.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        insertEmoji(emoji);
      });

      container.appendChild(emojiElement);
    });
  }

  // نمایش/مخفی کردن پنل ایموجی
  function toggleEmojiPanel() {
    const emojiPanel = document.getElementById("emojiPanel");
    if (!emojiPanel) return;

    // مخفی کردن پنل‌های دیگر
    const voiceRecorder = document.getElementById("voiceRecorder");
    const filePreview = document.getElementById("filePreview");
    const schedulePanel = document.getElementById("schedulePanel");

    if (voiceRecorder) voiceRecorder.style.display = "none";
    if (filePreview) filePreview.style.display = "none";
    if (schedulePanel) schedulePanel.style.display = "none";

    // نمایش/مخفی کردن پنل ایموجی
    if (emojiPanel.style.display === "block") {
      emojiPanel.style.display = "none";
    } else {
      emojiPanel.style.display = "block";

      // جلوگیری از بسته شدن پنل با کلیک روی خود پنل
      emojiPanel.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }
  }

  // درج ایموجی در متن پیام
  function insertEmoji(emoji) {
    const messageInput = document.getElementById("telegramInput");
    if (!messageInput) return;

    // ذخیره موقعیت کرسر
    const startPos = messageInput.selectionStart;
    const endPos = messageInput.selectionEnd;

    // درج ایموجی در موقعیت کرسر
    const text = messageInput.value;
    messageInput.value =
      text.substring(0, startPos) + emoji + text.substring(endPos);

    // تنظیم مجدد موقعیت کرسر بعد از ایموجی
    messageInput.selectionStart = messageInput.selectionEnd =
      startPos + emoji.length;

    // فوکوس روی فیلد ورودی
    messageInput.focus();

    // ارسال رویداد input برای اطلاع‌رسانی به سایر اسکریپت‌ها
    const event = new Event("input", { bubbles: true });
    messageInput.dispatchEvent(event);
  }

  // اضافه کردن رویداد کلیک به سند برای بستن پنل ایموجی
  document.addEventListener("click", function (e) {
    const emojiPanel = document.getElementById("emojiPanel");
    const emojiButton = document.getElementById("emojiPickerBtn");

    if (
      emojiPanel &&
      emojiPanel.style.display === "block" &&
      !emojiPanel.contains(e.target) &&
      e.target !== emojiButton &&
      !emojiButton.contains(e.target)
    ) {
      emojiPanel.style.display = "none";
    }
  });

  // اجرای تابع ایجاد دکمه ایموجی
  setTimeout(createEmojiButton, 500); // تأخیر کوتاه برای اطمینان از بارگذاری کامل DOM
});
