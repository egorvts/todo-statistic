const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function processCommand(command) {
    switch (command) {
        case 'exit':
            process.exit(0);
        case 'test':
            console.log(getAllOneLineComments(files));
            break;
        default:
            console.log('wrong command');
            break;
    }
}

// TODO you can do it!
function getAllOneLineComments(files) {
    return files.flatMap(file => 
        file.split('\n').filter(line => line.startsWith('// TODO '))
    );
}