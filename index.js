// Generated by CoffeeScript 1.9.3
(function() {
  var Q, search,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  search = require('jira-search');

  Q = require('q');

  module.exports = function(params) {
    return Q().then(function() {
      var issueType, issueTypes;
      issueTypes = (function() {
        var i, len, ref, results;
        ref = params.issueTypes;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          issueType = ref[i];
          results.push(issueType.name);
        }
        return results;
      })();
      return search({
        serverRoot: params.serverRoot,
        strictSSL: params.strictSSL,
        user: params.user,
        pass: params.pass,
        jql: 'project = "' + params.project + '" and issueType in ("' + issueTypes.join('", "') + '") order by rank',
        fields: 'summary,issuelinks,status,issuetype',
        expand: '',
        maxResults: params.maxResults,
        onTotal: params.onTotal,
        mapCallback: function(issue) {
          var inwardIssue, inwardLinkTypes, issuelink;
          if (params.onIssue) {
            params.onIssue(issue);
          }
          inwardLinkTypes = ((function() {
            var i, len, ref, results;
            ref = params.issueTypes;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              issueType = ref[i];
              if (issueType.name === issue.fields.issuetype.name) {
                results.push(issueType.inwardLinkTypes);
              }
            }
            return results;
          })())[0];
          return {
            id: issue.id,
            issuetype: issue.fields.issuetype.name,
            key: issue.key,
            summary: issue.fields.summary,
            status: issue.fields.status.name,
            issuelinks: (function() {
              var i, len, ref, ref1, results;
              ref = issue.fields.issuelinks;
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                issuelink = ref[i];
                if (!(ref1 = issuelink.type.inward, indexOf.call(inwardLinkTypes, ref1) >= 0)) {
                  continue;
                }
                inwardIssue = issuelink.inwardIssue;
                results.push({
                  id: inwardIssue.id,
                  linktype: issuelink.type.inward,
                  issuetype: inwardIssue.fields.issuetype.name,
                  key: inwardIssue.key,
                  summary: inwardIssue.fields.summary,
                  status: inwardIssue.fields.status.name
                });
              }
              return results;
            })()
          };
        }
      });
    });
  };

}).call(this);
