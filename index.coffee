search = require 'jira-search'
Q = require 'q'

module.exports = (params) ->
  Q()
    .then ->
      issueTypes = (issueType.name for issueType in params.issueTypes)
      search
        serverRoot: params.serverRoot
        strictSSL: params.strictSSL
        user: params.user
        pass: params.pass
        jql: 'project = "' + params.project + '" and issueType in ("' + issueTypes.join('", "') + '") order by rank'
        fields: 'summary,issuelinks,status,issuetype'
        expand: ''
        maxResults: params.maxResults
        onTotal: params.onTotal
        mapCallback: (issue) ->
          params.onIssue(issue) if params.onIssue
          inwardLinkTypes = (issueType.inwardLinkTypes for issueType in params.issueTypes when issueType.name is issue.fields.issuetype.name)[0]
          id: issue.id
          issuetype: issue.fields.issuetype.name
          key: issue.key
          summary: issue.fields.summary
          status: issue.fields.status.name
          issuelinks: for issuelink in issue.fields.issuelinks when issuelink.type.inward in inwardLinkTypes
            inwardIssue = issuelink.inwardIssue
            id: inwardIssue.id
            linktype: issuelink.type.inward
            issuetype: inwardIssue.fields.issuetype.name
            key: inwardIssue.key
            summary: inwardIssue.fields.summary
            status: inwardIssue.fields.status.name
