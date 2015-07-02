// Generated by CoffeeScript 1.9.3
(function() {
  var Q, search, sprints,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  search = require('jira-search');

  sprints = require('jira-sprints');

  Q = require('q');

  module.exports = function(params) {
    var sprintsLocal;
    sprintsLocal = function(rapidView, onTotal, onSprint) {
      return sprints({
        serverRoot: params.serverRoot,
        strictSSL: params.strictSSL,
        user: params.user,
        pass: params.pass,
        rapidView: rapidView,
        onTotal: onTotal,
        mapCallback: function(report) {
          var issue, ref, sprint;
          sprint = {
            id: report.sprint.id,
            sequence: report.sprint.sequence,
            startDate: report.sprint.startDate,
            endDate: report.sprint.endDate,
            completeDate: report.sprint.completeDate,
            name: report.sprint.name,
            state: report.sprint.state
          };
          sprint.issues = (function() {
            var i, len, ref, results;
            ref = report.contents.completedIssues;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              issue = ref[i];
              results.push(issue.id);
            }
            return results;
          })();
          if (sprint.state === !'CLOSED') {
            (ref = sprint.issues).push.apply(ref, (function() {
              var i, len, ref, results;
              ref = report.contents.incompletedIssues;
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                issue = ref[i];
                results.push(issue.id);
              }
              return results;
            })());
          }
          if (onSprint) {
            onSprint(sprint);
          }
          return sprint;
        }
      });
    };
    return Q().then(function() {
      var requirementType, requirementTypes, taskType, taskTypes;
      requirementTypes = (function() {
        var i, len, ref, results;
        ref = params.requirements;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          requirementType = ref[i];
          results.push(requirementType.name);
        }
        return results;
      })();
      taskTypes = (function() {
        var i, len, ref, results;
        ref = params.tasks;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          taskType = ref[i];
          results.push(taskType.name);
        }
        return results;
      })();
      return [
        sprintsLocal(params.requirementsRapidView, params.onRequirementSprintsTotal, params.onRequirementSprint), sprintsLocal(params.tasksRapidView, params.onTaskSprintsTotal, params.onTaskSprint), search({
          serverRoot: params.serverRoot,
          strictSSL: params.strictSSL,
          user: params.user,
          pass: params.pass,
          jql: 'project = "' + params.project + '" and issueType in ("' + requirementTypes.join('", "') + '") order by rank',
          fields: 'summary,issuelinks,status,issuetype',
          expand: '',
          maxResults: params.maxResults,
          onTotal: params.onTotal,
          mapCallback: function(issue) {
            var inwardIssue, inwardLinkTypes, issuelink, ref, requirement, requirementState, requirementStateName, requirementStates, requirementTypeName, taskState, taskStateName, taskStates, taskTypeName;
            requirementTypeName = issue.fields.issuetype.name;
            ref = ((function() {
              var i, len, ref, results;
              ref = params.requirements;
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                requirementType = ref[i];
                if (requirementType.name === requirementTypeName) {
                  results.push([requirementType.inwardLinkTypes, requirementType.states]);
                }
              }
              return results;
            })())[0], inwardLinkTypes = ref[0], requirementStates = ref[1];
            requirementStateName = issue.fields.status.name;
            requirementState = 'notready';
            if (indexOf.call(requirementStates.ready, requirementStateName) >= 0) {
              requirementState = 'ready';
            }
            if (indexOf.call(requirementStates.done, requirementStateName) >= 0) {
              requirementState = 'done';
            }
            requirement = {
              id: issue.id,
              issuetype: requirementTypeName,
              key: issue.key,
              summary: issue.fields.summary,
              state: requirementState,
              issuelinks: (function() {
                var i, len, ref1, ref2, results;
                ref1 = issue.fields.issuelinks;
                results = [];
                for (i = 0, len = ref1.length; i < len; i++) {
                  issuelink = ref1[i];
                  if (!(ref2 = issuelink.type.inward, indexOf.call(inwardLinkTypes, ref2) >= 0)) {
                    continue;
                  }
                  inwardIssue = issuelink.inwardIssue;
                  taskTypeName = inwardIssue.fields.issuetype.name;
                  if (indexOf.call(taskTypes, taskTypeName) >= 0) {
                    taskStates = ((function() {
                      var j, len1, ref3, results1;
                      ref3 = params.tasks;
                      results1 = [];
                      for (j = 0, len1 = ref3.length; j < len1; j++) {
                        taskType = ref3[j];
                        if (taskType.name === taskTypeName) {
                          results1.push(taskType.states);
                        }
                      }
                      return results1;
                    })())[0];
                    taskStateName = inwardIssue.fields.status.name;
                    taskState = 'notdone';
                    if (indexOf.call(taskStates.done, taskStateName) >= 0) {
                      taskState = 'done';
                    }
                    results.push({
                      id: inwardIssue.id,
                      linktype: issuelink.type.inward,
                      issuetype: taskTypeName,
                      key: inwardIssue.key,
                      summary: inwardIssue.fields.summary,
                      state: taskState
                    });
                  } else {
                    results.push(void 0);
                  }
                }
                return results;
              })()
            };
            if (params.onRequirement) {
              params.onRequirement(requirement);
            }
            return requirement;
          }
        })
      ];
    });
  };

}).call(this);
