import { TokenType } from './token-type.enum';

/**
 * Class for representing a token. 
 */
export class DMEToken {
    /**
     * Indicates the type of token. See TokenType enum.
     */
    private _type : TokenType;
    
    /**
     * Contains the value of the token. For number tokens, the value is the numerical value. for other tokens, it is the character itself.
     */
    private _value : any;

    get type() : TokenType {
      return this._type;
    }
    get value() : any {
      return this._value;
    }

    set type( type : TokenType ) {
      this._type = type;
    }
    set value( value : any ) {
      this._value = value;
    }
}