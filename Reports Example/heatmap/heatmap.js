var builds;

d3.csv("data.csv", function(data) {
  builds = d3.nest()
    .key(function(d) {return d.scenario})
    .sortValues(function(a,b) {
      return a.build-b.build;
    })
    .entries(data);

  var testResults = d3.select("body").select("#testResults")

  var scenarios = testResults.selectAll("div")
    .data(builds)
    .enter()
      .append("div")
      .attr("class","scenario");

  scenarios.append("div").attr("class","scenarioName").append("p").text(function(d) {return d.key});

  scenarios.selectAll(".run")
      .data(function(d){return d.values})
      .enter()
        .append("div")
        .attr("class",function(d) {return "run " + d.status;});

  var buildLabels = testResults.append("div").attr("class","buildLabels");
  buildLabels.append("div").attr("class","scenarioName");
  buildLabels.selectAll("p")
    .data(builds[0].values)
    .enter()
      .append("div")
      .attr("class","run")
      .append("p")
      .text(function(d){return d.build;});
});
