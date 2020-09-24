import React from 'react';
import Menu from './components/Menu';
import Chart from './components/Chart';
import jsonData from './data/quotes.json';

const default_category = "Any"

class App extends React.Component {
  state = {
    category: default_category,
    categories: this.getCategories()
  }
  onSelectChange = (d) => {
    this.setState({
      category: d
    })
  }
  getCategories() {
    let data = [default_category];
    jsonData.forEach(element => {
      if (element.Popularity < .125) return
      const found = data.includes(element.Category)
      if (!found) {
        data.push(element.Category)
      }
    })
    return data
  }
  render() {
    return (
      <>
        <Menu category={this.state.category} categories={this.state.categories} onChange={this.onSelectChange} />
        <Chart category={this.state.category} jsonData={jsonData} />
      </>
    );
  }
}

export default App;
