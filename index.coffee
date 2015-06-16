search = require 'jira-search'
Q = require 'q'

module.exports = (params) ->
  Q()
    .then ->
      requirementTypes = (requirementType.name for requirementType in params.requirements)
      taskTypes = (taskType.name for taskType in params.tasks)
      search
        serverRoot: params.serverRoot
        strictSSL: params.strictSSL
        user: params.user
        pass: params.pass
        jql: 'project = "' + params.project + '" and issueType in ("' + requirementTypes.join('", "') + '") order by rank'
        fields: 'summary,issuelinks,status,issuetype'
        expand: ''
        maxResults: params.maxResults
        onTotal: params.onTotal
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
