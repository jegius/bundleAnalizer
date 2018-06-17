let fileSystem = require('fs');

module.exports = {
    printResult: function (rootPath, arrayForPrint) {
        let self = this;

        if (!fileSystem.existsSync(rootPath)) {
            fileSystem.mkdirSync(rootPath);
        }

        arrayForPrint.forEach(element => {
            element.pattern 
                ? self.saveFile(`${rootPath}/${element.key}`, element.pattern.replace('{CONTENT_PLACEHOLDER}',element.value))
                : self.saveFile(`${rootPath}/${element.key}`, element.value)
        });
    },
    saveFile: function (path, content) {

        fileSystem.writeFile(path, content, (error) => {
            if (error) {
                return console.log(error);
            }

            console.log(`${path} was created!`);
        })
    },
}