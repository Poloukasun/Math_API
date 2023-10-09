import { error } from 'console';
import MathModel from '../models/math.js';
import Repository from '../models/repository.js';
import Controller from './Controller.js';
import fs from 'fs';
import path from 'path';

export default class MathsController extends Controller {
    constructor(HttpContext) {
        super(HttpContext, new Repository(new MathModel()));
    }
    doOperation() {
        let params = this.HttpContext.path.params;

        if (params.op != undefined) {
            let paramsValidated = this.validateParams(params);

            if (paramsValidated.isValid) {
                if (params.op == ' ') { // ADDITION +
                    params.op = '+';
                    params.value = parseFloat(params.x) + parseFloat(params.y);
                } else if (params.op == '-') { // SOUSTRACTION -
                    params.value = parseFloat(params.x) - parseFloat(params.y);
                } else if (params.op == '*') { // MULTIPLICATION *
                    params.value = parseFloat(params.x) * parseFloat(params.y);
                } else if (params.op == '/') { // DIVISION ÷
                    if (params.x == 0 && params.y == 0) {
                        params.value = NaN.toString();
                    } else if (params.y == 0) {
                        params.value = Infinity.toString();
                    } else {
                        params.value = parseFloat(params.x) / parseFloat(params.y);
                    }
                } else if (params.op == '%') { // MODULO %
                    if (params.y == 0) {
                        params.value = NaN.toString();
                    } else {
                        params.value = parseFloat(params.x) % parseFloat(params.y);
                    }
                } else if (params.op == '!') { // FACTORIELLE !
                    if (!this.isFloat(params.n) || params.n <= 0) {
                        params.error = "'n' parameter must be a integer > 0";
                    } else if (params.n > 170) {
                        params.value = Infinity.toString();
                    } else {
                        params.value = this.factorial(params.n);
                    }
                } else if (params.op == 'p') { // NOMBRE PREMIER p
                    if (parseInt(params.n) <= 0 || this.isFloat(parseFloat(params.n))) {
                        params.error = "'n' parameter must be a integer > 0";
                    } else {
                        params.value = this.isPrime(params.n);
                    }
                } else if (params.op = 'np') { // NIÈME PREMIER np
                    params.value = this.findPrime(parseInt(params.n));
                }
            } else {
                params.error = paramsValidated.error
            }
        } else {
            params.error = "'op' parameter is missing";
        }
        return this.HttpContext.response.JSON(params);
    }
    validateParams(params) {
        let isValid = false;
        let error = '';

        switch (params.op) {
            case ' ': //+
            case '-':
            case '*':
            case '/':
            case '%':
                isValid = params.x !== undefined && params.y !== undefined;
                if (Object.keys(params).length != 3) {
                    isValid = false;
                    error = "too many parameters";
                } else {
                    error = isValid ? '' : `'${params.x === undefined ? 'x' : 'y'}' parameter is missing`;
                }
                break;
            case '!':
            case 'p':
            case 'np':
                isValid = params.n !== undefined;
                if (Object.keys(params).length != 2) {
                    isValid = false;
                    error = "too many parameters";
                } else {
                    error = isValid ? '' : "'n' parameter is missing";
                }
                break;
            default:
                error = params.op;
        }

        return { isValid, error };
    }

    findPrime(n) {
        let primeNumer = 0;
        for (let i = 0; i < n; i++) {
            primeNumer++;
            while (!this.isPrime(primeNumer)) {
                primeNumer++;
            }
        }
        return primeNumer;
    }
    isFloat(n) {
        return Number(n) === n && n % 1 !== 0;
    }
    isPrime(n) {
        for (var i = 2; i < n; i++) {
            if (n % i === 0) {
                return false;
            }
        }
        return n > 1;
    }
    factorial(n) {
        if (n === 0 || n === 1) {
            return 1;
        }
        return n * this.factorial(n - 1);
    }
    help() {
        let helpPagePath = path.join(process.cwd(), wwwroot, 'API-Help-Pages/API-Maths-Help.html');
        this.HttpContext.response.HTML(fs.readFileSync(helpPagePath));
    }
    get() {
        if (this.HttpContext.path.queryString == '?') {
            this.help();
        }
        else {
            this.doOperation();
        }
    }
}