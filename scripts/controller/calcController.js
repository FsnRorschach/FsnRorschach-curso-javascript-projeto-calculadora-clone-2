// 3 formas de encapsulamento sao, public, protectes, private
//public = todos acessam
//protected = só fala com seus pares, Atributos e metodos da mesma classe e classe Pai
// private = Somente atributos e metodos da propria classe 

class CalcController{

    // dentro de uma classe são encontradas variaveis e funcoes, que se chamam metodos e atributos respectativamente
    constructor(){
        
        this._audio = new Audio('click.mp3');
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';

        this._operation = [];
        this._locale = 'pt-BR';
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
    
        // dataAtual é um atributo, é similar a uma variavel, porém tem mais recursos
        this._currentDate;
        this.initialize();
        this.initButtonsEvents();
        this.initiKeyboard();

    }

    //DOM - Document-

    pasteFromClipboard() {

        document.addEventListener('paste',e=>{

            let text = e.clipboardData.getData('Text');

            this.displayCalc = parseFloat(text);

            console.log(text);

        });
    }

    // inicializar 
    initialize(){

        this.setDisplayDateTime();

        setInterval(()=>{

            this.setDisplayDateTime();

        }, 1000 );

        this.setLastNumberToDisplay();
        this.pasteFromClipboard();
        
        // inicializando seletor de Duplo click no botao ac
        document.querySelectorAll('.btn-ac').forEach(btn=>{

            btn.addEventListener('bdlclick', e=>{

                this.toggleAudio();

            });

        });

    }

    toggleAudio() {

        // simplificado porque ele é booleano
        this._audioOnOff = !this._audioOnOff;
        // if ternário
        /*
        this._audioOnOff = (this._audioOnOff) ? false : true;
        */
        /*
        if (this._audioOnOff) {

            this._audioOnOff = false;

        } else {

            this._audioOnOff = true;

        }*/

    }

    // tocar o som da fato
    playAudio() {

        if(this._audioOnOff) {

            this._audio.currentTime = 0;
            this._audio.play();

        }

    }

    // copiar para area de transferencia
    copyToClipboard() {

        let input = document.createElement('input');

        input.value = this.displayCalc;

        document.body.appendChild(input);

        input.select();

        document.execCommand("Copy");

        input.remove();

    }

    // capturar evento do teclado
    initiKeyboard() {

        document.addEventListener('keyup', e=>{
           
            this.playAudio();

            switch(e.key){

                case 'Escape':
                    this.clearAll();
                    break;
                case 'Backspace':
                    this.clearEntry();
                    break;
                case '+':
                case '-':
                case '*':
                case '/':
                case '%':
                    this.addOperation(e.key);                    
                    break;
                case 'Enter':
                case '=':
                    this.calc();
                    break;
                case '.':
                case ',':
                    this.addDot();
                    break;
                
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    
                    break;          
                 
                case 'c':
                    if (e.ctrlKey) this.copyToClipboard();
                    break;
            }
        });

    }

    addEventListenerAll(element, events, fn){

        events.split(' ').forEach(event=>{

            element.addEventListener(event, fn, false);
            
        });

    }

    clearAll(){

        this._operation = [];

        this._lastNumber = '';

        this._lastOperator = '';

        this.setLastNumberToDisplay();

    }

    clearEntry(){

        this._operation.pop();

        this.setLastNumberToDisplay();

    }

    getLastOperation(){

        return this._operation[this._operation.length-1];

    }

    setLastOperation(value){

        this._operation[this._operation.length -1] = value;

    }

    setError(){

        this.displayCalc= "Error";

    }

    addDot() {

        let lastOperation = this.getLastOperation();

        if ( typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

        if (this.isOperator(lastOperation) || !lastOperation) {

            this.pushOperation('0.');

        } else {

            this.setLastOperation(lastOperation.toString() + '.');

        }

        this.setLastNumberToDisplay();

    }

    isOperator(value){
        
        //metodos indexOf, recebe valor e vai verificar se existe dentro do cochetes (array) o value recebido
        return (['+','-','*','%','/'].indexOf(value) > -1);

    }

    pushOperation(value){
        
        this._operation.push(value);

        if (this._operation.length > 3) {

            this.calc();

        }

    }

    getResult() {
       
        // try catch trata erro em area sensiveis
        // eval interpreta qualquer codigo string ou int
        // join faz o inverso do split, concatena valores dentro do array e junta tudo em uma string, "" vazia serve para tirar a virgula de separação do array
        try {
            return eval(this._operation.join(""));
        } catch(e) {

            setTimeout(()=>{

                this.setError();

            }, 1);            
        
        }
        
    }

    calc() {
        
        let last = '';
        
        this._lastOperator = this.getLastItem();

        if (this._operation.length < 3) {

            let firstItem = this._operation[0];

            this._operation = [firstItem, this._lastOperator, this._lastNumber];

        }

        if(this._operation.length > 3) {

            last = this._operation.pop();
            
            this._lastNumber = this.getResult();

        } else if (this._operation.length == 3) {

            this._lastNumber = this.getLastItem(false);

        }

        let result = this.getResult();

        if (last == '%'){

            result /= 100;

            this._operation = [result];

        } else {

            this._operation	 = [result];

            if (last) {
                this._operation.push(last);
            }
                

        }        

        this.setLastNumberToDisplay();

    }

    getLastItem(isOperator = true) {

        let lastItem;

        for(let i = this._operation.length-1; i>=0; i--){
            
            if (this.isOperator(this._operation[i]) == isOperator) {

                lastItem = this._operation[i];

                break;

            }                
            
        }

        if (!lastItem) {

            // if ternário, 1 condição () se for verdade, ? entao executa uma instrução, : é o Se não for verdade executa a ultima instrução
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;

        }

        return lastItem;

    }

    setLastNumberToDisplay(){

        let lastNumber = this.getLastItem(false);

        if (!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;

    }

    addOperation(value){

        if (isNaN(this.getLastOperation())){

            //String isNaN = verifica se nao é um numero
            if (this.isOperator(value)){

                //trocar o operador
                this.setLastOperation(value);

            }else {
                
                this.pushOperation(value);

                this.setLastNumberToDisplay();
                
            }

        } else {

            if (this.isOperator(value)) {

                this.pushOperation(value);

            } else {

                //Number
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);

                //atualizar display
                this.setLastNumberToDisplay();

            }
            
        }

    }

    execBtn(value){

        this.playAudio();

        switch(value){

            case 'ac':
                this.clearAll();
                break;
            case 'ce':
                this.clearEntry();
                break;
            case 'soma':
                this.addOperation('+');
                break;
            case 'subtracao':
                this.addOperation('-');
                break;
            case 'divisao':
                this.addOperation('/');
                break;
            case 'multiplicacao':
                this.addOperation('*');
                break;
            case 'porcento':
                this.addOperation('%');
                break;
            case 'igual':
                this.calc();
                break;
            case 'ponto':
                this.addDot();
                break;
            
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                
                break;          
                

            default:
                this.setError();
                break;

        }
    }

    initButtonsEvents(){

        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        buttons.forEach((btn, index)=>{

            this.addEventListenerAll(btn, "click drag", e=>{
                
                //replace quer dizer substitua, no caso substitua "btn" por "" (vazio/nada)
                let textBtn = btn.className.baseVal.replace("btn-","");
                this.execBtn(textBtn);                
                
            });

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e=>{

                btn.style.cursor = "pointer";

            });

        });

    }

    setDisplayDateTime(){
        
        this.displayDate = this.currentDate.toLocaleDateString(this._locale,{
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
        
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);

    }

    get displayTime(){

        return this._timeEl.innerHTML;

    }

    set displayTime(value){

        return this._timeEl.innerHTML = value;

    }

    get displayDate(){

        return this._dateEl.innerHTML;

    }

    set displayDate(value){

        return this._dateEl.innerHTML = value;

    }

    // toda vez que for criado um atributo privado, vc precisa criar o get e set do atributo, que é como recupera (get) e atribui valor (set)
    get displayCalc(){

        return this._displayCalcEl.innerHTML;
        //retorna o valor que está guardado no _displayCalc
    }

    set displayCalc(value){

        if (value.toString().length > 10) {

            this.setError();

            return false;

        }

        this._displayCalcEl.innerHTML = value;
        // atribui valor no _displayCalc
    }

    get currentDate(){
        
        return new Date();

    }

    set currentDate(value){

        this._currentDate = value;

    }

}
