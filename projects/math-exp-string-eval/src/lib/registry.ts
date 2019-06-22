/**
 * List of regular expressions for different token types.
 */
export let Regex = {
    validChar: /[a-zA-Z_0-9+-/*(),]/,
    num: /[0-9]/,
    op: /[+-/*]/,
    parenthesis: /[()]/,
    OpenParenthesis: /[(]/,
    closeParenthesis: /[)]/,
    decimalPoint: /[.]/,
    functionNameStart: /[a-zA-Z]/,
    funtionName: /[a-zA-Z0-9_.]/
  };

/**
 * Index table of characters. The value to the keys indicate the index for the transition table of the character.
 */
export let IndexTable : any = {
    "0": 0,
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
    "6": 0,
    "7": 0,
    "8": 0,
    "9": 0,
    "+": 1,
    "*": 1,
    "/": 1,
    "-": 2,
    "(": 3,
    ")": 4,
    ".": 5,
    ",": 7
  };

  /**
   * Transtion table of characters. The index represents the character (see Index table) and the array in an index represents the characters which are legal after the character in the index.
   */
export let TransitionTable : any = [
    [0, 1, 2, 4, 5, 7],
    [0, 3, 6],
    [0, 3, 6],
    [0, 2, 3],
    [1, 2, 4, 7],
    [0],
    [3],
    [0, 3, 6]
  ];

  /**
   * Operator precedence, where the keys of the object represent the operators. The greater the value, the higher the precedence.
   */
  export let OperatorPrecedence = {
    "(": -1,
    "-": 0,
    "+": 1,
    "*": 2,
    "/": 3
  };