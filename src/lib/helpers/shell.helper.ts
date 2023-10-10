import * as child_process from "child_process";

export function exec(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    child_process.exec(command, (error, stdout, stderr) => {
      if (error != null) reject(error);
      if (stderr !== "") {
        console.error(stderr);
      }
      resolve(stdout);
    });
  });
}
