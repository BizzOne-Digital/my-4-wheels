import bcrypt from "bcryptjs";

export const hashPassword = (pw: string) => bcrypt.hash(pw, 12);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

let dummy: string | null = null;
/** Compared against when an account does not exist, so login timing does not reveal valid emails. */
export const dummyHash = () => (dummy ??= bcrypt.hashSync("not-a-real-password", 12));
