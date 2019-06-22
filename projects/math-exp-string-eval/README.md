# Math Expression String Evaluator
This is an Angular library which provides a service for evaluating mathematical expressions of string type and return a number. This library does not use the **eval** function which is a built-in JavaScript utility.
This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.2.0.

**Note:** All `import` statements within this sample code or elaborated in this document will either include `projects/math-exp-string-eval/src/public-api` or `d` depending on how the library was installed. Refer to Installation.

## Documentation
To view the documentation, open `doc/index.html`. The documentation was generated using [Compodoc](https://compodoc.app/) tool. Compodoc is a useful tool for generating documentation for your Angular applications.

## Installation
### Using NPM
To install the library using npm:
```sh
npm i dl-math-exp-string-eval
```
This installation will include the import statement:
```typescript
// For module import in app.modeul.ts
import { ExpMathStringEvalModule } from '../../node_modules/dl-math-exp-string-eval';

// For service import in component
import { ExpMathStringEvalService } from '../../node_modules/dl-math-exp-string-eval';
```

### Manual
If you have cloned this repository and wish to use the library without installation through the Node Package Manager, then you can build the library by running:
```sh
ng build math-exp-string-eval
```
This will generate a module in `dist` directory by the name `math-exp-string-eval`.
To manually add the library to your application, copy directory `dist/math-exp-string-eval`, in this repository, to your application's `dist` directory. In case if your application directory does not have a `dist` directory then create one.
The import statements will include:
```typescript
// For module import in app.modeul.ts
import { ExpMathStringEvalModule } from 'math-exp-string-eval';

// For service import in component
import { MathExpStringEvalService } from 'math-exp-string-eval';
```

## Library Import
In the `app.module.ts` (or any module configuration) add `ExpMathStringEvalModule` to the `imports` array int `@NgModule` decorator. Then add the following line in the imports section of the module file:

    import { ExpMathStringEvalModule } from  'projects/math-exp-string-eval/src/public-api';
 This is for the case when the library is present within the `projects` directory. In case if the library is within `node_modules`, then make the changes accrodingly.

## Description
The library evaluates a string expression through:

 1. Tokenizing - A token can be a number, an operator, opening or closing parenthesis or a function name.
 2. Evaluating unary operations - Expression of the type `(-n)` where **n** is a whole number are evaluated next.
 3. Evaluating functions - Functions can be included in the expression and they are evaluated next.
 4. Evaluating final native expression - A native expression is one where there are no functions or unary operations existing within the expression.

### Token
A token represents an independent entity of the expression which has a unique purpose within the expression. There are seven types of tokens: **Operator**, **Operand**, **OpenParenthesis**, **CloseParenthesis**, **DecimalPoint**, **FunctionName** and **Comma**. Of these only **DecimalPoint** and **Comma** will not be tokenized into individual tokens. A token is represented by the `DMEToken` class which has the following:
| Field | Type | Description |
|--|--|--|
| type | enum - TokenType | Specifies the type of token from the TokenType enum. |
| value | any | The value of the token, for a number the value is the value of the number. |

### Function
A function can be used within an expression provided it is defined within an object of type `any` and passed in the second paremeter of the evaluating methods. A function takes the form `f1.f2...fn(param1, param2,..., paramN)`.

## Usage
### 1. Configuring App Module
Import the module into `app.module.ts`. If the library is in `dist` directory then use:
```typescript
import { ExpMathStringEvalModule } from 'math-exp-string-eval'
```
But if the library is within `node_modules`, installed using `npm` then use:
```typescript
import { ExpMathStringEvalModule } from '../../node_modules/dl-math-exp-string-eval'
```
Add `ExpMathStringEvalModule` to the `imports` array in the `@NgModule` decorator of the application module file (usually named `app.module.ts` inside `app` component directory). A sample `@NgModule` decorator should look like this:
```typescript
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ExpMathStringEvalModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
```
Once `app.module.ts` is configured, the service can now be injected into your components.

### 2. Service Injection
To use the service within a component (or wherever necessary), the service has to be injected into that component. A sample code for injecting the service into the app component:
```typescript
<other imports>
import { ExpMathStringEvalService } from 'math-exp-string-eval';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

constructor(private ser : ExpMathStringEvalService) { }
```
The above code injects the service into the constructor of the app component.

## Demo
Run `ng serve` in this application and open the developer console to view the results.
The demo code is present within `app.component.ts`. This application takes an expression in a string and the service is injected in the constructor in `app.component.ts`. There is an object which contains functions which are passed into the second argument of the evaluator method. Finally, there is invocation of the `Math.sin` method which is not defined in the list function, this is to demonstrate the look up which the service performs on the `Math` object of JS's library.

To run the demo, first build the library:
```sh
ng build math-exp-string-eval
```
and then run the application using Angular CLI's tool:
```sh
ng serve
```