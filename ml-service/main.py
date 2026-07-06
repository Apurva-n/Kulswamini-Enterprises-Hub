import os
import datetime
from fastapi import FastAPI
from pydantic import BaseModel
from bson import ObjectId
from pymongo import MongoClient
from dotenv import load_dotenv

app = FastAPI(title="Oil Parts ML Service", version="0.1.0")

# Load environment configuration
load_dotenv(dotenv_path="../backend/.env")
mongodb_uri = os.getenv("MONGODB_URI", "mongodb://[::1]:27017/oil-parts-platform")

# Initialize MongoDB Client
client = MongoClient(mongodb_uri)
try:
    db = client.get_default_database()
except Exception:
    db = client["oil-parts-platform"]

class ForecastRequest(BaseModel):
    product_id: str | None = None
    shop_id: str | None = None
    months: int = 1

class CreditRiskRequest(BaseModel):
    shop_id: str

@app.get("/health")
def health():
    try:
        # Simple ping to test DB connection
        client.admin.command('ping')
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    return {"status": "ok", "service": "ml-service", "database": db_status}

@app.post("/forecast/demand")
def forecast_demand(req: ForecastRequest):
    query = {"status": {"$in": ["confirmed", "dispatched", "delivered"]}}
    if req.shop_id:
        try:
            query["shopId"] = ObjectId(req.shop_id)
        except Exception:
            return {"status": "error", "message": "Invalid shop_id format"}

    orders = list(db["orders"].find(query).sort("orderDate", 1))

    from collections import defaultdict
    product_sales_by_month = defaultdict(lambda: defaultdict(float))

    for order in orders:
        order_date = order.get("orderDate")
        if not order_date:
            continue
        month_str = order_date.strftime("%Y-%m")

        for item in order.get("items", []):
            p_id = str(item.get("productId"))
            if req.product_id and p_id != req.product_id:
                continue
            qty = item.get("quantity", 0)
            product_sales_by_month[p_id][month_str] += qty

    forecasts = {}
    target_products = [req.product_id] if req.product_id else list(product_sales_by_month.keys())

    for p_id in target_products:
        sales = product_sales_by_month.get(p_id, {})
        if not sales:
            forecasts[p_id] = 0.0
            continue

        sorted_months = sorted(sales.keys())
        qty_list = [sales[m] for m in sorted_months]

        if len(qty_list) == 1:
            forecasts[p_id] = qty_list[0]
        elif len(qty_list) >= 2:
            # Moving average of up to last 3 months
            recent_qty = qty_list[-3:]
            forecasts[p_id] = round(sum(recent_qty) / len(recent_qty), 2)
        else:
            forecasts[p_id] = 0.0

    return {
        "status": "success",
        "forecasts": forecasts,
        "message": f"Calculated demand forecast for {len(forecasts)} products."
    }

@app.post("/score/credit-risk")
def score_credit_risk(req: CreditRiskRequest):
    try:
        shop_id = ObjectId(req.shop_id)
    except Exception:
        return {"status": "error", "message": "Invalid shop_id format"}

    shop = db["shops"].find_one({"_id": shop_id})
    if not shop:
        return {"status": "error", "message": "Shop not found"}

    ledger_entries = list(db["ledgerentries"].find({"shopId": shop_id}).sort("date", 1))

    if not ledger_entries:
        return {
            "status": "success",
            "risk_score": 0.0,
            "risk_level": "low",
            "reasons": ["No transactions found for this shop."]
        }

    current_balance = ledger_entries[-1].get("balanceAfter", 0)
    total_debit = sum(e.get("amount", 0) for e in ledger_entries if e.get("type") == "debit")

    reasons = []
    score_penalty = 0.0

    # 1. Outstanding Balance Ratio
    if total_debit > 0:
        outstanding_ratio = current_balance / total_debit
        if outstanding_ratio > 0.8:
            score_penalty += 40
            reasons.append("Very high unpaid balance relative to lifetime purchases.")
        elif outstanding_ratio > 0.5:
            score_penalty += 25
            reasons.append("Unpaid balance is more than 50% of lifetime purchases.")
        elif outstanding_ratio > 0.2:
            score_penalty += 10
            reasons.append("Moderate unpaid balance.")

    # 2. Payment delay / Recency
    last_payment = db["payments"].find_one({"shopId": shop_id}, sort=[("date", -1)])

    if last_payment:
        pay_date = last_payment.get("date")
        if isinstance(pay_date, datetime.datetime):
            # Calculate days since last payment (timezone-agnostic)
            now = datetime.datetime.now(pay_date.tzinfo) if pay_date.tzinfo else datetime.datetime.now()
            days_since_payment = (now - pay_date).days
            if days_since_payment > 60:
                score_penalty += 35
                reasons.append(f"No payment received in the last {days_since_payment} days.")
            elif days_since_payment > 30:
                score_penalty += 20
                reasons.append(f"No payment received in the last {days_since_payment} days.")
    else:
        if current_balance > 0:
            score_penalty += 45
            reasons.append("No payment has ever been recorded for this shop.")

    # 3. Absolute outstanding balance check
    if current_balance > 50000:
        score_penalty += 15
        reasons.append("High absolute outstanding balance (over ₹50,000).")

    risk_score = min(max(score_penalty, 0.0), 100.0)

    if risk_score >= 70:
        risk_level = "high"
    elif risk_score >= 30:
        risk_level = "medium"
    else:
        risk_level = "low"
        if not reasons:
            reasons.append("Good payment history and low outstanding balance.")

    return {
        "status": "success",
        "risk_score": risk_score,
        "risk_level": risk_level,
        "reasons": reasons
    }
