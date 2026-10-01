"""Streamlit UI for analytics, individual assessment, and bulk screening."""
from __future__ import annotations

import io
import json
from datetime import datetime, timezone

import pandas as pd
import plotly.express as px
import streamlit as st
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score

from src.config import METRICS_PATH, MODEL_FEATURES, TARGET, VALID_TYPES
from src.data_preprocessing import quality_report
from src.predict import load_model, predict_frame, predict_one

st.set_page_config(page_title="Online Fraud Detection", page_icon="🛡️", layout="wide")
ALIASES = {"transaction_id": ["nameorig", "transaction_id", "id"], "step": ["step", "time", "timestamp"], "type": ["type", "transaction_type"], "amount": ["amount", "transaction_amount"], "oldbalanceOrg": ["oldbalanceorg", "old_balance", "old_balance_origin"], "newbalanceOrig": ["newbalanceorig", "new_balance", "new_balance_origin"], "oldbalanceDest": ["oldbalancedest", "old_balance_dest"], "newbalanceDest": ["newbalancedest", "new_balance_dest"], "isFraud": ["isfraud", "fraud", "fraud_label", "target"]}


def infer_mapping(df):
    normalized = {c.lower().replace("_", ""): c for c in df.columns}
    return {key: next((normalized[a.replace("_", "")] for a in aliases if a.replace("_", "") in normalized), None) for key, aliases in ALIASES.items()}


def display_profile(df):
    report = quality_report(df)
    cols = st.columns(4)
    cols[0].metric("Rows", report["rows"]); cols[1].metric("Columns", report["columns"])
    cols[2].metric("Missing values", sum(report["missing_values"].values())); cols[3].metric("Duplicate rows", report["duplicate_rows"])
    with st.expander("Data quality report"):
        st.json(report)


def dashboard_page():
    st.title("ONLINE FRAUD DETECTION SYSTEM")
    st.caption("AI-powered transaction risk analysis")
    st.info("This is a machine-learning prototype for fraud-risk assessment, not a standalone financial decision system.")
    if METRICS_PATH.exists():
        report = json.loads(METRICS_PATH.read_text())
        cards = st.columns(4)
        cards[0].metric("Total transactions", f"{report['dataset_rows']:,}")
        cards[1].metric("Confirmed fraud", f"{report['fraud_count']:,}")
        cards[2].metric("Fraud rate", f"{report['fraud_rate']:.2%}")
        cards[3].metric("Selected model", report["selected_model"].replace("_", " ").title())
    else:
        st.warning("No trained model or calculated dashboard metrics yet. Add the real PaySim dataset and run the documented training command.")


def analyze_page():
    st.title("Analyze Transaction")
    with st.form("single"):
        left, right = st.columns(2)
        step = left.number_input("Step", min_value=0, value=1)
        kind = left.selectbox("Transaction type", sorted(VALID_TYPES))
        amount = left.number_input("Amount", min_value=0.0, value=1000.0)
        old_org = left.number_input("Origin previous balance", min_value=0.0, value=2000.0)
        new_org = right.number_input("Origin new balance", min_value=0.0, value=1000.0)
        old_dest = right.number_input("Destination previous balance", min_value=0.0, value=0.0)
        new_dest = right.number_input("Destination new balance", min_value=0.0, value=1000.0)
        submitted = st.form_submit_button("Analyze Transaction")
    if submitted:
        payload = {"step": step, "type": kind, "amount": amount, "oldbalanceOrg": old_org, "newbalanceOrig": new_org, "oldbalanceDest": old_dest, "newbalanceDest": new_dest}
        try:
            result = predict_one(payload)
            a, b, c = st.columns(3); a.metric("Prediction", result["prediction"]); b.metric("Fraud probability", f"{result['fraud_probability']:.1%}"); c.metric("Risk", f"{result['risk_score']}/100 — {result['risk_level']}")
            st.subheader("Top contributing factors"); st.write("\n".join(f"• {x}" for x in result["explanation"]))
            if result["risk_level"] == "HIGH": st.warning("Recommendation: flag for additional review; a prediction is not confirmed fraud.")
        except FileNotFoundError as error: st.error(str(error))


def upload_page():
    st.title("Upload & Check Dataset")
    st.caption("Upload only datasets you are authorized to analyze. Avoid unnecessary personal or sensitive financial information.")
    upload = st.file_uploader("Upload a CSV or Excel transaction dataset", type=["csv", "xlsx"])
    st.download_button("Download sample dataset (DEMO DATA — NOT REAL FINANCIAL DATA)", pd.DataFrame([{ "step": 1, "type": "PAYMENT", "amount": 1250, "oldbalanceOrg": 2000, "newbalanceOrig": 750, "oldbalanceDest": 0, "newbalanceDest": 1250 }]).to_csv(index=False), "sample_transactions.csv")
    if not upload: return
    try: df = pd.read_excel(upload) if upload.name.lower().endswith("xlsx") else pd.read_csv(upload)
    except Exception: st.error("The uploaded file could not be read. Check format and encoding."); return
    if df.empty: st.error("The uploaded dataset is empty."); return
    st.success(f"Uploaded {upload.name} ({len(df):,} rows, {len(df.columns)} columns)"); display_profile(df); st.dataframe(df.head(20), use_container_width=True)
    mapping = infer_mapping(df)
    st.subheader("Column mapping")
    selections = {}
    for feature in MODEL_FEATURES + [TARGET]:
        options = ["— not mapped —"] + list(df.columns)
        selections[feature] = st.selectbox(feature, options, index=options.index(mapping[feature]) if mapping.get(feature) in options else 0)
    usable = {k: v for k, v in selections.items() if v != "— not mapped —"}
    missing = [f for f in MODEL_FEATURES if f not in usable]
    if missing: st.warning("Dataset analytics are available, but ML screening is unavailable; missing: " + ", ".join(missing))
    if st.button("Run Fraud Analysis", type="primary"):
        if missing: return
        model_input = df.rename(columns={v: k for k, v in usable.items()})
        try: results = predict_frame(model_input)
        except FileNotFoundError as error: st.error(str(error)); return
        st.session_state["results"] = results; st.session_state["label_present"] = TARGET in usable
    if "results" not in st.session_state: return
    results = st.session_state["results"]
    cards = st.columns(5)
    cards[0].metric("Total", f"{len(results):,}"); cards[1].metric("Predicted fraud", int((results.predicted_fraud == "FRAUDULENT").sum())); cards[2].metric("Suspicious", int((results.predicted_fraud == "SUSPICIOUS").sum())); cards[3].metric("High risk", int((results.risk_level == "HIGH").sum())); cards[4].metric("Average risk", f"{results.fraud_probability.mean():.1%}")
    if st.session_state["label_present"]:
        actual = pd.to_numeric(results[TARGET], errors="coerce").fillna(0).astype(int)
        pred = (results.fraud_probability >= .5).astype(int)
        st.caption(f"Evaluation against supplied labels: accuracy {accuracy_score(actual,pred):.3f}; precision {precision_score(actual,pred,zero_division=0):.3f}; recall {recall_score(actual,pred,zero_division=0):.3f}; F1 {f1_score(actual,pred,zero_division=0):.3f}")
    else: st.info("This dataset does not contain verified fraud labels. Results are model predictions, not confirmed fraud.")
    st.plotly_chart(px.histogram(results, x="risk_level", color="risk_level", title="Risk level distribution"), use_container_width=True)
    st.plotly_chart(px.box(results, x="type", y="fraud_probability", title="Transaction type vs fraud probability"), use_container_width=True)
    st.subheader("Top 20 high-risk transactions"); st.dataframe(results.sort_values("fraud_probability", ascending=False).head(20), use_container_width=True)
    st.download_button("Download Results (CSV)", results.to_csv(index=False), "fraud_analysis_results.csv", "text/csv")


def performance_page():
    st.title("Model Performance")
    if not METRICS_PATH.exists():
        st.warning("Performance metrics appear after training on a real labeled dataset.")
        return
    report = json.loads(METRICS_PATH.read_text())
    st.caption("Model selection prioritizes PR-AUC, then recall, for class-imbalanced fraud screening.")
    st.dataframe(pd.DataFrame(report["model_comparison"]).T.rename_axis("model").reset_index(), use_container_width=True)
    st.write("False positives create unnecessary reviews; false negatives can leave fraud undetected. Thresholds should be tuned to the organization’s costs.")


def about_page():
    st.title("About the model")
    st.markdown("""**Methodology.** PaySim transaction fields are validated, then passed through a fitted preprocessing pipeline and a selected supervised classifier. The API never retrains during a request.

**Privacy.** Do not upload data unless you are authorized to analyze it. Avoid unnecessary identifiers and treat results as risk signals, not proof of wrongdoing.

**Limitations.** This prototype uses simulated PaySim data and lacks production signals such as device, location, merchant reputation, and reviewed outcomes. Data drift, concept drift, and model degradation must be monitored before production use.""")


pages = {"Dashboard": dashboard_page, "Analyze Transaction": analyze_page, "Upload & Check Dataset": upload_page, "Model Performance": performance_page, "About": about_page}
pages[st.sidebar.radio("Navigate", list(pages))]()
