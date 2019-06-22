/**
 * Class representing the result from evaluation of a function within the expression.
 */
export class FunctionResult {
    /**
     * Ending index of the function within the main expression.
     */
    private _endIndex : number;
    
    /**
     * Result after evaluating the function.
     */
    private _result : number;

    get endIndex() : number {
        return this._endIndex;
    }
    get result() : number {
        return this._result;
    }

    set endIndex( endIndex : number ) {
        this._endIndex = endIndex;
    }
    set result( result : number ) {
        this._result = result;
    }
}
