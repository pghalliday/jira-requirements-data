search = require 'jira-search'
sprints = require 'jira-sprints'
Q = require 'q'

module.exports = (params) ->
  sprintsLocal = (rapidView, onTotal, onSprint) ->
    sprints
      serverRoot: params.serverRoot
      strictSSL: params.strictSSL
      user: params.user
      pass: params.pass
      rapidView: rapidView
      onTotal: onTotal
      mapCallback: (report) ->
        sprint =
          id: report.sprint.id
          sequence: report.sprint.sequence
          startDate: report.sprint.startDate
          endDate: report.sprint.endDate
          completeDate: report.sprint.completeDate
          name: report.sprint.name
          state: report.sprint.state
        sprint.issues = (issue.id for issue in report.contents.completedIssues)
        if sprint.state isnt 'CLOSED'
          sprint.issues.push (issue.id for issue in report.contents.incompletedIssues)...
        onSprint(sprint) if onSprint
        sprint
  Q()
    .then ->
      requirementTypes = (requirementType.name for requirementType in params.requirements)
      taskTypes = (taskType.name for taskType in params.tasks)
      [
        sprintsLocal(
          params.requirementsRapidView
          params.onRequirementSprintsTotal
          params.onRequirementSprint
        )
        sprintsLocal(
          params.tasksRapidView
          params.onTaskSprintsTotal
          params.onTaskSprint
        )
        search
          serverRoot: params.serverRoot
          strictSSL: params.strictSSL
          user: params.user
          pass: params.pass
          jql: 'project = "' + params.project + '" and issueType in ("' + requirementTypes.join('", "') + '") order by rank'
          fields: 'summary,issuelinks,status,issuetype'
          expand: ''
          maxResults: params.maxResults
          onTotal: params.onRequirementsTotal
          mapCallback: (issue) ->
            requirementTypeName = issue.fields.issuetype.name
            [inwardLinkTypes, requirementStates] = ([requirementType.inwardLinkTypes, requirementType.states] for requirementType in params.requirements when requirementType.name is requirementTypeName)[0]
            requirementStateName = issue.fields.status.name
            requirementState = 'notready'
            requirementState = 'ready' if requirementStateName in requirementStates.ready
            requirementState = 'done' if requirementStateName in requirementStates.done
            requirement =
              id: issue.id
              issuetype: requirementTypeName
              key: issue.key
              summary: issue.fields.summary
              state: requirementState
              issuelinks: for issuelink in issue.fields.issuelinks when issuelink.type.inward in inwardLinkTypes
                inwardIssue = issuelink.inwardIssue
                taskTypeName = inwardIssue.fields.issuetype.name
                if taskTypeName in taskTypes
                  taskStates = (taskType.states for taskType in params.tasks when taskType.name is taskTypeName)[0]
                  taskStateName = inwardIssue.fields.status.name
                  taskState = 'notdone'
                  taskState = 'done' if taskStateName in taskStates.done
                  id: inwardIssue.id
                  linktype: issuelink.type.inward
                  issuetype: taskTypeName
                  key: inwardIssue.key
                  summary: inwardIssue.fields.summary
                  state: taskState
            params.onRequirement(requirement) if params.onRequirement
            requirement
      ]
    .spread (requirementSprints, taskSprints, requirements) ->
      requirementSprints: requirementSprints
      taskSprints: taskSprints
      requirements: requirements
