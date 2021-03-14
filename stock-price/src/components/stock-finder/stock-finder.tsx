import { Component, EventEmitter, h, State, Event } from "@stencil/core/internal";

@Component({
    tag: 'uc-stock-finder',
    styleUrl: 'stock-finder.scss',
    shadow: true
})
export class StockFiner {
    @State() searchedResults: { name: string, symbol: string}[] = [];
    @Event({bubbles: true}) emittedSymbol: EventEmitter<string>;

    el: HTMLInputElement;
    onSearchStockSymbol = (e: Event) => {
        e.preventDefault();
        const inputValue = this.el.value;
        fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${inputValue}&apikey=K538MTRAAMMAU8EG`)
        .then(res=>res.json())
        .then(parsedRes=>{
            this.searchedResults = parsedRes['bestMatches'].map(match=>{
                return { name: match['2. name'], symbol: match['1. symbol']}
            })
            console.log(this.searchedResults);
        })
        .catch(error=>console.log(error));
    }

    symbolEmitter = (symbol: string) => {
        this.emittedSymbol.emit(symbol);
    }

    render() {
        return [
            <form>
                <input ref={el=>this.el=el}/>
                <button onClick={this.onSearchStockSymbol}>Find</button>
            </form>,
            <ul>
                { this.searchedResults.map(result=>{
                    return <li onClick={()=>this.symbolEmitter(result.symbol)}>{result.symbol} - {result.name}</li>
                })}
            </ul>
        ]
    }
}