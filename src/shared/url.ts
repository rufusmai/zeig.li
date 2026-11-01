const urlRegex =
  /^(https?:\/\/)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/;

export const validateUrl = (url: string): boolean => urlRegex.test(url);
