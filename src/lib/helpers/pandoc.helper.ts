import * as fs from "fs/promises";
import * as tmp from "tmp";

import { exec } from "./shell.helper";

export type PandocFrom = "epub" | "fb2" | "markdown";
export type PandocTo = "html";

export type PandocConvertInput = {
  buffer: Buffer;
  from: PandocFrom;
  fromOptions?: string;
  to: PandocTo;
  toOptions?: string;
  templatePath?: string;
};

export function pandocConvert({
  buffer,
  from,
  fromOptions,
  to,
  toOptions,
  templatePath,
}: PandocConvertInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    tmp.file({ postfix: getExtension(from) }, (err, inputPath, _, cleanupInput) => {
      if (err != null) reject(err);

      tmp.file({ postfix: getExtension(to) }, async (err, outputPath, _, cleanupOutput) => {
        if (err != null) reject(err);

        await fs.writeFile(inputPath, buffer);
        let cmd = `pandoc --from ${from}${fromOptions ?? ""} --to ${to}${
          toOptions ?? ""
        } ${inputPath} -o ${outputPath} --standalone --embed-resources`;
        if (templatePath != null) {
          cmd += ` --template ${templatePath}`;
        }
        await exec(cmd);

        const output = await fs.readFile(outputPath);

        cleanupInput();
        cleanupOutput();

        resolve(output);
      });
    });
  });
}

function getExtension(format: PandocFrom | PandocTo): string {
  switch (format) {
    case "epub":
      return ".epub";
    case "fb2":
      return ".fb2";
    case "html":
      return ".html";
    case "markdown":
      return ".md";
  }
}
