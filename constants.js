module.exports = {
    REGEX_FOR_SEARCH_LOCALIZATION_KEYS: /('|")\b((\b[a-zA-Z]+)((\.[a-zA-Z-]+)?)+)\b('|")/g,
    REGEX_FOR_FINDING_XML_TAGS: /<trans-unit[\s\S]*?<\/trans-unit>/g,
    REGEX_FOR_SEARCH_LOCALIZATION_KEYS_IN_CONFIG: /id=('|")\b((\b[a-zA-Z]+)((\.[a-zA-Z-]+)?)+)\b('|")/g,
    REGEX_FOR_CLEANING_MAP: /'|"|\\|id=/g,
    SEARCH_ORIGINAL_PARAM: /original="([\w.]+)/g,
    SEARCH_SOURCE_LANGUAGE_PARAM: /source-language="([\w.]+)/g,
    SEARCH_TARGET_LANGUAGE_PARAM: /target-language="([\w.-]+)/g,
    REGEX_FOR_SEARCH_TOKENS: /([^:]+\/\*\![^*]+\*\/)/gi,
    REGEX_FOR_SPLIT_TOKEN_AND_VALUE: /[;]?[\/][*][!]/,
    REGEX_FOR_REMOVE_END_COMMENT: /[*/]+$/g,
    REGEX_FOR_FIND_INCORRECT_BASE64_IMAGES: /image\//,
    REGEX_FOR_CLEANING_KEY: /[^\w-_\s]|^\w+/gi,
    PATH_TO_RESULT_FOLDER: './result'
};