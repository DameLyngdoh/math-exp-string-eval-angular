import { Injectable } from '@angular/core';
import { DMEToken } from './dmetoken';
import { IndexTable, OperatorPrecedence, Regex, TransitionTable } from './registry';
import { TokenType } from './token-type.enum';
import { FunctionResult } from './function-result';

@Injectable({
  providedIn: 'root'
})
export class MathExpStringEvalService {

  constructor() { }

  /**
   * Method to evaluate a mathematical string expression.
   * @param exp The string expression to be evaluated.
   * @returns Returns a number which indicates the resultant value of the expression.
   */
  public evaluateExp( exp : string, functionDB : any ) : number {
    let result : number = 0;
    
    // Check if string is null
    if( exp==null || exp==undefined || exp.length==0 ) {
      return null;
    }
    
    try {
      result = this.evalauteTokenizedExp(this.tokenizeStringExp(exp), functionDB);
    }
    catch(e) {
      throw e;
    }

    return result;
  }

  /**
   * Evaluates a tokenized expression.
   * @param tokens The tokenized expression to be evaluated, which is the token list.
   * @returns Returns a number which indicates the resultant value of the expression.
   */
  public evalauteTokenizedExp( tokens : DMEToken[], functionDB : any ) : number {
    if(tokens==undefined || tokens==null || tokens.length==0){
      return null;
    }

    let result : number;
    try {
      // Evaluating unary operations
      tokens = this.evaluateUnaryOperations(tokens);
      // Evaluating all function tokens
      tokens = this.evaluateFunctionTokens(tokens, functionDB);
      // Evaluating all unary operations
      tokens = this.evaluateUnaryOperations(tokens);
      // Normalizing numbers following minus sign
      this.normalizeNegativeOperands(tokens);
      // Evaluating the obtained native expression
      result = this.evaluateNativeExpression(tokens);
    }
    catch(e) {
      throw e;
    }
    return result;
  }

  /**
   * Evaluates a tokenized native expression which is an expression that contains no more function tokens.
   * @param tokens List of tokens of the expression.
   * @returns Returns a number which is the result of the evaluation.
   */
  public evaluateNativeExpression( tokens : DMEToken[] ) : number {
    let operandStack : DMEToken[] = [], operatorStack : DMEToken[] = [];
    try{
      for( let i:number=0; i<tokens.length; i++) {
        switch(tokens[i].type){
          // If token is opening parenthesis
          case TokenType.OpenParenthesis:
            operatorStack.push(tokens[i]);
            break;
          
          // If token is closing parenthesis
          case TokenType.CloseParenthesis:
            for(let t : DMEToken=operatorStack.pop(); t.type!=TokenType.OpenParenthesis; t=operatorStack.pop()) {
              let a : DMEToken = operandStack.pop();
              a.type = TokenType.Operand;
              a.value = this.evaluateBinaryExpression(operandStack.pop(), t, a);
              operandStack.push(a);
            }
            break;
          
            // If token is an operand
          case TokenType.Operand:
            operandStack.push(tokens[i]);
            break;

          // If token is an operator
          case TokenType.Operator:
            if(operatorStack.length==0) {
              operatorStack.push(tokens[i]);
              break;
            }
            if(OperatorPrecedence[tokens[i].value] >= OperatorPrecedence[operatorStack[operatorStack.length-1].value]) {
              operatorStack.push(tokens[i]);
            }
            else {
              while(!(operatorStack.length==0) && OperatorPrecedence[tokens[i].value] < OperatorPrecedence[operatorStack[operatorStack.length-1].value]) {
                let a : DMEToken= operandStack.pop();
                a.value = this.evaluateBinaryExpression(operandStack.pop(), operatorStack.pop(), a);
                operandStack.push(a);
              }
              operatorStack.push(tokens[i]);
            }
            break;
        }
      }
      while(!(operatorStack.length==0)) {
        let a : DMEToken = operandStack.pop();
        a.value = this.evaluateBinaryExpression(operandStack.pop(), operatorStack.pop(), a);
        operandStack.push(a);
      }
      return operandStack.pop().value;
    }
    catch(e) {
      throw e;
    }
  }

  /**
   * Generates an array of tokens from the string expression.
   * @param exp The string expression.
   * @returns Returns a list (an array) of the generated tokens.
   */
  public tokenizeStringExp( exp : string ) : DMEToken[] {
    if(exp==undefined || exp==null) {
      return null;
    }
    if(exp.length==0) {
      return new Array<DMEToken>();
    }

    let result : DMEToken[] = [];

    let array : string[] = exp.split('');
    let pre : number = -1, current : number = 0;
    for( let i:number=0; i<array.length; i++) {
      
      // Ignore spaces
      if(array[i]==" ") {
        continue;
      }

      // Check if character is a valid character
      if(!array[i].match(Regex.validChar)) {
        throw new Error('Error: Unrecognized character at index ' + i);
      }

      // Check if character is start of a function name
      if(array[i].match(Regex.functionNameStart)){
        current = 6;
        try {
          i = this.processFunctionName(array, i, result);
        }
        catch(e) {
          throw e;
        }
        pre = current;
        continue;
      }
      
      // Get the index type
      current = IndexTable[array[i]];
      
      // Check if character is start of a number
      if(array[i].match(Regex.num)) {
        try {
          i = this.processNumbers(array, i, result);
        }
        catch(e) {
          throw e;
        }
        pre = current;
        continue;
      }

      // Get index type from index table
      if(!this.transitionCheck(pre, IndexTable[array[i]])) {
        throw new Error('Error: Invalid expression.');
      }
      let t :DMEToken= new DMEToken();
      t.value = array[i];
      switch(IndexTable[array[i]]){
        case 1:
        case 2:
          t.type = TokenType.Operator;
          break;
        case 3:
          t.type = TokenType.OpenParenthesis;
          break;
        case 4:
          t.type = TokenType.CloseParenthesis;
          break;
        case 6:
          t.type = TokenType.Comma;
          break;
        case 7:
          t.type = TokenType.Comma;
          break;
        default:

      }
      result.push(t);
      pre = current;
    }
    return result;
  }

  /**
   * Validates transition from one character to another using the transition table.
   * @param pre The type of the previous character.
   * @param current The type of the current character.
   * @returns Returns true if the transition is valid and false otherwise.
   */
  private transitionCheck( pre : number, current : number ) : boolean {
    if(pre==-1 && (current==0 || current==3)) {
      return true;
    }
    if(pre < 0 || pre > TransitionTable.length || current < 0 || current > TransitionTable.length) {
      return false;
    }
    let table : number[] = TransitionTable[pre];
    for( let i:number=0; i<table.length; i++) {
      if(table[i]==current) {
        return true;
      }
    }
    return false;
  }

  /**
   * Generates a token representing a number and pushes it to list of tokens and returns 
   * @param exp The array of characters of the expression.
   * @param index The index of the starting character for the number in the string
   * @param tokens The list of tokens already generated prior to the number token.
   * @returns Returns the index of the last character (or digit) of the number in the string.
   */
  private processNumbers( exp : string[], index : number, tokens : DMEToken[] ) : number {
    let temp : string = "";
    let t : DMEToken = new DMEToken();
    t.type = TokenType.Operand;

    // Parsing left side of decimal point
    for(; index<exp.length && exp[index].match(Regex.num); index++){
      temp += exp[index];
    }

    if( index==exp.length ) {
      t.value = parseInt(temp);
      tokens.push(t);
      return --index;
    }
    // Parsing decimal point
    if( exp[index]=='.') {
      temp += exp[index++];

      // If no digits present after decimal point
      if(index>=exp.length || !exp[index].match(Regex.num)) {
        throw new Error('Error: Invalid expression. No digit after decimal point. Index: ' + index);
      }

      // Parsing right side of decimal point
      for(; index<exp.length && exp[index].match(Regex.num); index++){
        temp += exp[index];
      }
    }
    t.value = parseFloat(temp);
    tokens.push(t);
    return --index;
  }

  /**
   * Generates a token representing a function name and pushes it to list of tokens and returns 
   * @param exp The array of characters of the expression.
   * @param index The index of the starting character for the function name in the string
   * @param tokens The list of tokens already generated prior to the number token.
   * @returns Returns the index of the last character of the function name in the string.
   */
  private processFunctionName( exp : string[], index : number, tokens : DMEToken[] ) : number {
    let fn : string = "";
    let t : DMEToken = new DMEToken();
    t.type = TokenType.FunctionName;

    for(; index<exp.length && exp[index].match(Regex.funtionName); index++){
      fn += exp[index];
    }
    t.value = fn.split(".");
    tokens.push(t);
    return --index;
  }

  /**
   * Evaluates any sub-string or sub-expression within parenthesis which is a negation operation
   * @param tokens The tokens already generated from the string expression.
   * @returns Returns the evaluated expression.
   */
  public evaluateUnaryOperations( tokens : DMEToken[] ) : DMEToken[] {
    let result : DMEToken[] = [];
    let i : number = 0;
    for(; i<tokens.length-3; i++) {
      
      // if token sub-string is of type "(-n)" where n is a number
      if(tokens[i].type==TokenType.OpenParenthesis && tokens[i+1].type==TokenType.Operator && tokens[i+1].value=="-" && tokens[i+2].type==TokenType.Operand && tokens[i+3].type==TokenType.CloseParenthesis) {
        
        // Create new token which negates the value of the number
        let t : DMEToken = new DMEToken();
        t.type = TokenType.Operand;
        t.value = tokens[i+2].value * (-1);
        
        // Push the opening parenthesis
        result.push(tokens[i]);
        // Push the negated
        result.push(t);
        // Push the close parenthesis
        result.push(tokens[i+3]);
        // Increment index to the closing parenthesis
        i += 3;
        continue;
      }
      result.push(tokens[i]);
    }

    // Push remaining tokens
    for(; i< tokens.length; i++) {
      result.push(tokens[i]);
    }
    return result;
  }

  /**
   * Evaluates a binomial expression of the type "a <operator> b".
   * @param a The first number token.
   * @param op The arithmetic operation.
   * @param b The second number token.
   */
  public evaluateBinaryExpression( a : DMEToken, op : DMEToken, b :DMEToken) : number {
    let result : number = 0;
    if(a.type==TokenType.Operand && op.type==TokenType.Operator && b.type==TokenType.Operand) {
      if(op.value=="+") {
        result = a.value + b.value;
      }
      else if(op.value=="-") {
        result = a.value - b.value;
      }
      else if(op.value=="*") {
        result = a.value * b.value;
      }
      else if(op.value=="/") {
        if(b.value==0) {
          throw new Error('Error: Divides by 0 exception.');
        }
        result = a.value / b.value;
      }
    }
    else {
      throw new Error('Error: Invalid binomial expression.');
    }
    return result;
  }

  /**
   * Method to evaluate all function tokens in an expression to numerical tokens.
   * @param tokens The list of tokens containing (or not containing) functions.
   * @param functionDB Object containing function declarations.
   * @returns Returns the original list of tokens but with results from the function calls.
   */
  public evaluateFunctionTokens( tokens : DMEToken[], functionDB : any ) : DMEToken[] {
    let result : DMEToken[] = [];
    let i : number = 0;
    try {
      for(i=0; i<tokens.length; i++) {
        if(tokens[i].type==TokenType.FunctionName) {
          // Validate function database
          if( functionDB==undefined || functionDB==null ) {
            throw new Error('Error: Empty or undefined or null function database.');
          }
          // Get function call result
          let re : FunctionResult = this.evaluateFunctionToken(tokens, i, functionDB);
          let t : DMEToken = new DMEToken();
          t.type = TokenType.Operand;
          t.value = re.result;
          
          // Replace function name with result of function
          result.push(t);
          i = re.endIndex;
        }
        else {
          result.push(tokens[i]);
        }
      }
    }
    catch(e) {
      throw e;
    }
    return result;
  }

  /**
   * Evaluates a function token within an expression.
   * @param tokens List of tokens of the expression.
   * @param startIndex Index of the function name token.
   * @param functionDB JSON object of the list of user defined functions.
   * @returns Returns a FunctionResult object.
   */
  private evaluateFunctionToken( tokens : DMEToken[], startIndex : number, functionDB : any ) : FunctionResult {
    let result : FunctionResult = new FunctionResult();
    let parenCount : number = 1;
    let index : number = startIndex + 1;
    let temp : DMEToken[] = [];
    let paramsArray : Array<DMEToken[]> = [];
    
    if(tokens[index].type!=TokenType.OpenParenthesis) {
      throw new Error('Error: No opening parenthesis after function name at index ' + index);
    }

    for(++index; index<tokens.length; index++) {
      if(tokens[index].type==TokenType.Comma) {
        if(temp.length==0) {
          throw new Error();
        }
        paramsArray.push(temp);
        temp = [];
        continue;
      }
      if(tokens[index].type==TokenType.FunctionName) {
        let re : FunctionResult = this.evaluateFunctionToken(tokens, index, functionDB);
        let t : DMEToken = new DMEToken();
        t.type = TokenType.Operand;
        t.value = re.result;
        temp.push(t);
        index = re.endIndex;
        continue;
      }
      if(tokens[index].type==TokenType.CloseParenthesis) {
        parenCount--;
        if(parenCount==0) {
          if(temp.length!=0) {
            paramsArray.push(temp);
          }
          break;
        }
      }
      else if(tokens[index].type==TokenType.OpenParenthesis) {
        parenCount++;
      }
      temp.push(tokens[index]);
    }
    
    // Mismatching parenthesis
    if(parenCount!=0) {
      throw new Error('Error: Mismatching parenthesis.');
    }
    result.endIndex = index;

    // Evaluating the parameters
    let params : number[] = [];
    for(let i:number=0; i<paramsArray.length; i++) {
      params[i] = this.evaluateNativeExpression(paramsArray[i]);
    }

    let func : Function = null;
    let isMathFunction : boolean = false;
    // If function not declared in function database
    if(!functionDB.hasOwnProperty(tokens[startIndex].value[0])) {
      // Special case of Math
      if(tokens[startIndex].value[0]=="Math") {
        // Check if funciton is a valid standard math lib function
        if(tokens[startIndex].value[1]==undefined || tokens[startIndex].value[1]==null || !Math.hasOwnProperty(tokens[startIndex].value[1])) {
          throw new Error('Error: Function/Object not found in Math library: function name = ' + tokens[startIndex].value[1]);
        }
        else {
          isMathFunction = true;
        }
      }
      else{
        throw new Error('Error: Function/Object not found: function name = ' + tokens[startIndex].value[0]);
      }
    }

    // Searching for function in database
    let currOb : any = functionDB[tokens[startIndex].value[0]]; 
    for(let i:number=1; !isMathFunction && i<tokens[startIndex].value.length; i++) {
      if(!currOb.hasOwnProperty(tokens[startIndex].value[i])) {
        throw new Error('Error: Function/Object not found: function name = ' + tokens[startIndex].value[i]);
      }
      else {
        currOb = currOb[tokens[startIndex].value[i]];
      }
    }

    func = isMathFunction ? Math[tokens[startIndex].value[1]] : currOb;
    if(isMathFunction) {
      switch(Math[tokens[startIndex].value[1]].length) {
        case 1:
          if(params[0]==undefined || params[0]==undefined) {
            throw new Error('Error: Invalid parameter for standard Math function' + tokens[startIndex].value[1]);
          }
          result.result = func(params[0]);
          break;
        case 2:
          if(params[0]==undefined || params[0]==undefined) {
            throw new Error('Error: Invalid first parameter for standard Math function' + tokens[startIndex].value[1]);
          }
          if(params[1]==undefined || params[1]==undefined) {
            throw new Error('Error: Invalid second parameter for standard Math function' + tokens[startIndex].value[1]);
          }
          result.result = func(params[0], params[1]);
          break;
        default:
          throw new Error("Error: Unregistered or unknown Math function.");
      }
    }
    else {
      result.result = func(params);
    }
    return result;
  }

  /**
   * Converts all ooperands succeeding a minus sign to negative numbers.
   * @param tokens The list of tokens generated from the expression.
   */
  private normalizeNegativeOperands( tokens : DMEToken[] ) : void{
    for(let i:number=0; i<tokens.length; i++) {
      if(i<tokens.length-1 && tokens[i].type==TokenType.Operator && tokens[i].value=='-') {
        if(tokens[i+1].type==TokenType.Operand){
          tokens[i].value = '+';
          tokens[i+1].value = tokens[i+1].value * -1;
        }
      }
    }
  }
}
