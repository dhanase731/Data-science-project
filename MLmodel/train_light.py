"""Lightweight model trainer — uses numpy only (low memory)."""
import os
import json
import pandas as pd
import numpy as np
from pymongo import MongoClient

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TARGET = "Monthly_Electricity_kWh"

FEATURES = [
    "Month", "Season", "Hostel_Rooms", "Occupied_Rooms", "Occupancy_Percentage",
    "Students", "Building_Age_Years", "Floors", "Hostel_Area_sqft", "Mess_Area_sqft",
    "Daily_Mess_Attendance", "Breakfast_Meals", "Lunch_Meals", "Dinner_Meals",
    "Kitchen_Equipment", "AC_Units", "Fans", "Lights", "Computers",
    "WiFi_Access_Points", "Washing_Machines", "Water_Pumps", "Solar_Panels",
    "Solar_Generation_kWh", "Outdoor_Temperature_C", "Humidity_Percentage",
    "Water_Consumption_Liters", "Generator_Hours", "Power_Outage_Hours",
    "Peak_Load_kW", "Electricity_Tariff_RsPerkWh", "Urban",
]


def load_data():
    csv_path = os.path.join(BASE_DIR, "hostel.csv")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client["energyiq"]
        count = db["energy_records"].estimated_document_count()
        if count > 0:
            records = list(db["energy_records"].find({}, {"_id": 0}))
            print(f"Loaded {len(records)} records from MongoDB.")
            return pd.DataFrame(records), client
    except Exception as e:
        print(f"MongoDB unavailable ({e}), using CSV.")

    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} records from hostel.csv.")
    return df, None


def encode_features(df):
    work = df[FEATURES + [TARGET]].copy()
    work = pd.get_dummies(work, columns=["Month", "Season"], drop_first=True)
    y = work[TARGET].values.astype(float)
    X = work.drop(columns=[TARGET]).values.astype(float)
    cols = [c for c in work.columns if c != TARGET]
    X = np.column_stack([np.ones(len(X)), X])
    col_names = ["intercept"] + cols
    return X, y, col_names


def train():
    df, mongo_client = load_data()
    X, y, col_names = encode_features(df)
    coeffs, _, _, _ = np.linalg.lstsq(X, y, rcond=None)

    y_pred = X @ coeffs
    mae = float(np.mean(np.abs(y - y_pred)))
    rmse = float(np.sqrt(np.mean((y - y_pred) ** 2)))
    r2 = float(1 - np.sum((y - y_pred) ** 2) / np.sum((y - y.mean()) ** 2))

    model_data = {
        "type": "numpy_linear",
        "target": TARGET,
        "coefficients": coeffs.tolist(),
        "columns": col_names,
        "metrics": {"mae": round(mae, 2), "rmse": round(rmse, 2), "r2": round(r2, 4)},
        "dataset_size": len(df),
    }

    out_path = os.path.join(BASE_DIR, "model_weights.json")
    with open(out_path, "w") as f:
        json.dump(model_data, f, indent=2)

    print(f"MAE: {mae:.2f}, RMSE: {rmse:.2f}, R2: {r2:.4f}")
    print(f"Model saved to {out_path}")

    if mongo_client:
        mongo_client["energyiq"]["model_metadata"].update_one(
            {"name": "best_model"},
            {"$set": {
                "name": "best_model",
                "target": TARGET,
                "algorithm": "Numpy Linear Regression",
                "status": "ready",
                "metrics": model_data["metrics"],
                "dataset_size": len(df),
                "updated_at": pd.Timestamp.utcnow().isoformat(),
            }},
            upsert=True,
        )


if __name__ == "__main__":
    train()
