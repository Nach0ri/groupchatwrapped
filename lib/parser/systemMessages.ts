const SYSTEM_PHRASES = [
  "messages and calls are end-to-end encrypted",
  "messages to this chat and calls are now secured",
  "you created group",
  "you joined using this group",
  "you were added",
  "you removed",
  "you left",
  " added ",
  " left",
  " removed ",
  " was added",
  " joined using",
  "changed the group icon",
  "changed this group's icon",
  "changed the subject",
  "changed the group description",
  "changed their phone number",
  "<media omitted>",
  "image omitted",
  "video omitted",
  "gif omitted",
  "sticker omitted",
  "audio omitted",
  "document omitted",
  "missed voice call",
  "missed video call",
  "this message was deleted",
  "you deleted this message",
];

export function isSystemMessage(body: string): boolean {
  const lower = body.toLowerCase().trim();
  if (!lower) return true;
  for (const phrase of SYSTEM_PHRASES) {
    if (lower.includes(phrase)) return true;
  }
  return false;
}
