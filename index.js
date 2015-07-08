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
          if (sprint.state !== 'CLOSED') {
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
          user: params.user,
          pass: params.pass,
          jql: 'project = "' + params.project + '" and issueType in ("' + requirementTypes.join('", "') + '") and status not in ("' + params.excludedStates.join('", "') + '") order by rank',
          fields: 'summary,issuelinks,status,issuetype',
          expand: '',
          maxResults: params.maxResults,
          onTotal: params.onRequirementsTotal,
          mapCallback: function(issue) {
            var inwardIssue, inwardLinkTypes, issuelink, issuelinkFilter, ref, requirement, requirementState, requirementStateName, requirementStates, requirementTypeName;
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
            issuelinkFilter = function(issuelink) {
              var inwardIssue, ref1, taskStateName, taskStates, taskTypeName;
              if (ref1 = issuelink.type.inward, indexOf.call(inwardLinkTypes, ref1) >= 0) {
                inwardIssue = issuelink.inwardIssue;
                taskTypeName = inwardIssue.fields.issuetype.name;
                if (indexOf.call(taskTypes, taskTypeName) >= 0) {
                  taskStates = ((function() {
                    var i, len, ref2, results;
                    ref2 = params.tasks;
                    results = [];
                    for (i = 0, len = ref2.length; i < len; i++) {
                      taskType = ref2[i];
                      if (taskType.name === taskTypeName) {
                        results.push(taskType.states);
                      }
                    }
                    return results;
                  })())[0];
                  taskStateName = inwardIssue.fields.status.name;
                  if (!(indexOf.call(params.excludedStates, taskStateName) >= 0)) {
                    issuelink.taskState = 'notdone';
                    if (indexOf.call(taskStates.done, taskStateName) >= 0) {
                      issuelink.taskState = 'done';
                    }
                    return true;
                  }
                }
              }
            };
            requirement = {
              id: issue.id,
              issuetype: requirementTypeName,
              key: issue.key,
              summary: issue.fields.summary,
              state: requirementState,
              issuelinks: (function() {
                var i, len, ref1, results;
                ref1 = issue.fields.issuelinks;
                results = [];
                for (i = 0, len = ref1.length; i < len; i++) {
                  issuelink = ref1[i];
                  if (!(issuelinkFilter(issuelink))) {
                    continue;
                  }
                  inwardIssue = issuelink.inwardIssue;
                  results.push({
                    id: inwardIssue.id,
                    linktype: issuelink.type.inward,
                    issuetype: inwardIssue.fields.issuetype.name,
                    key: inwardIssue.key,
                    summary: inwardIssue.fields.summary,
                    state: issuelink.taskState
                  });
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
    }).spread(function(requirementSprints, taskSprints, requirements) {
      return {
        requirementSprints: requirementSprints,
        taskSprints: taskSprints,
        requirements: requirements
      };
    });
  };

}).call(this);
