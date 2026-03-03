const { getAllFilePathsWithExtension, readFile } = require("./fileSystem");
const { readLine } = require("./console");

const files = getFiles();

console.log("Please, write your command!");
readLine(processCommand);

function getFiles() {
  const filePaths = getAllFilePathsWithExtension(process.cwd(), "js");
  return filePaths.map((path) => readFile(path));
}

function processCommand(command) {
  const [cmd] = command.split(" ");
  switch (cmd) {
    case "exit":
      process.exit(0);
    case "show":
      console.log(getAllOneLineComments(files));
      break;
    case "important":
      console.log(getAllOneLineImportantComments(files));
      break;
    case "user":
      console.log(getAllOneLineCommentsByUser(files, command.slice(5)));
      break;
    case "sort":
      console.log(sortComments(getAllOneLineComments(files), command.slice(5)));
      break;
    default:
      console.log("wrong command");
      break;
  }
}

// TODO you can do it!
function getAllOneLineComments(files) {
  return files.flatMap((file) =>
    file.split("\n").filter((line) => line.startsWith("// TODO ")),
  );
}

function getAllOneLineImportantComments(files) {
  return files.flatMap((file) =>
    file
      .split("\n")
      .filter((line) => line.startsWith("// TODO ") && line.includes("!")),
  );
}

function getAllOneLineCommentsByUser(files, user) {
  return getAllOneLineComments(files).filter(
    (c) => tryGetUser(c) === user.toLowerCase(),
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
    return comment.split(/[\s;]+/)[3].toLowerCase();
  } catch (error) {
    return null;
  }
}

function sortComments(comments, sortBy) {
  switch (sortBy) {
    case 'importance':
      return comments.sort((a, b) => b.split("!").length - a.split("!").length);
    case 'user':
      return comments.sort((a, b) => {
        const userA = tryGetUser(a);
        const userB = tryGetUser(b);

        return userA?.localeCompare(userB) ?? 0;
      });
      case 'date':
            return comments.sort((a, b) => {
            const dateA = tryGetDate(a);
            const dateB = tryGetDate(b);

            return -(dateA?.localeCompare(dateB) ?? 0);
        });             
  }
}
