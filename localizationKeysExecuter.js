(function () {
    const CONSTANTS = {
        REGEX_FOR_SEARCH_LOCALIZATION_KEYS: /('|")\b((\b[a-zA-Z]+)((\.[a-zA-Z-]+)?)+)\b('|")/g,
        REGEX_FOR_FINDING_XML_TAGS: /<trans-unit[\s\S]*?<\/trans-unit>/g,
        REGEX_FOR_SEARCH_LOCALIZATION_KEYS_IN_CONFIG: /id=('|")\b((\b[a-zA-Z]+)((\.[a-zA-Z-]+)?)+)\b('|")/g,
        REGEX_FOR_CLEANING_MAP: /'|"|\\|id=/g,
        PATH_TO_RESULT_FOLDER: './result',
        SEARCH_ORIGINAL_PARAM: /original="([\w.]+)/g,
        SEARCH_SOURCE_LANGUAGE_PARAM: /source-language="([\w.]+)/g,
        SEARCH_TARGET_LANGUAGE_PARAM: /target-language="([\w.-]+)/g,
    };

    let bundle = require('./resources/bundle.js');
    let localizationConfig = require('./resources/localization.xml.js');
    let utils = require('./utils.js');
    let pattern = require('./resources/keyPattern.js');

    let localizationKeysExecutor = {

        run: function () {
            this.findLocalizationKeys();
        },

        findLocalizationKeys: function () {
            let self = this;
            let localizationKeysInBundle = bundle.match(CONSTANTS.REGEX_FOR_SEARCH_LOCALIZATION_KEYS)
                .map(element => element.replace(CONSTANTS.REGEX_FOR_CLEANING_MAP, ''));
            let uniqueKeys = self.getUniqueKeys(localizationKeysInBundle);

            self.originalParam = localizationConfig.match(CONSTANTS.SEARCH_ORIGINAL_PARAM)[0].replace('original="', '');
            self.sourceLanguage = localizationConfig.match(CONSTANTS.SEARCH_SOURCE_LANGUAGE_PARAM)[0].replace('source-language="', '');
            self.targetLanguageParam = localizationConfig.match(CONSTANTS.SEARCH_TARGET_LANGUAGE_PARAM)[0].replace('target-language="', '');

            let localizationConfigKeys = localizationConfig.match(CONSTANTS.REGEX_FOR_FINDING_XML_TAGS);
            let coincidenceInConfig = self.getCoincidence(uniqueKeys, localizationConfigKeys);
            self.printResult(coincidenceInConfig);
        },

        printResult: function (coincidenceInConfig) {
            const self = this;
            const pathToBundleTokens = `${CONSTANTS.PATH_TO_RESULT_FOLDER}/localization-keys-${new Date().getTime()}`;
            let resultObject = [];
            console.log(coincidenceInConfig.length);
            resultObject.push({
                key: `${self.targetLanguageParam}.xliff`,
                value: coincidenceInConfig.join('\n            '),
                pattern: pattern.replace('{ORIGINAL_IN_PATTERN}', self.originalParam)
                    .replace('{SOURCE_LANGUAGE_IN_PATTERN}', self.sourceLanguage)
                    .replace('{TARGET_LANGUAGE_IN_PATTERN}', self.targetLanguageParam)
            });
            utils.printResult(pathToBundleTokens, resultObject)
        },

        getCoincidence: function (localizationKeys, keysInConfig) {
            let coincidence = [];
            localizationKeys.forEach(element => {
                let coincidenceKey = keysInConfig.find(keyInConfig => {
                    let clearKey = keyInConfig.match(CONSTANTS.REGEX_FOR_SEARCH_LOCALIZATION_KEYS_IN_CONFIG);
                    clearKey = clearKey
                        ? clearKey[0].replace(CONSTANTS.REGEX_FOR_CLEANING_MAP, '')
                        : null;

                    return element === clearKey
                });
                coincidenceKey && coincidence.push(coincidenceKey);
            });
            return coincidence;
        },
        getUniqueKeys: function (keysInBundle) {
            function getKeysMap(keysInBundle) {
                let keysMap = [];

                keysInBundle.forEach(element => {
                    keysMap[`-${element}`] = element});
                return getUniqueValues(keysMap);
            }

            function getUniqueValues(keyMap) {
                let unique = [];
                for(let element in keyMap) {
                    if (!~unique.indexOf(element)) {
                        unique[element] = element;
                    }
                }
                return makeArrayFromMap(unique);
            }

            function makeArrayFromMap(map) {
                let array = [];
                for (let element in map) {
                    array.push(element.replace('-', ''));
                }
                return array;
            }
            return getKeysMap(keysInBundle);
        }

    };
    return localizationKeysExecutor.run();
}());