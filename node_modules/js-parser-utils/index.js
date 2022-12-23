/// constants ///
var constants = {

    /// separators ///
    blockStartCharacter: "{",
    blockEndCharacter: "}",
    objectStartCharacter: "{",
    objectEndCharacter: "}",
    segmentStartCharacter: "(",
    segmentEndCharacter: ")",
    arrayStartCharacter: "[",
    arrayEndCharacter: "]",
    indexerStartCharacter: "[",
    indexerEndCharacter: "]",
    semicolonCharacter: ";",
    colonCharacter: ",",
    parameterSeparatorCharacter: ",",
    labelSeparatorCharacter: ":",

    /// signs ///
    equalSign: "=",
    typeSpecifierSign: ":",
    questionMarkSign: '?',
    generatorSign: "*",

    /// keywords ///
    breakKeyword: "break",
    continueKeyword: "continue",
    debuggerKeyword: "debugger",
    doKeyword: "do",
    endpointKeyword: "endpoint",
    forKeyword: "for",
    foreachKeyword: "foreach",
    functionKeyword: "function",
    moduleKeyword: "module",
    classKeyword: "class",
    ifKeyword: "if",
    elseKeyword: "else",
    returnKeyword: "return",
    switchKeyword: "switch",
    caseKeyword: "case",
    defaultKeyword: "default",
    throwKeyword: "throw",
    tryKeyword: "try",
    catchKeyword: "catch",
    finallyKeyword: "finally",
    variableKeyword: "var",
    whileKeyword: "while",
    withKeyword: "with",
    inKeyword: "in",
    ofKeyword: "of",
    letKeyword: "let",
    yieldKeyword: 'yield',
    awaitKeyword: 'await',
    asyncKeyword: 'async',
    constKeyword: 'const',
    inqKeyword: 'inq',

    /// errors ///
    unexpectedToken: "Unexpected token ILLEGAL"

};

/// factory ///
var factory = {

    tokenValidator: function(token) {
        return function (state) {
            return state.token && state.token.type === token;
        }
    },

    lookaheadTokenValidator: function(token) {
        return function (state) {
            var lh = state.lookahead();
            return lh && lh.type === token;
        }
    },

    keywordValidator: function(keyword) {
        return function(state) {
            return state.token && state.token.type === "keyword" && state.token.data === keyword;
        }
    }

};

/// validators ///
var validators = {

    /// token type validators ///
    isComment: factory.tokenValidator("comment"),
    isMacro: factory.tokenValidator("macro"),
    isLiteral: factory.tokenValidator("literal"),
    isKeyword: factory.tokenValidator("keyword"),
    isIdentifier: factory.tokenValidator("identifier"),
    isIdentifierName: factory.tokenValidator("identifier"),

    /// separator validators ///
    isBlockStart: factory.tokenValidator(constants.blockStartCharacter),
    isBlockEnd: factory.tokenValidator(constants.blockEndCharacter),
    isSegmentStart: factory.tokenValidator(constants.segmentStartCharacter),
    isSegmentEnd: factory.tokenValidator(constants.segmentEndCharacter),
    isArrayStart: factory.tokenValidator(constants.arrayStartCharacter),
    isArrayEnd: factory.tokenValidator(constants.arrayEndCharacter),
    isObjectStart: factory.tokenValidator(constants.objectStartCharacter),
    isObjectEnd: factory.tokenValidator(constants.objectEndCharacter),
    isIndexerStart: factory.tokenValidator(constants.indexerStartCharacter),
    isIndexerEnd: factory.tokenValidator(constants.indexerEndCharacter),
    isSemicolon: factory.tokenValidator(constants.semicolonCharacter),
    isColon: factory.tokenValidator(constants.colonCharacter),
    isParameterSeparator: factory.tokenValidator(constants.parameterSeparatorCharacter),
    isLabelSeparator: factory.tokenValidator(constants.labelSeparatorCharacter),

    /// sign validators ///
    isEqualSign: factory.tokenValidator(constants.equalSign),
    isTypeSpecifier: factory.tokenValidator(constants.typeSpecifierSign),
    isTypeSpecifierSign: factory.tokenValidator(constants.typeSpecifierSign),
    isQuestionMark: factory.tokenValidator(constants.questionMarkSign),
    isGeneratorSign: factory.tokenValidator(constants.generatorSign),

    /// keyword validators ///
    isBreak: factory.keywordValidator(constants.breakKeyword),
    isContinue: factory.keywordValidator(constants.continueKeyword),
    isDebugger: factory.keywordValidator(constants.debuggerKeyword),
    isDo: factory.keywordValidator(constants.doKeyword),
    isEndpoint: factory.keywordValidator(constants.endpointKeyword),
    isFor: factory.keywordValidator(constants.forKeyword),
    isForeach: factory.keywordValidator(constants.foreachKeyword),
    isFunction: factory.keywordValidator(constants.functionKeyword),
    isModule: factory.keywordValidator(constants.moduleKeyword),
    isClass: factory.keywordValidator(constants.classKeyword),
    isIf: factory.keywordValidator(constants.ifKeyword),
    isElse: factory.keywordValidator(constants.elseKeyword),
    isReturn: factory.keywordValidator(constants.returnKeyword),
    isSwitch: factory.keywordValidator(constants.switchKeyword),
    isCase: factory.keywordValidator(constants.caseKeyword),
    isDefault: factory.keywordValidator(constants.defaultKeyword),
    isThrow: factory.keywordValidator(constants.throwKeyword),
    isTry: factory.keywordValidator(constants.tryKeyword),
    isCatch: factory.keywordValidator(constants.catchKeyword),
    isFinally: factory.keywordValidator(constants.finallyKeyword),
    isVar: factory.keywordValidator(constants.variableKeyword),
    isVariable: factory.keywordValidator(constants.variableKeyword),
    isLet: factory.keywordValidator(constants.letKeyword),
    isConst: factory.keywordValidator(constants.constKeyword),
    isWhile: factory.keywordValidator(constants.whileKeyword),
    isWith: factory.keywordValidator(constants.withKeyword),
    isIn: factory.keywordValidator(constants.inKeyword),
    isOf: factory.keywordValidator(constants.ofKeyword),
    isYield: factory.keywordValidator(constants.yieldKeyword),
    isAwait: factory.keywordValidator(constants.awaitKeyword),
    isAsync: factory.keywordValidator(constants.asyncKeyword),
    isInq: factory.keywordValidator(constants.inqKeyword),

    /// lookahead validators ///
    isLookaheadLabelSeparator: factory.lookaheadTokenValidator(constants.labelSeparatorCharacter)

};

/// combined validators ///
validators.isCaseOrDefault = function(state) { return validators.isCase(state) || validators.isDefault(state) };
validators.isCatchOrFinally = function(state) { return validators.isCatch(state) || validators.isFinally(state) };

/// utilities ///
var utils = {

    /**
     * Parses a Block Statement.
     * @param state The parser state.
     * @param [scope] {string} The scope to use when parsing the statements inside the block.
     * @returns {*}
     */
    block: function (state, scope, secondaryScope) {
        if(!validators.isBlockStart(state)) return state.error(constants.unexpectedToken);
        state.next(); //Skip block start.

        utils.statementsInBlock(state, scope, secondaryScope);

        if(!validators.isBlockEnd(state)) return state.error(constants.unexpectedToken);
        state.next(); //Skip block end.
    },

    /**
     * Parses statements until a block end is found.
     * @param state The parser state.
     * @param [scope] {string} The scope to use when parsing the statements inside the block.
     */
    statementsInBlock: function(state, scope, secondaryScope) {
        state.createLexicalEnvironment();

        state.levelDown(scope);
        if(secondaryScope) state.levelDown(secondaryScope);

        while(state.token && !validators.isBlockEnd(state)) {
            state.processor.token(state);
        }

        if(secondaryScope) state.levelUp();
        state.levelUp();

        state.finalizeLexicalEnvironment();
    },

    /**
     * Parses a semicolon or applies automatic semicolon insertion.
     * @param state The parser state.
     * @param [noError] {boolean} Whether a missing semicolon should cause an error.
     * @returns {boolean} Whether the parsing or the insertion was successful.
     */
    semicolon: function(state, noError) {
        if(validators.isSemicolon(state)) {
            state.next();
        }
        else if(state.token && !validators.isBlockEnd(state)) {
            var lb = state.lookback();
            if(!lb || state.token.line === lb.line) {
                if(!noError) state.error(constants.unexpectedToken);
                return false;
            }
        }

        return true;
    },

    /**
     * Parses a semicolon or applies automatic semicolon insertion in non terminal mode.
     * @param state The parser state.
     * @param [noError] {boolean} Whether a missing semicolon should cause an error.
     * @returns {boolean} Whether the parsing or the insertion was successful.
     */
    semicolonNonTerminal: function(state, noError) {
        if(validators.isSemicolon(state)) {
            state.next();
        }
        else if(state.token && !validators.isBlockEnd(state)) {
            var lb = state.lookback();
            if(!lb || state.token.line === lb.line) {
                if(!noError) state.error(constants.unexpectedToken);
                return false;
            }
        }

        return true;
    }

};

/**
 * Extends the specified object with the global utils.
 * @param what {object} The object to extend.
 * @returns {*} The extended object.
 */
utils.extend = function(what) {
    for(var key in utils) {
        if(utils.hasOwnProperty(key) && !what.hasOwnProperty(key)) {
            what[key] = utils[key];
        }
    }

    return what;
};

validators.extend = function(what) {
    for(var key in validators) {
        if(validators.hasOwnProperty(key) && !what.hasOwnProperty(key)) {
            what[key] = validators[key];
        }
    }

    return what;
};

/// public interface ///
module.exports = {
    constants: constants,
    validators: validators,
    utils: utils,

    ExtensionManager: function() {
        var _self = this;

        this.extensions = [];

        var wrapResult = function(result) {
            return {
                hasResult: result === false || result === true,
                value: result
            }
        };

        var defineExtension = function(originalExtension, newExtension) {
            return function(argument1, argumentN) {
                var result = wrapResult(originalExtension.apply(this, arguments));
                if(result.hasResult) {
                    return result.value;
                }
                else {
                    _self.scope = this;
                    return newExtension.apply(_self, arguments);
                }
            };
        };

        this.include = function (extensionDefinition) {
            if(typeof extensionDefinition.methods == "object") {
                for(var methodName in extensionDefinition.methods) {
                    if(extensionDefinition.methods.hasOwnProperty(methodName)) {
                        var method = extensionDefinition.methods[methodName];
                        if(typeof method == "function") {
                            _self.extensions[methodName] = defineExtension(_self.extensions[methodName] || function() { }, method)
                        }
                    }
                }
            }
        };

        this.inject = function(methodName, scope, argument1, argumentN) {
            var args = Array.prototype.slice.call(arguments);
            var method = _self.extensions[args.shift()];
            if(method) return wrapResult(method.apply(args.shift(), args));
            else return wrapResult();
        }
    }
};