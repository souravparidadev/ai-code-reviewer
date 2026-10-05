export type ChangedFile = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string;
};

export function prepareDiff(files: ChangedFile[]) {
  return files
    .filter((file) => file.patch)
    .map((file) => {
      return `
FILE: ${file.filename}
STATUS: ${file.status}
ADDITIONS: ${file.additions}
DELETIONS: ${file.deletions}

DIFF:
${file.patch}
`;
    })
    .join("\n-----------------------------\n");
}