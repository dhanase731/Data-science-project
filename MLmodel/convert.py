import pandas as pd

# Read Excel file
df = pd.read_excel("hostel.xlsx")

# Save as CSV
df.to_csv("hostel.csv", index=False)

print("Conversion completed successfully!")