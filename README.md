# jira-requirements-data

Promise based library to query a JIRA project and return a list of requirements and linked issues with their statuses.

For use in projects where requirements are collected then issues satisfying those requirements are created and linked using JIRA issue linking with a many to many relationship in an analysis phase.

Usage
-----

```
npm install jira-requirements-data
```

```javascript
var search = require('jira-requirements-data');

search({
  serverRoot: 'https://my.jira.server',
  strictSSL: true,
  user: 'myuser',
  pass: 'mypassword',
  maxResults: 50,
  project: 'myproject',
  issueTypes: [{
    name: 'Requirement',
    inwardLinkTypes: [
      'is covered by',
      'is implemented by',
    ]
  }, {
    name: 'Change Request',
    inwardLinkTypes: [
      'is covered by',
      'is implemented by',
    ]
  }, {
    name: 'Risk',
    inwardLinkTypes: [
      'is covered by'
    ]
  }],
  onTotal: function (total) {
    // start a progress bar or something
  },
  onIssue: function (issue) {
    // update a progress bar or something
    // also the raw issue data will be provided here
  }
}).then(function (issues) {
  console.log(issues);
}).done();
```

The issues array will contain the following structured data

```javascript
[
  {
    id: 12345, // The issue ID
    issuetype: 'Requirement', // The issue type name
    key: 'KEY-123', // The issue key
    summary: 'Implement something', // The issue summary
    status: 'Ready', // The issue status name
    issuelinks: [
      {
        id: 45321, // The linked issue id
        linktype: 'is covered by', // The link type name
        issuetype: 'Story', // The linked issue type name
        key: 'KEY-4535', // The linked issue key
        summary: 'As a user I want to do something so that I can get something', // The linked issue summary
        status: 'To Do' // The linked issue status
      },
      ...
    ]
  },
  ...
]
```
