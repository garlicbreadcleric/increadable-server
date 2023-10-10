import * as crypto from "crypto";

export function md5(buffer: Buffer): string {
  return crypto.createHash("md5").update(buffer).digest("hex");
}
