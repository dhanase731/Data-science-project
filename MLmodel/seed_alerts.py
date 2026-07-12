"""Insert system alerts derived from MongoDB energy data."""
import os
from datetime import datetime, timezone
import pandas as pd
from pymongo import MongoClient

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")


def seed_alerts():
    client = MongoClient(MONGO_URI)
    db = client["energyiq"]
    alerts_col = db["alerts"]
    energy_col = db["energy_records"]

    if alerts_col.estimated_document_count() > 0:
        print(f"Alerts already exist ({alerts_col.estimated_document_count()}) — skipping.")
        return

    records = list(energy_col.find({}, {"_id": 0}))
    if not records:
        print("No energy records found — run seed_db.py first.")
        return

    df = pd.DataFrame(records)
    avg_kwh = df["Monthly_Electricity_kWh"].mean()
    high_threshold = df["Monthly_Electricity_kWh"].quantile(0.9)
    high_rows = df[df["Monthly_Electricity_kWh"] >= high_threshold].head(3)

    alerts = []
    for _, row in high_rows.iterrows():
        alerts.append({
            "user_id": "system",
            "type": "warning",
            "title": f"High Consumption — {row['Hostel_ID']}",
            "desc": (
                f"{row['Hostel_ID']} consumed {int(row['Monthly_Electricity_kWh'])} kWh "
                f"in {row['Month']} ({row['Season']}), above 90th percentile "
                f"({int(high_threshold)} kWh)."
            ),
            "read": False,
            "created_at": datetime.now(timezone.utc),
        })

    avg_solar = df["Solar_Generation_kWh"].mean()
    if avg_solar > 0:
        top_solar = df.loc[df["Solar_Generation_kWh"].idxmax()]
        alerts.append({
            "user_id": "system",
            "type": "success",
            "title": "Solar Generation Record",
            "desc": (
                f"{top_solar['Hostel_ID']} generated "
                f"{int(top_solar['Solar_Generation_kWh'])} kWh solar in {top_solar['Month']}."
            ),
            "read": False,
            "created_at": datetime.now(timezone.utc),
        })

    alerts.append({
        "user_id": "system",
        "type": "info",
        "title": "Dataset Loaded",
        "desc": (
            f"MongoDB seeded with {len(records)} hostel energy records. "
            f"Average monthly consumption: {int(avg_kwh)} kWh."
        ),
        "read": False,
        "created_at": datetime.now(timezone.utc),
    })

    alerts_col.insert_many(alerts)
    print(f"Inserted {len(alerts)} system alerts.")


if __name__ == "__main__":
    seed_alerts()
