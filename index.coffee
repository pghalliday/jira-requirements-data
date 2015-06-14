search = require 'jira-search'
Q = require 'q'

module.exports = (params) ->
  Q()
    .then ->
      search
        serverRoot: params.serverRoot
        strictSSL: params.strictSSL
        user: params.user
        pass: params.pass
        jql: 'project = "' + params.project + '" and issueType = "' + params.issueType + '"'
        fields: '*.all'
        expand: ''
        maxResults: params.maxResults
        onTotal: params.onTotal
        mapCallback: params.mapCallback
    .then (issues) ->
      console.log issues
