import os
import glob
import pandas as pd
import pdfplumber

def extract_tables_from_pdfs(input_dir, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    pdf_files = glob.glob(os.path.join(input_dir, "*.pdf"))
    
    print(f"Found {len(pdf_files)} PDF files in {input_dir}")
    
    for pdf_path in pdf_files:
        print(f"Processing {pdf_path}...")
        all_data = []
        headers = None
        
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                tables = page.extract_tables()
                for table in tables:
                    if not table: continue
                    # Clean up table by replacing newlines in strings
                    cleaned_table = []
                    for row in table:
                        cleaned_row = [str(cell).replace('\n', ' ').strip() if cell is not None else "" for cell in row]
                        cleaned_table.append(cleaned_row)
                    
                    if not cleaned_table: continue
                    
                    if headers is None:
                        headers = cleaned_table[0]
                        all_data.extend(cleaned_table[1:])
                    else:
                        # Sometimes headers repeat on next pages
                        if cleaned_table[0] == headers:
                            all_data.extend(cleaned_table[1:])
                        else:
                            all_data.extend(cleaned_table)
                            
        if headers and all_data:
            df = pd.DataFrame(all_data, columns=headers)
            # Try to identify dataset by columns
            col_str = " ".join(headers).lower()
            if "market_supply" in col_str or "supply_demand_g" in col_str:
                filename = "all_crops_monthly.csv"
            elif "grade" in col_str and "arrival date" in col_str:
                filename = "agri_market_prices.csv"
            elif "crop_duration_days" in col_str or "harvest_interval" in col_str:
                filename = "crop_details.csv"
            elif "state" in col_str and "crops" in col_str and "modal price (rs/kg)" in col_str:
                filename = "crop_prices.csv"
            else:
                filename = f"extracted_{os.path.basename(pdf_path)}.csv"
                
            out_path = os.path.join(output_dir, filename)
            df.to_csv(out_path, index=False)
            print(f"Saved {len(df)} rows to {out_path}")
        else:
            print(f"No tables extracted from {pdf_path}")

if __name__ == "__main__":
    input_dir = r"C:\Users\suhai\.gemini\antigravity-ide\brain\13775637-bd11-4242-9bcb-60092d1874a3\.user_uploaded"
    output_dir = r"c:\Users\suhai\Downloads\Uzhavan-Connect-main\ml\data"
    extract_tables_from_pdfs(input_dir, output_dir)
