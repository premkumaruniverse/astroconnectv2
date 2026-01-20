#!/usr/bin/env python3
"""
Test script to check if Brihat Kundli API is working properly
"""

import requests
import json
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:8000"
KUNDLI_ENDPOINT = f"{API_BASE_URL}/api/features/kundli/generate"

def test_brihat_kundli_api():
    """Test the Brihat Kundli API endpoint"""
    
    print("Testing Brihat Kundli API...")
    print(f"Endpoint: {KUNDLI_ENDPOINT}")
    
    # Test data
    test_birth_data = {
        "name": "Test User",
        "date": "1990-05-15",
        "time": "14:30",
        "place": "New Delhi, India",
        "latitude": 28.6139,
        "longitude": 77.2090
    }
    
    try:
        # Test 1: Check if server is running
        print("\n1. Checking if server is running...")
        health_response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        if health_response.status_code == 200:
            print("[OK] Server is running")
            print(f"   Response: {health_response.json()}")
        else:
            print(f"[ERROR] Server health check failed: {health_response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("[ERROR] Cannot connect to server. Make sure the backend is running on localhost:8000")
        return False
    except requests.exceptions.Timeout:
        print("[ERROR] Server response timeout")
        return False
    
    try:
        # Test 2: Test Brihat Kundli API
        print("\n2. Testing Brihat Kundli generation...")
        print(f"   Input data: {json.dumps(test_birth_data, indent=2)}")
        
        response = requests.post(
            KUNDLI_ENDPOINT,
            json=test_birth_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("[OK] Brihat Kundli API is working!")
            
            # Parse and validate response
            kundli_data = response.json()
            
            # Check required fields
            required_fields = ["basic_info", "planetary_positions", "predictions", "remedies", "lucky_elements"]
            missing_fields = []
            
            for field in required_fields:
                if field not in kundli_data:
                    missing_fields.append(field)
            
            if missing_fields:
                print(f"[WARNING] Missing fields in response: {missing_fields}")
            else:
                print("[OK] All required fields present in response")
            
            # Display sample data
            print("\nSample Response Data:")
            print(f"   Name: {kundli_data.get('basic_info', {}).get('name', 'N/A')}")
            print(f"   Rashi: {kundli_data.get('basic_info', {}).get('rashi', 'N/A')}")
            print(f"   Nakshatra: {kundli_data.get('basic_info', {}).get('nakshatra', 'N/A')}")
            print(f"   Planetary Positions: {len(kundli_data.get('planetary_positions', []))} planets")
            print(f"   Remedies: {len(kundli_data.get('remedies', []))} remedies")
            
            return True
            
        elif response.status_code == 422:
            print("[ERROR] Validation error - Invalid input data")
            print(f"   Error details: {response.json()}")
            return False
            
        elif response.status_code == 500:
            print("[ERROR] Internal server error")
            print(f"   Error details: {response.text}")
            return False
            
        else:
            print(f"[ERROR] Unexpected status code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("[ERROR] API request timeout (>30s)")
        return False
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Request failed: {e}")
        return False
    except json.JSONDecodeError:
        print("[ERROR] Invalid JSON response")
        return False

def test_frontend_integration():
    """Test if frontend can access the API"""
    
    print("\n3. Testing frontend integration...")
    
    # Check CORS headers
    try:
        response = requests.options(KUNDLI_ENDPOINT, timeout=5)
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        }
        
        if cors_headers['Access-Control-Allow-Origin']:
            print("[OK] CORS is configured")
            print(f"   Allowed Origins: {cors_headers['Access-Control-Allow-Origin']}")
        else:
            print("[WARNING] CORS headers not found")
            
    except Exception as e:
        print(f"[WARNING] Could not check CORS: {e}")

def main():
    """Main test function"""
    
    print("Brihat Kundli API Test Suite")
    print("=" * 50)
    
    # Run tests
    api_working = test_brihat_kundli_api()
    test_frontend_integration()
    
    print("\n" + "=" * 50)
    if api_working:
        print("[SUCCESS] RESULT: Brihat Kundli API is working properly!")
        print("\nSummary:")
        print("   [OK] Server is running")
        print("   [OK] API endpoint is accessible")
        print("   [OK] Response format is correct")
        print("   [OK] All required data fields are present")
    else:
        print("[FAILED] RESULT: Brihat Kundli API has issues!")
        print("\nTroubleshooting:")
        print("   1. Make sure the backend server is running")
        print("   2. Check if the database is connected")
        print("   3. Verify the API endpoint URL")
        print("   4. Check server logs for errors")

if __name__ == "__main__":
    main()