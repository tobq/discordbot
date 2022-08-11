function selectRandom<T>(options: T[]): T {
    return options[Math.floor(Math.random() * options.length)]
}

type MessageTemplate = string | MessageTemplate[] | { ors: (string | MessageTemplate)[] }
export const MESSAGE_TEMPLATE: MessageTemplate[] = [
    {
        "ors":[
            "Yo",
            "Hey",
            "Whats up",
            "Whats good"
        ]
    },
    [
        [
            {
                "ors":[
                    "I ",
                    "We ",
                    ""
                ]
            },
            {
                "ors":[
                    "came across",
                    "found",
                    "saw your posts for"
                ]
            },
            " your ",
            {
                "ors":[
                    "kits",
                    "samples",
                    "sample packs"
                ]
            },
            [
                " on discord. "
            ],
            [
                {
                    "ors":[
                        "We ",
                        ""
                    ]
                },
                {
                    "ors":[
                        "We think its fire",
                        "love your content"
                    ]
                }
            ]
        ]
    ],
    [
        {
            "ors":[
                "We want to collaborate",
                [
                    {
                        "ors":[
                            "Were",
                            "We are"
                        ]
                    },
                    " interested in collaborating"
                ]
            ]
        },
        " with you on a new platform we've been working on called TwoShot; its a platform for sharing loops, drums and samples (which can be minted as NFTs), it also pairs with an audio VST plugin that allows users to easily load in samples into their music projects - similar to how Arcade works"
    ],
    [
        {
            "ors":[
                "We've",
                "we have"
            ]
        },
        {
            "ors":[
                " already ",
                " "
            ]
        },
        {
            "ors":[
                "partnered",
                "collaborated",
                "worked"
            ]
        },
        " with ",
        {
            "ors":[
                "creators",
                "names"
            ]
        },
        " ",
        {
            "ors":[
                "like",
                "such as"
            ]
        },
        " @ArdistBeats, @Lunch77beats, @FernoSpazzin, @Tripilz ",
        {
            "ors":[
                "and",
                "as well as"
            ]
        },
        {
            "ors":[
                " some",
                ""
            ]
        },
        " other music labels"
    ],
    [
        "Would you ",
        {
            "ors":[
                "be interested in becoming",
                [
                    "want to ",
                    {
                        "ors":[
                            "be",
                            "become"
                        ]
                    }
                ]
            ]
        },
        " part of our ",
        {
            "ors":[
                "official ",
                ""
            ]
        },
        [
            "roster of featured ",
            {
                "ors":[
                    "TwoShot ",
                    ""
                ]
            },
            {
                "ors":[
                    "content creators",
                    "artists",
                    "creators"
                ]
            },
            "?"
        ]
    ]
]
export function generateMessage(template: MessageTemplate): string {
    if (typeof template === "string")
        return template;
    if (template instanceof Array) {
        return template.map(generateMessage).join("");
    }
    return generateMessage(selectRandom(template.ors))
}