import pandas as pd
from pycaret.regression import *

# Load dataset
df = pd.read_csv("hostel.csv")

print(df.head())

setup(
    data=df,
    target="Monthly_Electricity_kWh",
    session_id=42
)

best_model = compare_models()

# Save the model
save_model(best_model, "best_model")

print("✅ Model saved successfully!")