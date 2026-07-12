import os
import pandas as pd
from pymongo import MongoClient
from pycaret.regression import setup, create_model, save_model, pull

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def load_data():
    csv_path = os.path.join(BASE_DIR, "hostel.csv")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client["energyiq"]
        energy_col = db["energy_records"]
        count = energy_col.estimated_document_count()
        if count > 0:
            records = list(energy_col.find({}, {"_id": 0}))
            print(f"Loaded {len(records)} records from MongoDB.")
            return pd.DataFrame(records), client
        if os.path.exists(csv_path):
            df = pd.read_csv(csv_path)
            energy_col.insert_many(df.to_dict("records"))
            print(f"Seeded {len(df)} records into MongoDB.")
            return df, client
    except Exception as e:
        print(f"MongoDB unavailable ({e}), falling back to CSV.")

    if not os.path.exists(csv_path):
        raise FileNotFoundError("No data in MongoDB and hostel.csv not found.")
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} records from hostel.csv.")
    return df, None


df, mongo_client = load_data()
print(df.head())

setup(
    data=df,
    target="Monthly_Electricity_kWh",
    session_id=42,
    verbose=False,
    n_jobs=1,
)

# Train a single lightweight model (compare_models uses too much RAM)
best_model = create_model("ridge", verbose=False)
metrics = pull()
print(metrics)

save_model(best_model, os.path.join(BASE_DIR, "best_model"))

if mongo_client:
    db = mongo_client["energyiq"]
    db["model_metadata"].update_one(
        {"name": "best_model"},
        {"$set": {
            "name": "best_model",
            "target": "Monthly_Electricity_kWh",
            "algorithm": "Ridge Regression",
            "status": "ready",
            "dataset_size": len(df),
            "updated_at": pd.Timestamp.utcnow().to_pydatetime(),
        }},
        upsert=True,
    )

print("Model saved successfully!")
