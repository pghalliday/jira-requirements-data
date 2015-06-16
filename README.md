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
  requirements: [{
    name: 'Requirement',
    inwardLinkTypes: [
      'is covered by',
      'is implemented by'
    ],
    states: {
      done: [
        'done'
      ],
      ready: [
        'ready for deployment'
      ]
    }
  }, {
    name: 'Change Request',
    inwardLinkTypes: [
      'is covered by',
      'is implemented by'
    ],
    states: {
      done: [
        'done'
      ],
      ready: [
        'ready for deployment'
      ]
    }
  }, {
    name: 'Risk',
    inwardLinkTypes: [
      'is covered by'
    ],
    states: {
      done: [
        'done'
      ],
      ready: [
        'ready for deployment'
      ]
    }
  }],
  tasks: [{
    name: 'Bug',
    states: {
      done: [
        'resolved',
        'verified',
        'closed'
      ]
    }
  }, {
    name: 'Code Review',
    states: {
      done: [
        'done'
      ]
  }, {
    name: 'Story',
    states: {
      done: [
        'resolved',
        'verified',
        'closed'
      ]
  }, {
    name: 'Task',
    states: {
      done: [
        'done'
      ]
  }]
  onTotal: function (total) {
    // start a progress bar or something
  },
  onRequirement: function (requirement) {
    // update a progress bar or something
    // also the requirement data will be provided here
  }
}).then(function (requirements) {
  console.log(requirements);
}).done();
```

The requirements array will contain the following structured data

```javascript
[
  {
    id: 12345, // The issue ID
    issuetype: 'Requirement', // The issue type name
    key: 'KEY-123', // The issue key
    summary: 'Implement something', // The issue summary
    state: 'ready', // The issue state, one of ['notready', 'ready', 'done']
    issuelinks: [
      {
        id: 45321, // The linked issue id
        linktype: 'is covered by', // The link type name
        issuetype: 'Story', // The linked issue type name
        key: 'KEY-4535', // The linked issue key
        summary: 'As a user I want to do something so that I can get something', // The linked issue summary
        state: 'done', // The issue state, one of ['notdone', 'done']
      },
      ...
    ]
  },
  ...
]
```
