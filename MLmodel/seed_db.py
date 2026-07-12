"""Seed MongoDB with energy records from hostel.csv and initial system alerts."""
import os
import pandas as pd
from pymongo import MongoClient
from datetime import datetime, timezone

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
CSV_PATH = os.path.join(os.path.dirname(__file__), "hostel.csv")


def seed():
    client = MongoClient(MONGO_URI)
    db = client["energyiq"]
    energy_col = db["energy_records"]
    alerts_col = db["alerts"]
    model_col = db["model_metadata"]

    if energy_col.estimated_document_count() > 0:
        print(f"energy_records already has {energy_col.estimated_document_count()} documents — skipping seed.")
        return

    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"Dataset not found: {CSV_PATH}")

    df = pd.read_csv(CSV_PATH)
    records = df.to_dict("records")
    energy_col.insert_many(records)
    for field in ("Month", "Season", "Hostel_ID"):
        try:
            energy_col.create_index(field)
        except Exception as e:
            print(f"Warning: could not create index on {field}: {e}")
    print(f"Inserted {len(records)} energy records into MongoDB.")

    avg_kwh = df["Monthly_Electricity_kWh"].mean()
    high_threshold = df["Monthly_Electricity_kWh"].quantile(0.9)
    high_rows = df[df["Monthly_Electricity_kWh"] >= high_threshold].head(3)

    system_alerts = []
    for _, row in high_rows.iterrows():
        system_alerts.append({
            "user_id": "system",
            "type": "warning",
            "title": f"High Consumption — {row['Hostel_ID']}",
            "desc": f"{row['Hostel_ID']} consumed {int(row['Monthly_Electricity_kWh']):,} kWh in {row['Month']} ({row['Season']}), above 90th percentile ({int(high_threshold):,} kWh).",
            "read": False,
            "created_at": datetime.now(timezone.utc),
        })

    avg_solar = df["Solar_Generation_kWh"].mean()
    if avg_solar > 0:
        top_solar = df.loc[df["Solar_Generation_kWh"].idxmax()]
        system_alerts.append({
            "user_id": "system",
            "type": "success",
            "title": "Solar Generation Record",
            "desc": f"{top_solar['Hostel_ID']} generated {int(top_solar['Solar_Generation_kWh']):,} kWh solar in {top_solar['Month']}.",
            "read": False,
            "created_at": datetime.now(timezone.utc),
        })

    system_alerts.append({
        "user_id": "system",
        "type": "info",
        "title": "Dataset Loaded",
        "desc": f"MongoDB seeded with {len(records):,} hostel energy records. Average monthly consumption: {int(avg_kwh):,} kWh.",
        "read": False,
        "created_at": datetime.now(timezone.utc),
    })

    if alerts_col.estimated_document_count() == 0:
        alerts_col.insert_many(system_alerts)
        print(f"Inserted {len(system_alerts)} system alerts.")
    else:
        print("Alerts already exist — skipping.")

    model_col.update_one(
        {"name": "best_model"},
        {"$set": {
            "name": "best_model",
            "target": "Monthly_Electricity_kWh",
            "algorithm": "PyCaret regression (auto-selected)",
            "dataset_size": len(records),
            "status": "pending_training",
            "updated_at": datetime.now(timezone.utc),
        }},
        upsert=True,
    )
    print("Model metadata initialized.")


if __name__ == "__main__":
    seed()
