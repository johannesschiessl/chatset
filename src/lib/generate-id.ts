import { customAlphabet } from "nanoid";

const base36Alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";

export const generateBase36Id = customAlphabet(base36Alphabet, 32);
