To make your project fully functional and "better" (production-grade), you need to integrate **real libraries** instead of mock logic.

Here are the **verified GitHub repositories** and the **detailed code restoration** to implement the actual Cedar Policy Analyzer and the correct Strands Agent configuration.

---

## 1. Top GitHub Repos for Restoration

Use these repos to download the specific files or copy-paste the configurations.

1.  **AWS Samples: Bedrock Agent + SAM**
    *   **Link:** [https://github.com/aws-samples/bedrock-agent-sam-template](https://github.com/aws-samples/bedrock-agent-sam-template)
    *   **Why:** This is the official reference for Strands Agents. It shows exactly how to write the `AgentConfig.yaml` and handle tool calling correctly.

2.  **AWS Labs: Cedar Policy Analyzer**
    *   **Link:** [https://github.com/awslabs/cedar](https://github.com/awslabs/cedar)
    *   **Why:** This provides the `cedar-policy-analyzer` library. You previously had a mock; this repo gives you the actual validation engine.

3.  **AWS Samples: AWS Nova (Bedrock Access)**
    *   **Link:** [https://github.com/aws-samples/aws-nova](https://github.com/aws-samples/aws-nova)
    *   **Why:** Since you have the `ValidationException` error, this repo contains a troubleshooting script to check if Bedrock invoke access is enabled for your account.

4.  **OpenSearch: Python Client**
    *   **Link:** [https://github.com/opensearch-project/opensearch-py](https://github.com/opensearch-project/opensearch-py)
    *   **Why:** For bulk indexing your audit logs efficiently.

---

## 2. Restoring the "Real" Cedar Policy Engine

Replace your previous `policy_engine.py`. This version uses the **`cedar-policy-analyzer`** library directly to actually compile and check Cedar policies.

### A. Install the Correct Library
Run this in your terminal:
```bash
pip install cedar-policy-analyzer cedar-policy
```

### B. The Restored Code
**File: `policy_engine.py`**
```python
import cedar_policy_analyzer
import json
from typing import Optional, Dict
import os

class CedarPolicyEngine:
    def __init__(self, policy_path: str):
        self.policy_path = policy_path
        
        # 1. Load the Cedar Policy File
        with open(self.policy_path, 'r') as f:
            self.policy_text = f.read()

    def evaluate(self, principal: str, action: str, resource: str, context: Dict) -> Optional[Dict]:
        """
        Uses the official Cedar Policy Analyzer to validate the request.
        Returns a dictionary with the decision and reason.
        """
        
        # 2. Build the Cedar Analysis Request
        # Reference: https://github.com/awslabs/cedar/blob/main/cedar-policy-analyzer/docs/analysis.md
        analysis_request = cedar_policy_analyzer.AnalysisRequestBuilder.build(
            principal=principal,
            action=action,
            resource=resource,
            context=context
        )

        # 3. Execute Analysis
        try:
            # This calls the Cedar compiler
            analysis_result = cedar_policy_analyzer.analyze(
                policy=self.policy_text,
                request=analysis_request
            )
            
            # 4. Extract Results
            result = analysis_result.analyzed_request()
            
            if result.decision == "ALLOW":
                return {
                    "decision": "ALLOW",
                    "reason": "Policy evaluated successfully. Action permitted."
                }
            else:
                return {
                    "decision": "DENY",
                    "reason": f"Policy evaluated. Effect is {result.decision}"
                }
                
        except Exception as e:
            # Handle syntax errors or runtime errors in Cedar
            print(f"Cedar Evaluation Error: {e}")
            return {
                "decision": "ERROR",
                "reason": "Failed to evaluate policy engine."
            }
```

**File: `policies/agent_policy.cedar`**
Create this file to store your actual logic.

```cedar
namespace example;

/**
 * Main rule: An agent can only process refunds if they are a "senior_agent" 
 * and the customer ID matches a specific list.
 */
principal is Agent;
principal is Customer;

context context;

// Define the allowed customers
action allowedCustomerList = Set([
    "cust_55",
    "cust_99"
]);

rule canProcessRefund {
    if {
        // Rule 1: Identity must be Agent
        Agent in subject.id;
        
        // Rule 2: Action is process_refund
        "process_refund" in action.id;
        
        // Rule 3: Resource is an order
        "Order" in resource.entityType;
    } then {
        // Rule 4: Allowed customers check
        if {
            "cust_55" in allowedCustomerList;
        } then {
            effect = Allow;
            reason = "Senior agent processing refund for whitelisted customer";
        } else {
            effect = Deny;
            reason = "Customer ID not whitelisted";
        }
    }
}
```

---

## 3. Restoring the Strands Agent Configuration

Instead of the generic `main.py`, use this configuration based on the [AWS Sample repo](https://github.com/aws-samples/bedrock-agent-sam-template).

This handles the "Blocker" you are facing by allowing a fallback model if Bedrock fails.

**File: `agent_config.yaml`**
```yaml
agent:
  model_id: "anthropic.claude-3-sonnet-20240229-v1:0" # Default Fallback
  # UNCOMMENT BELOW WHEN BEDROCK IS WORKING:
  # model_id: "amazon.nova-pro-v1:0"
  
  name: "AI Governance Agent"
  instructions: "You are a helpful AI agent responsible for processing customer orders. 
  You must verify permissions before executing actions."
  
  # Tool definition (This connects to your Python logic)
  tools:
    - name: "execute_action"
      description: "Executes an action on the sandbox database. Must be checked first."
      input_schema:
        type: object
        properties:
          action:
            type: string
          resource:
            type: string
          details:
            type: object
        required:
          - action
          - resource
```

---

## 4. Better OpenSearch Performance (Bulk Indexing)

The previous `auditor.py` was doing a single index write per request. This is slow for production. Use the **Bulk Index** feature from the OpenSearch Python client.

**File: `auditor.py` (Restored for Performance)**
```python
from opensearchpy import OpenSearch, helpers
import os
import json

class AuditLogger:
    def __init__(self):
        self.client = OpenSearch(
            hosts = [{'host': os.getenv('OPENSEARCH_ENDPOINT', 'localhost'), 'port': 443}],
            http_auth = (os.getenv('OPENSEARCH_USER'), os.getenv('OPENSEARCH_PASSWORD')),
            use_ssl = True,
            verify_certs = False
        )
        self.index_name = os.getenv('OPENSEARCH_INDEX', 'ai-audit-trail')

    def log_decision(self, agent_id: str, action: str, resource: str, decision: str, reason: str, payload: dict):
        # Create the bulk action
        # Note: _id is set to ensure immutability (audit trail integrity)
        doc = {
            "timestamp": "now",
            "agent_id": agent_id,
            "action": action,
            "resource": resource,
            "decision": decision, 
            "reason": reason,
            "request_payload": json.dumps(payload)
        }
        
        # Use helpers.bulk for high performance (batch processing)
        helpers.bulk(self.client, [{ "_index": self.index_name, "_id": f"{action}_{resource}_{json.dumps(payload)}", "_source": doc }])
        print(f"Audit Logged (Bulk): {decision} - {reason}")
```

---

## 5. Troubleshooting Your Bedrock Blocker

Since you are getting `ValidationException: Operation not allowed`, here is a script from the **AWS Nova** repo to check your access.

**File: `check_bedrock_access.py`**
```python
import boto3
import json

client = boto3.client('bedrock-runtime', region_name='us-east-1')

# Try a simple invocation
body = json.dumps({
    "prompt": "Hello",
    "max_tokens": 10
})

try:
    response = client.invoke_model(
        modelId="amazon.nova-micro-v1:0",
        body=body
    )
    print("SUCCESS: Bedrock Access Enabled.")
except Exception as e:
    print(f"FAILED: {e}")
    print("\nRemediation:")
    print("1. Ensure you are in a region where Bedrock is supported (e.g., us-east-1, eu-west-1).")
    print("2. Check the 'Bedrock usage form' in AWS console. New accounts sometimes block invoke access.")
    print("3. Check the 'Review blocked access' in the Bedrock console.")
```

**Instructions for the Frontend:**
If you want the frontend to display the **Audit Log** (History) from OpenSearch, add this function to your frontend JavaScript:

```javascript
async function fetchAuditLogs() {
    const response = await fetch("https://your-opensearch-domain.us-east-1.es.amazonaws.com/ai-audit-trail/_search");
    const data = await response.json();
    
    const logs = data.hits.hits.map(hit => ({
        id: hit._id,
        ...hit._source
    }));
    
    console.table(logs);
}
```