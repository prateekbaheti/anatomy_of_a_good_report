var r1 = 600 / 2;
var r0 = r1 - 20;


d3.json("../execution_results.js", function(json){
    var freq_table = {}; 
    var uniques= [];
  
    var scenarios = json.scenarios.map(function(s) {
      return {"name":s.name, "tags":(s.tags || s.runs[0].tags).map(function(t){return t.name})};
    });

    scenarios.forEach(function(scenario) {
      scenario.tags.forEach(function(tag) { freq_table[tag] = ++freq_table[tag] || 1;});
      uniques = uniques.concat(scenario.tags.filter(function(t) { return uniques.indexOf(t) == -1;}));
    }); 

    function compareFrequency(tag1,tag2) {
      return freq_table[tag2] - freq_table[tag1];
    }

    var top_ten_tags = uniques.sort(compareFrequency).slice(0,10);
  
    var top_scenarios = scenarios.filter(function(s) {
      for (t1 in top_ten_tags) {
        for (t2 in s.tags) {
          if (top_ten_tags[t1] == s.tags[t2]) {
            return true;
          }
        }
      }
      return false;
    });
    
    top_scenarios.forEach(function(s) {
      s.tags = s.tags.filter(function(t) {
        return top_ten_tags.indexOf(t) != -1;
      });
    });

    var matrix = [];
    for(i = 0; i < top_ten_tags.length; i++) {
        matrix[i] = new Array(top_ten_tags.length);
        for(j = 0; j < top_ten_tags.length; j++) {
          matrix[i][j] = 0;
        }
    }

    top_scenarios.forEach(function(s) {
      //for every scenario
      for (i in s.tags) {
        var m = top_ten_tags.indexOf(s.tags[i]);
        if (s.tags.length == 1) {
          matrix[m][m] = ++matrix[m][m] || 1;  
          continue;
        }
        for (j in s.tags) {
          var n = top_ten_tags.indexOf(s.tags[j]);
          if (m == n) continue;
          matrix[m][n] = ++matrix[m][n] || 1; 
          //matrix[n][m] = matrix[m][n];
        }
      }
    });

    var chord = d3.layout.chord()
        .padding(.05)
        .sortSubgroups(d3.descending)
        .matrix(matrix);

    var width = 700;
    var height = 600;
    var innerRadius = Math.min(width, height) * .41;
    var outerRadius = innerRadius * 1.1;

    var fill = d3.scale.category20();

    var svg = d3.select("#chorddiagram")
        .append("svg")
        .attr("class", "chords")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .attr("height", 700)
        .attr("width", width);

    var g = svg.selectAll("g.group")
        .data(chord.groups)
        .enter().append("svg:g")
        .attr("class", "group");


    g.append("g")
        .selectAll("path")
        .data(chord.groups)
        .enter()
        .append("path")
        .style("fill", function(d) {
            return fill(d.index);
        })
        .style("stroke", function(d) {
            return fill(d.index);
        })
        .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
        .on("mouseover", fade(.1))
        .on("mouseout", fade(1));

    g.append("svg:text")
        .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + (r0) + ")"
                + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .text(function(d) {
            var index = d.index;
            return top_ten_tags[index];
        });

    g.append("svg:text")
        .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d) {
            var angle = d.angle * (180 / Math.PI );
            return "rotate(" + (angle  - 88) + ")"
                + "translate(" + (outerRadius + 10) + ")"
                + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .text(function(d) {
            var index = d.index;
            return matrix[index][index];
        });

    svg.append("g")
        .attr("class", "chord")
        .selectAll("path")
        .data(chord.chords)
        .enter().append("path")
        .style("fill", function(d) { return fill(d.target.index); })
        .attr("d", d3.svg.chord().radius(innerRadius))
        .on("mouseover", function(d) {
            var source = d.source.index;
            var target = d.target.index;
            //do something meaningful
        })
        .style("opacity", 1);

    /** Returns an array of tick angles and labels, given a group. */
    function groupTicks(d) {
        var k = (d.endAngle - d.startAngle) / d.value;
        return d3.range(0, d.value, 1000).map(function(v, i) {
            return {
                angle: v * k + d.startAngle,
                label: d.value
            };
        });
    }

    /** Returns an event handler for fading a given chord group. */
    function fade(opacity) {
        return function(g, i) {
            svg.selectAll("g.chord path")
                .filter(function(d) {
                    return d.source.index != i && d.target.index != i;
                })
                .transition()
                .style("opacity", opacity);
        };
    }

    function commonElements(a1, a2) {
        var common = []
        a1.forEach(function(e1){
            a2.forEach(function(e2) {
                if(e1 == e2){
                    common.push(e1)
                }
            });
        });
        return common;
    }

    function elementsInAButNotInRest(j1, juices) {
        var uniques = [];
        juices.forEach(function(j) {
            row = d3.values(j)[1];
            if(row != j1) {
                commonElements(j1, row).forEach(function(elem) {
                    uniques.push(elem);
                });
            }
        });
        return getUnique(uniques);
    }

    function getUnique(array) {
        var result = [];
        array.forEach(function(item) {
            if(result.indexOf(item) == -1) {
                result.push(item);
            }
        });
        return result;
    }
});
d3.select(self.frameElement).style("height", "960px");
