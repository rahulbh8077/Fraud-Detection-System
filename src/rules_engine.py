"""FraudShield AI — Configurable Hybrid Rules Engine & Decision Matrix."""
from __future__ import annotations

from typing import Any, Dict, List, TypedDict, Literal


DecisionType = Literal["BLOCK", "MANUAL_REVIEW", "CHALLENGE", "ALLOW"]


class RuleDefinition(TypedDict):
    id: str
    name: str
    description: str
    action: DecisionType
    enabled: bool
    severity: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]


# Default Rule Registry
DEFAULT_RULES: List[RuleDefinition] = [
    {
        "id": "RULE-001",
        "name": "High-Value Drain to Empty Destination",
        "description": "Flag TRANSFER or CASH_OUT transaction over $50,000 where destination account remains $0.",
        "action": "BLOCK",
        "enabled": True,
        "severity": "CRITICAL",
    },
    {
        "id": "RULE-002",
        "name": "Complete Origin Account Depletion",
        "description": "Flag transactions draining >= 95% of origin balance when origin balance > $50,000.",
        "action": "MANUAL_REVIEW",
        "enabled": True,
        "severity": "HIGH",
    },
    {
        "id": "RULE-003",
        "name": "Ultra Large Amount Threshold",
        "description": "Require step-up authorization (2FA/OTP) for single transactions over $300,000.",
        "action": "CHALLENGE",
        "enabled": True,
        "severity": "MEDIUM",
    },
    {
        "id": "RULE-004",
        "name": "Severe Balance Computation Inconsistency",
        "description": "Flag transactions with origin or destination balance calculation error > $10,000.",
        "action": "MANUAL_REVIEW",
        "enabled": True,
        "severity": "HIGH",
    },
]


def evaluate_rules(transaction: Dict[str, Any], rules: List[RuleDefinition] | None = None) -> Dict[str, Any]:
    """Evaluate business rules against a single transaction dictionary.

    Expects transaction keys: step, type, amount, oldbalanceOrg, newbalanceOrig, oldbalanceDest, newbalanceDest
    """
    if rules is None:
        rules = DEFAULT_RULES

    triggered_rules: List[Dict[str, Any]] = []
    
    tx_type = str(transaction.get("type", "")).upper()
    amount = float(transaction.get("amount", 0.0))
    old_org = float(transaction.get("oldbalanceOrg", 0.0))
    new_org = float(transaction.get("newbalanceOrig", 0.0))
    old_dest = float(transaction.get("oldbalanceDest", 0.0))
    new_dest = float(transaction.get("newbalanceDest", 0.0))

    # Computed checks
    org_diff = old_org - new_org
    dest_diff = new_dest - old_dest
    org_error = abs(org_diff - amount) if tx_type != "CASH_IN" else 0.0
    dest_error = abs(dest_diff - amount) if tx_type in ("TRANSFER", "CASH_OUT") else 0.0

    for rule in rules:
        if not rule.get("enabled", True):
            continue

        rid = rule["id"]
        triggered = False
        reason = ""

        if rid == "RULE-001":
            if tx_type in ("TRANSFER", "CASH_OUT") and amount >= 50000 and new_dest == 0.0:
                triggered = True
                reason = f"Type is {tx_type}, amount ${amount:,.2f} >= $50,000, and new destination balance is $0.00."

        elif rid == "RULE-002":
            if old_org > 50000 and amount >= 0.95 * old_org and new_org <= 0.05 * old_org:
                triggered = True
                reason = f"Transaction amount ${amount:,.2f} depletes {((org_diff/old_org)*100):.1f}% of origin balance (${old_org:,.2f})."

        elif rid == "RULE-003":
            if amount >= 300000:
                triggered = True
                reason = f"Transaction amount ${amount:,.2f} exceeds threshold limit of $300,000.00."

        elif rid == "RULE-004":
            if org_error > 10000 or dest_error > 10000:
                triggered = True
                reason = f"Balance inconsistency detected (Origin error: ${org_error:,.2f}, Dest error: ${dest_error:,.2f})."

        if triggered:
            triggered_rules.append({
                "rule_id": rule["id"],
                "rule_name": rule["name"],
                "action": rule["action"],
                "severity": rule["severity"],
                "reason": reason,
            })

    return {
        "triggered_count": len(triggered_rules),
        "triggered_rules": triggered_rules,
    }


def compute_composite_decision(
    fraud_probability: float,
    risk_score: int,
    triggered_rules: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Combine ML Probability Score with Rule Engine Triggers to produce a final decision matrix output."""

    # Higher action hierarchy: BLOCK > MANUAL_REVIEW > CHALLENGE > ALLOW
    rule_actions = [r["action"] for r in triggered_rules]

    decision: DecisionType = "ALLOW"
    decision_reason = "ML Risk Score and rules are within acceptable limits."

    if "BLOCK" in rule_actions or risk_score >= 85:
        decision = "BLOCK"
        if "BLOCK" in rule_actions:
            matching = [r["rule_name"] for r in triggered_rules if r["action"] == "BLOCK"]
            decision_reason = f"Blocked by Rule: {', '.join(matching)}"
        else:
            decision_reason = f"Critical ML Risk Score ({risk_score}/100) exceeded safety threshold (85)."

    elif "MANUAL_REVIEW" in rule_actions or risk_score >= 60:
        decision = "MANUAL_REVIEW"
        if "MANUAL_REVIEW" in rule_actions:
            matching = [r["rule_name"] for r in triggered_rules if r["action"] == "MANUAL_REVIEW"]
            decision_reason = f"Flagged for Manual Review by Rule: {', '.join(matching)}"
        else:
            decision_reason = f"Elevated ML Risk Score ({risk_score}/100) requires analyst investigation."

    elif "CHALLENGE" in rule_actions or risk_score >= 35:
        decision = "CHALLENGE"
        if "CHALLENGE" in rule_actions:
            matching = [r["rule_name"] for r in triggered_rules if r["action"] == "CHALLENGE"]
            decision_reason = f"Step-up 2FA/OTP Authorization required by Rule: {', '.join(matching)}"
        else:
            decision_reason = f"Moderate ML Risk Score ({risk_score}/100) triggers security challenge."

    return {
        "decision": decision,
        "decision_reason": decision_reason,
        "requires_analyst_review": decision in ("BLOCK", "MANUAL_REVIEW"),
        "requires_stepup_auth": decision == "CHALLENGE",
    }
