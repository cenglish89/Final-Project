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

    // app.resize() will be called anytime the page size is changed
    d3.select(window).on('resize', app.resize);


    // Add event listeners and the like here
      d3.select('#filter-agg').classed('active', true);

      d3.select('#filter-agg').on('click', function () {
        if (app.options.filtered === 'agg') {
          app.options.filtered = 'detail';
          d3.selectAll('.filter').classed('active', true);
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
           app.options.filtered = 'agg';
           d3.selectAll('.filter').classed('active', true);
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
  chart.margin = { 
    top: 20, right: 40, bottom: 130, left: 60
  };

  chart.parentEl = d3.select(selector)

  chart.svg = chart.parentEl
    .append('svg')
    .append('g')
    .attr('transform', 'translate(' + chart.margin.left + ',' + chart.margin.top + ')');

  // SCALES

  //now in d3 4version
  chart.x = d3.scaleLinear()
    .domain([0, d3.max(app.data1, function (d) {return d.femper;})])
    .nice();

  chart.y = d3.scaleLinear()
    .domain([0, d3.max(app.data1, function (d) { return d.earn; })])
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

  chart.xAxis = d3.axisBottom()
                .scale(chart.x)
                .tickFormat(formatAsPercentage);

  chart.gx=chart.svg.append("g")
    .attr("class", "x axis");
    
  chart.xLabel = chart.svg.append('text')
    .attr('dy', ".71em")
    .style('text-anchor', "middle")
    .text('Percent of Workers that are Women');


  var formatAsDollars = d3.format("$.0f")

  chart.yAxis= d3.axisRight()
              .scale(chart.y)
              .tickFormat(formatAsDollars);

  chart.gy = chart.svg.append("g")
    .attr("class", "y axis");
    
  chart.nat1 = chart.svg.append("text")
    .attr("x", -60)
    .attr("dy", ".71em")
    .style("text-anchor", "start")
    .text("National");

  chart.nat2 = chart.svg.append("text")
    .attr("x", -60)
    .attr("dy", ".71em")
    .style("text-anchor", "start")
    .text("Median");

  chart.nat3 = chart.svg.append("text")
    .attr("x", -60)
    .attr("dy", ".71em")
    .style("text-anchor", "start")
    .text("Earnings");
 

  chart.tooltip = d3.select("body").append("div")   
          .attr("class", "tooltip")               
          .style("opacity", 0);

  chart.line = chart.svg.append('line')
      .attr('x1',0)
      .attr('stroke-width',2)
      .attr('stroke','black');  


  if(screen.width < 992) {

    chart.med = chart.svg.append("text")
      .attr("y", -20)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Median Weekly Earnings");

  } else {

    chart.med = chart.svg.append("text")
      .attr("y", -20)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Median");

  }

  //Legends
   legendname = 400;
   legendlabel = 425;
   legendobj = 440;

  //Color legend
    var legendcolors = [ 
        { gap: 5, gap_text: "<70%", color: "#bd0026" },
        { gap: 4, gap_text: "70-80%", color: "#f03b20" },
        { gap: 3, gap_text: "80-90%", color: "#fd8d3c" },
        { gap: 2, gap_text: "90-100%", color: "#fed976" },
        { gap: 1, gap_text: ">100%", color: "#016c59" }        
      ]

  chart.legend = chart.svg.selectAll('rect')
      .data(legendcolors)
      .enter()
      .append("rect")
      .attr("x", function(d, i){ return ((i *  45)-chart.margin.left);})
      .attr("y", legendobj)
      .attr("width", 30)
      .attr("height", 30)
      .style("fill", function(d) { 
        return d.color;
      })
      .style("opacity", 0.8);

  chart.svg.selectAll('legendlabel')
      .data(legendcolors).enter()
      .append("text")
      .attr("class", "legendlabel")
      .attr("x", function(d, i){ return ((i *  45)-chart.margin.left);})
      .attr("y", legendlabel)
      .text(function(d) {
           return d.gap_text;
        })
      .style("fill", "#000");

  chart.colorlegend = chart.svg.append("text")
      .attr("class", "legendtext")
      .attr("x",-1*chart.margin.left)
      .attr("y", legendname)
      .attr("dy", ".71em")
      .style("text-anchor", "start")
      .text("Women's Earnings as % of Men's"); 

  //Size legend
  var legendsize = [
    {total: 300, text: "300K"},
    {total: 600, text: "600K"},
    {total: 1200, text: "1,200K"},
    {total: 2500, text: "2,500K"},
    {total: 5000, text: "5,000K"},
    {total: 10000, text: "10,000K"},
  ]

  chart.legendcirc = chart.svg.selectAll('circ')
      .data(legendsize)
      .enter()
      .append("circle")
      .attr("class", "circ")
      .attr("r", function (d) { return chart.r(d.total); })
      .attr("cx", function(d, i){ return ((45*5) + 40 + (i *  45)-chart.margin.left);})
      .attr("cy", legendobj+15)
      .style("fill", '#949494')
      .style("opacity", 1);

  chart.svg.selectAll('legendlabel')
      .data(legendsize).enter()
      .append("text")
      .attr("class", "legendlabel")
      .attr("x", function(d, i){ return ((45*5) + 20 + (i *  45)-chart.margin.left);})
      .attr("y", legendlabel)
      .text(function(d) {
           return d.text;
        })
      .style("fill", "#000");

  chart.sizelegend = chart.svg.append("text")
      .attr("class", "legendtext")
      .attr("x",(45*5) + 40-chart.margin.left)
      .attr("y", legendname)
      .attr("dy", ".71em")
      .style("text-anchor", "start")
      .text("Scaled by Number of Workers"); 


  chart.resize();
}

Chart.prototype = {
  resize: function() {
    var chart = this;

      //width in browser
      var width = chart.parentEl.node().offsetWidth;

      chart.width = width - chart.margin.left - chart.margin.right;
      chart.height = 500 - chart.margin.top - chart.margin.bottom;

      chart.parentEl.select('svg')
        .attr('width', chart.width + chart.margin.left + chart.margin.right)
        .attr('height', chart.height + chart.margin.top + chart.margin.bottom);

      chart.x.range([0, chart.width]);
      chart.y.range([chart.height, 0]);

      chart.gx.call(chart.xAxis)
        .attr('transform', 'translate(0,' + chart.height + ')')
      chart.gy.call(chart.yAxis)
        .attr('transform', 'translate(' + chart.width + ',0)');

      chart.xLabel
        .attr('x', chart.width/2)
        .attr('y', chart.height+chart.margin.top);
      chart.med
        .attr("x", chart.width+chart.margin.right-5);
      chart.nat1
        .attr("y", chart.y(970));
      chart.nat2
        .attr("y", chart.y(870));
      chart.nat3
        .attr("y", chart.y(770));
     
      chart.line
        .attr('y1',chart.y(803))
        .attr('x2',chart.width)
        .attr('y2',chart.y(803));

    chart.update()
  },

  update: function () {
    var chart = this;

    // TRANSFORM DATA

    txData = app.data1.slice();
    txData4 = txData.filter(function (d) { return d.level === "agg"; });


    if (app.options.filtered) {
        txData = txData.filter(function (d) { return d.level === app.options.filtered; });
    } 

    //remove previous chart so can see grey colors
    d3.select("#chart1").selectAll(".point").remove();
    d3.select("#chart1").selectAll(".cover").remove();
    d3.select("#chart1").selectAll(".titles").remove();

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


        //labels and Titles for the detailed view
    if (app.options.filtered === 'detail') {

      chart.title = chart.svg.append('text')
        .attr("class", "titles")
        .style("text-anchor", "middle")
        .attr("x", chart.width/2)
        .attr("y", 0)
        .text("Earnings for Individual Occupations");

    } else {

      chart.title = chart.svg.append('text')
        .attr("class", "titles")
        .style("text-anchor", "middle")
        .attr("x", chart.width/2)
        .attr("y", 0)
        .text("Aggregated Occupational Group Earnings");

    }


    //brush https://bl.ocks.org/mbostock/4063663 note the version without brushing

    // UPDATE CHART ELEMENTS  
    var formatAsPercentage = d3.format(".2");
    var formatAsDollars = d3.format("$.0f")

      //return d.country is a key, look for circle with that label year after year
      //data function takes data then the key
    var points=chart.svg.selectAll('.point')
      .data(txData, function (d) { return d.socname; });

      //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
      //array find to get location of aggregate

      //Tooltip code from talking to Vivian
    points.enter().append('circle')
      .attr('class','point path2')
      .sort(function (a, b) { return b.total - a.total; })
      .style('stroke',  function (d) {return chart.color([d.wagegap_group])})
      .style('fill', function (d) {return chart.color([d.wagegap_group])})
      .attr('r', function (d) {
        if (app.options.filtered==="agg") {
          return 0;
        } else {
          return chart.r(d.total);
        }
      })
      .attr('cx',  function (d) {
        if (app.options.filtered==="agg") {
          return chart.x(d.femper);
        } else {
          return chart.x(d.femper_group);
        } 
      })
      .attr('cy',   function (d) {
        if (app.options.filtered==="agg") {
          return chart.y(d.earn);
        } else {
          return chart.y(d.earn_group);
        } 
      })
      .on("mouseover", function(d) {
        chart.tooltip.transition()
          .duration(200)
          .style("opacity", .9)
          var select_group = d.group
          d3.selectAll(".path")
            .style("opacity", function(d) {
              return select_group.indexOf(d.group) ==-1 ? 0.2 : 1;
            })
            .style("stroke", function(d) {
              return select_group.indexOf(d.group) ==-1 ? 0.2 : 1;
            })
            ;
          if (d.wagegap < 1) {
            return chart.tooltip.html(d.socname + "<br>" + d.gender + " Earn " + formatAsDollars(d.earn) + "<br>" + "Women Earn " + formatAsPercentage(d.wagegap) + "&#162 for 1$ by Men")
              .style("left", (d3.event.pageX) + "px")   
              .style("top", (d3.event.pageY - 28) + "px");  
          } else {
            return chart.tooltip.html(d.socname + "<br>" + d.gender + " Earn " + formatAsDollars(d.earn) + "<br>" + "Women Earn " + formatAsPercentage(d.wagegap) + "$ for 1$ by Men")
              .style("left", (d3.event.pageX) + "px")   
              .style("top", (d3.event.pageY - 28) + "px");  
                }
            })          
        .on("mouseout", function(d) {   
            chart.tooltip.transition()    
                .duration(500)    
                .style("opacity", 0)
            d3.selectAll(".path")
            .style("opacity", 0.8);
          })
      .transition()
      .duration(1500)
      .attr('r', function (d) { return chart.r(d.total); })
      .attr('cx',  function (d) {
        if (app.options.filtered==="agg") {
          return chart.x(d.femper_group);
        } else {
          return chart.x(d.femper);
        } 
      })
      .attr('cy', function (d) {
        if (app.options.filtered==="agg") {
          return chart.y(d.earn_group);
        } else {
          return chart.y(d.earn);
        } 
      });
      
      //for the circles that exit, do animation as remove
      //doesn't seem to work with filter, would keep trying to make this work if more time
      //http://bl.ocks.org/alansmithy/e984477a741bc56db5a5
    points.exit()
      .transition().duration(1500)
      .attr('cx',  function (d) {return chart.x(d.femper_group);}) 
      .attr('cy', function (d) {return chart.y(d.earn_group);})
      .attr('r', 0)
      .remove();

        //idea for cover circle from here http://bl.ocks.org/nbremer/8df57868090f11e59175804e2062b2aa
     if (app.options.filtered === 'detail') {
      var cover = chart.svg.selectAll(".cover")
      .data(txData4);

      cover.enter().append("circle")
        .attr("class", "cover")
        .style("stroke",  function (d) {return chart.color([d.wagegap_group]); })
        .style("fill", function (d) {return chart.color([d.wagegap_group]); })
        .attr("r", function (d) { return chart.r(d.total); })
        .attr("cx", function (d) { return chart.x(d.femper); })
        .attr("cy", function (d) { return chart.y(d.earn); });

      d3.selectAll(".cover")
        .transition().duration(1500)
        .attr("r", 0);

    } else {
    }
 

  }
}



/////////////////////////////////////////////////////////////////////////
function Chart2(selector) {
  var chart2 = this;

  // SVG and MARGINS
  if(screen.width < 992) {
    chart2.margin = { 
      top: 20, right: 25, bottom: 130, left: 45
    };
  } else {
    chart2.margin = { 
      top: 20, right: 35, bottom: 130, left: 0
    };
  }

  chart2.parentEl = d3.select(selector)

  chart2.svg = chart2.parentEl
    .append('svg')
    .append('g')
    .attr('transform', 'translate(' + chart2.margin.left + ',' + chart2.margin.top + ')');

  // SCALES
  chart2.y = d3.scaleLinear()
    .domain([0, 2200])
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

    chart2.yAxis = d3.axisLeft()
                      .scale(chart2.y)
                      .tickFormat(formatAsDollars);

    chart2.gy = chart2.svg.append('g')
      .attr('class', 'y axis');

  //if on a small or medium device, add a yAxis to the right hand chart
  if(screen.width < 992) {

    chart2.nat1 = chart2.svg.append("text")
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("National");

    chart2.nat2 = chart2.svg.append("text")
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Median");

    chart2.nat3 = chart2.svg.append("text")
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Earnings");

    chart2.yLabel = chart2.svg.append('text')
      .attr("x", -1*chart2.margin.left)
      .attr("y", -1*chart2.margin.top)
      .attr("dy", ".71em")
      .style("text-anchor", "start")
      .text("Median Weekly Earnings");

    chart2.line = chart2.svg.append('line')
      .attr('stroke-width',2)
      .attr('stroke','black'); 

  } else {

    chart2.yLabel = chart2.svg.append('text')
      .attr("x", -1*chart2.margin.left)
      .attr("y", -1*chart2.margin.top)
      .attr("dy", ".71em")
      .style("text-anchor", "start")
      .text("Weekly Earnings");

    chart2.line = chart2.svg.append('line')
      .attr('stroke-width',2)
      .attr('stroke','black'); 

  }    

  chart2.tooltip = d3.select("body").append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);

  chart2.resize();
}

Chart2.prototype = {
  resize: function () {
    var chart2 = this;

    //width in browser
    var width = chart2.parentEl.node().offsetWidth;

    chart2.width = width - chart2.margin.left - chart2.margin.right;
    chart2.height = 500 - chart2.margin.top - chart2.margin.bottom;

    //console.log(chart2.width, chart2.height)
    chart2.parentEl.select('svg')
      .attr('width', chart2.width + chart2.margin.left + chart2.margin.right)
      .attr('height', chart2.height + chart2.margin.top + chart2.margin.bottom);

    chart2.y.range([chart2.height, 0]);

    if(screen.width < 992) {
      chart2.gy.call(chart2.yAxis);

      chart2.line
        .attr('x1',0)
        .attr('y1',chart2.y(803))
        .attr('x2',chart2.width)
        .attr('y2',chart2.y(803));

      chart2.nat1
        .attr("x", chart2.width)
        .attr("y", chart2.y(980));
      chart2.nat2
        .attr("x", chart2.width)
        .attr("y", chart2.y(880));
      chart2.nat3
        .attr("x", chart2.width)
        .attr("y", chart2.y(780));

    } else {
      chart2.line
        .attr('x1',-1*chart2.margin.right)
        .attr('y1',chart2.y(803))
        .attr('x2',chart2.width)
        .attr('y2',chart2.y(803));
    }

    chart2.update()
  },

  update: function () {
    var chart2 = this;

    // TRANSFORM DATA
    txData2 = app.data2.slice();

    //remove previous chart so can see grey colors
    d3.select("#chart2").selectAll(".point").remove();
    d3.select("#chart2").selectAll(".line").remove();
    d3.select("#chart2").selectAll(".labels").remove();
    d3.select("#chart2").selectAll(".titles").remove();
    d3.select("#chart2").selectAll(".titles2").remove();


    if (app.options.filtered) {
        txData2 = txData2.filter(function (d) { return d.level === app.options.filtered; });
    } 

    chart2.x = d3.scaleLinear()
        .domain([0, d3.max(txData2, function (d) {return d.rank;})])
        .range([0, chart2.width])
        .nice();

    var xAxis = d3.axisBottom()
                  .scale(chart2.x);


      //labels and Titles for the detailed view
    if (app.options.filtered==="detail") {
      chart2.title = chart2.svg.append('text')
        .attr("class", "titles")
        .style("text-anchor", "start")
        .attr("x", chart2.width/4)
        .attr("y", 0)
        .text("Average Earnings of Top 15 Occupations");

      chart2.title2 = chart2.svg.append('text')
        .attr("class", "titles2")
        .style("text-anchor", "start")
        .attr("x", chart2.width/4)
        .attr("y", chart2.margin.top)
        .text("Male versus Female Earnings, Ordered by Female Earnings");      

      chart2.high1 = chart2.svg.append('text')
        .attr("class", "labels")
        .style("text-anchor", "middle")
        .attr("x", chart2.x(1))
        .attr("y", chart2.y(2000))
        .text("Highest")
        .attr("opacity",0)
        .transition()
        .duration(1000)
        .attr("opacity",1);

      chart2.high2 = chart2.svg.append('text')
        .style("text-anchor", "middle")
        .attr("class", "labels")
        .attr("x", chart2.x(1))
        .attr("y", chart2.y(1900))
        .text("Earning")
        .attr("opacity",0)
        .transition()
        .duration(1000)
        .attr("opacity",1);

      chart2.large1 = chart2.svg.append('text')
        .attr("class", "labels")
        .style("text-anchor", "middle")
        .attr("x", chart2.x(2))
        .attr("y", chart2.y(1500))
        .text("Largest")
        .attr("opacity",0)
        .transition()
        .duration(1000)
        .attr("opacity",1);

      chart2.large2 = chart2.svg.append('text')
        .style("text-anchor", "middle")
        .attr("class", "labels")
        .attr("x", chart2.x(2))
        .attr("y", chart2.y(1400))
        .text("Wage Gap")
        .attr("opacity",0)
        .transition()
        .duration(1000)
        .attr("opacity",1);

      chart2.men1 = chart2.svg.append('text')
        .attr("class", "labels")
        .style("text-anchor", "middle")
        .attr("x", chart2.x(3))
        .attr("y", chart2.y(1300))
        .text("Employ The")
        .attr("opacity",0)
        .transition()
        .duration(1000)
        .attr("opacity",1);

      chart2.men2 = chart2.svg.append('text')
        .style("text-anchor", "middle")
        .attr("class", "labels")
        .attr("x", chart2.x(3))
        .attr("y", chart2.y(1200))
        .text("Most Men")
        .attr("opacity",0)
        .transition()
        .duration(1000)
        .attr("opacity",1);

      chart2.menp1 = chart2.svg.append('text')
        .attr("class", "labels")
        .style("text-anchor", "middle")
        .attr("x", chart2.x(4))
        .attr("y", chart2.y(1125))
        .text("Employ The")
        .attr("opacity",0)
        .transition()
        .duration(1000)
        .attr("opacity",1);

      chart2.menp2 = chart2.svg.append('text')
        .style("text-anchor", "middle")
        .attr("class", "labels")
        .attr("x", chart2.x(4))
        .attr("y", chart2.y(1025))
        .text("Most Women")
        .attr("opacity",0)
        .transition()
        .duration(1000)
        .attr("opacity",1);

      chart2.small1 = chart2.svg.append('text')
        .attr("class", "labels")
        .style("text-anchor", "middle")
        .attr("x", chart2.x(5))
        .attr("y", chart2.y(550))
        .text("Highest %")
        .attr("opacity",0)
        .transition()
        .duration(1000)
        .attr("opacity",1);

      chart2.small2 = chart2.svg.append('text')
        .style("text-anchor", "middle")
        .attr("class", "labels")
        .attr("x", chart2.x(5))
        .attr("y", chart2.y(450))
        .text("of Men")
        .attr("opacity",0)
        .transition()
        .duration(1000)
        .attr("opacity",1);

      chart2.women1 = chart2.svg.append('text')
        .attr("class", "labels")
        .style("text-anchor", "middle")
        .attr("x", chart2.x(6))
        .attr("y", chart2.y(1050))
        .text("Highest %")
        .attr("opacity",0)
        .transition()
        .duration(1000)
        .attr("opacity",1);

      chart2.women2 = chart2.svg.append('text')
        .style("text-anchor", "middle")
        .attr("class", "labels")
        .attr("x", chart2.x(6))
        .attr("y", chart2.y(950))
        .text("of Women")
        .attr("opacity",0)
        .transition()
        .duration(1000)
        .attr("opacity",1);

      chart2.womenp1 = chart2.svg.append('text')
        .attr("class", "labels")
        .style("text-anchor", "middle")
        .attr("x", chart2.x(7))
        .attr("y", chart2.y(450))
        .text("Smallest")
        .attr("opacity",0)
        .transition()
        .duration(1000)
        .attr("opacity",1);

      chart2.womenp2 = chart2.svg.append('text')
        .style("text-anchor", "middle")
        .attr("class", "labels")
        .attr("x", chart2.x(7))
        .attr("y", chart2.y(350))
        .text("Wage Gap")
        .attr("opacity",0)
        .transition()
        .duration(1000)
        .attr("opacity",1);

      chart2.lowest1 = chart2.svg.append('text')
        .attr("class", "labels")
        .style("text-anchor", "middle")
        .attr("x", chart2.x(8))
        .attr("y", chart2.y(250))
        .text("Lowest")
        .attr("opacity",0)
        .transition()
        .duration(1000)
        .attr("opacity",1);

      chart2.lowest2 = chart2.svg.append('text')
        .style("text-anchor", "middle")
        .attr("class", "labels")
        .attr("x", chart2.x(8))
        .attr("y", chart2.y(150))
        .text("Earning")
        .attr("opacity",0)
        .transition()
        .duration(1000)
        .attr("opacity",1);
    } else {
      chart2.title = chart2.svg.append('text')
        .attr("class", "titles")
        .style("text-anchor", "start")
        .attr("x", chart2.width/4)
        .attr("y", 0)
        .text("Occupational Group Earnings by Gender");

      chart2.title2 = chart2.svg.append('text')
        .attr("class", "titles2")
        .style("text-anchor", "start")
        .attr("x", chart2.width/4)
        .attr("y", chart2.margin.top)
        .text("Ordered by Female Earnings");
    }



    //brush https://bl.ocks.org/mbostock/4063663 note the version without brushing

    // UPDATE CHART ELEMENTS
    var formatAsDollars = d3.format("$.0f")
    var formatAsPercentage = d3.format(".2");

    //data function takes data then the key
    var points=chart2.svg.selectAll('.point')
      .data(txData2, function (d) { return d.socname; });

    points.enter().append('circle')
      .attr('class','point path')
      .sort(function (a, b) { return a.rank - b.rank; })
      .on("mouseover", function(d) {
        chart2.tooltip.transition()
          .duration(200)
          .style("opacity", .9) 
        var select_group = d.group
        d3.selectAll(".path2")
            .style("opacity", function(d) {
              return d.group.indexOf(select_group) ===-1 ? 0.2 : 1;
            })
            .style("stroke", function(d) {
              return d.group.indexOf(select_group) ===-1 ? 0.2 : 1;
            })
            ;
         chart2.tooltip.html(d.socname + "<br>" + d.gender + " Earn " + formatAsDollars(d.earn) + "<br>" + "Women Earn " + formatAsPercentage(d.wagegap) + "&#162 for 1$ by Men")
            .style("left", (d3.event.pageX) + "px")   
            .style("top", (d3.event.pageY - 28) + "px");  
        })          
        .on("mouseout", function(d) {   
            chart2.tooltip.transition()    
                .duration(500)    
                .style("opacity", 0)
            d3.selectAll(".path2")
              .style("opacity", 0.8)
          })
      .attr('r', function (d) {
        if (app.options.filtered==="agg") {
          return 0;
        } else {
          return chart2.r(d.count);
        }
      })
      .attr('cx', function(d) { return chart2.x(d.rank); })
      .attr('cy',  function(d) { return chart2.y(d.earn); })
      .style('stroke', '#333')
      .style('fill', function (d) { return chart2.color([d.wagegap_group]);})
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
      .attr('y1',function (d) { return (chart2.y(d.values[0].earn)+chart2.y(d.values[1].earn))/2;})
      .attr('x2',function (d) {return chart2.x(d.values[0].rank)})
      .attr('y2',function (d) { return (chart2.y(d.values[0].earn)+chart2.y(d.values[1].earn))/2;})
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