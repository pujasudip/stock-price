import { Component, h, Listen, Prop, State, Watch } from "@stencil/core/internal";
import { isEmpty } from 'lodash';

@Component({
    tag: 'uc-stock-price',
    styleUrl: 'stock-price.scss',
    shadow: true
})

export class StockPrice {
    el: HTMLInputElement;
    inputValue: string;
    @State() fetchedPrice: number = 0;
    @State() error = null;
    @Prop() stockSymbol: string;

    onFormSubmit = (event) => {
        event.preventDefault();
        const stockSymbol = this.el.value;
        this.fetchStockInfo(stockSymbol);
    }

    @Watch('stockSymbol')
    stockSymbolChanged(newValue, oldValue) {
        if(newValue !== oldValue){
            this.inputValue = newValue;
            this.fetchStockInfo(newValue);
        }
    }

    @Listen('emittedSymbol', { target: 'body'})
    symbolReceiver(symbol) {
        this.stockSymbol = symbol.detail;
    }

    hostData() {
        return { class: this.error ? 'error' : '' };
    }

    fetchStockInfo(stockSymbol) {
        fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=K538MTRAAMMAU8EG`)
            .then(res => {
                if (res.status !== 200) {
                    throw new Error('invalid data');
                }
                return res.json()
            })
            .then(parsedRes => {
                if (!isEmpty(parsedRes['Global Quote'])) {
                    this.error = null;
                    this.fetchedPrice = +parsedRes['Global Quote']['05. price'];
                } else {
                    throw new Error('Invalid stock symbol')
                };
            })
            .catch(error => {
                this.error = error.message;
            })
    }

    // componentShouldUpdate(newValue, oldValue, prop){
    //     console.log(newValue, oldValue, prop);
    // }

    componentDidLoad() {
        if(this.stockSymbol){
            this.inputValue = this.stockSymbol;
            this.fetchStockInfo(this.stockSymbol);
        }
    }

    render() {
        let dataContent = <p>Price: {this.fetchedPrice}</p>;
        if (this.error) {
            dataContent = <p> {this.error}</p>
        }
        return [
            <form onSubmit={this.onFormSubmit}>
                <input id="stock-symbol" ref={el => this.el = el} value={this.inputValue}/>
                <button type="submit">Submit</button>
            </form>,
            <div>
                {dataContent}
            </div>]
    }
}