"""FraudShield AI — SQLite Analyst Case Management & Queue Manager."""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

DB_PATH = Path(__file__).resolve().parents[1] / "data" / "cases.db"


def get_connection() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initialize the SQLite database schema if not already present."""
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS cases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                case_number TEXT UNIQUE NOT NULL,
                transaction_id TEXT,
                step INTEGER,
                tx_type TEXT,
                amount REAL,
                oldbalanceOrg REAL,
                newbalanceOrig REAL,
                oldbalanceDest REAL,
                newbalanceDest REAL,
                fraud_probability REAL,
                risk_score INTEGER,
                risk_level TEXT,
                recommendation TEXT,
                decision TEXT,
                decision_reason TEXT,
                triggered_rules_json TEXT,
                status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
                priority TEXT NOT NULL DEFAULT 'MEDIUM',
                assigned_to TEXT DEFAULT 'Unassigned',
                analyst_notes TEXT DEFAULT '',
                analyst_verdict TEXT DEFAULT 'UNVERIFIED',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)
        conn.commit()


def seed_sample_cases_if_empty() -> None:
    """Populate realistic sample analyst cases if the table is empty."""
    init_db()
    with get_connection() as conn:
        count = conn.execute("SELECT COUNT(*) FROM cases").fetchone()[0]
        if count > 0:
            return

        now = datetime.now(timezone.utc).isoformat()
        sample_cases = [
            (
                "CASE-2026-0001", "TXN-882194", 142, "TRANSFER", 450000.0, 500000.0, 50000.0, 0.0, 0.0,
                0.94, 94, "HIGH", "Immediate Block & Account Freeze", "BLOCK",
                "Blocked by Rule: High-Value Drain to Empty Destination",
                json.dumps([{"rule_id": "RULE-001", "rule_name": "High-Value Drain to Empty Destination", "severity": "CRITICAL"}]),
                "PENDING_REVIEW", "CRITICAL", "Sarah Connor", "Initial alert triggered automatically. High risk transfer to fresh account.",
                "UNVERIFIED", now, now
            ),
            (
                "CASE-2026-0002", "TXN-719302", 98, "CASH_OUT", 125000.0, 130000.0, 5000.0, 1000.0, 126000.0,
                0.78, 78, "HIGH", "Flag for Manual Review", "MANUAL_REVIEW",
                "Flagged for Manual Review by Rule: Complete Origin Account Depletion",
                json.dumps([{"rule_id": "RULE-002", "rule_name": "Complete Origin Account Depletion", "severity": "HIGH"}]),
                "UNDER_INVESTIGATION", "HIGH", "Alex Mercer", "Contacted cardholder to verify cash out transaction at branch #402.",
                "UNVERIFIED", now, now
            ),
            (
                "CASE-2026-0003", "TXN-654109", 204, "PAYMENT", 9500.0, 12000.0, 2500.0, 0.0, 0.0,
                0.12, 12, "LOW", "No Action Required", "ALLOW",
                "ML Risk Score and rules within acceptable limits.",
                json.dumps([]),
                "RESOLVED_LEGITIMATE", "LOW", "System Auto", "Verified standard utility payment behavior.",
                "CONFIRMED_LEGITIMATE", now, now
            ),
            (
                "CASE-2026-0004", "TXN-904128", 310, "TRANSFER", 890000.0, 890000.0, 0.0, 0.0, 890000.0,
                0.98, 98, "HIGH", "Freeze Destination Funds", "BLOCK",
                "Critical ML Risk Score (98/100) exceeded safety threshold.",
                json.dumps([{"rule_id": "RULE-003", "rule_name": "Ultra Large Amount Threshold", "severity": "CRITICAL"}]),
                "CONFIRMED_FRAUD", "CRITICAL", "Elena Rostova", "Confirmed unauthorized wire transfer attempt. Account credential takeover.",
                "CONFIRMED_FRAUD", now, now
            ),
        ]
        conn.executemany("""
            INSERT INTO cases (
                case_number, transaction_id, step, tx_type, amount, oldbalanceOrg, newbalanceOrig,
                oldbalanceDest, newbalanceDest, fraud_probability, risk_score, risk_level,
                recommendation, decision, decision_reason, triggered_rules_json, status, priority,
                assigned_to, analyst_notes, analyst_verdict, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sample_cases)
        conn.commit()


def create_case(tx_data: Dict[str, Any], pred_result: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new analyst case from prediction output."""
    init_db()
    now = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        count = conn.execute("SELECT COUNT(*) FROM cases").fetchone()[0]
        case_num = f"CASE-{datetime.now().year}-{count + 1001:04d}"
        tx_id = f"TXN-{int(datetime.now().timestamp() * 1000) % 1000000:06d}"

        score = pred_result.get("risk_score", 0)
        decision = pred_result.get("decision", "ALLOW")
        priority = "CRITICAL" if decision == "BLOCK" or score >= 85 else ("HIGH" if score >= 60 else "MEDIUM")

        conn.execute("""
            INSERT INTO cases (
                case_number, transaction_id, step, tx_type, amount, oldbalanceOrg, newbalanceOrig,
                oldbalanceDest, newbalanceDest, fraud_probability, risk_score, risk_level,
                recommendation, decision, decision_reason, triggered_rules_json, status, priority,
                assigned_to, analyst_notes, analyst_verdict, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            case_num, tx_id, tx_data.get("step", 1), tx_data.get("type", "TRANSFER"),
            float(tx_data.get("amount", 0.0)), float(tx_data.get("oldbalanceOrg", 0.0)),
            float(tx_data.get("newbalanceOrig", 0.0)), float(tx_data.get("oldbalanceDest", 0.0)),
            float(tx_data.get("newbalanceDest", 0.0)), float(pred_result.get("fraud_probability", 0.0)),
            int(score), str(pred_result.get("risk_level", "LOW")),
            str(pred_result.get("recommended_action", "")), str(decision),
            str(pred_result.get("decision_reason", "")),
            json.dumps(pred_result.get("triggered_rules", [])),
            "PENDING_REVIEW" if decision in ("BLOCK", "MANUAL_REVIEW") else "RESOLVED_LEGITIMATE",
            priority, "Unassigned", "", "UNVERIFIED", now, now
        ))
        conn.commit()
        return get_case_by_number(case_num)  # type: ignore


def list_cases(status: Optional[str] = None, priority: Optional[str] = None) -> List[Dict[str, Any]]:
    """List all cases with optional filtering."""
    init_db()
    seed_sample_cases_if_empty()
    query = "SELECT * FROM cases WHERE 1=1"
    params: List[Any] = []
    if status and status != "ALL":
        query += " AND status = ?"
        params.append(status)
    if priority and priority != "ALL":
        query += " AND priority = ?"
        params.append(priority)
    query += " ORDER BY id DESC"

    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["triggered_rules"] = json.loads(d.pop("triggered_rules_json") or "[]")
            result.append(d)
        return result


def get_case_by_number(case_number: str) -> Optional[Dict[str, Any]]:
    """Get case by case number."""
    init_db()
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM cases WHERE case_number = ?", (case_number,)).fetchone()
        if not row:
            return None
        d = dict(row)
        d["triggered_rules"] = json.loads(d.pop("triggered_rules_json") or "[]")
        return d


def update_case(
    case_number: str,
    status: Optional[str] = None,
    assigned_to: Optional[str] = None,
    notes: Optional[str] = None,
    verdict: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Update case status, assigned analyst, notes, or verdict."""
    init_db()
    existing = get_case_by_number(case_number)
    if not existing:
        return None

    now = datetime.now(timezone.utc).isoformat()
    new_status = status if status is not None else existing["status"]
    new_assign = assigned_to if assigned_to is not None else existing["assigned_to"]
    new_notes = notes if notes is not None else existing["analyst_notes"]
    new_verdict = verdict if verdict is not None else existing["analyst_verdict"]

    with get_connection() as conn:
        conn.execute("""
            UPDATE cases
            SET status = ?, assigned_to = ?, analyst_notes = ?, analyst_verdict = ?, updated_at = ?
            WHERE case_number = ?
        """, (new_status, new_assign, new_notes, new_verdict, now, case_number))
        conn.commit()

    return get_case_by_number(case_number)


def get_queue_metrics() -> Dict[str, Any]:
    """Summary statistics for analyst case queue."""
    init_db()
    seed_sample_cases_if_empty()
    with get_connection() as conn:
        total = conn.execute("SELECT COUNT(*) FROM cases").fetchone()[0]
        pending = conn.execute("SELECT COUNT(*) FROM cases WHERE status = 'PENDING_REVIEW'").fetchone()[0]
        investigating = conn.execute("SELECT COUNT(*) FROM cases WHERE status = 'UNDER_INVESTIGATION'").fetchone()[0]
        confirmed_fraud = conn.execute("SELECT COUNT(*) FROM cases WHERE analyst_verdict = 'CONFIRMED_FRAUD'").fetchone()[0]
        false_positive = conn.execute("SELECT COUNT(*) FROM cases WHERE analyst_verdict = 'FALSE_POSITIVE'").fetchone()[0]
        critical = conn.execute("SELECT COUNT(*) FROM cases WHERE priority = 'CRITICAL'").fetchone()[0]

    return {
        "total_cases": total,
        "pending_review": pending,
        "under_investigation": investigating,
        "confirmed_fraud": confirmed_fraud,
        "false_positives": false_positive,
        "critical_priority": critical,
    }
