from flask import Flask, request, jsonify
from flask_cors import CORS
try:
    from pycaret.regression import load_model, predict_model
    PYCARET_AVAILABLE = True
except Exception:
    PYCARET_AVAILABLE = False
import pandas as pd
import numpy as np
from pymongo import MongoClient
from datetime import datetime, timedelta, timezone
import bcrypt
import jwt
import os
import json
import subprocess
import sys
from functools import wraps
from bson import ObjectId

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS"
    return response


@app.errorhandler(500)
def handle_500(e):
    response = jsonify({"error": "Internal server error", "detail": str(e)})
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response, 500


@app.errorhandler(Exception)
def handle_uncaught(e):
    response = jsonify({"error": "Internal server error", "detail": str(e)})
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response, 500

# ── Config ────────────────────────────────────────────────────────────────────
JWT_SECRET = os.environ.get("JWT_SECRET", "energyiq_secret_key_2025")
JWT_EXPIRY_HOURS = 24
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
CARBON_FACTOR = 0.82
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SEASON_MAP = {
    "January": "Winter", "February": "Winter", "March": "Summer",
    "April": "Summer", "May": "Summer", "June": "Monsoon",
    "July": "Monsoon", "August": "Monsoon", "September": "Monsoon",
    "October": "Autumn", "November": "Autumn", "December": "Winter",
}

MONTH_ORDER = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

WEEKLY_FACTORS = {"Mon": 0.95, "Tue": 0.88, "Wed": 1.02, "Thu": 1.10,
                  "Fri": 1.18, "Sat": 0.92, "Sun": 0.75}

# ── MongoDB ───────────────────────────────────────────────────────────────────
mongo_available = False
client = None
db = None
users_col = predictions_col = energy_col = alerts_col = model_col = None

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")
    db = client["energyiq"]
    users_col = db["users"]
    predictions_col = db["predictions"]
    energy_col = db["energy_records"]
    alerts_col = db["alerts"]
    model_col = db["model_metadata"]
    mongo_available = True
    try:
        users_col.create_index("email", unique=True)
        predictions_col.create_index("user_id")
        for col, field in [(energy_col, "Month"), (alerts_col, "user_id")]:
            try:
                col.create_index(field)
            except Exception:
                pass
    except Exception:
        pass
except Exception as e:
    print(f"Warning: MongoDB not available ({e}). Start MongoDB service to enable full functionality.")


def ensure_data_seeded():
    if not mongo_available:
        return
    try:
        if energy_col.estimated_document_count() == 0:
            from seed_db import seed
            seed()
    except Exception as e:
        print(f"Warning: could not seed data ({e})")


KEEP_COLS = [
    "Month", "Season", "Hostel_Rooms", "Occupied_Rooms", "Occupancy_Percentage",
    "Students", "Building_Age_Years", "Floors", "Hostel_Area_sqft", "Mess_Area_sqft",
    "Daily_Mess_Attendance", "Breakfast_Meals", "Lunch_Meals", "Dinner_Meals",
    "Kitchen_Equipment", "AC_Units", "Fans", "Lights", "Computers",
    "WiFi_Access_Points", "Washing_Machines", "Water_Pumps", "Solar_Panels",
    "Solar_Generation_kWh", "Outdoor_Temperature_C", "Humidity_Percentage",
    "Water_Consumption_Liters", "Generator_Hours", "Power_Outage_Hours",
    "Peak_Load_kW", "Electricity_Tariff_RsPerkWh", "Urban",
    "Monthly_Electricity_kWh", "Monthly_Electricity_Bill_Rs", "Occupancy_Percentage",
]


def get_energy_df():
    if mongo_available:
        try:
            records = list(energy_col.find({}, {"_id": 0}))
            if records:
                df = pd.DataFrame(records)
                df = df[[c for c in KEEP_COLS if c in df.columns]]
                return df
        except Exception:
            pass
    csv_path = os.path.join(BASE_DIR, "hostel.csv")
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        return df[[c for c in KEEP_COLS if c in df.columns]]
    return pd.DataFrame()

# ── ML Model ──────────────────────────────────────────────────────────────────
model = None
numpy_model = None
model_path = os.path.join(BASE_DIR, "best_model")
numpy_model_path = os.path.join(BASE_DIR, "model_weights.json")


def load_ml_model():
    global model, numpy_model
    model = None
    if PYCARET_AVAILABLE:
        try:
            model = load_model(model_path)
            return True
        except Exception:
            pass
    try:
        with open(numpy_model_path) as f:
            numpy_model = json.load(f)
        return True
    except Exception:
        numpy_model = None
        return False


def run_prediction(input_df):
    if model is not None:
        result = predict_model(model, data=input_df)
        return max(1000, round(float(result["prediction_label"].iloc[0])))
    if numpy_model is not None:
        drop_cols = [c for c in ["Hostel_ID", "Monthly_Electricity_Bill_Rs", "Monthly_Electricity_kWh"] if c in input_df.columns]
        input_df = input_df.drop(columns=drop_cols, errors="ignore")
        row = pd.get_dummies(input_df, columns=["Month", "Season"], drop_first=True)
        cols = numpy_model["columns"][1:]
        vec = [1.0]
        for col in cols:
            vec.append(float(row[col].iloc[0]) if col in row.columns else 0.0)
        pred = float(np.dot(numpy_model["coefficients"], vec))
        return max(1000, round(pred))
    raise RuntimeError("No model loaded")


def get_monthly_stats(df):
    monthly = []
    for m in MONTH_ORDER:
        mdf = df[df["Month"] == m]
        if len(mdf) > 0:
            monthly.append({
                "month": m,
                "consumption": round(mdf["Monthly_Electricity_kWh"].mean()),
                "bill": round(mdf["Monthly_Electricity_Bill_Rs"].mean()),
            })
    return monthly


def get_predictions_by_month(user_id):
    """Return stored ML predictions grouped by month with kwh, bill, carbon."""
    if not mongo_available:
        return {}
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": "$month",
            "kwh": {"$avg": "$result.kwh"},
            "bill": {"$avg": "$result.bill"},
            "carbon": {"$avg": "$result.carbon"},
            "count": {"$sum": 1},
        }},
    ]
    result = {}
    for doc in predictions_col.aggregate(pipeline):
        month = doc["_id"]
        if month:
            result[month[:3]] = {
                "kwh": round(doc["kwh"]),
                "bill": round(doc["bill"]),
                "carbon": round(doc["carbon"]),
                "count": doc["count"],
            }
    return result


def compute_distribution(df):
    if df.empty:
        return []
    total_ac = df["AC_Units"].mean()
    total_lights = df["Lights"].mean()
    total_fans = df["Fans"].mean()
    total_pumps = df["Water_Pumps"].mean()
    total_washing = df["Washing_Machines"].mean()
    raw = [total_ac * 3, total_lights * 1.5, total_fans * 0.8, total_pumps * 2, total_washing * 1.2]
    raw_sum = sum(raw) or 1
    colors = ["#2563EB", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899"]
    names = ["Air Conditioning", "Lighting", "Kitchen", "Water Pumps", "Laundry"]
    distribution = [
        {"name": names[i], "value": round(raw[i] / raw_sum * 100), "color": colors[i]}
        for i in range(5)
    ]
    total_pct = sum(d["value"] for d in distribution)
    distribution.append({"name": "Other", "value": max(0, 100 - total_pct), "color": "#6B7280"})
    return distribution


def compute_season_data(df):
    seasons = ["Summer", "Monsoon", "Winter", "Autumn"]
    season_data = []
    for s in seasons:
        sdf = df[df["Season"] == s]
        if len(sdf) > 0:
            season_data.append({
                "season": s,
                "block_a": round(sdf["Monthly_Electricity_kWh"].quantile(0.75)),
                "block_b": round(sdf["Monthly_Electricity_kWh"].quantile(0.50)),
                "block_c": round(sdf["Monthly_Electricity_kWh"].quantile(0.25)),
            })
    return season_data


def compute_hostel_blocks(df):
    if df.empty:
        return []
    q_vals = df["Monthly_Electricity_kWh"].quantile([0.25, 0.5, 0.75, 1.0])
    max_kwh = q_vals[1.0] or 1
    blocks = []
    for label, q, eff_base in [
        ("Block A", 1.0, 72), ("Block B", 0.75, 78),
        ("Block C", 0.5, 84), ("Block D", 0.25, 91),
    ]:
        consumption = round(q_vals[q])
        efficiency = min(99, round(eff_base + (1 - consumption / max_kwh) * 10))
        blocks.append({"block": label, "consumption": consumption, "efficiency": efficiency})
    return blocks


def compute_weekly(df):
    if df.empty:
        return []
    base = df["Monthly_Electricity_kWh"].mean() / 30
    return [{"day": day, "kwh": round(base * factor)} for day, factor in WEEKLY_FACTORS.items()]


def compute_heatmap(df):
    if df.empty:
        return []
    base = df["Monthly_Electricity_kWh"].mean() / 30
    peak_load_avg = df["Peak_Load_kW"].mean() or 1
    heatmap = []
    for day_idx, day in enumerate(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]):
        day_factor = WEEKLY_FACTORS[day]
        for hour in range(24):
            if 6 <= hour <= 9:
                hour_factor = 1.3
            elif 12 <= hour <= 16:
                hour_factor = 1.5
            elif 18 <= hour <= 22:
                hour_factor = 1.2
            elif 0 <= hour <= 5:
                hour_factor = 0.4
            else:
                hour_factor = 0.8
            kwh = base * day_factor * hour_factor
            load_pct = min(100, round((kwh / peak_load_avg) * 100 * 0.3))
            heatmap.append({"hour": hour, "day": day, "value": load_pct})
    return heatmap


def compute_top_consumers(df):
    if df.empty:
        return []
    avg_kwh = df["Monthly_Electricity_kWh"].mean()
    tariff_avg = df["Electricity_Tariff_RsPerkWh"].mean()
    total_ac = df["AC_Units"].mean()
    total_lights = df["Lights"].mean()
    total_fans = df["Fans"].mean()
    total_pumps = df["Water_Pumps"].mean()
    total_washing = df["Washing_Machines"].mean()
    raw = [total_ac * 3, total_lights * 1.5, total_fans * 0.8, total_pumps * 2, total_washing * 1.2]
    raw_sum = sum(raw) or 1
    categories = [
        ("Air Conditioning", raw[0]), ("Lighting", raw[1]),
        ("Kitchen Equipment", raw[2]), ("Water Pumps", raw[3]),
        ("Laundry", raw[4]),
    ]
    consumers = []
    for cat, weight in categories:
        share = round(weight / raw_sum * 100)
        kwh = round(avg_kwh * share / 100)
        consumers.append({
            "category": cat, "kwh": kwh,
            "cost": round(kwh * tariff_avg), "share": share,
        })
    misc_share = max(0, 100 - sum(c["share"] for c in consumers))
    if misc_share > 0:
        kwh = round(avg_kwh * misc_share / 100)
        consumers.append({
            "category": "Miscellaneous", "kwh": kwh,
            "cost": round(kwh * tariff_avg), "share": misc_share,
        })
    return sorted(consumers, key=lambda x: x["kwh"], reverse=True)


def compute_kpi_changes(df):
    if df.empty or len(df) < 2:
        return {"kwhChange": "0%", "billChange": "0%", "occupancyChange": "0%", "solarChange": "0%",
                "kwhPositive": True, "billPositive": True, "occupancyPositive": True, "solarPositive": True}
    months_present = df["Month"].unique()
    if len(months_present) >= 2:
        recent = df[df["Month"].isin(months_present[-2:])]
        older = df[~df["Month"].isin(months_present[-2:])]
        if len(older) > 0:
            def pct_change(new, old):
                if old == 0:
                    return "0%", True
                p = ((new - old) / old) * 100
                return f"{'+' if p >= 0 else ''}{p:.1f}%", p >= 0
            kwh_c, kwh_p = pct_change(recent["Monthly_Electricity_kWh"].mean(), older["Monthly_Electricity_kWh"].mean())
            bill_c, bill_p = pct_change(recent["Monthly_Electricity_Bill_Rs"].mean(), older["Monthly_Electricity_Bill_Rs"].mean())
            occ_c, occ_p = pct_change(recent["Occupancy_Percentage"].mean(), older["Occupancy_Percentage"].mean())
            sol_c, sol_p = pct_change(recent["Solar_Generation_kWh"].mean(), older["Solar_Generation_kWh"].mean())
            return {
                "kwhChange": kwh_c, "billChange": bill_c,
                "occupancyChange": occ_c, "solarChange": sol_c,
                "kwhPositive": bool(kwh_p), "billPositive": bool(bill_p),
                "occupancyPositive": bool(occ_p), "solarPositive": bool(sol_p),
            }
    return {"kwhChange": "0%", "billChange": "0%", "occupancyChange": "0%", "solarChange": "0%",
            "kwhPositive": True, "billPositive": True, "occupancyPositive": True, "solarPositive": True}


def build_prediction_input(data):
    month = data.get("month", "August")
    season = data.get("season") or SEASON_MAP.get(month, "Summer")
    rooms = int(data.get("rooms", 120))
    students = int(data.get("students", 480))
    occupancy = float(data.get("occupancy", 85))
    fans = int(data.get("fans", 240))
    lights = int(data.get("lights", 360))
    ac_units = int(data.get("ac_units", 60))
    temperature = float(data.get("temperature", 34))
    humidity = float(data.get("humidity", 72))
    water = float(data.get("water", 1200))
    kitchen = float(data.get("kitchen", 8))
    laundry = float(data.get("laundry", 6))
    solar = float(data.get("solar", 420))
    tariff = float(data.get("tariff", 4.50))
    peak_load = float(data.get("peak_load", 180))
    building_age = int(data.get("building_age", 10))
    generator_hours = float(data.get("generator_hours", 3.0))
    outage_hours = float(data.get("power_outage_hours", 2.0))
    urban = int(data.get("urban", 1))

    occupied_rooms = round(rooms * occupancy / 100)
    floors = max(2, rooms // 50)
    area = rooms * 250
    mess_area = round(area * 0.18)
    daily_attendance = round(students * 0.85)

    return pd.DataFrame([{
        "Month": month[:3],
        "Season": season,
        "Hostel_Rooms": rooms,
        "Occupied_Rooms": occupied_rooms,
        "Occupancy_Percentage": occupancy,
        "Students": students,
        "Building_Age_Years": building_age,
        "Floors": floors,
        "Hostel_Area_sqft": area,
        "Mess_Area_sqft": mess_area,
        "Daily_Mess_Attendance": daily_attendance,
        "Breakfast_Meals": daily_attendance,
        "Lunch_Meals": round(daily_attendance * 0.95),
        "Dinner_Meals": round(daily_attendance * 0.97),
        "Kitchen_Equipment": int(kitchen * 3),
        "AC_Units": ac_units,
        "Fans": fans,
        "Lights": lights,
        "Computers": round(students * 0.15),
        "WiFi_Access_Points": max(5, rooms // 10),
        "Washing_Machines": max(1, rooms // 20),
        "Water_Pumps": max(1, floors // 2),
        "Solar_Panels": 1 if solar > 0 else 0,
        "Solar_Generation_kWh": solar,
        "Outdoor_Temperature_C": temperature,
        "Humidity_Percentage": humidity,
        "Water_Consumption_Liters": water,
        "Generator_Hours": generator_hours,
        "Power_Outage_Hours": outage_hours,
        "Peak_Load_kW": peak_load,
        "Electricity_Tariff_RsPerkWh": tariff,
        "Urban": urban,
    }]), month, season, tariff


# ── Startup ───────────────────────────────────────────────────────────────────
ensure_data_seeded()
model_loaded = load_ml_model()
if model_loaded and mongo_available:
    try:
        model_col.update_one(
            {"name": "best_model"},
            {"$set": {"status": "ready", "updated_at": datetime.now(timezone.utc)}},
            upsert=True,
        )
    except Exception:
        pass


# ── JWT Helpers ───────────────────────────────────────────────────────────────
def create_token(user_id: str, email: str, name: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"error": "Token missing"}), 401
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            request.user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated


def format_time_ago(dt):
    if isinstance(dt, str):
        return dt
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = now - dt
    hours = int(diff.total_seconds() / 3600)
    if hours < 1:
        return "just now"
    if hours < 24:
        return f"{hours}h ago"
    days = hours // 24
    return f"{days}d ago"


# ── Auth Routes ───────────────────────────────────────────────────────────────
@app.route("/auth/register", methods=["POST"])
def register():
    if not mongo_available:
        return jsonify({"error": "MongoDB is not running. Start the MongoDB service."}), 503
    data = request.json or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if users_col.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    result = users_col.insert_one({
        "name": name,
        "email": email,
        "password": hashed,
        "role": "admin",
        "created_at": datetime.now(timezone.utc),
    })

    user_id = str(result.inserted_id)
    token = create_token(user_id, email, name)
    return jsonify({"token": token, "user": {"id": user_id, "name": name, "email": email, "role": "admin"}}), 201


@app.route("/auth/login", methods=["POST"])
def login():
    if not mongo_available:
        return jsonify({"error": "MongoDB is not running. Start the MongoDB service."}), 503
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = users_col.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode(), user["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    user_id = str(user["_id"])
    token = create_token(user_id, email, user["name"])
    users_col.update_one({"_id": user["_id"]}, {"$set": {"last_login": datetime.now(timezone.utc)}})

    return jsonify({
        "token": token,
        "user": {"id": user_id, "name": user["name"], "email": email, "role": user.get("role", "admin")},
    })


@app.route("/auth/me", methods=["GET"])
@token_required
def me():
    if not mongo_available:
        return jsonify({"user": request.user})
    user = users_col.find_one({"email": request.user["email"]}, {"password": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404
    user["id"] = str(user.pop("_id"))
    if "created_at" in user:
        user["created_at"] = user["created_at"].isoformat()
    return jsonify({"user": user})


# ── Predict Route ─────────────────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
@token_required
def predict():
    if model is None and numpy_model is None:
        return jsonify({"error": "ML model not loaded. Run train_light.py or train.py first."}), 503

    data = request.json or {}
    hostel = data.get("hostel", "Block A")
    input_df, month, season, tariff = build_prediction_input(data)

    predicted_kwh = run_prediction(input_df)

    df = get_energy_df()
    month_short = month[:3]
    month_data = df[df["Month"] == month_short]["Monthly_Electricity_kWh"] if not df.empty else pd.Series()
    if len(month_data) > 0:
        mean_kwh = month_data.mean()
        std_kwh = month_data.std() if month_data.std() > 0 else 1
        z = abs(predicted_kwh - mean_kwh) / std_kwh
        confidence = max(70, min(98, round(95 - z * 5)))
        pct = ((predicted_kwh - mean_kwh) / mean_kwh) * 100
        trend = f"{'+' if pct >= 0 else ''}{pct:.1f}%"
    else:
        confidence = 88
        trend = "0.0%"

    bill = round(predicted_kwh * tariff)
    carbon = round(predicted_kwh * CARBON_FACTOR)
    efficiency = "A" if predicted_kwh < 6000 else "B" if predicted_kwh < 10000 else "C"

    prediction_record = {
        "user_id": request.user["user_id"],
        "user_email": request.user["email"],
        "hostel": hostel,
        "month": month,
        "season": season,
        "inputs": data,
        "result": {
            "kwh": predicted_kwh,
            "bill": bill,
            "confidence": confidence,
            "efficiency": efficiency,
            "carbon": carbon,
            "trend": trend,
        },
        "created_at": datetime.now(timezone.utc),
    }
    if mongo_available:
        predictions_col.insert_one(prediction_record)

    return jsonify({
        "kwh": predicted_kwh,
        "bill": bill,
        "confidence": confidence,
        "efficiency": efficiency,
        "carbon": carbon,
        "trend": trend,
    })


# ── Alerts Routes ────────────────────────────────────────────────────────────
@app.route("/alerts", methods=["GET"])
@token_required
def get_alerts():
    if not mongo_available:
        return jsonify({"alerts": []})
    user_id = request.user["user_id"]
    items = list(alerts_col.find(
        {"$or": [{"user_id": user_id}, {"user_id": "system"}]},
        {"_id": 1, "type": 1, "title": 1, "desc": 1, "created_at": 1, "read": 1}
    ).sort("created_at", -1).limit(50))
    for a in items:
        a["id"] = str(a.pop("_id"))
        if "created_at" in a:
            a["time"] = format_time_ago(a.pop("created_at"))
    return jsonify({"alerts": items})


@app.route("/alerts/stats", methods=["GET"])
@token_required
def alert_stats():
    if not mongo_available:
        return jsonify({"total": 0, "critical": 0, "warnings": 0, "resolved": 0})
    user_id = request.user["user_id"]
    query = {"$or": [{"user_id": user_id}, {"user_id": "system"}]}
    total = alerts_col.count_documents(query)
    critical = alerts_col.count_documents({**query, "type": "error"})
    warnings = alerts_col.count_documents({**query, "type": "warning"})
    resolved = alerts_col.count_documents({**query, "read": True})
    return jsonify({"total": total, "critical": critical, "warnings": warnings, "resolved": resolved})


@app.route("/alerts", methods=["POST"])
@token_required
def create_alert():
    if not mongo_available:
        return jsonify({"error": "MongoDB required for alerts"}), 503
    data = request.json or {}
    if not data.get("title") or not data.get("type"):
        return jsonify({"error": "title and type are required"}), 400
    result = alerts_col.insert_one({
        "user_id": request.user["user_id"],
        "type": data["type"],
        "title": data["title"],
        "desc": data.get("desc", ""),
        "read": False,
        "created_at": datetime.now(timezone.utc),
    })
    return jsonify({"id": str(result.inserted_id)}), 201


@app.route("/alerts/<alert_id>", methods=["PATCH"])
@token_required
def update_alert(alert_id):
    if not mongo_available:
        return jsonify({"error": "MongoDB required"}), 503
    alerts_col.update_one(
        {"_id": ObjectId(alert_id), "user_id": {"$in": [request.user["user_id"], "system"]}},
        {"$set": {"read": True}}
    )
    return jsonify({"ok": True})


@app.route("/alerts/<alert_id>", methods=["DELETE"])
@token_required
def delete_alert(alert_id):
    if not mongo_available:
        return jsonify({"error": "MongoDB required"}), 503
    alerts_col.delete_one({"_id": ObjectId(alert_id), "user_id": request.user["user_id"]})
    return jsonify({"ok": True})


@app.route("/alerts/mark-all-read", methods=["POST"])
@token_required
def mark_all_read():
    if not mongo_available:
        return jsonify({"ok": True})
    user_id = request.user["user_id"]
    alerts_col.update_many(
        {"$or": [{"user_id": user_id}, {"user_id": "system"}], "read": False},
        {"$set": {"read": True}}
    )
    return jsonify({"ok": True})


# ── Recommendations Route ─────────────────────────────────────────────────────
@app.route("/recommendations", methods=["GET"])
@token_required
def recommendations():
    df = get_energy_df()
    if df.empty:
        return jsonify({"recommendations": [], "totalSavings": 0, "co2Reduction": 0})

    avg_kwh = df["Monthly_Electricity_kWh"].mean()
    avg_tariff = df["Electricity_Tariff_RsPerkWh"].mean()
    avg_solar = df["Solar_Generation_kWh"].mean()

    recs = [
        {
            "id": 1, "priority": "high", "category": "Lighting",
            "title": "Replace Fluorescent Lighting with LED",
            "desc": f"Installing LED lighting can reduce lighting energy by up to 60%. Current average consumption is {round(avg_kwh):,} kWh/month.",
            "savings": round(avg_kwh * 0.22 * avg_tariff * 0.6),
            "reduction": "18%", "difficulty": "Medium", "impact": "High", "progress": 0,
        },
        {
            "id": 2, "priority": "high", "category": "HVAC",
            "title": "Optimize AC Scheduling During Peak Hours",
            "desc": f"Smart thermostats with occupancy sensors can reduce AC energy by 25%. AC accounts for ~{round(compute_distribution(df)[0]['value'])}% of average monthly usage.",
            "savings": round(avg_kwh * 0.38 * avg_tariff * 0.25),
            "reduction": "24%", "difficulty": "Low", "impact": "High", "progress": 35,
        },
        {
            "id": 3, "priority": "medium", "category": "Renewable",
            "title": "Increase Solar Panel Utilization",
            "desc": f"Current avg solar generation is {round(avg_solar):,} kWh. Expanding capacity can reduce grid dependency by 35%.",
            "savings": round(avg_solar * avg_tariff * 0.5),
            "reduction": "14%", "difficulty": "High", "impact": "High", "progress": 20,
        },
        {
            "id": 4, "priority": "medium", "category": "Pumps",
            "title": "Optimize Water Pump Schedule",
            "desc": "Shifting water pump operations to off-peak hours (22:00–06:00) reduces costs by leveraging lower tariff rates.",
            "savings": round(avg_kwh * 0.12 * avg_tariff * 0.15),
            "reduction": "7%", "difficulty": "Low", "impact": "Medium", "progress": 60,
        },
        {
            "id": 5, "priority": "low", "category": "Automation",
            "title": "Install Motion Sensors in Common Areas",
            "desc": "Automatic lighting control in corridors and common areas eliminates unnecessary energy use when spaces are unoccupied.",
            "savings": round(avg_kwh * 0.05 * avg_tariff),
            "reduction": "4%", "difficulty": "Low", "impact": "Low", "progress": 80,
        },
        {
            "id": 6, "priority": "low", "category": "Kitchen",
            "title": "Insulate Kitchen Exhaust Systems",
            "desc": "Proper insulation of kitchen exhaust reduces AC load in adjacent areas, lowering kitchen-zone AC consumption by 12%.",
            "savings": round(avg_kwh * 0.02 * avg_tariff),
            "reduction": "2%", "difficulty": "Medium", "impact": "Low", "progress": 0,
        },
    ]
    total_savings = sum(r["savings"] for r in recs)
    co2_reduction = round(avg_kwh * CARBON_FACTOR * 0.25)
    return jsonify({"recommendations": recs, "totalSavings": total_savings, "co2Reduction": co2_reduction})


# ── Reports Route ─────────────────────────────────────────────────────────────
@app.route("/reports", methods=["GET"])
@token_required
def reports():
    if not mongo_available:
        return jsonify({"reports": []})
    user_id = request.user["user_id"]
    history = list(predictions_col.find(
        {"user_id": user_id}, {"_id": 1, "hostel": 1, "month": 1, "result": 1, "created_at": 1}
    ).sort("created_at", -1).limit(20))
    report_list = []
    for p in history:
        dt = p["created_at"]
        report_list.append({
            "id": str(p["_id"]),
            "name": f"{p.get('month', 'Unknown')} — {p.get('hostel', 'Hostel')} Prediction Report",
            "type": "Prediction",
            "date": dt.strftime("%b %d, %Y"),
            "kwh": p.get("result", {}).get("kwh", 0),
            "bill": p.get("result", {}).get("bill", 0),
            "status": "ready",
        })
    return jsonify({"reports": report_list})


# ── Prediction History ────────────────────────────────────────────────────────
@app.route("/predictions/history", methods=["GET"])
@token_required
def prediction_history():
    if not mongo_available:
        return jsonify({"history": []})
    limit = int(request.args.get("limit", 10))
    records = list(
        predictions_col.find(
            {"user_id": request.user["user_id"]},
            {"_id": 0, "inputs": 0}
        ).sort("created_at", -1).limit(limit)
    )
    for r in records:
        if "created_at" in r:
            r["created_at"] = r["created_at"].isoformat()
    return jsonify({"history": records})


# ── Dashboard Route ───────────────────────────────────────────────────────────
@app.route("/dashboard", methods=["GET"])
@token_required
def dashboard():
    user_id = request.user["user_id"]
    pred_map = get_predictions_by_month(user_id)

    # Build monthly chart only from user predictions
    monthly = []
    for m in MONTH_ORDER:
        if m in pred_map:
            monthly.append({
                "month": m,
                "consumption": pred_map[m]["kwh"],
                "bill": pred_map[m]["bill"],
                "predicted": pred_map[m]["kwh"],
                "carbon": pred_map[m]["carbon"],
            })

    # KPI from predictions
    if monthly:
        avg_kwh = round(sum(m["consumption"] for m in monthly) / len(monthly))
        avg_bill = round(sum(m["bill"] for m in monthly) / len(monthly))
        avg_carbon = round(sum(m["carbon"] for m in monthly) / len(monthly))
    else:
        avg_kwh = avg_bill = avg_carbon = 0

    # KPI changes from predictions
    kpi_changes = {"kwhChange": "0%", "billChange": "0%", "occupancyChange": "0%", "solarChange": "0%",
                   "kwhPositive": True, "billPositive": True, "occupancyPositive": True, "solarPositive": True}
    if len(monthly) >= 2:
        recent = monthly[-1]["consumption"]
        older = monthly[-2]["consumption"]
        if older:
            p = ((recent - older) / older) * 100
            kpi_changes["kwhChange"] = f"{'+' if p >= 0 else ''}{p:.1f}%"
            kpi_changes["kwhPositive"] = p >= 0
        recent_b = monthly[-1]["bill"]
        older_b = monthly[-2]["bill"]
        if older_b:
            p = ((recent_b - older_b) / older_b) * 100
            kpi_changes["billChange"] = f"{'+' if p >= 0 else ''}{p:.1f}%"
            kpi_changes["billPositive"] = p >= 0

    try:
        pred_count = predictions_col.count_documents({"user_id": user_id}) if mongo_available else 0
    except Exception:
        pred_count = 0

    # Use dataset only for distribution/season/blocks/weekly (structural data, not shown as consumption)
    df = get_energy_df()

    return jsonify({
        "monthly": monthly,
        "distribution": compute_distribution(df),
        "season": compute_season_data(df),
        "hostelBlocks": compute_hostel_blocks(df),
        "weekly": compute_weekly(df),
        "kpi": {
            "avgKwh": avg_kwh,
            "avgBill": avg_bill,
            "avgOccupancy": 0,
            "avgSolar": 0,
        },
        "kpiChanges": kpi_changes,
        "occupancySeries": [],
        "solarSeries": [],
        "recordCount": pred_count,
    })


# ── Analytics Route ───────────────────────────────────────────────────────────
@app.route("/analytics", methods=["GET"])
@token_required
def analytics():
    df = get_energy_df()
    return jsonify({
        "monthly": get_monthly_stats(df),
        "weekly": compute_weekly(df),
        "season": compute_season_data(df),
        "topConsumers": compute_top_consumers(df),
        "heatmap": compute_heatmap(df),
    })


# ── Model & Dataset Routes ────────────────────────────────────────────────────
@app.route("/model/info", methods=["GET"])
@token_required
def model_info():
    meta = {}
    if mongo_available:
        try:
            meta = model_col.find_one({"name": "best_model"}, {"_id": 0}) or {}
            if "updated_at" in meta:
                meta["updated_at"] = meta["updated_at"].isoformat()
            meta["recordCount"] = energy_col.estimated_document_count()
        except Exception:
            pass
    if not meta and numpy_model:
        meta = {
            "name": "best_model",
            "algorithm": numpy_model.get("type", "numpy_linear"),
            "metrics": numpy_model.get("metrics", {}),
            "dataset_size": numpy_model.get("dataset_size", 0),
            "status": "ready",
        }
    meta["loaded"] = model is not None or numpy_model is not None
    if "recordCount" not in meta:
        meta["recordCount"] = len(get_energy_df())
    return jsonify(meta)


@app.route("/dataset/upload", methods=["POST"])
@token_required
def upload_dataset():
    if not mongo_available:
        return jsonify({"error": "MongoDB required for dataset upload"}), 503
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files["file"]
    if not file.filename.endswith((".csv", ".xlsx")):
        return jsonify({"error": "Only CSV or Excel files are supported"}), 400

    try:
        if file.filename.endswith(".csv"):
            new_df = pd.read_csv(file)
        else:
            new_df = pd.read_excel(file)
        records = new_df.to_dict("records")
        energy_col.delete_many({})
        energy_col.insert_many(records)
        model_col.update_one(
            {"name": "best_model"},
            {"$set": {
                "dataset_size": len(records),
                "updated_at": datetime.now(timezone.utc),
                "status": "needs_retraining",
            }},
            upsert=True,
        )
        return jsonify({"ok": True, "records": len(records)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/model/retrain", methods=["POST"])
@token_required
def retrain_model():
    global model, numpy_model
    try:
        script = "train_light.py"
        if not os.path.exists(os.path.join(BASE_DIR, script)):
            script = "train.py"
        result = subprocess.run(
            [sys.executable, os.path.join(BASE_DIR, script)],
            capture_output=True, text=True, timeout=600, cwd=BASE_DIR,
        )
        if result.returncode != 0:
            return jsonify({"error": result.stderr or result.stdout or "Training failed"}), 500
        model_loaded = load_ml_model()
        if mongo_available:
            try:
                model_col.update_one(
                    {"name": "best_model"},
                    {"$set": {
                        "status": "ready" if model_loaded else "failed",
                        "updated_at": datetime.now(timezone.utc),
                        "dataset_size": energy_col.estimated_document_count(),
                    }},
                    upsert=True,
                )
            except Exception:
                pass
        return jsonify({"ok": True, "modelLoaded": model_loaded})
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Training timed out"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    record_count = 0
    if mongo_available:
        try:
            record_count = energy_col.estimated_document_count()
        except Exception:
            record_count = len(get_energy_df())
    else:
        record_count = len(get_energy_df())
    return jsonify({
        "status": "ok",
        "model": "loaded" if (model is not None or numpy_model is not None) else "not_loaded",
        "db": "connected" if mongo_available else "disconnected",
        "records": record_count,
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
