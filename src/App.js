import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import * as d3 from 'd3';
import _ from 'lodash';

class App extends Component {
    state = {results: []}
    N = 10

    componentDidMount() {
        d3.csv('http://swizec.github.io/h1b-software-salaries/data/h1bs.csv')
          .get((data) => {
              this.setState({data: data});

              // poor man's force async
              setTimeout(this.experiment.bind(this), 0);
          });
    }

    experiment() {
        this.runner('lodash', _.cloneDeep);
        this.runner('json.string -> parse', (d) => JSON.parse(JSON.stringify(d)));
        this.runner('Object.assign', (arr) => arr.map((d) => Object.assign({}, d)));
    }

    runner(name, method) {
        const times = d3.range(0, this.N).map(() => {
            const t1 = new Date();

            let copy = method(this.state.data);

            const t2 = new Date();
            return t2 - t1;
        });

        let results = this.state.results;
        results.push({name: name,
                      avg: d3.mean(times)});

        this.setState({results: results});
    }

    render() {
        let results = null;

        if (this.state.data && !this.state.results.length) {
            results = <p>Fetched {this.state.data.length}-element dataset. Making copies :)</p>;
        }else if (this.state.results.length) {
            results =
            <div>
                <p>Average time to copy {this.state.data.length} object array. Experiment runs {this.N} times.</p>
                <ul>
                    {this.state.results.map((res, i) => <li key={i}><strong>{res.name}</strong>: {res.avg}ms</li>)}
                </ul>
            </div>
        }

        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h2>Object copy performance</h2>
                </div>
                <p className="App-intro">
                    This might take a while to run. Please be patient.
                </p>
                {results}
            </div>
        );
    }
}

export default App;
