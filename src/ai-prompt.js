const OpenAI = require('openai');

const analyzeContract = async (contract, apiKey) => {
    const openai = new OpenAI({
        apiKey: apiKey,
    });

    const params = {
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'user',
                content: `
                Your role and goal is to be an AI smart contract auditor. Your job is to perform an audit on the given smart contract.
                Here is the smart contract: ${contract}
                
                Please provide the results in the following JSON format for easy front-end display:
                
                {
                  "auditReport": "A detailed audit report of the smart contract, covering security, performance and any other relevant aspects",
                  "metricScores": [
                    {"metric": "Security", "score": 0-10},
                    {"metric": "Performance", "score": 0-10},
                    {"metric": "Other key Areas", "score": 0-10},
                    {"metric": "Gas Efficiency", "score": 0-10},
                    {"metric": "Code Quality", "score": 0-10},
                    {"metric": "Documentation", "score": 0-10}
                  ],
                  "suggestionsForImprovement": "Suggestions for improving the smart contract in terms of security, performance and any other identified weaknesses"
                }
                
                Ensure that your response is a valid JSON object.
                Thank You`,
            },
        ],
    };

    try {
        const chatCompletion = await openai.chat.completions.create(params);
        const rawContent = chatCompletion.choices[0].message.content;
        console.log("Raw API Response:");
        console.log(rawContent);

        let auditResults;
        try {
            auditResults = JSON.parse(rawContent);
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            console.log("Attempting to extract JSON from the response...");
            const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                auditResults = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Could not extract valid JSON from the response");
            }
        }

        console.log('\nAudit Report:');
        console.log(auditResults.auditReport);

        console.log('\nMetric Scores:');
        auditResults.metricScores.forEach((metric) => {
            console.log(`${metric.metric}: ${metric.score}/10`);
        });

        console.log('\nSuggestions for Improvement:');
        console.log(auditResults.suggestionsForImprovement);
    } catch (error) {
        console.error('Error during contract analysis:', error);
    }
};

module.exports = { analyzeContract };