var app;

var MAX_RADIUS=30;
var TRANSITION_DURATION = 750;
var binCount = 10;

  //
d3.queue()
  .defer(d3.json, 'data/soc_data.json')
  .defer(d3.json, 'data/fem_soc_data.json')
  .awaitAll(function (error, results) {
    if (error) { throw error; }
    app.initialize(results[0],results[1]);
  });

app = {
  data1: [],
  data2: [],
  components: [],

  options: {
    socgroup: 'all',
    filtered: 'agg',
    highlight: false,
  },

  initialize: function (data1,data2) {
    app.data1 = data1;
    app.data2 = data2;

    //console.log(app.data2);

    // Here we create each of the components on our page, storing them in an array
    app.components = [
      new Chart('#chart1'),
      new Chart2('#chart2')
    ];


    // Add event listeners and the like here
      d3.select('#filter-agg').classed('active', true);

      d3.select('#filter-agg').on('click', function () {
        if (app.options.filtered === 'agg') {
          app.options.filtered = false;
          d3.select('#filter-agg').classed('active', false);  
        } else {
          app.options.filtered = 'agg';
          d3.selectAll('.filter').classed('active', false);
          d3.select('#filter-agg').classed('active', true);
        }
        app.components.forEach(function (d) {d.update(); });
      });

      d3.select('#filter-detail').on('click', function () {
        if ( app.options.filtered === 'detail') {
           app.options.filtered = false;
          d3.select('#filter-detail').classed('active', false);
        } else {
           app.options.filtered = 'detail';
          d3.selectAll('.filter').classed('active', false);
          d3.select('#filter-detail').classed('active', true);
        }
        app.components.forEach(function (d) {d.update(); });
      });

    d3.select('#soc-group').on('change', function () {
      app.options.socgroup = d3.event.target.value;
      app.components.forEach(function (d) {d.update(); }); 
    });

    d3.select('#highlight-wTotal').on('click', function () {
        if (app.options.highlight === 'wTotal') {
          app.options.highlight = false;
          d3.select('#highlight-wTotal').classed('active', false);
        } else {
          app.options.highlight = 'wTotal';
          d3.selectAll('.highlight').classed('active', false);
          d3.select('#highlight-wTotal').classed('active', true);
        }
        app.components.forEach(function (d) {d.update(); });
      });

    d3.select('#highlight-mTotal').on('click', function () {
        if (app.options.highlight === 'mTotal') {
          app.options.highlight = false;
          d3.select('#highlight-mTotal').classed('active', false);
        } else {
          app.options.highlight = 'mTotal';
          d3.selectAll('.highlight').classed('active', false);
          d3.select('#highlight-mTotal').classed('active', true);
        }
        app.components.forEach(function (d) {d.update(); });
      });

    d3.select('#highlight-wPercent').on('click', function () {
        if (app.options.highlight === 'wPercent') {
          app.options.highlight = false;
          d3.select('#highlight-wPercent').classed('active', false);
        } else {
          app.options.highlight = 'wPercent';
          d3.selectAll('.highlight').classed('active', false);
          d3.select('#highlight-wPercent').classed('active', true);
        }
        app.components.forEach(function (d) {d.update(); });
      });

    d3.select('#highlight-mPercent').on('click', function () {
        if (app.options.highlight === 'mPercent') {
          app.options.highlight = false;
          d3.select('#highlight-mPercent').classed('active', false);
        } else {
          app.options.highlight = 'mPercent';
          d3.selectAll('.highlight').classed('active', false);
          d3.select('#highlight-mPercent').classed('active', true);
        }
        app.components.forEach(function (d) {d.update(); });
      });

    d3.select('#highlight-highEarn').on('click', function () {
        if (app.options.highlight === 'highEarn') {
          app.options.highlight = false;
          d3.select('#highlight-highEarn').classed('active', false);
        } else {
          app.options.highlight = 'highEarn';
          d3.selectAll('.highlight').classed('active', false);
          d3.select('#highlight-highEarn').classed('active', true);
        }
        app.components.forEach(function (d) {d.update(); });
      });

    d3.select('#highlight-lowEarn').on('click', function () {
        if (app.options.highlight === 'lowEarn') {
          app.options.highlight = false;
          d3.select('#highlight-lowEarn').classed('active', false);
        } else {
          app.options.highlight = 'lowEarn';
          d3.selectAll('.highlight').classed('active', false);
          d3.select('#highlight-lowEarn').classed('active', true);
        }
        app.components.forEach(function (d) {d.update(); });
      });

    d3.select('#highlight-bigGap').on('click', function () {
        if (app.options.highlight === 'bigGap') {
          app.options.highlight = false;
          d3.select('#highlight-bigGap').classed('active', false);
        } else {
          app.options.highlight = 'bigGap';
          d3.selectAll('.highlight').classed('active', false);
          d3.select('#highlight-bigGap').classed('active', true);
        }
        app.components.forEach(function (d) {d.update(); });
      });

    d3.select('#highlight-smallGap').on('click', function () {
        if (app.options.highlight === 'smallGap') {
          app.options.highlight = false;
          d3.select('#highlight-smallGap').classed('active', false);
        } else {
          app.options.highlight = 'smallGap';
          d3.selectAll('.highlight').classed('active', false);
          d3.select('#highlight-smallGap').classed('active', true);
        }
        app.components.forEach(function (d) {d.update(); });
      });


    // app.resize() will be called anytime the page size is changed
    d3.select('window').on('resize', app.resize);

    app.update();

  },

  resize: function () {
    app.components.forEach(function (c) { if (c.resize) { c.resize(); }});
  },

  update: function () {
    app.components.forEach(function (c) { if (c.update) { c.update(); }});
  }
}

function Chart(selector) {
  var chart = this;


  // SVG and MARGINS
  var margin = { 
    top: 20, right: 85, bottom: 130, left: 55
  };

  chart.width = 640 - margin.right - margin.left;
  chart.height = 500 - margin.top - margin.bottom;


  chart.svg = d3.select(selector)
    .append('svg')
    .attr('width', chart.width + margin.left + margin.right)
    .attr('height', chart.height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // SCALES

  //now in d3 4version
  chart.x = d3.scaleLinear()
      .domain([0, d3.max(app.data1, function (d) {return d.femper;})])
      .range([0, chart.width])
      .nice();

  chart.y = d3.scaleLinear()
    .domain([0, d3.max(app.data1, function (d) { return d.earn; })])
    .range([chart.height, 0])
    .nice();

  chart.r = d3.scaleSqrt()
    .domain([0, d3.max(app.data1, function (d) { return d.total; })])
    .range([0, MAX_RADIUS]);

    //d3 4version
  chart.color = d3.scaleThreshold()
    .domain([1,2,3,4,5])
    .range(['#eeeeee','#016c59','#fed976','#fd8d3c','#f03b20','#bd0026']);

  // AXES
    //no more .svg, no more .orient
  var formatAsPercentage = d3.format(".0%");

  var xAxis = d3.axisBottom()
                .scale(chart.x)
                .tickFormat(formatAsPercentage);

  chart.svg.append("g")
    .attr("class", "x axis")
    .attr('transform', 'translate(0,' + chart.height + ')')
    .call(xAxis);
    
  chart.svg.append('text')
    .attr('x', chart.width/2)
    .attr('y', chart.height+margin.top)
    .attr('dy', ".71em")
    .style('text-anchor', "middle")
    .text('Percent of Workers that are Women');


  var formatAsDollars = d3.format("$.0f")

  var yAxis = d3.axisLeft()
                    .scale(chart.y)
                    .tickFormat(formatAsDollars);

  chart.svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);
    
  chart.svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -1*(chart.height/2))
    .attr("y", -1*(chart.width/9))
    .attr("dy", ".71em")
    .style("text-anchor", "middle")
    .text("Median Weekly Earnings");


 chart.svg.append("g")
    .append("text")
    .attr("x", chart.width+5)
    .attr("y", chart.y(870))
    .attr("dy", ".71em")
    .style("text-anchor", "start")
    .text("Total Median");

 chart.svg.append("g")
    .append("text")
    .attr("x", chart.width+5)
    .attr("y", chart.y(770))
    .attr("dy", ".71em")
    .style("text-anchor", "start")
    .text("Earnings"); 

  chart.update();
}

Chart.prototype = {
  update: function () {
    var chart = this;

    // TRANSFORM DATA
    txData = app.data1.slice();

    if (app.options.filtered) {
        txData = txData.filter(function (d) { return d.level === app.options.filtered; });
    } 

    //remove previous chart so can see grey colors
    d3.select("#chart1").selectAll(".point").remove();

    //filter works using highlight
//    if (app.options.highlight!== false) {
//        txData = txData.filter(function (d) { return d.highlight.indexOf(app.options.highlight)!==-1; });
//    } 

    if (app.options.socgroup !== 'all') {
      var socgroup=app.options.socgroup;
      txData = txData.filter(function (d) {
        return d.grp_text === socgroup;
      });
    }

    //Hide the options for detailed looks until ready for it
    if (app.options.filtered === 'agg') {
      d3.selectAll('#soc-group').classed('hide', true);  
      d3.selectAll('#detail-filter.filter').classed('hide', true);
    } else {
       d3.selectAll('#soc-group').classed('hide', false);
       d3.selectAll('#detail-filter.filter').classed('hide', false);
    }

    
    //brush https://bl.ocks.org/mbostock/4063663 note the version without brushing

    // UPDATE CHART ELEMENTS

      //return d.country is a key, look for circle with that label year after year
      //data function takes data then the key
    var points=chart.svg.selectAll('.point')
      .data(txData, function (d) { return d.socname; });

      //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
      //array find to get location of aggregate

    points.enter().append('circle')
      .attr('class','point')
      .style('stroke',  function (d) {
        if (app.options.filtered==="agg") {
          return chart.color([d.wagegap_group]);
        } else if (app.options.highlight===false) {
          return chart.color([d.wagegap_group]);
        } else if (d.highlight.indexOf(app.options.highlight)===-1) {
                return '#999999';
              } else {
                return chart.color([d.wagegap_group]);
              }
             })
      .style('fill', function (d) { 
        if (app.options.filtered==="agg") {
          return chart.color([d.wagegap_group]);
        } else if (app.options.highlight===false) {
          return chart.color([d.wagegap_group]);
        } else if (d.highlight.indexOf(app.options.highlight)===-1) {
                return '#999999';
              } else {
                return chart.color([d.wagegap_group]);
              }
             })
      .attr('r', function (d) {
        if (app.options.filtered==="agg") {
          return 0;
        } else if (app.options.highlight===false) {
          return 0;
        } else {
          return chart.r(d.total);
        }
      })
      .attr('cx',  function (d) {
        if (app.options.filtered==="agg") {
          return chart.x(d.femper);
        } else if (app.options.highlight===false) {
          return chart.x(d.femper_group);
        } else {
          return chart.x(d.femper);
        }
      })
      .attr('cy',   function (d) {
        if (app.options.filtered==="agg") {
          return chart.y(d.earn);
        } else if (app.options.highlight===false) {
          return chart.y(d.earn_group);
        } else {
          return chart.y(d.earn);
        }
      })
      .transition()
      .duration(TRANSITION_DURATION)
      .attr('r', function (d) { return chart.r(d.total); })
      .attr('cx',  function (d) {
        if (app.options.filtered==="agg") {
          return chart.x(d.femper);
        } else if (app.options.highlight===false) {
          return chart.x(d.femper);
        } else {
          return chart.x(d.femper);
        }
      })
      .attr('cy',   function (d) {
        if (app.options.filtered==="agg") {
          return chart.y(d.earn);
        } else if (app.options.highlight===false) {
          return chart.y(d.earn);
        } else {
          return chart.y(d.earn);
        }
      });
      
      //for the circles that exit, do animation as remove
    points.exit()
      .transition().duration(TRANSITION_DURATION)
      .remove();

    var line = chart.svg.append('line')
      .attr('x1',0)
      .attr('y1',chart.y(803))
      .attr('x2',chart.width)
      .attr('y2',chart.y(803))
      .attr('stroke-width',2)
      .attr('stroke','black');   


  }
}



/////////////////////////////////////////////////////////////////////////
function Chart2(selector) {
  var chart2 = this;

  // SVG and MARGINS
  var margin = { 
    top: 20, right: 15, bottom: 130, left: 45
  };

  chart2.width = 640 - margin.right - margin.left;
  chart2.height = 500 - margin.top - margin.bottom;


  chart2.svg = d3.select(selector)
    .append('svg')
    .attr('width', chart2.width + margin.left + margin.right)
    .attr('height', chart2.height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // SCALES
  chart2.y = d3.scaleLinear()
    .domain([0, d3.max(app.data2, function (d) { return d.earn; })])
    .range([chart2.height, 0])
    .nice();

  chart2.r = d3.scaleSqrt()
    .domain([0, d3.max(app.data2, function (d) { return d.total; })])
    .range([0, MAX_RADIUS]);

    //d3 4version
  chart2.color = d3.scaleThreshold()
    .domain([1,2,3,4,5])
    .range(['#eeeeee','#016c59','#fed976','#fd8d3c','#f03b20','#bd0026']);

  // AXES
  
  var formatAsDollars = d3.format("$.0f")

  var yAxis = d3.axisLeft()
                    .scale(chart2.y)
                    .tickFormat(formatAsDollars);

  chart2.svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);
    
  chart2.svg.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", ".71em")
    .style("text-anchor", "start")
    .text("Median Weekly Earnings");


  chart2.update();
}

Chart2.prototype = {
  update: function () {
    var chart2 = this;

    // TRANSFORM DATA
    txData2 = app.data2.slice();

    //remove previous chart so can see grey colors
    d3.select("#chart2").selectAll(".point").remove();
    d3.select("#chart2").selectAll(".line").remove();

    if (app.options.filtered) {
        txData2 = txData2.filter(function (d) { return d.level === app.options.filtered; });
    } 

    chart2.x = d3.scaleLinear()
        .domain([0, d3.max(txData2, function (d) {return d.rank;})])
        .range([0, chart2.width])
        .nice();

    var xAxis = d3.axisBottom()
                  .scale(chart2.x);

    //brush https://bl.ocks.org/mbostock/4063663 note the version without brushing

    // UPDATE CHART ELEMENTS

    //data function takes data then the key
    var points=chart2.svg.selectAll('.point')
      .data(txData2, function (d) { return d.socname; });

    points.enter().append('circle')
      .attr('class','point')
      .attr('r', 0)
      .attr('cx', function(d) { return chart2.x(d.rank); })
      .attr('cy',  function(d) { return chart2.y(d.earn); })
      .style('stroke', '#333')
      .style('fill', function (d) { return chart2.color([d.wagegap_group]) })
      .transition()
      .duration(TRANSITION_DURATION)
      .delay(function (d,i){ return (i * 50) })
      .attr('r', function (d) { return chart2.r(d.count); });
      
      //for the circles that exit, do animation as remove
    points.exit()
      .transition().duration(TRANSITION_DURATION)
      .attr('r', 0)
      .remove();

    //nest data for the lines
    chart2.counts = d3.nest()
      .key(function(d) {return d.socname})
      .entries(txData2);

    var lines=chart2.svg.selectAll('.line')
      .data(chart2.counts);

    lines.enter().append('line')
      .attr('class','line')
      .attr('x1',function (d) {return chart2.x(d.values[1].rank)})
      .attr('y1',function (d) {return (chart2.y(d.values[0].earn)+chart2.y(d.values[1].earn))/2})
      .attr('x2',function (d) {return chart2.x(d.values[0].rank)})
      .attr('y2',function (d) {return (chart2.y(d.values[0].earn)+chart2.y(d.values[1].earn))/2})
      .transition()
      .delay(function (d,i){ return (i * 50) })
      .duration(TRANSITION_DURATION)
      .attr('y1',function (d) {return chart2.y(d.values[1].earn)})
      .attr('y2',function (d) {return chart2.y(d.values[0].earn)});  

    lines.exit()
      .transition().duration(TRANSITION_DURATION)
      .attr('y1',function (d) {return (chart2.y(d.values[0].earn)+chart2.y(d.values[1].earn))/2})
      .attr('y2',function (d) {return (chart2.y(d.values[0].earn)+chart2.y(d.values[1].earn))/2})
      .remove();

  }
}