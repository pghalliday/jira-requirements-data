# jira-requirements-data

Promise based library to query a JIRA project and return a list of requirements with the issues that have been linked to them to indicate that those issues satisfy the requirements

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
  issueTypes: [
    name: 'Requirement'
    inwardLinkTypes: [
      'is covered by'
      'is implemented by'
    ]
  ,
    name: 'Change Request'
    inwardLinkTypes: [
      'is covered by'
      'is implemented by'
    ]
  ,
    name: 'Risk'
    inwardLinkTypes: [
      'is covered by'
    ]
  ]
}).then(function (issues) {
  console.log(issues);
}).done();
```

The issues array will contain the following data

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
