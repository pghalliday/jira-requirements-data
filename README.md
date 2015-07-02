# jira-requirements-data

Promise based library to query a JIRA project and return a list of requirements and linked issues with their statuses.

For use in projects where requirements are collected then issues satisfying those requirements are created and linked using JIRA issue linking with a many to many relationship in an analysis phase.

Usage
-----

```
npm install jira-requirements-data
```

```javascript
var jiraRequirementsData = require('jira-requirements-data');

jiraRequirementsData({
  serverRoot: 'https://my.jira.server',
  strictSSL: true,
  user: 'myuser',
  pass: 'mypassword',
  maxResults: 50,
  project: 'myproject',
  requirementsRapidView: 123,
  tasksRapidView: 456,
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
    }
  }, {
    name: 'Story',
    states: {
      done: [
        'resolved',
        'verified',
        'closed'
      ]
    }
  }, {
    name: 'Task',
    states: {
      done: [
        'done'
      ]
    }
  }]
  onRequirementSprintsTotal: function (total) {
    // start a progress bar or something
  },
  onRequirementSprint: function (sprint) {
    // update a progress bar or something
    // also the requirement sprint data will be provided here
  },
  onTaskSprintsTotal: function (total) {
    // start a progress bar or something
  },
  onTaskSprint: function (sprint) {
    // update a progress bar or something
    // also the task sprint data will be provided here
  },
  onRequirementsTotal: function (total) {
    // start a progress bar or something
  },
  onRequirement: function (requirement) {
    // update a progress bar or something
    // also the requirement data will be provided here
  }
}).spread(function (requirementSprints, taskSprints, requirements) {
  console.log(requirementSprints);
  console.log(taskSprints);
  console.log(requirements);
}).done();
```

The `requirementSprints` and `taskSprints` arrays will contain the following structured data

```javascript
[
  {
    id: 123, // The sprint ID
    sequence: 4561, // The sprint sequence number (for ordering in the rapid view)
    startDate: '13/May/14 5:38 PM', // The sprint start date
    endDate: '27/May/14 5:38 PM', // The sprint end date
    completeDate: '20/Jun/14 5:38 PM', // The sprint complete date (when the sprint was actually closed)
    name: 'My Sprint', // The sprint name
    state: 'CLOSED', // The sprint state, one of ['CLOSED', 'FUTURE', 'ACTIVE']
    issues = [ // Array of issue IDs associated with the sprint
      12345,
      45678,
      ...
    ]
  },
  ...
]
```

The `requirements` array will contain the following structured data

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
