import React from 'react';
import * as d3 from 'd3';
import { interpolatePlasma } from "d3-scale-chromatic";
import Canvas from 'canvas';
import cloud from 'd3-cloud';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

var sel = "#chart",
    toolTip = {
        Create: function (d) {
            d3.select(this).attr('class', 'text--hover')
            const instance = this._tippy,
                wordHeight = d3.select(this).node().getBoundingClientRect().height;
            if (!instance) {
                let rand = d['phrases'][Math.floor(Math.random() * d.phrases.length)]
                tippy(this, {
                    allowHTML: true,
                    content: `<div class="quote">“${rand.phrase}”</div><div class="attribution">—${rand.author}</div>`,
                    offset: function () { return [0, -Math.round(wordHeight / 4)] },
                    hideOnClick: false
                })
            }
        },
        Remove: function (d) {
            d3.select(this).attr('class', '')
            const instance = this._tippy;
            if (instance) {
                instance.hide();
                setTimeout(
                    function () {
                        instance.destroy();
                    }, 250);
            }
        }
    }

function debounce(fn, ms) {
    let timer
    return _ => {
        clearTimeout(timer)
        timer = setTimeout(_ => {
            timer = null
            fn.apply(this, arguments)
        }, ms)
    };
}

class Chart extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            height: window.innerHeight,
            width: window.innerWidth,
            csv: []
        };
    }
    formatData(category, jsondata) {
        var data = []
        jsondata.forEach(element => {
            if (element.Popularity < .01) return
            const matchesCategory = category === "Any" ? true : category === element.Category
            if (matchesCategory) {
                element.Tags.forEach(tag => {
                    var found = data.some(el => {
                        return tag.toLowerCase() === el.keyword.toLowerCase()
                    })
                    if (found) {
                        data.forEach(el => {
                            if (tag === el.keyword) {
                                el.count++
                                el.phrases.push({
                                    phrase: element.Quote,
                                    category: element.Category,
                                    author: element.Author
                                })
                            }
                        })
                    }
                    else {
                        data.push({
                            keyword: tag,
                            count: 1,
                            phrases: [{
                                phrase: element.Quote,
                                category: element.Category,
                                author: element.Author
                            }]
                        })
                    }
                })
            }
        })
        return data
    }
    drawChart = (category, jsondata) => {
        var data = this.formatData(category, jsondata),
            words = data.map(function (d) {
                return { text: d.keyword, count: d.count, size: d.count, phrases: d.phrases };
            });

        var min = d3.min(words, function (d) { return +d.size }),
            max = d3.max(words, function (d) { return +d.size }),
            mean = d3.mean(words, function (d) { return +d.size }),
            median = d3.median(words, function (d) { return +d.size });

        var element = d3.select(sel).node(),
            m = [20, 20, 20, 20],
            w = element.getBoundingClientRect().width - m[1] - m[3],
            h = element.getBoundingClientRect().height - m[0] - m[2]

        var layout = cloud().size([w + m[1] + m[3], h + m[0] + m[2]])
            .canvas(function () { return Canvas.createCanvas(1, 1); })
            .words(words)
            .padding(function (d) { return Math.round(d.size / 20) + 4 })
            .font("'Amatic SC', sans-serif")
            .fontSize(function (d) {
                var maxratio = 366 / max,
                    widthratio = element.getBoundingClientRect().width / 800;
                return Math.round(((d.size / (max / mean))) * maxratio * 8 * widthratio) + 20;
            })
            .on("end", draw)

        layout.start();

        function draw(words) {
            d3.select(sel).append("svg")
                .attr("width", w + m[1] + m[3])
                .attr("height", h + m[0] + m[2])
                .attr("class", "wordcloud")
                .append("g")
                .attr("transform", `translate(${(w + m[1] + m[3]) / 2},${(h + m[0] + m[2]) / 2})`)
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .on('mouseover', toolTip.Create)
                .on('mouseout', toolTip.Remove)
                .attr('data-count', function (d) { return d.count })
                .style({
                    "font-family": function (d) { return d.font; },
                    "font-size": function (d) { return d.size + "px"; },
                    "text-transform": "uppercase",
                    "fill": function (d) { return interpolatePlasma(d.count / 100) },
                    "cursor": "pointer"
                })
                .attr("text-anchor", "middle")
                .attr("transform", function (d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function (d) { return d.text; });
        }
    }
    componentDidMount() {
        const t = this,
            debouncedHandleResize = debounce(function handleResize() {
                t.setState({
                    height: window.innerHeight,
                    width: window.innerWidth
                })
            }, 1000)

        t.drawChart(t.props.category, t.props.jsonData)
        window.addEventListener('resize', debouncedHandleResize)
    }
    componentDidUpdate() {
        d3.select("#chart svg").remove()
        d3.selectAll("[data-tippy-root]").remove();
        this.drawChart(this.props.category, this.props.jsonData)
    }
    render() {
        return <main id='chart'></main>
    }
}

export default Chart;