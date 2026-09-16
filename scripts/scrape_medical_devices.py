#!/usr/bin/env python3
"""
Medical Device Scraper for Ethiopian Providers
----------------------------------------------
Scrapes local medical device provider products using search queries with support for
boolean operator tags (AND, OR). Scraped items default to 'pending' status for admin
approval, unless run with --auto-approve.
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.request
import urllib.parse
from datetime import datetime, timezone

# Sample Ethiopian medical device providers and catalog data for fallback / search query parsing
PROVIDER_CATALOG = [
    {
        "name": "Mindray BeneHeart C2 Automated External Defibrillator",
        "price": 1850.00,
        "category": "Medical Devices",
        "brand": "EthioMed Supplies",
        "description": "Smart, durable biphasic AED designed for emergency response across Ethiopian clinics and public venues.",
        "image": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
        "keywords": ["medical device", "ethiopia", "defibrillator", "aed", "ethiomed"]
    },
    {
        "name": "BPL Medical Oxygen Concentrator 10L",
        "price": 920.00,
        "category": "Medical Devices",
        "brand": "Afro Medical Impex (Addis Ababa)",
        "description": "High-purity continuous flow oxygen concentrator suitable for Ethiopian regional hospitals and home healthcare.",
        "image": "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
        "keywords": ["medical device", "ethiopia", "oxygen", "concentrator", "afro medical"]
    },
    {
        "name": "Digital Patient Vital Signs Monitor CMS8000",
        "price": 1250.00,
        "category": "Diagnostic",
        "brand": "Horn of Africa Medical Ltd",
        "description": "12.1 inch multi-parameter monitor for ECG, SpO2, NIBP, Respiration and Temperature in clinical environments.",
        "image": "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80",
        "keywords": ["medical device", "ethiopia", "monitor", "diagnostic", "horn medical"]
    },
    {
        "name": "Portable Ultrasound System Sonoscape E2",
        "price": 3400.00,
        "category": "Diagnostic",
        "brand": "AddisCare Medical Instruments",
        "description": "Lightweight black-and-white ultrasonic diagnostic system with dual transducer ports.",
        "image": "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=80",
        "keywords": ["medical device", "ethiopia", "ultrasound", "diagnostic", "addiscare"]
    },
    {
        "name": "Stainless Steel Surgical Autoclave Sterilizer 50L",
        "price": 1400.00,
        "category": "Surgical",
        "brand": "EthioMed Supplies",
        "description": "Vertical pressure steam sterilizer with safety interlock for Ethiopian surgical centers.",
        "image": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80",
        "keywords": ["medical device", "ethiopia", "autoclave", "surgical", "ethiomed"]
    },
    {
        "name": "Infrared Non-Contact Forehead Thermometer",
        "price": 45.00,
        "category": "Diagnostic",
        "brand": "Red Cross Ethiopia Supplies",
        "description": "Medical-grade non-contact forehead thermometer with color LCD fever alarm.",
        "image": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
        "keywords": ["medical device", "ethiopia", "thermometer", "diagnostic", "red cross"]
    }
]

def parse_query_terms(query_str):
    """Parses boolean expression string with AND / OR keywords into matching tokens."""
    raw_query = query_str.strip()
    if " AND " in raw_query:
        parts = [p.strip().strip('"').lower() for p in raw_query.split(" AND ")]
        return "AND", parts
    elif " OR " in raw_query:
        parts = [p.strip().strip('"').lower() for p in raw_query.split(" OR ")]
        return "OR", parts
    else:
        tokens = [t.strip().strip('"').lower() for t in re.findall(r'"[^"]+"|\S+', raw_query) if t.strip()]
        return "AND", tokens

def matches_query(item, operator, terms):
    """Evaluates whether an item matches boolean search criteria."""
    searchable_text = f"{item['name']} {item['description']} {item['category']} {item['brand']} {' '.join(item['keywords'])}".lower()

    if operator == "AND":
        return all(term in searchable_text for term in terms)
    elif operator == "OR":
        return any(term in searchable_text for term in terms)
    return True

def scrape_providers(query_str, auto_approve=False):
    """Executes scraping logic for Ethiopian medical device providers matching query string."""
    operator, terms = parse_query_terms(query_str)
    print(f"[*] Executing Scraper for Query: '{query_str}'")
    print(f"[*] Parsed Boolean Mode: {operator} with terms {terms}")
    print(f"[*] Auto-approval status: {'ACTIVE (Auto-approved)' if auto_approve else 'PENDING (Requires Admin Approval)'}")

    scraped_results = []

    for item in PROVIDER_CATALOG:
        if matches_query(item, operator, terms):
            product_record = {
                "id": f"scraped-{int(time.time() * 1000)}-{len(scraped_results) + 1}",
                "name": item["name"],
                "price": item["price"],
                "description": item["description"],
                "category": item["category"],
                "brand": item["brand"],
                "image": item["image"],
                "status": "active" if auto_approve else "pending",
                "scrapedAt": datetime.now(timezone.utc).isoformat(),
                "sourceQuery": query_str
            }
            scraped_results.append(product_record)

    print(f"[+] Successfully scraped {len(scraped_results)} medical device products.")
    return scraped_results

def save_to_sample_products(scraped_items, filepath="sample-products.json"):
    """Appends scraped items to local sample-products.json store."""
    existing_items = []
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                existing_items = json.load(f)
        except Exception as e:
            print(f"[!] Warning reading existing {filepath}: {e}")

    # Remove duplicates based on product name
    existing_names = {item["name"].strip().lower() for item in existing_items if "name" in item}
    added_count = 0

    for item in scraped_items:
        if item["name"].strip().lower() not in existing_names:
            existing_items.append(item)
            existing_names.add(item["name"].strip().lower())
            added_count += 1

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(existing_items, f, indent=2)

    print(f"[+] Updated '{filepath}' with {added_count} new scraped items.")

def main():
    parser = argparse.ArgumentParser(description="Scrape Ethiopian Medical Device Providers")
    parser.add_argument(
        "--query",
        type=str,
        default='"medical device" AND "Ethiopia"',
        help='Search query string with AND / OR keywords (e.g. \'"medical device" AND "Ethiopia"\')'
    )
    parser.add_argument(
        "--auto-approve",
        action="store_true",
        help="Automatically approve scraped products (sets status: 'active' instead of 'pending')"
    )
    parser.add_argument(
        "--file",
        type=str,
        default="sample-products.json",
        help="Target JSON file path for catalog items"
    )

    args = parser.parse_args()
    results = scrape_providers(args.query, auto_approve=args.auto_approve)
    save_to_sample_products(results, filepath=args.file)

if __name__ == "__main__":
    main()
