import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import * as d3 from 'd3';
import _ from 'lodash';
import async from 'async';

class App extends Component {
    state = {results: [],
             done: false}
    N = 20

    componentDidMount() {
        d3.csv('http://swizec.github.io/h1b-software-salaries/data/h1bs.csv')
          .get((data) => {
              this.setState({data: data});

              // poor man's force async
              setTimeout(this.experiment.bind(this), 0);
          });
    }

    experiment() {
        const experiments = {
            'lodash _.cloneDeep': _.cloneDeep,
            '.map + lodash _.clone': (arr) => arr.map((d) => _.clone(d)),
            '.map + lodash _.assign': (arr) => arr.map((d) => _.assign({}, d)),
            'JSON string/parse': (arr) => JSON.parse(JSON.stringify(arr)),
            '.map + Object.assign': (arr) => arr.map((d) => Object.assign({}, d))
        };

        const methods = Object.keys(experiments)
                              .map(name => {
                                  return (callback) => {
                                      setTimeout(() => {
                                          this.runner(name, experiments[name]);
                                          callback();
                                      },
                                                 0);
                                  }});

        async.series(methods, () => {
            let results = this.state.results;
            results.push({name: '--- done ---',
                          avg: '---'});
            this.setState({results: results,
                           done: true});
        });
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
        const done = !this.state.done ? `Experiment runs ${this.N} times. Be patient :)` : '';

        if (this.state.data && !this.state.results.length) {
            results = <p>Fetched {this.state.data.length}-element dataset. Making copies. {done}</p>;
        }else if (this.state.results.length) {

            results =
            <div>
                <p>Average time to clone <strong>{this.state.data.length} object</strong> array. {done}</p>
                <br/>
                <table className="results">
                    <thead>
                        <tr>
                            <th>Method</th><th>Avg. Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.results.map((res, i) => (
                            <tr key={i}>
                            <td>{res.name}</td>
                            <td>{res.avg}ms</td>
                            </tr>
                         ))}
                    </tbody>
                </table>
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
