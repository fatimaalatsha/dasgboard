const emailTemplates = {
    "stage_1": [
        {
            document: "Driver's Licence Class",
            content:  "Full G Class"
        },
        {
            document: "Driver's Abstract Link",
            content: "https://www.services.gov.on.ca/wps85/portal/s2i/!ut/p/z1/dYvBCoJAFAC_pR_Yt7uF2tGCCgQtjMq9yNO15aG8FQyFvj7pZtBxhhkw8ADDOJLDF3nGbubCBGV0lIGONyrNknArLzeVRSeVrGWqoZiD8G9w0JCDAZNr2mHdXv0ZXQNFjcKzcH4UgybRz050yJbYCTsOi-FObP30u0xfu5jyhst9DH2L1fvpVh_SE-oq/",
        },
        {
            document: "Vehicle Insurance Limit",
            content: "Please provide a copy of the current automobile liability insurance with limits of not less than 2M.",
            default: "Please provide a copy of your vehicle insurance."
        },
    ],
    "stage_2": [
        {
            document: "Vehicle Safety",
            place: "Preferred Auto",
            address: "725 May St. N",
            number: "807-345-1234",
            cost: "$92+ tax",
            default: "If you have a go-to garage that offers you the best price, you may get your safety check done at your preferred garage. Please send us the safety certificate once you have it."
        },
        {
            document: "Background Check",
            content: "Get your background check at:",
            url: "https://www.tritoncanada.ca/personal"
        },
        {
            document: "Rideshare Driver-Insurance Verification",
            content: ""
        },
        {
            document: "City Licensing",
            content: "Get your vehicle inspection at:",
            url: "https://www.tritoncanada.ca/personal",
            cost: "$250"
        },
    ]
}

export default emailTemplates