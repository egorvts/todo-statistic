const { getAllFilePathsWithExtension, readFile } = require("./fileSystem");
const { readLine } = require("./console");
const path = require("path");

const files = getFiles();

console.log("Please, write your command!");
readLine(processCommand);

function getFiles() {
  const filePaths = getAllFilePathsWithExtension(process.cwd(), "js");
  return filePaths.map((filePath) => ({
    content: readFile(filePath),
    fileName: path.basename(filePath),
  }));
}

function processCommand(command) {
  const [cmd] = command.split(" ");
  switch (cmd) {
    case "exit":
      process.exit(0);
    case "show":
      console.log(formatOutput(getAllOneLineComments(files)));
      break;
    case "important":
      console.log(formatOutput(getAllOneLineImportantComments(files)));
      break;
    case "user":
      console.log(
        formatOutput(getAllOneLineCommentsByUser(files, command.slice(5))),
      );
      break;
    case "sort":
      console.log(
        formatOutput(
          sortComments(getAllOneLineComments(files), command.slice(5)),
        ),
      );
      break;
    case "date":
      console.log(
        formatOutput(getAllOneLineCommentsAfterDate(files, command.slice(5))),
      );
      break;
    default:
      console.log("wrong command");
      break;
  }
}

// TODO you can do it!
function getAllOneLineComments(files) {
  return files.flatMap((file) =>
    file.content
      .split("\n")
      .filter((line) => /^\/\/\s*todo\s*:?\s/i.test(line))
      .map((comment) => ({ comment, fileName: file.fileName })),
  );
}

function getAllOneLineCommentsAfterDate(files, date) {
  return files.flatMap((file) =>
    file.content
      .split("\n")
      .filter((line) => {
        if (!/^\/\/\s*todo\s*:?\s/i.test(line)) {
          return false;
        }
        const lineDate = tryGetDate(line);
        return lineDate && lineDate >= date;
      })
      .map((comment) => ({ comment, fileName: file.fileName })),
  );
}

function getAllOneLineImportantComments(files) {
  return files.flatMap((file) =>
    file.content
      .split("\n")
      .filter((line) => /^\/\/\s*todo\s*:?\s/i.test(line) && line.includes("!"))
      .map((comment) => ({ comment, fileName: file.fileName })),
  );
}

function getAllOneLineCommentsByUser(files, user) {
  return getAllOneLineComments(files).filter(
    (c) => tryGetUser(c.comment) === user.toLowerCase(),
  );
}

function tryGetUser(comment) {
  try {
    return comment.split(/[\s;]+/)[2].toLowerCase();
  } catch (error) {
    return null;
  }
}

function tryGetDate(comment) {
  try {
    const date = comment.split(/[\s;]+/)[3];
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    return null;
  } catch (error) {
    return null;
  }
}

function formatOutput(items) {
  const MAX_WIDTHS = [1, 10, 10, 15, 50];
  const HEADER = ["!", "user", "date", "file", "comment"];

  function truncate(str, maxLen) {
    if (str.length <= maxLen) {
      return str.padEnd(maxLen);
    }
    return str.slice(0, maxLen - 3) + "...";
  }

  function getCommentText(comment) {
    const match = comment.match(/^\/\/\s*todo\s*:?\s*/i);
    if (!match) return comment;
    const afterTodo = comment.slice(match[0].length);
    const parts = afterTodo.split(/;\s*/);
    return parts.length >= 3 ? parts.slice(2).join("; ") : afterTodo;
  }

  function formatRow(values, widths) {
    const columns = values.map((val, i) => truncate(val, widths[i]));
    return columns.map((col) => "  " + col + "  ").join("|");
  }

  const rows = items.map((item) => [
    item.comment.includes("!") ? "!" : "",
    tryGetUser(item.comment) || "",
    tryGetDate(item.comment) || "",
    item.fileName,
    getCommentText(item.comment),
  ]);

  const widths = HEADER.map((header, i) =>
    Math.min(
      MAX_WIDTHS[i],
      Math.max(header.length, ...rows.map((r) => r[i].length)),
    ),
  );

  const headerRow = formatRow(HEADER, widths);
  const separatorLength = headerRow.length;
  const separator = "-".repeat(separatorLength);

  const dataRows = rows.map((row) => formatRow(row, widths));

  return [headerRow, separator, ...dataRows, separator].join("\n");
}

function sortComments(items, sortBy) {
  switch (sortBy) {
    case "importance":
      return items.sort(
        (a, b) => b.comment.split("!").length - a.comment.split("!").length,
      );
    case "user":
      return items.sort((a, b) => {
        const userA = tryGetUser(a.comment);
        const userB = tryGetUser(b.comment);

        return userA?.localeCompare(userB) ?? 0;
      });
    case "date":
      return items.sort((a, b) => {
        const dateA = tryGetDate(a.comment);
        const dateB = tryGetDate(b.comment);

        if (dateA === null) {
          return dateB === null ? 0 : 1;
        }
        if (dateB === null) {
          return -1;
        }

        return -dateA.localeCompare(dateB);
      });
  }
}
