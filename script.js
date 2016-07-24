var app;

var MAX_RADIUS=25;
var TRANSITION_DURATION = 750;
var binCount = 10;

  //.defer(d3.json, 'data/cip_data.json')
  
d3.queue()
  .defer(d3.json, 'data/soc_data.json')
  .awaitAll(function (error, results) {
    if (error) { throw error; }
    app.initialize(results[0]);
  });

app = {
  data: [],
  components: [],

  options: {
    year: 'all'
  },

  initialize: function (data) {
    app.data = data;

    // Here we create each of the components on our page, storing them in an array
    app.components = [
      new Chart('#chart')
    ];


    // Add event listeners and the like here
  //  d3.select('#soc-group').on('change', function () {
  //    app.options.socgroup = d3.event.target.value;
  //    charts.forEach(function (d) {d.update(); }); 
  //  });


    // app.resize() will be called anytime the page size is changed
    d3.select('window').on('resize', app.resize);


  },

  resize: function () {
    app.components.forEach(function (c) { if (c.resize) { c.resize(); }});
  },

}

function Chart(selector) {
  var chart = this;

  // SVG and MARGINS
  var margin = { 
    top: 15, right: 85, bottom: 30, left: 55
  };

  chart.width = 640 - margin.right - margin.left;
  chart.height = 400 - margin.top - margin.bottom;


  chart.svg = d3.select(selector)
    .append('svg')
    .attr('width', chart.width + margin.left + margin.right)
    .attr('height', chart.height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // SCALES

  //now in d3 4version
  chart.x = d3.scaleLinear()
      .domain([0, d3.max(app.data, function (d) {return d.femper;})])
      .range([0, chart.width])
      .nice();

  chart.y = d3.scaleLinear()
    .domain([0, d3.max(app.data, function (d) { return d.earn; })])
    .range([chart.height, 0])
    .nice();

  chart.r = d3.scaleSqrt()
    .domain([0, d3.max(app.data, function (d) { return d.total; })])
    .range([0, MAX_RADIUS]);

    //d3 4version
    //can now take color brewer
  chart.color = d3.scaleOrdinal(d3.schemeCategory22);

  // AXES
    //no more .svg, no more .orient
  var formatAsPercentage = d3.format(".0%");

  var xAxis = d3.axisBottom()
                .scale(chart.x)
                .tickFormat(formatAsPercentage);

  chart.svg.append("g")
    .attr("class", "x axis")
    .attr('transform', 'translate(0,' + chart.height + ')')
    .call(xAxis)
    .append('text')
    .attr('x', chart.width/2)
    .attr('y', chart.height+margin.top)
    .attr('dy', ".71em")
    .style('text-anchor', "middle")
    .style('fill', '#000')
    .style('font-weight', 'bold')
    .text("Percent of Workers that are Women");


  var formatAsDollars = d3.format("$.0f")

  var yAxis = d3.axisLeft()
                    .scale(chart.y)
                    .tickFormat(formatAsDollars);

  chart.svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -1*(chart.height/2))
    .attr("y", -1*(chart.width/11))
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
    txData = app.data.slice();

//    if (app.options.socgroup !== 'all') {
//      var socgroup=app.options.socgroup;
//      txData = txData.filter(function (d) {
//        return d.groupname === socgroup;
//      });
//    }

    var t = d3.transition().duration(TRANSITION_DURATION)

    // UPDATE CHART ELEMENTS

      //return d.country is a key, look for circle with that label year after year
      //data function takes data then the key
    var points=chart.svg.selectAll('.point')
      .data(txData, function (d) { return d.socname; });

      //.merge and after is created and previously existing circles
      //before .merge only applies to the new selections
    points.enter().append('circle')
      .attr('class','point')
      .attr('r', 0)
      .transition().duration(TRANSITION_DURATION)
      .attr('r', function (d) { return chart.r(d.total); })
      .attr('cx', function(d) { return chart.x(d.femper); })
      .attr('cy',  function(d) { return chart.y(d.earn); })
      .merge(points)
      .sort(function (a, b) { return b.total - a.total; })
      
      //for the circles that exit, do animation as remove
    points.exit()
      .transition().duration(TRANSITION_DURATION)
      .attr('r', 0)
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
