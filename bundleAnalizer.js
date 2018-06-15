(function () {
    const CONSTANTS = {
        REGEX_FOR_SERCH_TOKENS: /([^:]+\/\*\![^*]+\*\/)/gi,
        REGEX_FOR_SERCH_KEYS_IN_BUNDLE: /('|")\b((\b[a-zA-Z]+)(\.[a-zA-Z]+)+)\b('|")/g,
        REGEX_FOR_SPLIT_TOKEN_AND_VALUE: /[;]?[\/][*][!]/,
        REGEX_FOR_REMOVE_END_COMENT: /[*/]+$/g,
        REGEX_FOR_FIND_INCORRECT_BASE64_IMAGES: /image\//,
        REGEX_FOR_CLEANING_KEY: /[^\w-_\s]|^\w+/gi,
        PATH_TO_RESULT_FOLDER: './result'
    };

    let bundle = require('./resources/bundle.js');
    let configuration = require('./resources/configuration.js');
    let fs = require('fs');

    let tokenCleaner = {

        run: function () {
            this.clearTokens(bundle, configuration)
        },

        clearTokens: function (bundle, configuration) {
            let self = this;
            let notReadyTokens = self.findTokensInBundle(bundle);
            self.startConfiguration = JSON.parse(JSON.stringify(configuration));
            self.tokensInBundle = self.getUniqueValues(self.makeDefaultValueArray(notReadyTokens));
            self.configuration = JSON.parse(JSON.stringify(configuration));
            self.checkTokens();
            self.notEqualsTokens = self.getNotEqualsTokens(self.tokensInBundle, self.startConfiguration.designTokenSet);

            self.common = {
                tokensInBundle: self.tokensInBundle.length,
                notEqualsTokens: self.notEqualsTokens.length
            };

            self.writeTokenCleanerResult();

            return self;
        },

        writeTokenCleanerResult: function () {
            const self = this;
            const objectsForSaving = [];
            const pathToBundleTokens = `${CONSTANTS.PATH_TO_RESULT_FOLDER}/${self.configuration.serviceName}-${new Date().getTime()}`;

            objectsForSaving.push({key: `${self.configuration.serviceName}-self.json`, value: self});
            objectsForSaving.push({key: `${self.configuration.serviceName}-configuration.json`, value: self.configuration});
            objectsForSaving.push({key: `${self.configuration.serviceName}-tokensInBundle.json`, value: self.tokensInBundle});
            objectsForSaving.push({key: `${self.configuration.serviceName}-notEqualsTokens.json`, value: self.notEqualsTokens});
            objectsForSaving.push({key: `common.json`, value: self.common});

            if (!fs.existsSync(pathToBundleTokens)) {
                fs.mkdirSync(pathToBundleTokens);
            }

            objectsForSaving.forEach(element => {
               self.saveJson(`${pathToBundleTokens}/${element.key}`, element.value)
            });
        },

        saveJson: function (path, content) {

            fs.writeFile(path, JSON.stringify(content), (error) => {
                if (error) {
                    return console.log(error);
                }

                console.log(`${path} was created!`);
            })
        },

        makeDefaultValueArray: function (tokensInBundle) {
            let self = this;
            let tokensObjectInBundle = [];
            tokensInBundle.forEach(tokenWithDefaluValue => {
                let tokenInArray = tokenWithDefaluValue.replace(CONSTANTS.REGEX_FOR_REMOVE_END_COMENT, '').split(CONSTANTS.REGEX_FOR_SPLIT_TOKEN_AND_VALUE);
                tokensObjectInBundle.push({
                    key: self.clearKey(tokenInArray[1]),
                    value: CONSTANTS.REGEX_FOR_FIND_INCORRECT_BASE64_IMAGES.test(tokenInArray[0]) ? "url('data:" + tokenInArray[0] : tokenInArray[0]
                })
            });
            return tokensObjectInBundle;
        },

        clearKey: function (key) {
            return key.replace(CONSTANTS.REGEX_FOR_CLEANING_KEY, '')
        },

        checkTokens: function () {
            let self = this;
            let clearConfiguration = [];
            let notEqualsTokens = [];
            self.tokensInBundle.forEach(tokenInBundle => {
                let token = self.configuration.designTokenSet.find(configToken => configToken.key === tokenInBundle.key);
                token
                    ? clearConfiguration.push(token)
                    : notEqualsTokens;
            });

            self.configuration.designTokenSet = clearConfiguration;
            self.notEqualsTokens = notEqualsTokens;
        },

        findTokensInBundle: function (bandle) {
            return bandle.match(CONSTANTS.REGEX_FOR_SERCH_TOKENS);
        },

        getUniqueValues: function (tokenValues) {
            let unique = [];
            tokenValues.forEach(element => {
                if (!~unique.indexOf(element.key)) {
                    unique[element.key] = element;
                }
            });


            return this.makeArrayFromMap(unique);
        },

        makeArrayFromMap: function (map) {
            let result = [];
            for (let key in map) {
                result.push(map[key])
            }

            return result;
        },

        getNotEqualsTokens: function (bandleTokens, configTokens) {
            let result = [];
            bandleTokens.forEach(bundleToken => {
                let token = configTokens.find(configToken => configToken.key === bundleToken.key);
                !token && result.push(bundleToken);
            });

            return result;
        }
    };
    return tokenCleaner.run();
}());