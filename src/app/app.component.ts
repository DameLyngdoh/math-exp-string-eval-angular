import { Component } from '@angular/core';
// import { MathExpStringEvalService } from 'math-exp-string-eval';
import { MathExpStringEvalService } from 'math-exp-string-eval';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'math-exp-evaluator-app';

  public expStr : string = '1 + 2 - 6 / 6 + (3.1 - 2) + f1.f2.sum(f1.f2.square(1+4), (-3)) + Math.sin(f1.f2.square(7))'; 
  constructor(private ser : MathExpStringEvalService) {
    
    // User defined functions
    let funcs : any = {
      "f1": {
        "f2": {
          "sum": function( a : number[] ) : number {
            return a[0] + a[1];
          },
          "square": function( a : number[] ) : number {
            return a[0]*a[0];
          }
        }
      }
    };

    console.log(ser.evaluateExp(this.expStr, funcs));
  }
}
