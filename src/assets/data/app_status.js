const app_status = [
    {
        text: 'Blank',
        value: 'null',
        sub: []
    },
    { 
        text: 'Awaiting Documents', 
        value: 'Awaiting Documents', 
        sub: [] 
    },
    {
        text: 'Document review',
        value: 'Document review',
    },
    {
        text: 'Do not contact (DNC)',
        value: 'Do not contact (DNC)',
        sub: [
            {
                text: 'Opted out',
                value: 'Opted out'
            },
            {
                text: 'Banned',
                value: 'Banned'
            },
            {
                text: 'International',
                value: 'International'
            },
            {
                text: 'Rejected',
                value: 'Rejected'
            },
        ]
    },
    {
        text: 'Existing Driver',
        value: 'Existing Driver',
    },
    {
        text: 'Ineligible',
        value: 'Ineligible',
        sub: [
            { 
                text: 'Underage', 
                value: 'Underage' 
            },
            { 
                text: 'Unqualified licence class', 
                value: 'Unqualified licence class' 
            },
            {
                text: 'Background check - Failed', 
                value: 'Background check - Failed' 
            },
            { 
                text: 'Driver Abstract - Failed', 
                value: 'Driver Abstract - Failed' 
            },
            { 
                text: 'Unqualified vehicle', 
                value: 'Unqualified vehicle' 
            },
            { 
                text: 'Rejected City Licence', 
                value: 'Rejected City Licence' 
            },
        ]
    },
    { 
        text: 'On Hold/Contact Later', 
        value: 'On Hold/Contact Later', 
        sub: [
            { 
                text: 'Upgrading License', 
                value: 'Upgrading License' 
            },
            { 
                text: 'License Upgrade Requested', 
                value: 'License Upgrade Requested' 
            },
        ] 
    },
    {
        text: 'Step 1 - Contact Info',
        value: 'Step 1 - Contact Info',
    },
    {
        text: 'Step 2 - Licence',
        value: 'Step 2 - Licence',
    },
    {
        text: 'Step 3 - Work Eligibility',
        value: 'Step 3 - Work Eligibility',
    },
    {
        text: 'Step 4 - Vehicle Ownership',
        value: 'Step 4 - Vehicle Ownership',
    },
    {
        text: 'Step 5 - Insurance',
        value: 'Step 5 - Insurance',
    },
    {
        text: 'Step 6 - Safety',
        value: 'Step 6 - Safety',
    },
    {
        text: 'Step 7 - Driver History',
        value: 'Step 7 - Driver History',
    },
    {
        text: 'Step 8 - Profile Picture',
        value: 'Step 8 - Profile Picture',
    },
    { 
        text: 'Unresponsive', 
        value: 'Unresponsive', 
        sub: [] 
    },
    
]

export default app_status