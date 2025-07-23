export function containsEmoji(text: string): boolean {
  const emojiRegex = /\p{Emoji}/u;
  return emojiRegex.test(text);
}

export function isEmojiOnly(text: string): boolean {

  const emojiOnlyRegex = /^(\s*|\p{Emoji}+)$/u;
  return emojiOnlyRegex.test(text);
}