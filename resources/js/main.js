
// Now entering D3 land. Enjoy your stay!

var Graph = {

  _data: [],
  _colors: [],
  _focus: null,

  setData: function(args) {
    for (var key in args) {
      if (args.hasOwnProperty(key)) {
        this['_' + key] = args[key];
      }
    }
    return this;
  },
  render: function() {

    var statsGraph = d3.select('#sd-stats-graph');
    var $statsGraph = $(statsGraph[0]);

    function createSubject(fill, filteredData, pointsFill) {

      var statsGraphSubject = statsGraph.append('g')
        .attr('class', 'sd-stats-graph-subject');
      statsGraphSubject.append('path')
        .attr('class', 'sd-stats-graph-area')
        .attr('fill', fill)
        .attr('d', statsGraphArea(filteredData));
      statsGraphSubject.append('path')
        .attr('class', 'sd-stats-graph-line')
        .attr('d', statsGraphLine(filteredData));

      if (pointsFill) {

        var statsGraphPoint = statsGraphSubject.append('g')
          .attr('class', 'sd-stats-graph-points')
          .selectAll('.sd-stats-graph-point')
            .data(data.reverse())
          .enter().append('g')
            .attr('class', 'sd-stats-graph-point')
            .attr('transform', function(d, i) {
              return 'translate(' + statsGraphScale.x(data.length - 1 - i) + ', ' + statsGraphScale.y(d.goals) + ')';
            });

        var statsGraphLabel = statsGraphPoint.append('g')
          .attr('class', 'sd-stats-graph-label');
        var statsGraphLabelTextSize = 10;
        statsGraphLabel.append('path')
          .attr('d', 'M0,0L24,0');
        var statsGraphLabelText = statsGraphLabel.append('text')
          .text(function(d) {
            return d.name;
          })
          .attr('transform', 'translate(36, 4)')
          .attr('font-size', statsGraphLabelTextSize);
        statsGraphLabel.insert('rect', 'text')
          .attr('width', function(d, i) {
            return statsGraphLabelText[0][i].getBBox().width + 24;
          })
          .attr('height', statsGraphLabelTextSize + 10)
          .attr('transform', 'translate(24, ' + ((statsGraphLabelTextSize + 10) / -2) +')');

        statsGraphPoint.append('circle')
          .attr('r', 3)
          .attr('fill', pointsFill);
        statsGraphPoint.append('circle')
          .attr('r', 3)
          .attr('fill', '#fff');
      }
    }
    function createSubjects(subjects) {
      subjects.forEach(function(subject) {
        createSubject(subject.fill, subject.data, subject.pointsFill);
      });
    }

    function createLegend(subjects) {
      var legendHeight = 24;
      var statsGraphLegend = statsGraph.append('g')
        .attr('class', 'sd-stats-graph-legend')
        .attr('transform', 'translate(' + (statsGraphConfig.width - legendHeight) + ', 0)');
      subjects.forEach(function(subject, index) {
        var statsGraphLegendItem = statsGraphLegend.append('g')
          .attr('transform', 'translate(0, ' + ((legendHeight + 16) * index) + ')');
        statsGraphLegendItem.append('text')
          .text(subject.label)
          .attr('text-anchor', 'end')
          .attr('transform', 'translate(-16, 17)');
        statsGraphLegendItem.append('rect')
          .attr('width', legendHeight)
          .attr('height', legendHeight)
          .attr('fill', subject.fill);
      });
    }

    if (this._data.length) {

      $statsGraph.empty();

      var data = this._data.sort(function(a, b) {
        return b[this._focus] - a[this._focus];
      }.bind(this));

      var statsGraphConfig = {
        width: $statsGraph.width(),
        height: $statsGraph.height(),
        margin: {
          top: parseInt($statsGraph.css('padding-top')),
          right: parseInt($statsGraph.css('padding-right')),
          bottom: parseInt($statsGraph.css('padding-bottom')),
          left: parseInt($statsGraph.css('padding-left'))
        }
      };
      var statsGraphScale = {
        x: d3.scale.linear()
          .domain([0, data.length])
          .range([0, statsGraphConfig.width]),
        y: d3.scale.linear()
          .domain([0, d3.max(data, function(d) {
            return d.points;
          })])
          .range([statsGraphConfig.height, 0])
      };
      var statsGraphAxis = {
        x: d3.svg.axis().scale(statsGraphScale.x).orient('bottom').ticks(0),
        y: d3.svg.axis().scale(statsGraphScale.y).orient('left')
      };

      statsGraph = statsGraph.append('svg')
        .attr('width', statsGraphConfig.width + (statsGraphConfig.margin.right + statsGraphConfig.margin.left))
        .attr('height', statsGraphConfig.height + (statsGraphConfig.margin.top + statsGraphConfig.margin.bottom))
      .append('g')
        .attr('transform', 'translate(' + statsGraphConfig.margin.left + ', ' + statsGraphConfig.margin.top + ')');

      // Add axes
      var statsGraphAxes = statsGraph.append('g')
        .attr('class', 'sd-stats-graph-axes');
      statsGraphAxes.append('g')
        .attr('class', 'sd-stats-graph-axis')
        .attr('transform', 'translate(0, ' + statsGraphConfig.height + ')')
        .call(statsGraphAxis.x)
        .append('text')
          .attr('class', 'sd-stats-graph-axis-label')
          .attr('transform', 'translate(' + (statsGraphConfig.width / 2) + ', 24)')
          .attr('text-anchor', 'middle')
          .text('Players');
      statsGraphAxes.append('g')
        .attr('class', 'sd-stats-graph-axis')
        .call(statsGraphAxis.y);

      var statsGraphLine = d3.svg.line()
        .x(function(d, i) {
          return statsGraphScale.x(i);
        })
        .y(function(d) {
          return statsGraphScale.y(d);
        });
      var statsGraphArea = d3.svg.area()
        .x(function(d, i) {
          return statsGraphScale.x(i);
        })
        .y0(statsGraphConfig.height)
        .y1(function(d) {
          return statsGraphScale.y(d);
        });

      // Plot subjects
      var dataSubjects = [
        {
          label: 'Points',
          fill: '#fff',
          data: data.map(function(d) {
            return d.points;
          })
        },
        {
          label: 'Assists',
          fill: 'url(#diagonal-lines)',
          data: data.map(function(d) {
            return d.assists;
          })
        },
        {
          label: 'Goals',
          fill: 'url(#dots)',
          data: data.map(function(d) {
            return d.goals;
          }),
          pointsFill: this._colors[1]
        }
      ];
      createSubjects(dataSubjects);
      createLegend(dataSubjects);
    }
  }
};

$(window).on('resize', function() {
  Graph.render();
});

// Now leaving D3 land. Thanks for visiting!
// 
// Now entering Backbone land. Enjoy your stay!

// Set the default underscore template variable
_.templateSettings.variable = 'data';

var StatsView = Backbone.View.extend({
  template: _.template($('#template-sd-stats').html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    Graph.setData({
      data: this.model.get('players').toJSON(),
      colors: this.model.get('colors'),
      focus: 'goals'
    }).render();
  }
});

var Player = Backbone.Model.extend();
var Players = Backbone.Collection.extend({
  model: Player
});

var Team = Backbone.Model.extend({
  initialize: function(attributes) {
    this.set({players: new Players(attributes.players)});
  }
});
var Teams = Backbone.Collection.extend({
  model: Team
});

var teams = new Teams();
teams.fetch({
  url: '/data/teams.json',
  reset: true
});

var TeamItemView = Backbone.View.extend({

  tagName: 'div',
  className: 'sd-team-item',
  template: _.template($('#template-sd-team-item').html()),
  events: {
    'click': 'onClick'
  },

  onClick: function() {
    this.$el.addClass('sd-selected')
      .siblings().removeClass('sd-selected');
    var statsView = new StatsView({
      model: this.model,
      el: '#sd-stats'
    });
    statsView.render();
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});
var TeamsListView = Backbone.View.extend({
  initialize: function() {
    this.listenTo(this.collection, 'reset', this.render);
  },
  render: function() {
    this.$el.empty();
    this.collection.each(function(team) {
      var teamItemView = new TeamItemView({
        model: team
      });
      this.$el.append(teamItemView.render().el);
    }, this);
    return this;
  }
});

var teamsListView = new TeamsListView({
  collection: teams,
  el: '#sd-teams-list'
});
teamsListView.render();
