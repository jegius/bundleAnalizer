(function () {
    const CONSTANTS = require('./constants.js');
    let bundle = require('./resources/bundle.js');
    let configuration = require('./resources/configuration.js');
    let utils = require('./utils.js');


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

            objectsForSaving.push({key: `${self.configuration.serviceName}-self.json`, value: JSON.stringify(self)});
            objectsForSaving.push({key: `${self.configuration.serviceName}-configuration.json`, value: JSON.stringify(self.configuration)});
            objectsForSaving.push({key: `${self.configuration.serviceName}-tokensInBundle.json`, value: JSON.stringify(self.tokensInBundle)});
            objectsForSaving.push({key: `${self.configuration.serviceName}-notEqualsTokens.json`, value: JSON.stringify(self.notEqualsTokens)});
            objectsForSaving.push({key: `common.json`, value: JSON.stringify(self.common)});

            utils.printResult(pathToBundleTokens, objectsForSaving);
        },



        makeDefaultValueArray: function (tokensInBundle) {
            let self = this;
            let tokensObjectInBundle = [];
            tokensInBundle && tokensInBundle.forEach(tokenWithDefaultValue => {
                let tokenInArray = tokenWithDefaultValue.replace(CONSTANTS.REGEX_FOR_REMOVE_END_COMMENT, '').split(CONSTANTS.REGEX_FOR_SPLIT_TOKEN_AND_VALUE);
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
            return bandle.match(CONSTANTS.REGEX_FOR_SEARCH_TOKENS);
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